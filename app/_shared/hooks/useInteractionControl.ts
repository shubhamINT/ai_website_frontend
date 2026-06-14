import { useState, useCallback, useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { InteractionMode, ChatMessage } from '../types/agentTypes';
import { useSpeechGate } from './useSpeechGate';

export function useInteractionControl(
    updateMessages: (updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => void
) {
    const { localParticipant } = useLocalParticipant();
    const [mode, setInteractionMode] = useState<InteractionMode>('voice');
    const [manuallyMuted, setManuallyMuted] = useState(false);

    // In voice mode (and not hand-muted) the VAD gate owns the mic — opens it on
    // detected speech, holds it on silence (always gated; see [[vad-always-gate]]).
    // Otherwise the mic is forced off here.
    const gateActive = mode === 'voice' && !manuallyMuted;
    useSpeechGate(gateActive);

    useEffect(() => {
        if (!localParticipant) return;
        if (!gateActive) {
            localParticipant.setMicrophoneEnabled(false);
        }
        // when gateActive, useSpeechGate is the sole owner of the mic enable state.
    }, [localParticipant, gateActive]);


    const toggleMic = useCallback((mute: boolean) => {
        // Mute = user wants silence (pauses the gate). Unmute → re-enter voice mode.
        setManuallyMuted(mute);
        if (!mute) {
            setInteractionMode('voice');
        }
    }, []);

    const sendText = useCallback(async (text: string) => {
        if (localParticipant) {
            // Activating text mode
            setInteractionMode('text');

            // Standard LiveKit Text Stream
            await localParticipant.sendText(text, { topic: 'lk.chat' });

            // Optimistically add to UI
            const id = `local-${Date.now()}`;
            updateMessages((prev) => {
                const next = new Map(prev);
                next.set(id, {
                    id,
                    sender: 'user',
                    type: 'text',
                    text,
                    timestamp: Date.now(),
                    isInterim: false
                });
                return next;
            });
        }
    }, [localParticipant, updateMessages]);

    return {
        mode,
        setInteractionMode,
        toggleMic,
        sendText
    };
}
