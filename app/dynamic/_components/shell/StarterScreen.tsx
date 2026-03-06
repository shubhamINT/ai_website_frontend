'use client';

import React from 'react';
import { motion } from 'framer-motion';

import { SmartIcon } from '@/app/_shared/media/SmartIcon';

const questions = [
    {
        text: 'Wanna know where our company is located?',
        icon: 'map-pin',
        description: 'Find our global offices and reach out to us in person.',
        color: 'blue',
    },
    {
        text: 'Wanna know about the opportunities in careers?',
        icon: 'briefcase',
        description: 'Explore exciting roles and join our team of innovators.',
        color: 'violet',
    },
    {
        text: 'Wanna know about our services?',
        icon: 'layers',
        description: 'Discover how we can help your business grow with our solutions.',
        color: 'emerald',
    },
    {
        text: 'Wanna know more about our company?',
        icon: 'building-2',
        description: 'Learn about our vision, mission, and the legacy we are building.',
        color: 'amber',
    },
];

const colorMap: Record<string, { text: string; glow: string; dot: string }> = {
    blue: { text: 'text-blue-600', glow: 'bg-blue-500/10', dot: 'bg-blue-500' },
    violet: { text: 'text-violet-600', glow: 'bg-violet-500/10', dot: 'bg-violet-500' },
    emerald: { text: 'text-emerald-600', glow: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    amber: { text: 'text-amber-600', glow: 'bg-amber-500/10', dot: 'bg-amber-500' },
};

export const StarterScreen: React.FC = () => {
    return (
        <div className="flex w-full max-w-6xl flex-col items-center gap-10 pb-12 pt-4 md:gap-16 md:py-24">
            <div className="flex flex-col items-center px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black tracking-tight text-zinc-800 md:text-6xl"
                >
                    How can I help you today?
                </motion.h1>
            </div>

            <div className="grid w-full grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:gap-8 xl:px-0">
                {questions.map((question, index) => (
                    <motion.button
                        key={index}
                        layoutId={`flashcard-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                        className="group relative flex flex-col items-start gap-5 overflow-hidden rounded-[2.5rem] bg-white/70 p-8 text-left shadow-[0_20px_50px_rgba(0,0,0,0.02)] ring-1 ring-white/60 backdrop-blur-2xl"
                    >
                        <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full ${colorMap[question.color].glow} opacity-40 blur-[40px]`} />

                        <div className="flex w-full items-start justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 ${colorMap[question.color].text}`}>
                                <SmartIcon iconRef={question.icon} className="h-6 w-6" />
                            </div>

                            <div className={`mt-2 h-1.5 w-1.5 rounded-full ${colorMap[question.color].dot} opacity-40`} />
                        </div>

                        <div className="relative z-10 flex-1">
                            <h3 className="text-xl font-bold tracking-tight text-zinc-900">
                                {question.text}
                            </h3>
                            <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-500/90">
                                {question.description}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
