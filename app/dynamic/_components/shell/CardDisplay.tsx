import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import type { ChatMessage } from '@/app/hooks/agentTypes';
import { Flashcard } from '@/app/dynamic/_components/cards/Flashcard';

export const CardDisplay = ({ cards }: { cards: ChatMessage[] }) => {
    if (cards.length === 0) return null;

    const validCards = cards.filter((card): card is ChatMessage & { cardData: NonNullable<ChatMessage['cardData']> } =>
        card && card.cardData !== undefined && card.cardData.title !== undefined
    );

    if (validCards.length === 0) return null;

    const count = validCards.length;
    let gridClasses = 'mx-auto grid w-full auto-rows-max items-start gap-4 md:gap-6 ';

    if (count === 1) {
        gridClasses += 'grid-cols-1 max-w-[min(92vw,60rem)]';
    } else if (count === 2) {
        gridClasses += 'grid-cols-1 md:grid-cols-2 max-w-5xl';
    } else if (count === 3) {
        gridClasses += 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-7xl';
    } else if (count === 4) {
        gridClasses += 'grid-cols-1 md:grid-cols-2 max-w-5xl';
    } else {
        gridClasses += 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 max-w-[95vw] xl:max-w-screen-2xl';
    }

    return (
        <div className="relative flex w-full flex-col items-center">
            <motion.div layout className={`relative z-10 px-4 md:px-8 ${gridClasses}`}>
                <AnimatePresence mode="popLayout">
                    {validCards.map((card) => {
                        const hasMedia = Boolean(
                            card.cardData?.image?.url ||
                                card.cardData?.dynamicMedia?.query ||
                                (card.cardData?.dynamicMedia?.urls && card.cardData.dynamicMedia.urls.length > 0)
                        );

                        let layoutProp: 'default' | 'horizontal' = 'default';
                        if (count === 1 && hasMedia) {
                            layoutProp = 'horizontal';
                        }

                        return (
                            <motion.div
                                layout
                                key={card.id}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 160,
                                        damping: 20,
                                        mass: 0.8,
                                    },
                                }}
                                exit={{ opacity: 0, scale: 0.85, y: -20, transition: { duration: 0.3, ease: 'easeOut' } }}
                                transition={{ type: 'spring', stiffness: 180, damping: 22 }}
                                className="flex w-full self-start items-start"
                            >
                                <Flashcard
                                    {...card.cardData}
                                    size="bento"
                                    layout={layoutProp}
                                    layoutId={card.id}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {validCards.length > 4 && (
                <div className="mt-4 flex items-center gap-2 rounded-full bg-white/40 px-3 py-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl md:mt-6 md:px-4 md:py-2">
                    <div className="flex gap-1 md:gap-1.5">
                        {validCards.slice(-5).map((_, index) => (
                            <motion.div
                                key={index}
                                layoutId={`dot-${index}`}
                                className="h-1 w-1 rounded-full bg-zinc-400 md:h-1.5 md:w-1.5"
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-600 md:text-xs">
                        {validCards.length} Cards
                    </span>
                </div>
            )}
        </div>
    );
};
