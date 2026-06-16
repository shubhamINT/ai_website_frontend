import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { InfographicSection, VisualIntent } from '@/app/_shared/types/agentTypes';
import { SmartIcon } from '../primitives/SmartIcon';
import { INTENT_COLORS, type CardColors } from '../flashcard/flashcardThemes';
import { CheckDot, MD_COMPONENTS } from '../flashcard/markdownComponents';
import { PresetGraphic } from './PresetGraphic';

// ─── Section blocks ────────────────────────────────────────────────────────
// One component per `InfographicSection.type`. Each is a self-contained block;
// `<InfographicRenderer>` maps sections[] to these in order with a staggered
// mount. `colors` is the card-level accent (from visual_intent).

interface BlockProps<S> {
    section: S;
    colors: CardColors;
}

// Small section heading with an accent underline — shown when a block has a title.
const SectionTitle = ({ title, colors }: { title?: string; colors: CardColors }) => {
    if (!title) return null;
    return (
        <div className="mb-3">
            <h4 className="font-display text-base md:text-lg font-semibold tracking-tight text-zinc-900">{title}</h4>
            <span className={`mt-1.5 block h-[3px] w-8 rounded-full bg-current ${colors.text} opacity-80`} />
        </div>
    );
};

export const MarkdownBlock = ({ section }: BlockProps<Extract<InfographicSection, { type: 'markdown' }>>) => (
    <div>
        <SectionTitle title={section.title} colors={INTENT_COLORS.neutral} />
        <div className="markdown-render md-stagger text-[15px] leading-relaxed tracking-[-0.005em] text-zinc-700 md:text-lg">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>{section.content}</ReactMarkdown>
        </div>
    </div>
);

export const BulletListBlock = ({ section }: BlockProps<Extract<InfographicSection, { type: 'bullet_list' }>>) => (
    <div>
        <SectionTitle title={section.title} colors={INTENT_COLORS.neutral} />
        <ul className="md-stagger flex list-none flex-col gap-2.5 pl-0">
            {section.items?.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-[1.5] text-zinc-700 md:text-base">
                    <CheckDot />
                    <span className="min-w-0">{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

export const IconBulletsBlock = ({ section, colors }: BlockProps<Extract<InfographicSection, { type: 'icon_bullets' }>>) => (
    <div>
        <SectionTitle title={section.title} colors={colors} />
        <div className="flex flex-col gap-3.5 md:gap-4">
            {section.items?.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, type: 'spring', stiffness: 220, damping: 22 }}
                    className="flex items-start gap-3.5"
                >
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
                        <SmartIcon iconRef={item.icon || 'info'} type="static" className="h-[1.05rem] w-[1.05rem]" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-[15px] font-semibold leading-snug text-zinc-900 md:text-base">{item.title}</p>
                        {item.text && <p className="mt-0.5 text-sm leading-snug text-zinc-500 md:text-[15px]">{item.text}</p>}
                    </div>
                </motion.div>
            ))}
        </div>
        {section.graphic && (
            <div className="mt-5 flex justify-center">
                <PresetGraphic name={section.graphic} className="h-16 w-auto md:h-20" />
            </div>
        )}
    </div>
);

export const StatsGrid = ({ section, colors }: BlockProps<Extract<InfographicSection, { type: 'stats' }>>) => {
    const items = section.items ?? [];
    // 2-up on phones, 4-up on wide cards when there are 4 tiles.
    const cols = items.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : items.length === 3 ? 'grid-cols-3' : 'grid-cols-2';
    return (
        <div>
            <SectionTitle title={section.title} colors={colors} />
            <div className={`grid gap-3 md:gap-4 ${cols}`}>
                {items.map((item, i) => {
                    const c = INTENT_COLORS[(item.intent as VisualIntent) ?? 'neutral'] ?? colors;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 14, scale: 0.96 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 240, damping: 20 }}
                            className={`relative overflow-hidden rounded-2xl ${c.bg} p-3.5 ring-1 ${c.ring} md:p-4`}
                        >
                            {item.icon && (
                                <span className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 ${c.text} shadow-sm`}>
                                    <SmartIcon iconRef={item.icon} type="static" className="h-4 w-4" />
                                </span>
                            )}
                            <div className={`font-display text-2xl font-semibold leading-none tracking-tight md:text-4xl ${c.text}`}>
                                {item.value}
                            </div>
                            <div className="mt-1.5 text-xs leading-snug text-zinc-500 md:text-sm">{item.label}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export const CtaBanner = ({ section }: BlockProps<Extract<InfographicSection, { type: 'cta_banner' }>>) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 p-5 text-white shadow-[0_12px_30px_-10px_rgba(37,99,235,0.5)] md:p-6"
    >
        {/* soft sheen */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                <SmartIcon iconRef={section.icon || 'sparkles'} type="static" className="h-6 w-6 text-white" />
            </span>
            <div className="min-w-0">
                <p className="font-display text-lg font-semibold leading-tight tracking-tight md:text-xl">{section.title}</p>
                {section.text && <p className="mt-1 text-sm text-white/85 md:text-[15px]">{section.text}</p>}
            </div>
        </div>
    </motion.div>
);

// Route one section to its block. Unknown type → degrade to markdown (title/content), else null.
export const SectionBlock = ({ section, colors }: { section: InfographicSection; colors: CardColors }) => {
    switch (section.type) {
        case 'markdown':
            return <MarkdownBlock section={section} colors={colors} />;
        case 'bullet_list':
            return <BulletListBlock section={section} colors={colors} />;
        case 'icon_bullets':
            return <IconBulletsBlock section={section} colors={colors} />;
        case 'stats':
            return <StatsGrid section={section} colors={colors} />;
        case 'cta_banner':
            return <CtaBanner section={section} colors={colors} />;
        default: {
            // Graceful degradation: render any unknown block's text as markdown.
            const fallback = section as { title?: string; content?: string };
            const text = fallback.content ?? fallback.title;
            if (!text) return null;
            return <MarkdownBlock section={{ type: 'markdown', title: fallback.title, content: text }} colors={colors} />;
        }
    }
};
