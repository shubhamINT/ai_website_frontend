import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FlashcardStyle, FlashcardMedia } from '@/app/_shared/types/agentTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SmartIcon } from '../primitives/SmartIcon';
import { RichMedia } from '../media/RichMedia';
import { TextPoster } from './TextPoster';
import { INTENT_COLOR_MAP, COLOR_PALETTE, POSTER_COLOR_ROTATION } from './flashcardThemes';
import { cardVariants } from './flashcardAnimations';

// ─── Props ───────────────────────────────────────────────────────────────────

interface FlashcardProps {
    title: string;
    value?: string;
    items?: Array<{ icon: string; text: string }>;
    tagline?: { icon: string; text: string };
    media?: FlashcardMedia;
    card_index?: number;
    // Layout is passed by AgentInterface based on grid context — NOT from backend
    layout?: 'default' | 'horizontal' | 'centered';
    // displayMode: 'grid' = 2×2 icon grid (VAANI window), 'list' = vertical list (immersive)
    displayMode?: 'grid' | 'list';
    layoutId?: string;
    shouldStreamText?: boolean;
}

type FullFlashcardProps = FlashcardProps & FlashcardStyle;

// ─── Component ────────────────────────────────────────────────────────────────

export const Flashcard = React.memo(({
    title = 'Information',
    value = '',
    items,
    tagline,
    visual_intent,
    icon,
    media,
    card_index = 0,
    layout = 'default',
    displayMode = 'list',
    layoutId,
    shouldStreamText = false,
}: FullFlashcardProps) => {

    // Card accent: intent drives the border/glow/icon color.
    const colorKey = INTENT_COLOR_MAP[visual_intent ?? 'neutral'] ?? 'zinc';
    const colors = COLOR_PALETTE[colorKey] ?? COLOR_PALETTE.zinc;

    // Poster gets its own color rotation (card_index % palette length) so each
    // poster in a batch is visually distinct regardless of visual_intent.
    const posterColorKey = POSTER_COLOR_ROTATION[card_index % POSTER_COLOR_ROTATION.length];
    const posterColors   = COLOR_PALETTE[posterColorKey] ?? COLOR_PALETTE.blue;

    // Theme: neon for cyberpunk, glass for everything else.
    // Grid/window mode always uses the light glass theme regardless of visual_intent.
    const isNeon = visual_intent === 'cyberpunk' && displayMode !== 'grid';

    // Media — always render a fixed-height slot so every card is the same size.
    // Priority: scraped/curated image → poster_label from backend → card title → "INT."
    const hasImage = Boolean(media?.urls && media.urls.length > 0);

    // When no image is shown, the poster drives the visual identity of the card.
    // Use the poster's color for icon badges so the header and items match the poster.
    const accentColors = !hasImage && !isNeon ? posterColors : colors;
    const themeClass = isNeon
        ? `bg-zinc-900 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-${colorKey}-500/50`
        : 'bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60';
    const prefersReducedMotion = useReducedMotion();
    const hasStreamedOnceRef = useRef(false);
    const [displayLength, setDisplayLength] = useState(0);

    // Grid cascade animation states — active only when shouldStreamText && displayMode === 'grid'
    const shouldAnimateGrid = shouldStreamText && displayMode === 'grid' && !prefersReducedMotion;
    const [titleVisible,     setTitleVisible]     = useState(!shouldAnimateGrid);
    const [titleWordCount,   setTitleWordCount]   = useState(shouldAnimateGrid ? 0 : Infinity);
    const [mediaVisible,     setMediaVisible]     = useState(!shouldAnimateGrid);
    const [bodyWordCount,    setBodyWordCount]     = useState(shouldAnimateGrid ? 0 : Infinity);
    const [visibleTileCount, setVisibleTileCount] = useState(shouldAnimateGrid ? 0 : 4);
    const [tileWordCounts,   setTileWordCounts]   = useState<number[]>([
        shouldAnimateGrid ? 0 : Infinity,
        shouldAnimateGrid ? 0 : Infinity,
        shouldAnimateGrid ? 0 : Infinity,
        shouldAnimateGrid ? 0 : Infinity,
    ]);
    const [taglineWordCount, setTaglineWordCount] = useState(shouldAnimateGrid ? 0 : Infinity);
    const [taglineVisible,   setTaglineVisible]   = useState(!shouldAnimateGrid);

    // The poster shows ONLY the card title (not the backend poster_label/stat).
    const posterLabel = (title ?? '').trim() || 'INT.';
    // Always show the media block — imageless cards get a colorful text poster.
    const showHorizontalMedia = layout === 'horizontal';
    const showStackedMedia    = layout !== 'horizontal';

    // Fixed height — image and poster occupy the same slot so cards are uniform.
    // Grid/window mode uses a shorter slot so the full card fits without scrolling.
    const MEDIA_SLOT = displayMode === 'grid' ? 'h-42 md:h-36' : 'h-44 md:h-50';

    const renderMediaInner = () => (
        hasImage
            ? <RichMedia urls={media?.urls} source={media?.source} alt={title} fill />
            : <TextPoster label={posterLabel} colors={posterColors} colorKey={posterColorKey} />
    );

    const safeValue = value ?? '';

    useEffect(() => {
        if (displayMode === 'grid' || !safeValue) {
            setDisplayLength(0);
            return;
        }

        const shouldAnimate =
            shouldStreamText &&
            !prefersReducedMotion &&
            !hasStreamedOnceRef.current;

        if (!shouldAnimate) {
            setDisplayLength(safeValue.length);
            return;
        }

        setDisplayLength(0);
        hasStreamedOnceRef.current = true;

        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const totalLength = safeValue.length;

        const delay =
            totalLength > 1200 ? 16 :
            totalLength > 700  ? 18 :
            totalLength > 350  ? 22 :
            totalLength > 140  ? 26 : 30;

        const getStep = (remaining: number) => {
            if (totalLength > 1200) return Math.max(5, Math.ceil(remaining / 28));
            if (totalLength > 700) return Math.max(4, Math.ceil(remaining / 24));
            if (totalLength > 350) return Math.max(3, Math.ceil(remaining / 20));
            if (totalLength > 140) return Math.max(2, Math.ceil(remaining / 18));
            return 1;
        };

        const streamStep = (currentLength: number) => {
            if (cancelled) return;
            const remaining = totalLength - currentLength;
            if (remaining <= 0) return;

            const nextLength = Math.min(totalLength, currentLength + getStep(remaining));
            setDisplayLength(nextLength);

            if (nextLength < totalLength) {
                timeoutId = setTimeout(() => streamStep(nextLength), delay);
            }
        };

        timeoutId = setTimeout(() => streamStep(0), 120);

        return () => {
            cancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [safeValue, shouldStreamText, prefersReducedMotion]);

    // Grid card cascade: title words → media → body words → tile-by-tile (icon then text) → tagline bar + words
    // Targets ~3 seconds total so animation finishes before VAANI stops explaining.
    useEffect(() => {
        if (!shouldAnimateGrid) return;
        const ts: ReturnType<typeof setTimeout>[] = [];
        const at = (ms: number, fn: () => void) => { ts.push(setTimeout(fn, ms)); };

        // Title: icon container fades in immediately; title text types word by word
        at(0, () => setTitleVisible(true));
        const TITLE_WORD_MS = 45;
        const titleWords = title.trim().split(/\s+/).filter(Boolean);
        titleWords.forEach((_, i) => at(i * TITLE_WORD_MS, () => setTitleWordCount(i + 1)));
        const titleEnd = titleWords.length * TITLE_WORD_MS;

        // Poster fades in after title has mostly appeared
        at(Math.max(titleEnd, 200), () => setMediaVisible(true));

        // Body text word by word
        const bodyWords = safeValue.trim().split(/\s+/).filter(Boolean);
        const BODY_START = 380, BODY_WORD_MS = 28;
        bodyWords.forEach((_, i) => at(BODY_START + i * BODY_WORD_MS, () => setBodyWordCount(i + 1)));
        const bodyEnd = BODY_START + bodyWords.length * BODY_WORD_MS;

        // Tiles: each icon fades in, then its text types, before next tile starts
        const TILE_ICON_DELAY = 120, TILE_WORD_MS = 40, TILE_GAP = 80;
        let cursor = bodyEnd + 80;
        (items ?? []).slice(0, 4).forEach((item, ti) => {
            at(cursor, () => setVisibleTileCount(ti + 1));
            const tWords = item.text.trim().split(/\s+/).filter(Boolean);
            const textAt = cursor + TILE_ICON_DELAY;
            tWords.forEach((_, wi) =>
                at(textAt + wi * TILE_WORD_MS, () =>
                    setTileWordCounts(prev => { const n = [...prev]; n[ti] = wi + 1; return n; })
                )
            );
            cursor = textAt + tWords.length * TILE_WORD_MS + TILE_GAP;
        });

        // Tagline: bar fades in after grid, then text types word by word
        const TAGLINE_GAP = 100, TAGLINE_WORD_MS = 55;
        at(cursor + TAGLINE_GAP, () => setTaglineVisible(true));
        const tagWords = (tagline?.text ?? '').trim().split(/\s+/).filter(Boolean);
        tagWords.forEach((_, i) => at(cursor + TAGLINE_GAP + 150 + i * TAGLINE_WORD_MS, () => setTaglineWordCount(i + 1)));

        return () => ts.forEach(clearTimeout);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const visibleText = useMemo(
        () => safeValue.slice(0, displayLength),
        [safeValue, displayLength]
    );

    const renderContent = (text: string) => {
        if (!text) return null;
        return (
            <div className={`
                markdown-render
                ${isNeon ? 'prose-invert text-zinc-300' : 'text-zinc-600'}
                prose prose-sm max-w-none
                prose-p:leading-relaxed prose-p:my-1
                prose-headings:my-2 prose-headings:font-bold prose-headings:text-inherit
                prose-strong:text-inherit prose-strong:font-bold
                prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                prose-li:my-0.5
                text-[11px] md:text-sm
                ${layout === 'centered' ? 'text-center [&>*]:text-center' : ''}
            `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </div>
        );
    };

    return (
        <motion.div
            layout
            layoutId={layoutId}
            custom={card_index}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
            className={`
                relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem]
                ${themeClass}
                ${displayMode === 'grid' ? 'p-6' : 'p-4 md:p-6'} w-full
                group flex flex-col self-start transition-colors
            `}
        >
            {/* Ambient glow */}
            <div className={`absolute -right-20 -top-20 h-40 w-40 md:h-64 md:w-64 rounded-full ${colors.glow} blur-[30px] md:blur-[60px] opacity-25 md:opacity-40`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.14)_28%,rgba(255,255,255,0)_62%)]" />

            <div className={`relative z-10 flex flex-col
                ${layout === 'horizontal' ? 'gap-4 md:flex-row md:items-center md:gap-6' : displayMode === 'grid' ? 'gap-2.5' : 'gap-4 md:gap-5'}
                ${layout === 'centered'   ? 'justify-center text-center items-center' : ''}
            `}>

                {/* Horizontal media (left side) */}
                {showHorizontalMedia && (
                    <div className="w-full shrink-0 md:w-[min(40%,20rem)] md:max-w-[20rem]">
                        <div className={`overflow-hidden rounded-[1.35rem] ring-1 ring-black/5 md:rounded-[1.6rem] ${MEDIA_SLOT}`}>
                            {renderMediaInner()}
                        </div>
                    </div>
                )}

                <div className={`flex flex-col ${layout === 'horizontal' ? 'min-w-0 flex-1 justify-center' : 'w-full'}`}>
                    {/* Header row: icon + title + status indicator */}
                    <motion.div
                        initial={shouldAnimateGrid ? { opacity: 0, y: -8 } : false}
                        animate={titleVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className={`flex items-start ${layout === 'centered' ? 'justify-center w-full relative' : 'justify-between'}`}
                    >
                        <div className={`flex items-center gap-2 md:gap-3 ${layout === 'centered' ? 'flex-col gap-3' : ''}`}>
                            <div className={`
                                flex shrink-0 h-8 w-8 items-center justify-center rounded-lg md:h-10 md:w-10 md:rounded-[14px]
                                ${isNeon
                                    ? `bg-gradient-to-br ${accentColors.gradient} text-white`
                                    : `bg-white ${accentColors.text} ring-1 ring-zinc-100 shadow-sm`
                                }
                                transition-all duration-300 group-hover:scale-110
                            `}>
                                <SmartIcon
                                    iconRef={typeof icon === 'object' ? icon.ref : (icon || 'info')}
                                    type="static"
                                    className="w-4 h-4 md:w-5 md:h-5"
                                />
                            </div>

                            <div>
                                <h3 className={`text-xs md:text-[15px] font-bold leading-tight ${isNeon ? 'text-white' : 'text-zinc-900'}`}>
                                    {shouldAnimateGrid
                                        ? title.trim().split(/\s+/).filter(Boolean).slice(0, titleWordCount).join(' ')
                                        : title
                                    }
                                </h3>
                            </div>
                        </div>

                        {/* Status pulse indicator */}
                        {visual_intent === 'processing' ? (
                            <div className="flex shrink-0 space-x-0.5 md:space-x-1 mt-1">
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce" />
                            </div>
                        ) : (
                            <div className={`shrink-0 w-1 h-1 md:w-2 md:h-2 rounded-full mt-1 ${visual_intent === 'urgent' ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`} />
                        )}
                    </motion.div>

                    {/* Stacked media (inside content column) */}
                    {showStackedMedia && (
                        <motion.div
                            initial={shouldAnimateGrid ? { opacity: 0, y: -8 } : false}
                            animate={mediaVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={`${displayMode === 'grid' ? 'mt-2' : 'mt-4'} overflow-hidden rounded-[1.35rem] ring-1 ring-black/5 md:rounded-[1.7rem] ${MEDIA_SLOT}`}
                        >
                            {renderMediaInner()}
                        </motion.div>
                    )}

                    {/* Body text — grid: word-by-word via bodyWordCount; list: existing streaming */}
                    {(displayMode === 'grid' ? bodyWordCount > 0 : safeValue.length > 0) && (
                        <div className={`${displayMode === 'grid' ? 'mt-3' : 'mt-3'} text-sm ${isNeon ? 'text-zinc-300' : 'text-zinc-600'}`}>
                            {displayMode === 'grid'
                                ? <p className="text-[11px] leading-snug">
                                      {safeValue.trim().split(/\s+/).filter(Boolean).slice(0, bodyWordCount).join(' ')}
                                  </p>
                                : renderContent(visibleText)
                            }
                            {displayMode !== 'grid' && displayLength > 0 && displayLength < safeValue.length && (
                                <span
                                    aria-hidden="true"
                                    className="ml-1 inline-block h-3 w-0.5 animate-pulse rounded-full bg-current align-middle opacity-50"
                                />
                            )}
                        </div>
                    )}

                    {/* 2×2 icon grid — VAANI window mode */}
                    {displayMode === 'grid' && items && items.length > 0 && (
                        <>
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {items.slice(0, 4).map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={shouldAnimateGrid ? { opacity: 0, y: -8 } : false}
                                        animate={idx < visibleTileCount ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                        className={`
                                            flex flex-col items-center gap-1.5 rounded-xl p-2.5
                                            ${isNeon
                                                ? `bg-white/10 ring-1 ring-white/20`
                                                : `${accentColors.bg} ring-1 ${accentColors.ring}`
                                            }
                                        `}
                                    >
                                        <SmartIcon
                                            iconRef={item.icon || 'circle-dot'}
                                            type="static"
                                            className={`w-7 h-7 ${isNeon ? 'text-white' : accentColors.text}`}
                                        />
                                        <span className={`text-[10px] md:text-[11px] font-semibold text-center leading-tight ${isNeon ? 'text-white/90' : 'text-zinc-700'}`}>
                                            {shouldAnimateGrid
                                                ? item.text.trim().split(/\s+/).filter(Boolean).slice(0, tileWordCounts[idx]).join(' ')
                                                : item.text
                                            }
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                            {tagline && (
                                <motion.div
                                    initial={shouldAnimateGrid ? { opacity: 0, y: -8 } : false}
                                    animate={taglineVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className={`mt-5 flex items-center gap-2 rounded-lg px-3 py-2
                                        ${isNeon ? 'bg-white/10 ring-1 ring-white/20' : `${accentColors.bg} ring-1 ${accentColors.ring}`}
                                    `}
                                >
                                    <SmartIcon
                                        iconRef={tagline.icon || 'check-circle'}
                                        type="static"
                                        className={`w-3.5 h-3.5 shrink-0 ${isNeon ? 'text-white' : accentColors.text}`}
                                    />
                                    <span className={`text-[10px] md:text-xs font-medium ${isNeon ? 'text-white/80' : 'text-zinc-600'}`}>
                                        {shouldAnimateGrid
                                            ? tagline.text.trim().split(/\s+/).filter(Boolean).slice(0, taglineWordCount).join(' ')
                                            : tagline.text
                                        }
                                    </span>
                                </motion.div>
                            )}
                        </>
                    )}

                    {/* Vertical list — immersive/main mode */}
                    {displayMode !== 'grid' && items && items.length > 0 && (
                        <div className="mt-3 flex flex-col gap-2">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-2.5">
                                    <div className={`
                                        mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-md
                                        ${isNeon
                                            ? `bg-linear-to-br ${accentColors.gradient} text-white`
                                            : `${accentColors.bg} ${accentColors.text} ring-1 ${accentColors.ring}`
                                        }
                                    `}>
                                        <SmartIcon
                                            iconRef={item.icon || 'circle-dot'}
                                            type="static"
                                            className="w-3 h-3"
                                        />
                                    </div>
                                    <span
                                        className={`text-[11px] md:text-[13px] leading-snug ${isNeon ? 'text-zinc-300' : 'text-zinc-700'}`}
                                        dangerouslySetInnerHTML={{
                                            __html: item.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

Flashcard.displayName = 'Flashcard';
