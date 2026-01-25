import { useEffect, useState, useCallback } from "react";
import { RoomEvent, Participant } from "livekit-client";
import type { TranscriptionSegment } from "livekit-client";
import { useRoomContext, useLocalParticipant } from "@livekit/components-react";

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

export interface LiveKitTranscriptionsHook {
    messages: ChatMessage[];
    addLocalMessage: (text: string) => void;
}

export function useLiveKitTranscriptions(): LiveKitTranscriptionsHook {
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    const [messages, setMessages] = useState<Map<string, ChatMessage>>(new Map());

    const handleTranscription = useCallback(
        (segments: TranscriptionSegment[], participant?: Participant) => {
            if (!participant) return;
            const senderIsAgent = participant.identity !== localParticipant?.identity;

            setMessages((prev) => {
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
        },
        [localParticipant]
    );

    const handleData = useCallback(
        (payload: Uint8Array, participant?: Participant, _kind?: any, topic?: string) => {
            if (!topic) return;

            const senderIsAgent = participant?.identity !== localParticipant?.identity;
            const strData = new TextDecoder().decode(payload);

            if (topic === 'ui.flashcard') {
                try {
                    const data = JSON.parse(strData);
                    if (data.type === 'flashcard') {
                        const id = `card-${Date.now()}`;
                        setMessages((prev) => {
                            const next = new Map(prev);
                            next.set(id, {
                                id,
                                type: 'flashcard',
                                cardData: {
                                    title: data.title,
                                    value: data.value
                                },
                                sender: 'agent',
                                timestamp: Date.now(),
                                isInterim: false
                            });
                            return next;
                        });
                    }
                } catch (e) {
                    console.error(e);
                }
                return;
            }

            if (topic === 'ui.text') {
                let text = strData;
                try {
                    const data = JSON.parse(strData);
                    if (typeof data?.text === 'string') {
                        text = data.text;
                    }
                } catch {
                    // fall back to raw text
                }

                const id = `text-${Date.now()}-${Math.random().toString(16).slice(2)}`;
                setMessages((prev) => {
                    const next = new Map(prev);
                    next.set(id, {
                        id,
                        type: 'text',
                        text,
                        sender: senderIsAgent ? 'agent' : 'user',
                        timestamp: Date.now(),
                        isInterim: false
                    });
                    return next;
                });
            }
        },
        [localParticipant]
    );

    useEffect(() => {
        if (!room) return;
        room.on(RoomEvent.TranscriptionReceived, handleTranscription);
        room.on(RoomEvent.DataReceived, handleData);
        return () => {
            room.off(RoomEvent.TranscriptionReceived, handleTranscription);
            room.off(RoomEvent.DataReceived, handleData);
        };
    }, [room, handleTranscription, handleData]);

    const addLocalMessage = useCallback((text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const id = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setMessages((prev) => {
            const next = new Map(prev);
            next.set(id, {
                id,
                type: 'text',
                text: trimmed,
                sender: 'user',
                isInterim: false,
                timestamp: Date.now()
            });
            return next;
        });
    }, []);

    return {
        messages: Array.from(messages.values()).sort((a, b) => a.timestamp - b.timestamp),
        addLocalMessage
    };
}
