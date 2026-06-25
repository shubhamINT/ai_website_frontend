"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { useAudioFFT } from './useAudioFFT';

interface BarVisualizerProps {
    agentTrack?: TrackReferenceOrPlaceholder;
    userTrack?: TrackReferenceOrPlaceholder;
    mode?: 'full' | 'mini';
    barCount?: number;
    /** Override bar width in px (defaults to mode: mini 3, full 4). */
    barWidth?: number;
    /** Override the max bar height in px when speaking (defaults to mode: mini 24, full 64). */
    maxBarHeight?: number;
    /** Override bar color (e.g. translucent white for a glass look). Defaults to the speaking theme color. */
    barColor?: string;
}

export const BarVisualizer: React.FC<BarVisualizerProps> = ({
    agentTrack,
    userTrack,
    mode = 'full',
    barCount: customBarCount,
    barWidth,
    maxBarHeight,
    barColor,
}) => {
    // Dynamic bar count based on mode
    const barCount = customBarCount || (mode === 'mini' ? 12 : 30);

    // access the raw media stream tracks
    const agentMediaTrack = agentTrack?.publication?.track?.mediaStreamTrack;
    const userMediaTrack = userTrack?.publication?.track?.mediaStreamTrack;

    // Get FFT data for both with built-in sampling and speaking detection
    const { data: agentData, isSpeaking: isAgentSpeaking } = useAudioFFT(agentMediaTrack, { fftSize: 128, barCount });
    const { data: userData, isSpeaking: isUserSpeaking } = useAudioFFT(userMediaTrack, { fftSize: 128, barCount });

    const isSpeaking = isAgentSpeaking || isUserSpeaking;

    // Premium Color Tokens
    const colors = {
        agent: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.4)' },
        user: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
        idle: { primary: '#94a3b8', secondary: '#64748b', glow: 'rgba(148, 163, 184, 0)' }
    };

    // Determine active theme
    const activeTheme = isAgentSpeaking ? colors.agent : (isUserSpeaking ? colors.user : colors.idle);

    // Combine data: We want to visualize whoever is speaking essentially.
    const combinedData = useMemo(() => {
        // If one is speaking specifically, show that. If both or neither, show max.
        const result = new Uint8Array(barCount);
        for (let i = 0; i < barCount; i++) {
            const aVal = agentData?.[i] || 0;
            const uVal = userData?.[i] || 0;
            result[i] = Math.max(aVal, uVal);
        }
        return result;
    }, [agentData, userData, barCount]);


    return (
        <div
            className={`
                relative flex items-center justify-center w-full h-full
                ${mode === 'mini' ? 'gap-0.5' : 'gap-1'}
            `}
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
            }}
        >
            {Array.from({ length: barCount }).map((_, i) => (
                <VisualizerBar
                    key={i}
                    value={combinedData[i]} // 0-255
                    theme={activeTheme}
                    mode={mode}
                    isSpeaking={isSpeaking}
                    index={i}
                    total={barCount}
                    barWidth={barWidth}
                    maxBarHeight={maxBarHeight}
                    barColor={barColor}
                />
            ))}
        </div>
    );
};

const VisualizerBar = ({ value, theme, mode, isSpeaking, index, total, barWidth, maxBarHeight, barColor }: any) => {
    // Enhance the value with some shaping (bell curve) to avoid "wall of sound" look if input is flat
    // but relies mostly on FFT data.

    // Scale 0-255 to height pixels
    // Min height when idle: 4px
    // Max height: container height (approx 48-64px?)

    // Normalize value 0-1
    const norm = value / 255;

    // Apply a slight bell curve attenuation to edges to keep the "focused" look?
    const centerOffset = Math.abs(index - (total - 1) / 2) / ((total - 1) / 2); // 0 at center, 1 at edges
    const positionMultiplier = 0.5 + 0.5 * Math.pow(Math.cos(centerOffset * Math.PI / 2), 0.5); // 1.0 at center, 0.5 at edges

    // Calculate target height (maxHeight overridable so a host can make speaking
    // bars grow bigger; falls back to the mode default).
    const baseHeight = mode === 'mini' ? 4 : 6;
    const maxHeight = maxBarHeight ?? (mode === 'mini' ? 24 : 64);

    const targetHeight = baseHeight + (norm * (maxHeight - baseHeight) * positionMultiplier);

    // Idle wave: stagger delay spreads the sine phase across all bars (1.6 s full
    // cycle), creating a slow ripple. Uses CSS scaleY (not height) so it doesn't
    // conflict with framer-motion's spring height animation.
    const idleDelay = isSpeaking ? '0s' : `${((index / total) * 1.6).toFixed(2)}s`;

    return (
        <motion.div
            initial={{ height: baseHeight }}
            animate={{
                height: targetHeight,
                backgroundColor: barColor ?? theme.primary,
            }}
            transition={{
                height: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.5
                },
                backgroundColor: { duration: 0.2 }
            }}
            style={{
                boxShadow: isSpeaking && value > 10
                    ? `0 0 12px ${barColor ? 'rgba(255,255,255,0.55)' : theme.glow}`
                    : 'none',
                width: `${barWidth ?? (mode === 'mini' ? 3 : 4)}px`,
                transformOrigin: 'bottom',
                animation: isSpeaking ? 'none' : `bar-idle-wave 2.4s ease-in-out ${idleDelay} infinite`,
                minWidth: `${barWidth ?? (mode === 'mini' ? 3 : 4)}px`,
            }}
            className="rounded-full relative z-10 shrink-0"
        >
            {/* Glossy overlay — softer (white-glass) when a custom barColor is used */}
            <div className={`absolute inset-0 w-full h-full rounded-full pointer-events-none bg-linear-to-t ${barColor ? 'from-white/30' : 'from-black/20'} to-transparent`} />
        </motion.div>
    );
};