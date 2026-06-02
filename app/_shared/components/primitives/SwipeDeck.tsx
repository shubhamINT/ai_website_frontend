'use client';

import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate, PanInfo } from 'framer-motion';

interface SwipeDeckProps {
    /** One slide per child. */
    children: React.ReactNode[];
    /**
     * 'strip' — slides take ~78% width so the next card peeks (starter questions).
     * 'deck'  — one full-width slide per page, Tinder-style (flashcards).
     */
    mode?: 'strip' | 'deck';
    /** Show the dot pager below the deck. */
    showDots?: boolean;
    /** Show clickable prev/next arrows (for mouse users). Defaults to true. */
    showArrows?: boolean;
    className?: string;
}

const SNAP = { type: 'spring' as const, stiffness: 320, damping: 34, mass: 0.7 };

/**
 * SwipeDeck — a horizontal, paginated carousel built on framer-motion.
 *
 * No native scroll (it animates a transform), so there's never a scrollbar. The
 * track is dragged on the x-axis and snaps to the nearest slide on release, using
 * both drag offset and velocity so a quick flick advances a page. Used by the
 * window-variant StarterScreen (mode="strip") and CardDisplay (mode="deck").
 */
export const SwipeDeck: React.FC<SwipeDeckProps> = ({
    children,
    mode = 'strip',
    showDots = false,
    showArrows = true,
    className = '',
}) => {
    const slides = React.Children.toArray(children);
    const count = slides.length;

    const viewportRef = useRef<HTMLDivElement>(null);
    const [pageWidth, setPageWidth] = useState(0);
    const [index, setIndex] = useState(0);
    const x = useMotionValue(0);

    // Slide width: full viewport for a deck, ~78% for a peeking strip.
    const slideFraction = mode === 'deck' ? 1 : 0.78;

    useLayoutEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        const measure = () => setPageWidth(el.clientWidth * slideFraction);
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [slideFraction]);

    // Owns all track motion: snaps to the active slide whenever index or width
    // changes (goTo just sets index; a resize shrinking the deck re-clamps here).
    useLayoutEffect(() => {
        const clamped = Math.min(index, count - 1);
        if (clamped !== index) setIndex(clamped);
        animate(x, -clamped * pageWidth, SNAP);
    }, [index, pageWidth, count, x]);

    const goTo = (next: number) => setIndex(Math.max(0, Math.min(next, count - 1)));

    const onDragEnd = (_: unknown, info: PanInfo) => {
        const flick = Math.abs(info.velocity.x) > 400;
        const moved = Math.abs(info.offset.x) > pageWidth * 0.25;
        if ((flick || moved) && info.offset.x < 0) goTo(index + 1);
        else if ((flick || moved) && info.offset.x > 0) goTo(index - 1);
        else goTo(index);
    };

    // A single slide doesn't need drag/dots.
    if (count <= 1) {
        return <div className={className}>{slides}</div>;
    }

    const atStart = index === 0;
    const atEnd = index === count - 1;

    return (
        <div className={`flex w-full flex-col items-center ${className}`}>
            <div className="relative w-full">
                <div ref={viewportRef} className="w-full overflow-hidden">
                    <motion.div
                        className="flex"
                        style={{ x }}
                        drag="x"
                        dragConstraints={{ left: -(count - 1) * pageWidth, right: 0 }}
                        dragElastic={0.14}
                        onDragEnd={onDragEnd}
                    >
                        {slides.map((slide, i) => (
                            <div
                                key={i}
                                className="shrink-0 px-1.5"
                                style={{ width: pageWidth || '100%' }}
                            >
                                {slide}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Prev / next — for mouse users; drag still works too */}
                {showArrows && (
                    <>
                        <button
                            onClick={() => goTo(index - 1)}
                            disabled={atStart}
                            aria-label="Previous"
                            className="absolute left-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white disabled:pointer-events-none disabled:opacity-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => goTo(index + 1)}
                            disabled={atEnd}
                            aria-label="Next"
                            className="absolute right-0 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white disabled:pointer-events-none disabled:opacity-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {showDots && (
                <div className="mt-4 flex items-center gap-1.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Go to card ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-blue-600' : 'w-1.5 bg-zinc-300 hover:bg-zinc-400'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
