import { useState, useCallback, useEffect } from "react";
import { useLocalParticipant } from "@livekit/components-react";

import type { ChatMessage, InteractionMode } from "@/app/hooks/agentTypes";
import { LIVEKIT_TOPICS } from "@/app/hooks/topics";

export function useInteractionControl(
    updateMessages: (updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => void
) {
    const { localParticipant } = useLocalParticipant();
    const [mode, setInteractionMode] = useState<InteractionMode>("voice");

    useEffect(() => {
        if (!localParticipant) {
            return;
        }

        localParticipant.setMicrophoneEnabled(mode === "voice");
    }, [localParticipant, mode]);

    const toggleMic = useCallback(
        (mute: boolean) => {
            if (!localParticipant) {
                return;
            }

            if (!mute) {
                setInteractionMode("voice");
            }

            localParticipant.setMicrophoneEnabled(!mute);
        },
        [localParticipant]
    );

    const sendText = useCallback(
        async (text: string) => {
            if (!localParticipant) {
                return;
            }

            setInteractionMode("text");
            await localParticipant.sendText(text, { topic: LIVEKIT_TOPICS.chat });

            const id = `local-${Date.now()}`;
            updateMessages((prev) => {
                const next = new Map(prev);
                next.set(id, {
                    id,
                    sender: "user",
                    type: "text",
                    text,
                    timestamp: Date.now(),
                    isInterim: false,
                });
                return next;
            });
        },
        [localParticipant, updateMessages]
    );

    return {
        mode,
        setInteractionMode,
        toggleMic,
        sendText,
    };
}
