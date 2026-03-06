import { useMemo } from "react";
import {
    useVoiceAssistant,
    useLocalParticipant,
    useRoomContext,
    type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Track } from "livekit-client";

import type { AgentState } from "@/app/hooks/agentTypes";
export type {
    AgentState,
    InteractionMode,
    FlashcardStyle,
    ChatMessage,
} from "@/app/hooks/agentTypes";
import { useAgentMessages } from "@/app/hooks/useAgentMessages";
import { useContextSync } from "@/app/hooks/useContextSync";
import { useInteractionControl } from "@/app/hooks/useInteractionControl";

export function useAgentInteraction() {
    const { state, audioTrack: agentTrack } = useVoiceAssistant();
    const { localParticipant, microphoneTrack } = useLocalParticipant();
    const room = useRoomContext();

    const { messages, messagesRef, updateMessages, onStreamCompleteRef } = useAgentMessages();
    useContextSync(messagesRef, onStreamCompleteRef);
    const { mode, setInteractionMode, toggleMic, sendText } = useInteractionControl(updateMessages);

    const agentState: AgentState =
        state === "speaking"
            ? "speaking"
            : state === "listening"
              ? "listening"
              : state === "thinking" || (state as string) === "loading"
                ? "thinking"
                : "idle";

    const activeTrack = useMemo(() => {
        if (agentTrack?.publication?.track) {
            return agentTrack;
        }

        return undefined;
    }, [agentTrack]);

    const userTrack = useMemo(() => {
        if (localParticipant && microphoneTrack?.track) {
            return {
                participant: localParticipant,
                source: Track.Source.Microphone,
                publication: microphoneTrack,
            } as TrackReferenceOrPlaceholder;
        }

        return undefined;
    }, [localParticipant, microphoneTrack]);

    return {
        agentState,
        mode,
        setInteractionMode,
        messages,
        updateMessages,
        activeTrack,
        userTrack,
        toggleMic,
        sendText,
        roomState: room?.state,
    };
}
