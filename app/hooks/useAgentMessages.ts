import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useRoomContext, useLocalParticipant } from "@livekit/components-react";
import { RoomEvent, type Participant } from "livekit-client";

import type { ChatMessage } from "@/app/hooks/agentTypes";
import { LIVEKIT_TOPICS } from "@/app/hooks/topics";
import {
    createAgentTextMessage,
    createContactFormMessage,
    createFlashcardMessage,
    createGlobalPresenceMessage,
    createJobApplicationMessage,
    createLocationRequestMessage,
    createMapPolylineMessage,
    createMeetingMessage,
    createNearbyOfficesMessage,
    extractUserInfoPatch,
    getFlashcardStreamId,
    isMapPolylinePayload,
    removeMessagesByType,
} from "@/app/hooks/_lib/parsers/message-factories";
import { applyTranscriptionSegments } from "@/app/hooks/_lib/parsers/transcription";
import { mergeStoredUserInfo } from "@/app/hooks/_lib/storage/userInfo.storage";

export function useAgentMessages() {
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();

    const [messagesMap, setMessagesMap] = useState<Map<string, ChatMessage>>(new Map());
    const messagesRef = useRef<Map<string, ChatMessage>>(new Map());
    const cleanupTimeoutsRef = useRef<number[]>([]);
    const onStreamCompleteRef = useRef<(() => void) | null>(null);

    const updateMessages = useCallback((updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => {
        setMessagesMap((prev) => {
            const next = updater(prev);
            messagesRef.current = next;
            return next;
        });
    }, []);

    const scheduleMessageRemoval = useCallback(
        (id: string, delayMs: number) => {
            const timeoutId = window.setTimeout(() => {
                updateMessages((prev) => {
                    const next = new Map(prev);
                    next.delete(id);
                    return next;
                });
            }, delayMs);

            cleanupTimeoutsRef.current.push(timeoutId);
        },
        [updateMessages]
    );

    const sortedMessages = useMemo(() => {
        return Array.from(messagesMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    }, [messagesMap]);

    useEffect(() => {
        return () => {
            cleanupTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
            cleanupTimeoutsRef.current = [];
        };
    }, []);

    useEffect(() => {
        if (!room) {
            return;
        }

        const onTranscription = (segments: Parameters<typeof applyTranscriptionSegments>[1], participant?: Participant) => {
            if (!participant) {
                return;
            }

            const sender: ChatMessage["sender"] = participant.identity !== localParticipant?.identity ? "agent" : "user";
            updateMessages((prev) => applyTranscriptionSegments(prev, segments, sender));
        };

        const onData = (_payload: Uint8Array, _participant?: Participant, _kind?: unknown, topic?: string) => {
            const rawMessage = new TextDecoder().decode(_payload);

            try {
                const data = JSON.parse(rawMessage);

                if (topic === LIVEKIT_TOPICS.flashcard || data.type === "flashcard" || data.type === "end_of_stream") {
                    if (data.type === "end_of_stream") {
                        onStreamCompleteRef.current?.();
                        return;
                    }

                    const nextMessage = createFlashcardMessage(data);
                    const streamId = getFlashcardStreamId(data);

                    updateMessages((prev) => {
                        const next = new Map(prev);
                        const flashcards = Array.from(next.values()).filter((message) => message.type === "flashcard");
                        const currentStreamId = flashcards[flashcards.length - 1]?.cardData?.stream_id;

                        if (streamId && currentStreamId && streamId !== currentStreamId) {
                            removeMessagesByType(next, "flashcard");
                        }

                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });
                    return;
                }

                if (topic === LIVEKIT_TOPICS.text || data.type === "agent_chat") {
                    const nextMessage = createAgentTextMessage(data, rawMessage);
                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });
                    return;
                }

                if (topic === LIVEKIT_TOPICS.userDetails) {
                    mergeStoredUserInfo(extractUserInfoPatch(data));
                    return;
                }

                if (data.type === "map.polyline") {
                    const nextMessage = createMapPolylineMessage(data);
                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });
                    return;
                }

                if (topic === LIVEKIT_TOPICS.locationRequest || data.type === "location_request") {
                    if (isMapPolylinePayload(data)) {
                        const nextMessage = createMapPolylineMessage(data);
                        updateMessages((prev) => {
                            const next = new Map(prev);
                            next.set(nextMessage.id, nextMessage);
                            return next;
                        });
                        return;
                    }

                    const nextMessage = createLocationRequestMessage(data);
                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });
                    scheduleMessageRemoval(nextMessage.id, 30000);
                    return;
                }

                if (topic === LIVEKIT_TOPICS.contactForm || data.type === "contact_form" || data.type === "contact_form_submit") {
                    const isSubmit = data.type === "contact_form_submit";
                    const nextMessage = createContactFormMessage(data, isSubmit);

                    updateMessages((prev) => {
                        const next = new Map(prev);

                        if (isSubmit) {
                            removeMessagesByType(next, "contact_form");
                        }

                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });

                    if (isSubmit) {
                        scheduleMessageRemoval(nextMessage.id, 2000);
                    }
                    return;
                }

                if (topic === LIVEKIT_TOPICS.meetingForm || data.type === "meeting_form" || data.type === "meeting_invite_submit") {
                    const isSubmit = data.type === "meeting_invite_submit";
                    const nextMessage = createMeetingMessage(data, isSubmit);

                    updateMessages((prev) => {
                        const next = new Map(prev);

                        if (isSubmit) {
                            removeMessagesByType(next, "meeting_form");
                        }

                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });

                    if (isSubmit) {
                        scheduleMessageRemoval(nextMessage.id, 2500);
                    }
                    return;
                }

                if (topic === LIVEKIT_TOPICS.globalPresence || data.type === "global_presence") {
                    const nextMessage = createGlobalPresenceMessage(data);
                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });
                    return;
                }

                if (topic === LIVEKIT_TOPICS.nearbyOffices || data.type === "nearby_offices") {
                    const nextMessage = createNearbyOfficesMessage(data);
                    updateMessages((prev) => {
                        const next = new Map(prev);
                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });
                    return;
                }

                if (topic === LIVEKIT_TOPICS.jobApplication || data.type === "job_application_preview" || data.type === "job_application_submit") {
                    const isSubmit = data.type === "job_application_submit";
                    const nextMessage = createJobApplicationMessage(data, isSubmit);

                    updateMessages((prev) => {
                        const next = new Map(prev);

                        if (isSubmit) {
                            removeMessagesByType(next, "job_application_preview");
                        }

                        next.set(nextMessage.id, nextMessage);
                        return next;
                    });

                    if (isSubmit) {
                        scheduleMessageRemoval(nextMessage.id, 2500);
                    }
                }
            } catch {
                return;
            }
        };

        room.on(RoomEvent.TranscriptionReceived, onTranscription);
        room.on(RoomEvent.DataReceived, onData);

        return () => {
            room.off(RoomEvent.TranscriptionReceived, onTranscription);
            room.off(RoomEvent.DataReceived, onData);
        };
    }, [room, localParticipant, scheduleMessageRemoval, updateMessages]);

    return {
        messages: sortedMessages,
        messagesRef,
        updateMessages,
        onStreamCompleteRef,
    };
}
