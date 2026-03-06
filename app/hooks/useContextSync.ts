import { useRef, useCallback, useEffect } from "react";
import { useRoomContext, useLocalParticipant, useVoiceAssistant } from "@livekit/components-react";

import type { ChatMessage } from "@/app/hooks/agentTypes";
import { LIVEKIT_TOPICS } from "@/app/hooks/topics";
import { publishJsonData } from "@/app/hooks/_lib/livekit/publish";
import { ensureStoredUserInfo } from "@/app/hooks/_lib/storage/userInfo.storage";

export function useContextSync(
    messagesRef: React.MutableRefObject<Map<string, ChatMessage>>,
    onStreamCompleteRef: React.MutableRefObject<(() => void) | null>
) {
    const { localParticipant } = useLocalParticipant();
    const room = useRoomContext();
    const { audioTrack: agentTrack } = useVoiceAssistant();
    const roomState = room?.state;
    const hasAgentTrack = Boolean(agentTrack);

    const syncPerformed = useRef(false);
    const syncRef = useRef<() => void>(() => undefined);

    const syncUIContext = useCallback(() => {
        if (!localParticipant || !room || room.state !== "connected") {
            return;
        }

        const isMobile = window.innerWidth < 768;
        const currentMessages = Array.from(messagesRef.current.values()).sort((a, b) => a.timestamp - b.timestamp);

        const visibleCards = currentMessages
            .filter((message) => message.type === "flashcard")
            .map((message) => ({
                id: message.id,
                type: message.type,
                title: message.cardData?.title,
                summary:
                    message.cardData?.value?.substring(0, 100) +
                    (message.cardData?.value && message.cardData.value.length > 100 ? "..." : ""),
            }));

        const userInfo = ensureStoredUserInfo();

        void publishJsonData(
            localParticipant,
            {
                type: "ui.context_sync",
                timestamp: Date.now(),
                viewport: {
                    screen: isMobile ? "mobile" : "desktop",
                    density: isMobile ? "compact" : "comfortable",
                    theme: "light",
                    capabilities: {
                        canRenderCards: true,
                        maxVisibleCards: isMobile ? 1 : Math.floor(window.innerWidth / 320),
                        supportsRichUI: true,
                        supportsDynamicMedia: true,
                    },
                },
                active_elements: visibleCards,
            },
            {
                reliable: true,
                topic: LIVEKIT_TOPICS.uiContext,
            }
        );

        void publishJsonData(
            localParticipant,
            {
                type: "user.context_sync",
                timestamp: Date.now(),
                user_info: userInfo,
            },
            {
                reliable: true,
                topic: LIVEKIT_TOPICS.userContext,
            }
        );
    }, [localParticipant, room, messagesRef]);

    useEffect(() => {
        syncRef.current = syncUIContext;
    }, [syncUIContext]);

    useEffect(() => {
        onStreamCompleteRef.current = syncUIContext;
        return () => {
            onStreamCompleteRef.current = null;
        };
    }, [syncUIContext, onStreamCompleteRef]);

    useEffect(() => {
        if (roomState === "connected") {
            if (agentTrack && !syncPerformed.current) {
                syncUIContext();
                syncPerformed.current = true;
            }

            let timeout: ReturnType<typeof setTimeout>;

            const handleResize = () => {
                clearTimeout(timeout);
                timeout = setTimeout(syncUIContext, 1000);
            };

            window.addEventListener("resize", handleResize);

            return () => {
                window.removeEventListener("resize", handleResize);
                clearTimeout(timeout);
            };
        }

        syncPerformed.current = false;
        return undefined;
    }, [roomState, hasAgentTrack, agentTrack, syncUIContext]);

    return {
        syncUIContext,
    };
}
