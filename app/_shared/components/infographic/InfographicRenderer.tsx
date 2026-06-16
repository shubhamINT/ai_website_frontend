import React from 'react';
import { motion } from 'framer-motion';
import type { InfographicData } from '@/app/_shared/types/agentTypes';
import { SmartIcon } from '../primitives/SmartIcon';
import { INTENT_COLORS, chipIcon } from '../flashcard/flashcardThemes';
import { cardVariants } from '../flashcard/flashcardAnimations';
import { PresetGraphic } from './PresetGraphic';
import { SectionBlock } from './blocks';

// ─── Infographic card ──────────────────────────────────────────────────────
// The composed, text-led card. Unlike the flat flashcard, it renders its OWN
// polished elevated surface: top accent rail, header (icon + title), optional
// hero (description + preset graphic), ordered section blocks, and chip pills.
// Accent color flows from `visual_intent` (INTENT_COLORS); everything degrades
// gracefully — a payload with only a title still renders cleanly.

interface InfographicRendererProps {
    schema: InfographicData;
    card_index?: number;
    layoutId?: string;
}

export const InfographicRenderer = React.memo(({ schema, card_index = 0, layoutId }: InfographicRendererProps) => {
    const colors = INTENT_COLORS[schema.visual_intent ?? 'neutral'] ?? INTENT_COLORS.neutral;

    const headerTitle = schema.title ?? schema.hero?.title;
    const headerIcon = schema.icon ?? schema.hero?.icon ?? 'info';
    const hero = schema.hero;
    const heroHasBody = Boolean(hero?.description || hero?.graphic);
    const sections = schema.sections ?? [];
    const chips = schema.chips ?? [];

    return (
        <motion.div
            layout
            layoutId={layoutId}
            custom={card_index}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
            className="group relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/[0.06] shadow-[0_18px_50px_-16px_rgba(15,23,42,0.30)]"
        >
            {/* Top accent rail — the signature blue→emerald premium stripe */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-400" />

            {/* Ambient corner glow tinted by intent */}
            <div className={`pointer-events-none absolute -right-20 -top-16 h-48 w-48 rounded-full ${colors.glow} blur-[60px] opacity-40`} />

            <div className="relative z-10 flex flex-1 flex-col gap-5 p-5 md:gap-6 md:p-7">
                {/* Header: icon badge + title + accent underline */}
                {headerTitle && (
                    <div className="flex items-start gap-3 md:gap-3.5">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12 ${colors.bg} ${colors.text} ring-1 ${colors.ring} shadow-sm transition-transform duration-300 group-hover:scale-105`}>
                            <SmartIcon iconRef={headerIcon} type="static" className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="min-w-0 pt-0.5">
                            <h3 className="font-display text-xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-2xl">
                                {headerTitle}
                            </h3>
                            <motion.span
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-2 block h-[3px] w-10 origin-left rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
                            />
                        </div>
                    </div>
                )}

                {/* Hero region — description + preset graphic on a soft tinted panel */}
                {heroHasBody && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 24 }}
                        className={`flex flex-col items-center gap-4 rounded-2xl ${colors.bg} px-4 py-5 text-center ring-1 ${colors.ring} md:flex-row md:gap-6 md:text-left`}
                    >
                        {hero?.description && (
                            <p className="min-w-0 flex-1 text-[15px] leading-relaxed text-zinc-600 md:text-base">
                                {hero.description}
                            </p>
                        )}
                        {hero?.graphic && (
                            <div className="shrink-0">
                                <PresetGraphic name={hero.graphic} className="h-20 w-auto md:h-24" />
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Ordered section blocks — staggered mount */}
                {sections.length > 0 && (
                    <div className="flex flex-col gap-5 md:gap-6">
                        {sections.map((section, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 + i * 0.08, type: 'spring', stiffness: 200, damping: 24 }}
                            >
                                <SectionBlock section={section} colors={colors} />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Footer chips — tag pills with auto-derived icons */}
                {chips.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-2 border-t border-zinc-900/[0.06] pt-4">
                        {chips.map((chip, i) => (
                            <motion.span
                                key={`${chip}-${i}`}
                                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 240, damping: 20 }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900/[0.04] px-3 py-1.5 text-[13px] font-medium text-zinc-600 ring-1 ring-black/5"
                            >
                                <SmartIcon iconRef={chipIcon(chip)} type="static" className={`h-3.5 w-3.5 ${colors.text}`} />
                                {chip}
                            </motion.span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

InfographicRenderer.displayName = 'InfographicRenderer';
