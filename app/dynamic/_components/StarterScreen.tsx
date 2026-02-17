'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SmartIcon } from './SmartIcon';
import { BarVisualizer } from './BarVisualizer';

interface StarterScreenProps {
    onSelectQuestion: (question: string) => void;
    activeTrack?: any;
    userTrack?: any;
}

const questions = [
    {
        text: "Wanna know where our company is located?",
        icon: "map-pin",
        description: "Find our global offices and reach out to us in person.",
        color: "blue"
    },
    {
        text: "Wanna know about the opportunities in careers?",
        icon: "briefcase",
        description: "Explore exciting roles and join our team of innovators.",
        color: "violet"
    },
    {
        text: "Wanna know about our services?",
        icon: "layers",
        description: "Discover how we can help your business grow with our solutions.",
        color: "emerald"
    },
    {
        text: "Wanna know more about our company?",
        icon: "building-2",
        description: "Learn about our vision, mission, and the legacy we're building.",
        color: "amber"
    }
];

const colorMap: Record<string, string> = {
    blue: "group-hover:text-blue-600 group-hover:bg-blue-100/50 group-hover:border-blue-200",
    violet: "group-hover:text-violet-600 group-hover:bg-violet-100/50 group-hover:border-violet-200",
    emerald: "group-hover:text-emerald-600 group-hover:bg-emerald-100/50 group-hover:border-emerald-200",
    amber: "group-hover:text-amber-600 group-hover:bg-amber-100/50 group-hover:border-amber-200"
};

export const StarterScreen: React.FC<StarterScreenProps> = ({ 
    onSelectQuestion
}) => {
    return (
        <div className="flex w-full max-w-5xl flex-col items-center gap-8 pt-4 pb-12 md:gap-12 md:py-20">
            {/* Header section */}
            <div className="flex flex-col items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 rounded-full bg-blue-50/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 ring-1 ring-blue-200/50 backdrop-blur-sm"
                >
                    Get Started with Indus Net
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl"
                >
                    How can I help you today?
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 max-w-2xl text-base text-zinc-500 md:text-lg"
                >
                    Select one of the topics below to explore our services, career opportunities, or simply learn more about our presence.
                </motion.p>
            </div>

            {/* Questions Grid */}
            <div className="grid w-full grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:gap-6 xl:px-0">
                {questions.map((q, idx) => (
                    <motion.button
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        onClick={() => onSelectQuestion(q.text)}
                        className={`group relative flex items-center gap-5 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white/80 p-5 text-left backdrop-blur-xl transition-all hover:border-transparent hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 ${colorMap[q.color as keyof typeof colorMap]}`}
                    >
                        {/* Hover Gradient Overlay */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white to-zinc-50/50 opacity-0 transition-opacity group-hover:opacity-100" />
                        
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm">
                            <SmartIcon iconRef={q.icon} className="h-7 w-7" />
                        </div>
                        
                        <div className="flex-1 pr-4">
                            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-inherit transition-colors">
                                {q.text}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-zinc-500 line-clamp-1">
                                {q.description}
                            </p>
                        </div>

                        <div className="shrink-0 opacity-0 transition-all duration-300 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                             <svg className="h-5 w-5 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

