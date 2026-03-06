import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomAudioRenderer, useLocalParticipant } from '@livekit/components-react';

import { useAgentInteraction } from '@/app/hooks/useAgentInteraction';
import { useLocationPublishing } from '@/app/hooks/useLocationPublishing';
import { AgentControls } from '@/app/dynamic/_components/shell/AgentControls';
import { AgentVisualStage } from '@/app/dynamic/_components/shell/AgentVisualStage';
import { SubtitleOverlay } from '@/app/dynamic/_components/shell/SubtitleOverlay';

interface AgentInterfaceProps {
    onDisconnect: () => void;
}

export const AgentInterface: React.FC<AgentInterfaceProps> = ({ onDisconnect }) => {
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
    } = useAgentInteraction();
    const { localParticipant } = useLocalParticipant();

    const [inputText, setInputText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isAgentMuted, setIsAgentMuted] = useState(false);

    const latestAgentMessage = useMemo(() => {
        return [...messages].reverse().find((message) => message.sender === 'agent' && message.type === 'text') || null;
    }, [messages]);

    const locationRequestMessage = useMemo(() => {
        return [...messages].reverse().find((message) => message.type === 'location_request') || null;
    }, [messages]);

    useLocationPublishing(locationRequestMessage?.id, localParticipant);

    useEffect(() => {
        if (activeTrack?.publication?.track && 'setVolume' in activeTrack.publication.track) {
            (activeTrack.publication.track as { setVolume: (volume: number) => void }).setVolume(isAgentMuted ? 0 : 1);
        }
    }, [isAgentMuted, activeTrack]);

    const handleSend = () => {
        if (!inputText.trim()) {
            return;
        }

        void sendText(inputText);
        setInputText('');
    };

    const handleMicToggle = () => {
        if (mode === 'text') {
            setInteractionMode('voice');
            setIsMuted(false);
            toggleMic(false);
            return;
        }

        const nextMutedState = !isMuted;
        setIsMuted(nextMutedState);
        toggleMic(nextMutedState);
    };

    const handleInputChange = (value: string) => {
        setInputText(value);
        if (mode !== 'text') {
            setInteractionMode('text');
        }
    };

    const handleInputFocus = () => {
        if (mode !== 'text') {
            setInteractionMode('text');
        }
    };

    return (
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-3xl bg-transparent shadow-2xl ring-1 ring-black/5">
            <RoomAudioRenderer />

            <AnimatePresence>
                {agentState === 'thinking' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 flex items-center justify-center bg-white/10 backdrop-blur-[2px]"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex gap-2">
                                {[0, 1, 2].map((index) => (
                                    <motion.div
                                        key={index}
                                        className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: index * 0.1, ease: 'easeInOut' }}
                                    />
                                ))}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600/80">Thinking</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AgentVisualStage
                messages={messages}
                updateMessages={updateMessages}
                isThinking={agentState === 'thinking'}
            />

            <SubtitleOverlay text={latestAgentMessage?.text ?? null} isInterim={Boolean(latestAgentMessage?.isInterim)} />

            <AgentControls
                activeTrack={activeTrack}
                userTrack={userTrack}
                mode={mode}
                isMuted={isMuted}
                isAgentMuted={isAgentMuted}
                inputText={inputText}
                onInputChange={handleInputChange}
                onInputFocus={handleInputFocus}
                onSend={handleSend}
                onMicToggle={handleMicToggle}
                onToggleAgentMute={() => setIsAgentMuted((prev) => !prev)}
                onDisconnect={onDisconnect}
            />
        </div>
    );
};
