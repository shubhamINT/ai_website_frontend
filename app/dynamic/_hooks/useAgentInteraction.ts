import { useCallback, useMemo, useState, useEffect } from 'react';
import {
    useVoiceAssistant,
    useLocalParticipant,
    useRoomContext,
    useChat,
    type TrackReferenceOrPlaceholder
} from '@livekit/components-react';
import { Track, RoomEvent, type TranscriptionSegment, type Participant } from 'livekit-client';

export type AgentState = 'listening' | 'speaking' | 'thinking' | 'idle';

// Reusing the message structure/logic but simplified for this hook
export interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    type: 'text' | 'flashcard';
    text?: string;
    cardData?: {
        title: string;
        value: string;
    };
    isInterim?: boolean;
    timestamp: number;
}

export function useAgentInteraction() {
    const { state, audioTrack: agentTrack } = useVoiceAssistant();
    const { localParticipant, microphoneTrack } = useLocalParticipant();
    const room = useRoomContext();

    // Auto-enable microphone on mount/connect (from modular implementation)
    useEffect(() => {
        if (localParticipant) {
            localParticipant.setMicrophoneEnabled(true);
        }
    }, [localParticipant]);

    // We can use useChat for basic text, but stricter control via Events is often better for custom agents
    // For now, let's implement a custom message handler similar to the modular one
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // --- Message Handling ---
    const handleTranscription = useCallback(
        (segments: TranscriptionSegment[], participant?: Participant) => {
            if (!participant) return;
            const senderIsAgent = participant.identity !== localParticipant?.identity;

            setMessages((prev) => {
                const newMessages = [...prev];
                // basic logic: find existing interim and update, or push new
                // For simplicity in this demo, we'll just push finalized ones or update tail
                // A more robust map-based approach (like in original) is better for updates

                // Let's stick to the map approach internally but expose array
                return newMessages; // Placeholder, see useEffect below
            });
        },
        [localParticipant]
    );

    // Re-implementing the Map-based logic for robustness inside the effect or a ref
    // Using a Ref to hold the map to avoid heavy state updates, then sync to state
    const [messagesMap, setMessagesMap] = useState<Map<string, ChatMessage>>(new Map());

    useEffect(() => {
        if (!room) return;

        const onTranscription = (segments: TranscriptionSegment[], participant?: Participant) => {
            if (!participant) return;
            const senderIsAgent = participant.identity !== localParticipant?.identity;

            setMessagesMap((prev) => {
                const next = new Map(prev);
                for (const segment of segments) {
                    next.set(segment.id, {
                        id: segment.id,
                        type: 'text',
                        text: segment.text.replace(/\[.*?\]/g, '').trim(),
                        sender: senderIsAgent ? "agent" : "user",
                        isInterim: !segment.final,
                        timestamp: segment.firstReceivedTime,
                    });
                }
                return next;
            });
        };

        const onData = (payload: Uint8Array, participant?: Participant, _kind?: any, topic?: string) => {
            // topic check if your backend sends it
            // Simple fallback decode
            const strData = new TextDecoder().decode(payload);
            try {
                const data = JSON.parse(strData);
                // Assuming standard format: { type: 'flashcard', title: '...', value: '...' }
                if (data.type === 'flashcard' || topic === 'ui.flashcard') {
                    const id = `card-${Date.now()}-${Math.random()}`;
                    setMessagesMap((prev) => {
                        const next = new Map(prev);
                        next.set(id, {
                            id,
                            type: 'flashcard',
                            cardData: {
                                title: data.title || "Info",
                                value: data.value || JSON.stringify(data)
                            },
                            sender: 'agent',
                            timestamp: Date.now(),
                            isInterim: false
                        });
                        return next;
                    });
                }
            } catch (e) { /* ignore non-json */ }
        };

        room.on(RoomEvent.TranscriptionReceived, onTranscription);
        room.on(RoomEvent.DataReceived, onData);

        return () => {
            room.off(RoomEvent.TranscriptionReceived, onTranscription);
            room.off(RoomEvent.DataReceived, onData);
        };
    }, [room, localParticipant]);

    // Derived array
    const sortedMessages = useMemo(() => {
        return Array.from(messagesMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    }, [messagesMap]);


    // --- State & Tracks ---
    // Simple state mapping
    const agentState: AgentState = state === 'speaking' ? 'speaking' :
        state === 'listening' ? 'listening' : 'idle';
    // 'thinking' is not a default state in standard hook, but we can infer if needed

    const activeTrack = useMemo(() => {
        if (agentTrack?.publication) {
            return {
                participant: agentTrack.participant,
                source: Track.Source.Microphone, // Agents usually act as microphone sources
                publication: agentTrack.publication
            } as TrackReferenceOrPlaceholder;
        }
        return undefined;
    }, [agentTrack]);

    const userTrack = useMemo(() => {
        if (localParticipant && microphoneTrack) {
            return {
                participant: localParticipant,
                source: Track.Source.Microphone,
                publication: microphoneTrack
            } as TrackReferenceOrPlaceholder;
        }
        return undefined;
    }, [localParticipant, microphoneTrack]);


    // --- Actions ---
    const toggleMic = useCallback((mute: boolean) => {
        if (localParticipant) {
            localParticipant.setMicrophoneEnabled(!mute);
        }
    }, [localParticipant]);

    const sendText = useCallback(async (text: string) => {
        if (localParticipant) {
            // Publish data to the room, backend handles it as text input
            // Standard pattern: encode text and send
            const encoder = new TextEncoder();
            const data = encoder.encode(JSON.stringify({ type: 'user_chat', text }));
            await localParticipant.publishData(data, { reliable: true });

            // Optimistically add to UI? or wait for echo?
            // Let's add optimistically for better UI feel
            const id = `local-${Date.now()}`;
            setMessagesMap((prev) => {
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
    }, [localParticipant]);

    return {
        agentState,
        messages: sortedMessages,
        activeTrack, // Agent audio
        userTrack,   // User mic
        toggleMic,
        sendText,
        roomState: room?.state
    };
}
