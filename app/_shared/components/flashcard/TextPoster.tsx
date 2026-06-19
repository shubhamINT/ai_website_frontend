'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CardColors } from './flashcardThemes';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TextPosterProps {
    label: string;
    colors: CardColors;
    colorKey: string;
}

// ─── Component ──────────────────────────────────────────────────────────────────
// Shown in place of an image when a card has no relevant scraped image.
// A colorful, gently-animated panel showing ONLY the card title — nothing else
// (no icon, no divider) — so a card is never empty and never borrows a wrong photo.

export const TextPoster: React.FC<TextPosterProps> = ({ label, colors, colorKey }) => {
    const safeLabel = (label || '').trim() || 'INT.';

    return (
        <div
            className={`
                group relative isolate h-full w-full overflow-hidden
                bg-gradient-to-br ${colors.gradient}
            `}
        >
            {/* Soft moving light blobs */}
            <motion.div
                aria-hidden
                className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl"
                animate={{ x: [0, 24, 0], y: [0, 18, 0] }}
                transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                aria-hidden
                className="absolute -bottom-12 -right-8 h-44 w-44 rounded-full bg-black/15 blur-2xl"
                animate={{ x: [0, -20, 0], y: [0, -16, 0] }}
                transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Subtle grid texture */}
            <div
                aria-hidden
                className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:22px_22px]"
            />
            {/* Top sheen */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.30)_0%,rgba(255,255,255,0.05)_30%,rgba(255,255,255,0)_60%)]" />

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 py-8 text-center">
                <motion.h4
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.55, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
                    className="max-w-full text-balance text-xl font-extrabold leading-tight tracking-tight text-white drop-shadow-sm md:text-3xl"
                >
                    {safeLabel}
                </motion.h4>
            </div>
        </div>
    );
};

TextPoster.displayName = 'TextPoster';
