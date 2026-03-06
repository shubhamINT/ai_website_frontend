import type { TranscriptionSegment } from "livekit-client";

import type { ChatMessage } from "@/app/hooks/agentTypes";

export function applyTranscriptionSegments(
    previousMessages: Map<string, ChatMessage>,
    segments: TranscriptionSegment[],
    sender: ChatMessage["sender"]
) {
    const nextMessages = new Map(previousMessages);
    let changed = false;

    for (const segment of segments) {
        const cleanText = segment.text.replace(/\[.*?\]|<.*?>/g, "").trim();

        if (!cleanText && segment.final) {
            continue;
        }

        const existingMessage = nextMessages.get(segment.id);
        const isInterim = !segment.final;

        if (
            existingMessage &&
            existingMessage.text === cleanText &&
            existingMessage.isInterim === isInterim
        ) {
            continue;
        }

        nextMessages.set(segment.id, {
            id: segment.id,
            type: "text",
            text: cleanText,
            sender,
            isInterim,
            timestamp: segment.firstReceivedTime,
        });
        changed = true;
    }

    return changed ? nextMessages : previousMessages;
}
