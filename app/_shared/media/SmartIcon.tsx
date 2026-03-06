'use client';

import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

interface SmartIconProps extends LucideProps {
    type?: 'animated' | 'static';
    iconRef: string;
    fallback?: string;
    className?: string;
}

const dynamicIcons = Object.fromEntries(
    Object.entries(dynamicIconImports).map(([key, importer]) => [key, dynamic(importer)])
) as Record<string, React.ComponentType<LucideProps>>;

const LucideIcon = ({ name, ...props }: { name: string } & LucideProps) => {
    const IconComponent = dynamicIcons[name] || dynamicIcons.info;

    return (
        <Suspense fallback={<div className="h-5 w-5 animate-pulse rounded-full bg-zinc-200" />}>
            <IconComponent {...props} />
        </Suspense>
    );
};

const LottieIcon = ({ src, className }: { src: string; className?: string }) => {
    const [Lottie, setLottie] = useState<React.ComponentType<{ animationData: unknown; loop?: boolean; className?: string }> | null>(null);
    const [animationData, setAnimationData] = useState<unknown>(null);

    useEffect(() => {
        import('lottie-react').then((mod) => setLottie(() => mod.default));

        if (src.startsWith('http')) {
            fetch(src)
                .then((res) => res.json())
                .then((data) => setAnimationData(data))
                .catch((error) => console.error('Failed to load Lottie:', error));
        }
    }, [src]);

    if (!Lottie || !animationData) {
        return <div className={`animate-pulse rounded-full bg-zinc-100 ${className}`} />;
    }

    return <Lottie animationData={animationData} loop={true} className={className} />;
};

export const SmartIcon: React.FC<SmartIconProps> = ({
    type = 'static',
    iconRef,
    fallback,
    className,
    ...props
}) => {
    if (type === 'animated') {
        return <LottieIcon src={iconRef} className={className} />;
    }

    const cleanName = iconRef.replace('lucide-', '').toLowerCase();
    const validName = cleanName in dynamicIconImports ? cleanName : fallback || 'info';

    return <LucideIcon name={validName} className={className} {...props} />;
};
