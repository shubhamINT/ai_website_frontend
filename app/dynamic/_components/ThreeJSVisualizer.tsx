"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { TrackReferenceOrPlaceholder, useTrackVolume } from '@livekit/components-react';
import * as THREE from 'three';

interface ThreeJSVisualizerProps {
    agentTrack?: TrackReferenceOrPlaceholder;
    userTrack?: TrackReferenceOrPlaceholder;
}

const AnimatedBlob = ({ agentTrack, userTrack }: ThreeJSVisualizerProps) => {
    const materialRef = useRef<any>(null);
    const agentVol = useTrackVolume(agentTrack as any);
    const userVol = useTrackVolume(userTrack as any);

    useFrame((state) => {
        if (!materialRef.current) return;

        // Clean volume values
        const aVol = Math.max(0, agentVol || 0);
        const uVol = Math.max(0, userVol || 0);

        // Total activity
        const totalVol = Math.min(1, aVol + uVol);

        // Distort Animation
        const targetDistort = 0.4 + (totalVol * 0.6);
        const targetSpeed = 3 + (totalVol * 4);

        // Smooth interpolation
        materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.15);
        materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 0.15);

        // Color Handling
        const baseColor = new THREE.Color("#4f46e5"); // Indigo 600
        const userColor = new THREE.Color("#10b981"); // Emerald 500

        let mixFactor = 0;
        if (uVol > 0.05 && uVol > aVol) {
            mixFactor = Math.min(1, uVol * 4);
        }

        const targetColor = baseColor.clone().lerp(userColor, mixFactor);
        materialRef.current.color.lerp(targetColor, 0.1);
    });

    return (
        <Float speed={5} rotationIntensity={0.2} floatIntensity={0.2}>
            <Sphere args={[1, 64, 64]} scale={1.2}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#4f46e5"
                    roughness={0.1}
                    metalness={0.6}
                    distort={0.4}
                    speed={3}
                />
            </Sphere>
        </Float>
    );
};

export const ThreeJSVisualizer: React.FC<ThreeJSVisualizerProps> = (props) => {
    return (
        <div className="h-full w-full overflow-hidden">
            <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
                <ambientLight intensity={1.5} />
                <pointLight position={[5, 5, 5]} intensity={2.5} color="#ffffff" />
                <pointLight position={[-5, -5, -5]} intensity={1.5} color="#4f46e5" />
                <AnimatedBlob {...props} />
            </Canvas>
        </div>
    );
};
