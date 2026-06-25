import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentInteraction } from '@/app/_shared/hooks/useAgentInteraction';
import { useLocalParticipant, RoomAudioRenderer } from '@livekit/components-react';
import { Canvas } from './Canvas';
import { VoiceDock } from './VoiceDock';
import { useVisualMessageFilters } from './useVisualMessageFilters';

interface AgentInterfaceProps {
    onDisconnect: () => void;
    /**
     * Window variant only: called by the ■ (pause) button instead of fully closing.
     * Keeps the widget open but pauses the session so the user can resume later.
     * Falls back to onDisconnect when not provided (immersive view).
     */
    onPause?: () => void;
    /** Called when the backend watchdog force-pauses (no disconnect). */
    onForcePause?: () => void;
    /**
     * 'immersive' — full-window experience (/dynamic). Default.
     * 'window'    — compact, tightened spacing for the Vani chat window / embed drawer.
     */
    variant?: 'immersive' | 'window';
    /**
     * Window variant only: the embed card is in its wide (expanded) state. Lets the
     * VoiceDock widen with the card instead of staying pinned to its narrow cap.
     */
    isExpanded?: boolean;
}

/**
 * AgentInterface — the shared agent shell.
 *
 * Owns the engine (LiveKit room state via useAgentInteraction) and composes the
 * two views that always travel together:
 *   <Canvas>     — the visual board (cards, maps, forms)
 *   <VoiceDock>  — the control bar (visualizer, mic, text input)
 * Both read from the same message stream; neither works alone. Used by /dynamic
 * (immersive), the Vani window, and the /embed widget.
 */
export const AgentInterface: React.FC<AgentInterfaceProps> = ({ onDisconnect, onPause, onForcePause, variant = 'immersive', isExpanded = false }) => {
    const {
        agentState,
        mode,
        setInteractionMode,
        messages,
        updateMessages,
        activeTrack,
        userTrack,
        toggleMic,
        sendText,
        roomState,
        forcePauseRef,
    } = useAgentInteraction();

    // Register the force-pause callback so useAgentMessages can call it when
    // the backend publishes agent.force_pause. Triggers the same soft-pause
    // behaviour as the ⏸ button without any session disconnect.
    const [externallyPaused, setExternallyPaused] = useState(false);
    useEffect(() => {
        forcePauseRef.current = () => {
            setExternallyPaused(true);
            onForcePause?.();
        };
        return () => { forcePauseRef.current = null; };
    }, [forcePauseRef, onForcePause]);

    const flashcards = useMemo(() => messages.filter(m => m.type === 'flashcard'), [messages]);
    const visuals = useVisualMessageFilters(messages);
    const { locationRequestMessage, latestVisualMessage } = visuals;

    // StarterScreen is showing when there is no content at all.
    // VoiceDock visualizer should be HIDDEN then (BlobVisualizer covers it).
    // When cards / maps / forms appear, show it in the dock instead.
    const hasContent = flashcards.length > 0 || latestVisualMessage !== null;

    // Latest thing Vani has said — shown centered on the welcome screen as she speaks.
    // Suppressed while audio is muted (resume suppression) so no "Hello" text
    // flickers on screen. The suppress flag is window-only, so /dynamic is unaffected.
    const [suppressAudio, setSuppressAudio] = useState(false);

    const liveAgentMessage = useMemo(
        () => {
            if (suppressAudio) return null;
            return messages.findLast(m => m.type === 'text' && m.sender === 'agent') ?? null;
        },
        [messages, suppressAudio]
    );

    const { localParticipant } = useLocalParticipant();

    // ─── Resume: audio suppression + greeting intercept (window only) ────────
    //
    // Goal: the user should never hear or see "Hello, how can I assist you?" on
    // resume. They should hear the warm resume greeting ("It's good to have you
    // back!") and see its text ONLY if the previous state was text-only (not
    // cards/forms — in that case the Canvas renders content and StarterScreen
    // is hidden anyway, so no text shows regardless).
    //
    // Mechanism:
    //  1. On first localParticipant available → send [RESUME CONVERSATION] hint
    //     immediately (0 delay). This races against the backend's generate_reply
    //     greeting. With interrupt_response=True the greeting is cut off.
    //  2. Simultaneously set suppressAudio=true → agent track volume=0 so the
    //     "Hello" (or partial "H-") is never heard.
    //  3. Watch agentState: thinking→speaking transition means the agent just
    //     finished processing our hint and is now speaking the resume greeting.
    //     Unmute at that point (volume→1).
    //  4. While suppressed, liveAgentMessage returns null so no text flickers.

    const resumeSentRef  = useRef(false);
    const prevStateRef   = useRef<string>('');

    // ─── Clear informational cards when user sends a new message ─────────────
    // When the user asks something new, flashcards / maps should disappear so
    // the StarterScreen shows the agent's live text response. Interactive content
    // (forms, job-application) is intentionally NOT cleared — the user is mid-flow.
    const userMessages = useMemo(
        () => messages.filter(m => m.sender === 'user' && m.type === 'text' && !m.isInterim),
        [messages]
    );
    const prevUserCountRef = useRef(0);
    useEffect(() => {
        if (userMessages.length <= prevUserCountRef.current) {
            prevUserCountRef.current = userMessages.length;
            return;
        }
        prevUserCountRef.current = userMessages.length;

        const CLEAR_TYPES = new Set([
            'flashcard', 'map_polyline', 'global_presence', 'nearby_offices',
        ]);
        updateMessages(prev => {
            const hasInfoContent = Array.from(prev.values()).some(m => CLEAR_TYPES.has(m.type));
            if (!hasInfoContent) return prev;
            const next = new Map(prev);
            for (const [key, msg] of next.entries()) {
                if (CLEAR_TYPES.has(msg.type)) next.delete(key);
            }
            return next;
        });
    }, [userMessages.length, updateMessages]);
    // ────────────────────────────────────────────────────────────────────────

    // Control agent track volume based on suppressAudio (window only).
    useEffect(() => {
        if (variant !== 'window') return;
        const track = activeTrack?.publication?.track;
        if (!track || !('setVolume' in track)) return;
        (track as { setVolume: (v: number) => void }).setVolume(suppressAudio ? 0 : 1);
    }, [variant, suppressAudio, activeTrack]);

    // Send hint once the room is fully connected (data channel open).
    // localParticipant exists before the WebRTC PeerConnection is ready, which
    // causes "PC manager is closed" errors — roomState === 'connected' is the
    // reliable signal that sendText() can actually reach the server.
    useEffect(() => {
        if (variant !== 'window')       return;
        if (roomState !== 'connected')  return;
        if (resumeSentRef.current)      return;

        const raw = sessionStorage.getItem('vani_pause_context');
        if (!raw) return;

        try {
            const ctx = JSON.parse(raw) as { cardTitle?: string; agentSnippet?: string; timestamp?: number };
            if (ctx.timestamp && Date.now() - ctx.timestamp > 30 * 60 * 1000) {
                sessionStorage.removeItem('vani_pause_context');
                return;
            }

            resumeSentRef.current = true;
            sessionStorage.removeItem('vani_pause_context');

            // Mute agent audio immediately — suppresses any greeting fragment.
            setSuppressAudio(true);

            const topic = ctx.cardTitle ?? ctx.agentSnippet?.slice(0, 60) ?? 'the previous topic';
            sendText(
                `[RESUME CONVERSATION] The user was viewing "${topic}" when the session paused. ` +
                `Do NOT greet them or say hello. Warmly say it's good to have them back and ask ` +
                `how you can help further with "${topic}" or anything else.`
            );
        } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variant, roomState]);

    // Unmute when agent transitions thinking → speaking (= resume greeting, not
    // the interrupted Hello). Any other speaking transition keeps it suppressed.
    useEffect(() => {
        if (variant !== 'window') return;
        if (!suppressAudio) return;
        if (agentState === 'speaking' && prevStateRef.current === 'thinking') {
            setSuppressAudio(false);
        }
        prevStateRef.current = agentState;
    }, [variant, suppressAudio, agentState]);

    // Safety fallback: if thinking→speaking never fires (e.g. the backend didn't
    // interrupt cleanly), unmute after 4 s so the user isn't permanently silent.
    useEffect(() => {
        if (variant !== 'window') return;
        if (!suppressAudio) return;
        const id = setTimeout(() => setSuppressAudio(false), 4000);
        return () => clearTimeout(id);
    }, [variant, suppressAudio]);
    // ────────────────────────────────────────────────────────────────────────

    // ─── Farewell detection — auto-close when the agent says goodbye ────────
    // Watches final (non-interim) agent messages for farewell phrases. When the
    // backend's EndCallTool fires (e.g. "Thanks for visiting IndusNet. Bye!"),
    // we call onDisconnect to fully close the widget — not just pause.
    useEffect(() => {
        const last = messages.findLast(
            m => m.sender === 'agent' && m.type === 'text' && !m.isInterim
        );
        if (!last?.text) return;
        const t = last.text.toLowerCase();
        const isFarewell =
            (t.includes('thanks for visiting') && t.includes('bye')) ||
            t.includes('goodbye') ||
            (t.includes('bye') && (t.includes('indus') || t.includes('have a great')));
        if (isFarewell) onDisconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);
    // ────────────────────────────────────────────────────────────────────────

    // ─── Location Request Handler ────────────────────────────────────────────
    // The agent can ask for the user's geolocation silently (no UI). We resolve
    // it here, at the engine level, and publish the result back over the room.
    useEffect(() => {
        if (!locationRequestMessage || !localParticipant) return;

        const messageId = locationRequestMessage.id;
        console.log('--- GEOLOCATION: Requesting user location ---', { messageId });

        const publishLocation = (payload: object) => {
            const encoded = new TextEncoder().encode(JSON.stringify(payload));
            localParticipant.publishData(encoded, { topic: 'user.location' });
            console.log('--- GEOLOCATION: Sent to backend ---', payload);
        };

        if (!navigator.geolocation) {
            publishLocation({ status: 'unsupported' });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                publishLocation({
                    status: 'success',
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                });
            },
            (err) => {
                console.warn('--- GEOLOCATION: Error ---', err.message);
                publishLocation({ status: 'denied', error: err.message });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationRequestMessage?.id]); // Only re-fire when a NEW location request arrives
    // ────────────────────────────────────────────────────────────────────────

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-transparent ring-1 ring-black/5 shadow-2xl">
            <RoomAudioRenderer />

            {/* Thinking / Loading Overlay */}
            <AnimatePresence>
                {agentState === 'thinking' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        // Center-only blur band. Leaves the header (top) and the
                        // suggested-questions + VoiceDock (bottom) sharp & interactive
                        // so the user can refine their query while the agent thinks.
                        // The mask fades the blur softly at both edges (longer, more
                        // transparent fade at the bottom) so it doesn't cut sharply.
                        className={`pointer-events-none absolute inset-x-0 z-40 flex items-center justify-center bg-white/5 backdrop-blur-md ${variant === 'window' ? 'top-[60px] bottom-[185px]' : 'top-24 bottom-36'}`}
                        style={{
                            maskImage: 'linear-gradient(to bottom, transparent 0%, #000 16%, #000 68%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 16%, #000 68%, transparent 100%)',
                        }}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 0.6,
                                            delay: i * 0.1,
                                            ease: "easeInOut"
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600/80">
                                Thinking
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Canvas
                visuals={visuals}
                flashcards={flashcards}
                agentState={agentState}
                variant={variant}
                isExpanded={isExpanded}
                updateMessages={updateMessages}
                sendText={sendText}
                agentText={liveAgentMessage?.text ?? null}
                isAgentInterim={liveAgentMessage?.isInterim ?? false}
            />

            <VoiceDock
                mode={mode}
                setInteractionMode={setInteractionMode}
                toggleMic={toggleMic}
                sendText={sendText}
                onDisconnect={onDisconnect}
                onPause={onPause}
                activeTrack={activeTrack}
                userTrack={userTrack}
                variant={variant}
                isExpanded={isExpanded}
                showVisualizer={variant === 'immersive' || hasContent}
                externallyPaused={externallyPaused}
                onExternalPauseHandled={() => setExternallyPaused(false)}
            />
        </div>
    );
};
