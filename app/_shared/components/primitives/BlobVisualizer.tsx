"use client";

import React, { useMemo } from "react";
import {
    useVoiceAssistant,
    useLocalParticipant,
    type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { BarVisualizer } from "./BarVisualizer";

/**
 * BlobVisualizer — two rolling "leaf" blobs with live voice bars on top.
 *
 * Two soft, heavily-blurred organic shapes (one green/teal, one purple/pink)
 * continuously rotate, float, scale and morph their border-radius at different
 * speeds and opposite directions, so they roll over one another like leaves.
 * A slow hue-rotate on the wrapper cycles the whole pair through color schemes
 * (green → blue → purple → pink). The BarVisualizer stays centered and crisp
 * above the blobs, reacting to real agent/user audio.
 *
 * Only used in the StarterScreen window variant — Canvas hides StarterScreen
 * entirely when cards / maps / forms are present, so the blobs vanish on answer.
 */
export const BlobVisualizer: React.FC = () => {
    const { audioTrack } = useVoiceAssistant();
    const { localParticipant, microphoneTrack } = useLocalParticipant();

    // Mirror useAgentInteraction's track resolution so the bars get real audio.
    const agentTrack = audioTrack?.publication?.track ? audioTrack : undefined;
    const userTrack: TrackReferenceOrPlaceholder | undefined = useMemo(() => {
        if (localParticipant && microphoneTrack?.track) {
            return {
                participant: localParticipant,
                source: Track.Source.Microphone,
                publication: microphoneTrack,
            } as TrackReferenceOrPlaceholder;
        }
        return undefined;
    }, [localParticipant, microphoneTrack]);

    return (
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
            {/* Color-cycling wrapper — hue-rotate continuously shifts both blobs
                through the whole palette. Sits ABOVE the perspective layer so the
                filter post-processes color without flattening the children's 3D. */}
            <div
                className="absolute inset-0"
                style={{ animation: "blob-hue 12s linear infinite", willChange: "filter" }}
            >
                {/* 3D perspective layer */}
                <div className="absolute inset-0" style={{ perspective: "700px", transformStyle: "preserve-3d" }}>
                    {/* Blob 1 — yellow ↔ sky-blue. Translucent so it composites THROUGH
                        blob 2 (soft alpha blend over the 7px edge) — no occlusion seam. */}
                    <div
                        className="absolute h-24 w-24 blur-[7px]"
                        style={{
                            top: "40px",
                            left: "40px",
                            zIndex: 3,
                            opacity: 0.8,
                            background:
                                "linear-gradient(135deg, #facc15 0%, #facc15 20%, #38bdf8 80%, #38bdf8 100%)",
                            borderRadius: "62% 38% 46% 54% / 60% 56% 44% 40%",
                            transformOrigin: "center",
                            animation: "leaf-wave-a 2.5s linear infinite",
                            willChange: "transform",
                        }}
                    />
                    {/* Blob 2 — light-orange ↔ purple, same translucency so the pair
                        reads as two soft glowing shapes passing through each other. */}
                    <div
                        className="absolute h-24 w-24 blur-[7px]"
                        style={{
                            top: "40px",
                            left: "40px",
                            zIndex: 2,
                            opacity: 0.8,
                            background:
                                "linear-gradient(135deg, #fdba74 0%, #fdba74 20%, #a855f7 80%, #a855f7 100%)",
                            borderRadius: "45% 55% 58% 42% / 50% 45% 55% 50%",
                            transformOrigin: "center",
                            animation: "leaf-wave-b 3s linear infinite",
                            willChange: "transform",
                        }}
                    />
                </div>
            </div>

            {/* Live audio bars — wider bars that grow bigger on speech, centered above the blobs */}
            <div className="relative z-10 flex h-12 w-32 items-center">
                <BarVisualizer
                    agentTrack={agentTrack}
                    userTrack={userTrack}
                    mode="mini"
                    barCount={14}
                    barWidth={5}
                    maxBarHeight={46}
                    barColor="rgba(255,255,255,0.6)"
                />
            </div>
        </div>
    );
};
