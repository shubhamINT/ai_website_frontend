"use client";

import React, { useMemo, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';

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
    barCount: customBarCount
}) => {
    const agentVol = useTrackVolume(agentTrack as any);
    const userVol = useTrackVolume(userTrack as any);

    // Debug: log volume values
    useEffect(() => {
        if (agentVol > 0 || userVol > 0) {
            console.log('[BarVisualizer] Volume:', { agentVol, userVol, hasAgentTrack: !!agentTrack?.publication?.track, hasUserTrack: !!userTrack?.publication?.track });
        }
    }, [agentVol, userVol, agentTrack, userTrack]);

    // Dynamic bar count based on mode - optimized for the 48px/64px container
    const barCount = customBarCount || (mode === 'mini' ? 10 : 24);

    // Audio State Logic
    const aVol = Math.max(0, agentVol || 0);
    const uVol = Math.max(0, userVol || 0);

    // Lower threshold for "speaking" state to catch softer audio
    const isAgentSpeaking = aVol > 0.005;
    const activeVol = Math.max(aVol, uVol);
    const isSpeaking = activeVol > 0.005;

    // Premium Color Tokens
    const colors = {
        agent: { primary: '#10b981', secondary: '#059669', glow: 'rgba(16, 185, 129, 0.4)' },
        user: { primary: '#3b82f6', secondary: '#2563eb', glow: 'rgba(59, 130, 246, 0.4)' },
        idle: { primary: '#94a3b8', secondary: '#64748b', glow: 'rgba(148, 163, 184, 0)' }
    };

    const activeTheme = !isSpeaking ? colors.idle : isAgentSpeaking ? colors.agent : colors.user;

    // Create a smoothed volume value with enhanced physics for better vibration
    const smoothVol = useSpring(activeVol, {
        stiffness: 400, // Stiffer for snappier response
        damping: 20,    // Less damping for more "life"
        mass: 0.2       // Lighter mass for quick reaction
    });

    // Generate bar configurations with organic variation
    const bars = useMemo(() => {
        return Array.from({ length: barCount }).map((_, i) => {
            // Distance from center (0 to 1)
            const centerOffset = Math.abs(i - (barCount - 1) / 2) / ((barCount - 1) / 2);
            // Bell curve multiplier
            const multiplier = Math.pow(Math.cos(centerOffset * Math.PI / 2), 1.5);
            // Random jitter factor for "organic" feel
            const jitter = 0.8 + Math.random() * 0.4;

            return {
                multiplier: multiplier * jitter,
                delay: i * 0.01,
            };
        });
    }, [barCount]);

    return (
        <div
            className={`
                relative flex items-center justify-center w-full h-full
                ${mode === 'mini' ? 'gap-0.5' : 'gap-1.5'}
            `}
            style={{
                // Fade out edges for a high-end "optical" look
                maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
            }}
        >
            {bars.map((bar, i) => (
                <VisualizerBar
                    key={i}
                    volume={smoothVol}
                    theme={activeTheme}
                    multiplier={bar.multiplier}
                    mode={mode}
                    isSpeaking={isSpeaking}
                />
            ))}
        </div>
    );
};

const VisualizerBar = ({ volume, theme, multiplier, mode, isSpeaking }: any) => {
    // Non-linear height scaling for better visual impact
    const height = useTransform(
        volume,
        [0, 0.05, 0.2, 0.6, 1], // More granular mapping for low volume sensitivity
        [
            mode === 'mini' ? 4 : 8, // Base height
            mode === 'mini' ? 10 : 20,
            mode === 'mini' ? 20 : 45,
            mode === 'mini' ? 28 : 70,
            mode === 'mini' ? 32 : 90  // Max height
        ]
    );

    // Apply the per-bar multiplier
    const scaledHeight = useTransform(height, (v) => v * multiplier);

    return (
        <motion.div
            style={{
                height: scaledHeight,
                backgroundColor: theme.primary,
                boxShadow: isSpeaking ? `0 0 12px ${theme.glow}` : 'none',
                // Responsive width: slightly thicker in center
                width: mode === 'mini' ? '3px' : '4px',
                minWidth: mode === 'mini' ? '3px' : '4px',
            }}
            animate={{
                backgroundColor: theme.primary,
            }}
            transition={{
                backgroundColor: { duration: 0.15, ease: "linear" } // Faster color transitions
            }}
            className="rounded-full relative z-10 flex-shrink-0"
        >
            {/* Glossy overlay */}
            <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </motion.div>
    );
};