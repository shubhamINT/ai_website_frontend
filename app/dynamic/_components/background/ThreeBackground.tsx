'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const pseudoRandom = (seed: number) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
};

function ParticleField() {
    const ref = useRef<THREE.Points>(null);

    const circleTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context) {
            context.beginPath();
            context.arc(32, 32, 30, 0, Math.PI * 2);
            context.fillStyle = 'white';
            context.fill();
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    const particleCount = 3000;
    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const col = new Float32Array(particleCount * 3);

        const palette = [
            new THREE.Color('#f43f5e'),
            new THREE.Color('#f59e0b'),
            new THREE.Color('#6366f1'),
            new THREE.Color('#8b5cf6'),
            new THREE.Color('#06b6d4'),
        ];

        for (let index = 0; index < particleCount; index += 1) {
            const offset = index * 3;
            const radius = 8 + pseudoRandom(index + 1) * 12;
            const theta = pseudoRandom(index + 101) * 360 - 180;
            const phi = pseudoRandom(index + 1001) * 360 - 180;

            pos[offset] = radius * Math.sin(theta) * Math.cos(phi);
            pos[offset + 1] = radius * Math.sin(theta) * Math.sin(phi);
            pos[offset + 2] = radius * Math.cos(theta);

            const color = palette[Math.floor(pseudoRandom(index + 5001) * palette.length)];
            col[offset] = color.r;
            col[offset + 1] = color.g;
            col[offset + 2] = color.b;
        }

        return { positions: pos, colors: col };
    }, []);

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta * 0.05;
            ref.current.rotation.x += delta * 0.02;
        }
    });

    return (
        <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                vertexColors
                map={circleTexture}
                alphaTest={0.01}
                size={0.18}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

export const ThreeBackground: React.FC = () => {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
                <ambientLight intensity={1} />
                <fog attach="fog" args={['#FAFAFA', 5, 45]} />
                <ParticleField />
            </Canvas>
        </div>
    );
};
