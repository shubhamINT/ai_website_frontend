"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrackReferenceOrPlaceholder } from '@livekit/components-react';

import { useAudioFFT } from '@/app/hooks/useAudioFFT';

interface BarVisualizerProps {
    agentTrack?: TrackReferenceOrPlaceholder;
    userTrack?: TrackReferenceOrPlaceholder;
    mode?: 'full' | 'mini';
    barCount?: number;
}

export const BarVisualizer: React.FC<BarVisualizerProps> = ({
    agentTrack,
    userTrack,
    mode = 'full',
    barCount: customBarCount,
}) => {
    const barCount = customBarCount || (mode === 'mini' ? 12 : 30);
    const agentMediaTrack = agentTrack?.publication?.track?.mediaStreamTrack;
    const userMediaTrack = userTrack?.publication?.track?.mediaStreamTrack;

    const { data: agentData, isSpeaking: isAgentSpeaking } = useAudioFFT(agentMediaTrack, { fftSize: 128, barCount });
    const { data: userData, isSpeaking: isUserSpeaking } = useAudioFFT(userMediaTrack, { fftSize: 128, barCount });

    const isSpeaking = isAgentSpeaking || isUserSpeaking;

    const colors = {
        agent: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.4)' },
        user: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
        idle: { primary: '#94a3b8', secondary: '#64748b', glow: 'rgba(148, 163, 184, 0)' },
    };

    const activeTheme = isAgentSpeaking ? colors.agent : (isUserSpeaking ? colors.user : colors.idle);

    const combinedData = useMemo(() => {
        const result = new Uint8Array(barCount);

        for (let index = 0; index < barCount; index += 1) {
            const agentValue = agentData?.[index] || 0;
            const userValue = userData?.[index] || 0;
            result[index] = Math.max(agentValue, userValue);
        }

        return result;
    }, [agentData, userData, barCount]);

    return (
        <div
            className={`relative flex h-full w-full items-center justify-center ${mode === 'mini' ? 'gap-0.5' : 'gap-1'}`}
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            }}
        >
            {Array.from({ length: barCount }).map((_, index) => (
                <VisualizerBar
                    key={index}
                    value={combinedData[index]}
                    theme={activeTheme}
                    mode={mode}
                    isSpeaking={isSpeaking}
                    index={index}
                    total={barCount}
                />
            ))}
        </div>
    );
};

const VisualizerBar = ({ value, theme, mode, isSpeaking, index, total }: {
    value: number;
    theme: { primary: string; secondary: string; glow: string };
    mode: 'full' | 'mini';
    isSpeaking: boolean;
    index: number;
    total: number;
}) => {
    const norm = value / 255;
    const centerOffset = Math.abs(index - (total - 1) / 2) / ((total - 1) / 2);
    const positionMultiplier = 0.5 + 0.5 * Math.pow(Math.cos(centerOffset * Math.PI / 2), 0.5);
    const baseHeight = mode === 'mini' ? 4 : 6;
    const maxHeight = mode === 'mini' ? 24 : 64;
    const targetHeight = baseHeight + (norm * (maxHeight - baseHeight) * positionMultiplier);

    return (
        <motion.div
            initial={{ height: baseHeight }}
            animate={{
                height: targetHeight,
                backgroundColor: theme.primary,
            }}
            transition={{
                height: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    mass: 0.5,
                },
                backgroundColor: { duration: 0.2 },
            }}
            style={{
                boxShadow: isSpeaking && value > 10 ? `0 0 12px ${theme.glow}` : 'none',
                width: mode === 'mini' ? '3px' : '4px',
                minWidth: mode === 'mini' ? '3px' : '4px',
            }}
            className="relative z-10 flex-shrink-0 rounded-full"
        >
            <div className="pointer-events-none absolute inset-0 h-full w-full rounded-full bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
    );
};
