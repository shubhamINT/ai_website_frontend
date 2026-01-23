import React, { useEffect, useRef } from 'react';
import { type TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';

interface AudioVisualizerProps {
    trackRef?: TrackReferenceOrPlaceholder;
    color?: string;
    barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
    trackRef,
    color = "bg-indigo-500",
    barCount = 7
}) => {
    // LiveKit's hook to get volume (0-1)
    // We cast to any to avoid strict type mismatch with TrackReferenceOrPlaceholder
    // in some versions of the SDK where it strictly expects TrackReference.
    const volume = useTrackVolume(trackRef as any);


    // We'll create a few bars that react to volume
    // To make it look "organic", we'll offset their heights based on volume + index

    return (
        <div className="flex h-12 items-center justify-center gap-1.5">
            {Array.from({ length: barCount }).map((_, i) => (
                <VisualizerBar
                    key={i}
                    index={i}
                    total={barCount}
                    volume={volume || 0}
                    color={color}
                />
            ))}
        </div>
    );
};

const VisualizerBar = ({ index, total, volume, color }: { index: number, total: number, volume: number, color: string }) => {
    // Calculate a height multiplier based on a bell curve (center bars higher)
    const center = (total - 1) / 2;
    const distance = Math.abs(index - center);
    const maxScale = 1 - (distance / center) * 0.5; // Scale down edges

    // Dynamic height: base height + volume reaction
    // Clamp volume to useful range
    const effectiveVol = Math.max(0.1, volume);
    const height = 8 + (effectiveVol * 40 * maxScale);

    // Add some random/perlin noise simulation for "alive" feel even when silent (breathing)
    // For now, simple CSS animation will handle the "breathing" if volume is 0
    // But here we set explicit height style

    return (
        <div
            className={`w-1.5 rounded-full transition-all duration-100 ease-out ${color} ${volume > 0.01 ? 'opacity-100' : 'opacity-40 animate-pulse'}`}
            style={{
                height: `${height}px`,
                // Adding a tiny transform for smoother feel
                transform: `scaleY(${volume > 0.01 ? 1 : 0.8})`
            }}
        />
    );
};
