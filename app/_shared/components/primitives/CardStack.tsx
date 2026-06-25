'use client';

import React, { useEffect, useState } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface CardStackProps {
    /** One card per child. */
    children: React.ReactNode[];
    /** Show the dot pager below the stack. */
    showDots?: boolean;
    /** Show clickable prev/next arrows (for mouse users). Defaults to true. */
    showArrows?: boolean;
    /**
     * Expanded (wide) card → arrows sit on the LEFT/RIGHT sides, just outside the
     * card. Collapsed (narrow) → arrows sit inline with the dots row (`‹ • • • ›`)
     * since there's no horizontal room beside the card.
     */
    isExpanded?: boolean;
    className?: string;
}

// Small chevron icon used by both arrow placements.
const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
    </svg>
);

const arrowBtn =
    'flex items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.15)] ring-1 ring-black/5 backdrop-blur transition-all hover:bg-white';

// The per-move animation — same feel as the manual click/drag (do not slow this;
// the user likes the snap). The *dwell* between auto-moves is AUTO_MS below.
const SPRING = { type: 'spring' as const, stiffness: 300, damping: 32, mass: 0.7 };

// How long the front card rests before the deck cycles to the next one.
const AUTO_MS = 3500;

// How many cards peek behind the front one before the rest hide.
const VISIBLE_BEHIND = 2;

/**
 * CardStack — a 3D stacked deck of cards that cycles in a loop.
 *
 * The active card sits in front at full size; upcoming cards peek out from the
 * top-right corner behind it (each nudged up + right, scaled down, faded). On a
 * slow timer the deck plays ONE loop — first card through the last and back to the
 * first — then stops. The front card eases back into the stack and the next rises
 * forward, never peeling off-screen. Manual nav (drag / arrows / dots) wraps
 * circularly, moves a step, and restarts the loop. Used by the window-variant
 * CardDisplay; SwipeDeck still drives the StarterScreen.
 */
export const CardStack: React.FC<CardStackProps> = ({
    children,
    showDots = false,
    showArrows = true,
    isExpanded = false,
    className = '',
}) => {
    const slides = React.Children.toArray(children);
    const count = slides.length;

    const [index, setIndex] = useState(0);
    // Bumped on every manual nav so the auto-cycle timer restarts (manual moves
    // don't fight the timer).
    const [interactionKey, setInteractionKey] = useState(0);

    const wrap = (n: number) => ((n % count) + count) % count;

    // Slow auto-advance for ONE full loop — steps from the first card through the
    // last and back to the first, then stops (no endless spinning). Restarts when
    // the card count changes or the user navigates manually.
    useEffect(() => {
        if (count <= 1) return;
        let steps = 0;
        const id = setInterval(() => {
            setIndex((i) => wrap(i + 1));
            steps += 1;
            if (steps >= count) clearInterval(id); // back at the first card → done
        }, AUTO_MS);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [count, interactionKey]);

    const goTo = (next: number) => {
        setIndex(wrap(next));
        setInteractionKey((k) => k + 1);
    };

    const onDragEnd = (_: unknown, info: PanInfo) => {
        const flick = Math.abs(info.velocity.x) > 400;
        const moved = Math.abs(info.offset.x) > 60;
        if ((flick || moved) && info.offset.x < 0) goTo(index + 1);
        else if ((flick || moved) && info.offset.x > 0) goTo(index - 1);
    };

    // A single card needs no stacking or controls.
    if (count <= 1) {
        return <div className={className}>{slides}</div>;
    }

    return (
        <div className={`flex w-full flex-col items-center ${className}`}>
            <motion.div layout className="relative w-full">
                {slides.map((slide, i) => {
                    // Circular depth: 0 = front, 1..n behind. The front card cycles
                    // to the back of the stack rather than peeling off-screen.
                    const depth = wrap(i - index);
                    const isFront = depth === 0;
                    const clamped = Math.min(depth, VISIBLE_BEHIND + 1);

                    // Front card full opacity; the next VISIBLE_BEHIND peek and fade;
                    // everything deeper is hidden.
                    let opacity = 0;
                    if (isFront) opacity = 1;
                    else if (depth <= VISIBLE_BEHIND) opacity = 1 - depth * 0.22;

                    // Generous peek: each layer shifts right+up noticeably so the
                    // user can see at a glance that more cards sit behind the front.
                    const target = {
                        x: clamped * 22,
                        y: -clamped * 20,
                        scale: 1 - clamped * 0.05,
                        opacity: isFront ? 1 : opacity,
                    };

                    return (
                        <motion.div
                            key={i}
                            // Front card stays in flow and drives the container height.
                            // Behind cards use inset-x-0 top-0 max-h-full so they START
                            // from the top (natural content order) and are CAPPED at the
                            // front card's height. The cap is a rounded rectangle, so the
                            // visible portion always ends with a clean rounded corner.
                            // (inset-0 caused a mid-content straight cut when a taller
                            // card sat behind a shorter front card.)
                            className={isFront ? 'relative' : 'absolute inset-x-0 top-0 max-h-full overflow-hidden rounded-3xl md:rounded-4xl'}
                            style={{ zIndex: 100 - depth }}
                            animate={target}
                            transition={SPRING}
                            drag={isFront ? 'x' : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.18}
                            onDragEnd={isFront ? onDragEnd : undefined}
                        >
                            {slide}
                        </motion.div>
                    );
                })}

                {/* EXPANDED: arrows on the left/right sides, ~12px outside the card. */}
                {showArrows && isExpanded && (
                    <>
                        <button
                            onClick={() => goTo(index - 1)}
                            aria-label="Previous"
                            className={`absolute -left-11 top-1/2 z-200 h-9 w-9 -translate-y-1/2 ${arrowBtn}`}
                        >
                            <Chevron dir="left" />
                        </button>
                        <button
                            onClick={() => goTo(index + 1)}
                            aria-label="Next"
                            className={`absolute -right-11 top-1/2 z-200 h-9 w-9 -translate-y-1/2 ${arrowBtn}`}
                        >
                            <Chevron dir="right" />
                        </button>
                    </>
                )}
            </motion.div>

            {/* Pager row. COLLAPSED → arrows flank the dots ( ‹ • • • › ). EXPANDED →
                just the dots (side arrows handle nav). */}
            {showDots && (
                <div className="mt-5 flex items-center justify-center gap-3">
                    {showArrows && !isExpanded && (
                        <button
                            onClick={() => goTo(index - 1)}
                            aria-label="Previous"
                            className={`h-7 w-7 ${arrowBtn}`}
                        >
                            <Chevron dir="left" />
                        </button>
                    )}

                    <div className="flex items-center gap-1.5">
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

                    {showArrows && !isExpanded && (
                        <button
                            onClick={() => goTo(index + 1)}
                            aria-label="Next"
                            className={`h-7 w-7 ${arrowBtn}`}
                        >
                            <Chevron dir="right" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
