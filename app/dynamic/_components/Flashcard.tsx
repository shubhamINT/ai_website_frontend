import React from 'react';

interface FlashcardProps {
    title: string;
    value: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({ title, value }) => {
    return (
        <div className="group relative w-full max-w-sm overflow-hidden rounded-2xl bg-white/5 p-6 shadow-xl ring-1 ring-white/10 backdrop-blur-xl transitionWidth duration-500 hover:bg-white/10">
            {/* Glow effect */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl transition-opacity duration-500 group-hover:opacity-40" />

            <div className="relative z-10 flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                    {title}
                </span>
                <p className="text-lg font-medium leading-relaxed text-slate-200">
                    {value}
                </p>
            </div>
        </div>
    );
};
