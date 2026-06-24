'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartIcon } from './SmartIcon';
import { SwipeDeck } from './SwipeDeck';

interface StarterScreenProps {
    /** 'window' renders the compact widget welcome screen; 'immersive' the /dynamic grid. */
    variant?: 'immersive' | 'window';
    /** Send a starter question to the agent. */
    onQuestionClick?: (text: string) => void;
    /** Latest agent spoken text — replaces the greeting in the middle as it speaks. */
    agentText?: string | null;
    /** True while that text is still streaming (shows a live caret). */
    isAgentInterim?: boolean;
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

const colorMap: Record<string, { text: string; glow: string; dot: string }> = {
    blue: { text: "text-blue-600", glow: "bg-blue-500/10", dot: "bg-blue-500" },
    violet: { text: "text-violet-600", glow: "bg-violet-500/10", dot: "bg-violet-500" },
    emerald: { text: "text-emerald-600", glow: "bg-emerald-500/10", dot: "bg-emerald-500" },
    amber: { text: "text-amber-600", glow: "bg-amber-500/10", dot: "bg-amber-500" }
};

export const StarterScreen: React.FC<StarterScreenProps> = ({
    variant = 'immersive',
    onQuestionClick,
    agentText,
    isAgentInterim,
}) => {
    if (variant === 'window') {
        const speaking = Boolean(agentText && agentText.trim());
        return (
            <div className="flex w-full max-w-xl flex-1 flex-col">
                {/* Middle — the greeting, swapped for the live transcript as Vaani speaks */}
                <div className="flex flex-1 items-center justify-center px-6">
                    <AnimatePresence mode="wait">
                        {speaking ? (
                            <motion.p
                                key="transcript"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className="text-center text-xl font-medium leading-relaxed tracking-tight text-slate-800 md:text-2xl"
                            >
                                {agentText}
                                {isAgentInterim && (
                                    <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.15em] animate-pulse rounded-full bg-blue-500 align-middle" />
                                )}
                            </motion.p>
                        ) : (
                            <motion.h1
                                key="greeting"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                className="text-center text-2xl font-semibold leading-snug tracking-tight md:text-3xl"
                            >
                                <span className="text-blue-600">Welcome to INT.</span>
                                <br />
                                <span className="text-slate-900">I am Vaani,</span>{' '}
                                <span className="text-blue-600">do let me know how can I help you?</span>
                            </motion.h1>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom — starter questions as a swipeable strip, just above the dock */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mt-auto w-full pb-1"
                >
                    <SwipeDeck mode="strip">
                        {questions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => onQuestionClick?.(q.text)}
                                className="group flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3.5 text-left ring-1 ring-black/[0.04] shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
                            >
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 ${colorMap[q.color].text}`}>
                                    <SmartIcon iconRef={q.icon} className="h-5 w-5" />
                                </span>
                                <span className="line-clamp-2 text-sm font-medium text-slate-800">
                                    {q.text}
                                </span>
                            </button>
                        ))}
                    </SwipeDeck>
                </motion.div>
            </div>
        );
    }

    // ─── Immersive (/dynamic) — original grid, unchanged ──────────────────────
    return (
        <div className="flex w-full max-w-6xl flex-col items-center gap-10 pt-4 pb-12 md:gap-16 md:py-24">
            <div className="flex flex-col items-center text-center px-4">
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
                {questions.map((q, idx) => (
                    <motion.button
                        key={idx}
                        layoutId={`flashcard-${idx}`}
                        onClick={() => onQuestionClick?.(q.text)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1, duration: 0.5 }}
                        className="group relative flex flex-col items-start gap-5 overflow-hidden rounded-[2.5rem] bg-white/70 p-8 text-left backdrop-blur-2xl ring-1 ring-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
                    >
                        <div className={`absolute -right-16 -top-16 h-32 w-32 rounded-full ${colorMap[q.color].glow} blur-[40px] opacity-40`} />

                        <div className="flex w-full items-start justify-between">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100 ${colorMap[q.color].text}`}>
                                <SmartIcon iconRef={q.icon} className="h-6 w-6" />
                            </div>

                            <div className={`mt-2 h-1.5 w-1.5 rounded-full ${colorMap[q.color].dot} opacity-40`} />
                        </div>

                        <div className="relative z-10 flex-1">
                            <h3 className="text-xl font-bold tracking-tight text-zinc-900">
                                {q.text}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-500/90 font-medium">
                                {q.description}
                            </p>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
