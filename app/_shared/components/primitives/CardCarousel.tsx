'use client';

import React, { useEffect, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface CardCarouselProps {
    /** One card per child. */
    children: React.ReactNode[];
    /** Show the dot pager below the carousel. */
    showDots?: boolean;
    /** Show clickable prev/next arrows (for mouse users). Defaults to true. */
    showArrows?: boolean;
    className?: string;
}

// Per-move slide animation — keeps the snappy feel the user liked from the deck.
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 32, mass: 0.7 };

// How long the active card rests before the carousel auto-advances one step.
const AUTO_MS = 3500;

/**
 * CardCarousel — a single-card slide carousel.
 *
 * Exactly ONE card is visible at a time. All cards share one grid cell (so the
 * height = the tallest card, keeping a uniform size) and slide horizontally as a
 * filmstrip: each card sits at `(i - index)` full widths and the off-screen ones
 * are CLIPPED by the container's overflow-hidden — no peeking / ghost cards. On a
 * slow timer the carousel plays ONE loop forward then rests. Manual nav
 * (drag / arrows / dots) moves a step and restarts the loop. Replaces the older
 * 3D peek CardStack, which read as cluttered inside the narrow widget window.
 */
export const CardCarousel: React.FC<CardCarouselProps> = ({
    children,
    showDots = false,
    showArrows = true,
    className = '',
}) => {
    const slides = React.Children.toArray(children);
    const count = slides.length;

    const [index, setIndex] = useState(0);
    // Bumped on every manual nav so the auto-advance timer restarts (manual moves
    // don't fight the timer).
    const [interactionKey, setInteractionKey] = useState(0);

    const clamp = (n: number) => Math.max(0, Math.min(count - 1, n));

    // Slow auto-advance for ONE forward pass — steps from the first card to the
    // last, then stops (no endless looping). Restarts on count change / manual nav.
    useEffect(() => {
        if (count <= 1) return;
        const id = setInterval(() => {
            setIndex((i) => {
                if (i >= count - 1) {
                    clearInterval(id); // reached the last card → done
                    return i;
                }
                return i + 1;
            });
        }, AUTO_MS);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, interactionKey]);

    const goTo = (next: number) => {
        setIndex(clamp(next));
        setInteractionKey((k) => k + 1);
    };

    const onDragEnd = (_: unknown, info: PanInfo) => {
        const flick = Math.abs(info.velocity.x) > 400;
        const moved = Math.abs(info.offset.x) > 60;
        if ((flick || moved) && info.offset.x < 0) goTo(index + 1);
        else if ((flick || moved) && info.offset.x > 0) goTo(index - 1);
    };

    // A single card needs no sliding or controls.
    if (count <= 1) {
        return <div className={className}>{slides}</div>;
    }

    return (
        <div className={`flex w-full flex-col items-center ${className}`}>
            {/* grid-stack + overflow-hidden: all cards share one cell so the height =
                the tallest card; the filmstrip transform below slides the active card
                in and clips the rest off-screen. */}
            <motion.div layout className="relative grid w-full overflow-hidden">
                {slides.map((slide, i) => {
                    const isActive = i === index;
                    return (
                        <motion.div
                            key={i}
                            // All cards occupy the same grid cell; offset each by full
                            // widths so only the active one is centered + visible.
                            className={`[grid-area:1/1] w-full ${isActive ? '' : 'pointer-events-none'}`}
                            style={{ zIndex: isActive ? 10 : 0 }}
                            animate={{ x: `${(i - index) * 100}%`, opacity: isActive ? 1 : 0 }}
                            transition={SPRING}
                            drag={isActive ? 'x' : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.18}
                            onDragEnd={isActive ? onDragEnd : undefined}
                        >
                            {slide}
                        </motion.div>
                    );
                })}

                {/* Prev / next — for mouse users; drag still works too. Hidden at
                    the ends so navigation reads as a finite filmstrip. */}
                {showArrows && (
                    <>
                        <button
                            onClick={() => goTo(index - 1)}
                            disabled={index === 0}
                            aria-label="Previous"
                            className="absolute left-0 top-1/2 z-[200] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white disabled:pointer-events-none disabled:opacity-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => goTo(index + 1)}
                            disabled={index === count - 1}
                            aria-label="Next"
                            className="absolute right-0 top-1/2 z-[200] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white disabled:pointer-events-none disabled:opacity-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}
            </motion.div>

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
