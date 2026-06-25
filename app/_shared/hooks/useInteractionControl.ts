import { useState, useCallback, useEffect } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import { InteractionMode, ChatMessage } from '../types/agentTypes';

export function useInteractionControl(
    updateMessages: (updater: (prev: Map<string, ChatMessage>) => Map<string, ChatMessage>) => void
) {
    const { localParticipant } = useLocalParticipant();
    const [mode, setInteractionMode] = useState<InteractionMode>('voice');

    // Exclusive Mode Management
    useEffect(() => {
        if (!localParticipant) return;

        if (mode === 'voice') {
            localParticipant.setMicrophoneEnabled(true);
        } else {
            localParticipant.setMicrophoneEnabled(false);
        }
    }, [localParticipant, mode]);


    const toggleMic = useCallback((mute: boolean) => {
        if (localParticipant) {
            // Mute = User wants silence. If they unmute, they enter Voice mode.
            if (!mute) {
                setInteractionMode('voice');
            }
            localParticipant.setMicrophoneEnabled(!mute);
        }
    }, [localParticipant]);

    const sendText = useCallback(async (text: string) => {
        if (!localParticipant) return;

        // System hints (prefixed [RESUME CONVERSATION]) go straight to the backend.
        // They must NOT appear in the UI, must NOT switch to text mode (voice stays on),
        // and must NOT be added to the message map (no transcript, no context-sync side-effects).
        const isSystemHint = text.startsWith('[RESUME CONVERSATION]');

        if (!isSystemHint) {
            setInteractionMode('text');
        }

        await localParticipant.sendText(text, { topic: 'lk.chat' });

        if (!isSystemHint) {
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
