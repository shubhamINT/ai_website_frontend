'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticleField() {
    const ref = useRef<THREE.Points>(null);
    
    // 1. Programmatically create a perfect circle texture for premium smooth dots
    const circleTexture = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (context) {
            context.beginPath();
            context.arc(32, 32, 28, 0, Math.PI * 2);
            context.fillStyle = 'white';
            context.fill();
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    const particleCount = 2000;
    const positions = useMemo(() => {
        const arr = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Spread them wide enough
            arr[i3] = (Math.random() - 0.5) * 50;     // X axis spread
            arr[i3 + 1] = (Math.random() - 0.5) * 50; // Y axis spread
            arr[i3 + 2] = (Math.random() - 0.5) * 20; // Z axis depth
        }
        return arr;
    }, []);

    // 2. Slow, graceful animation
    useFrame((state) => {
        if (ref.current) {
            const time = state.clock.getElapsedTime();
            ref.current.rotation.x = time * 0.02;
            ref.current.rotation.y = time * 0.03;
            
            // Subtle vertical drift
            ref.current.position.y = Math.sin(time * 0.5) * 0.2;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="#8b5cf6"
                transparent
                opacity={0.4}
                map={circleTexture || undefined}
                sizeAttenuation={true}
                depthWrite={false}
            />
        </points>
    );
}

export const ThreeBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 h-full w-full pointer-events-none overflow-hidden">
            <Canvas 
                camera={{ position: [0, 0, 25], fov: 60 }} 
                dpr={[1, 2]}
                gl={{ alpha: true, antialias: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={1.5} />
                <fog attach="fog" args={['#FAFAFA', 5, 45]} />
                <ParticleField />
            </Canvas>
        </div>
    );
};