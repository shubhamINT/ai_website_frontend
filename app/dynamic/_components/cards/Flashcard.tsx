import React from 'react';
import { motion, type Variants } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { FlashcardStyle } from '@/app/hooks/agentTypes';
import { RichMedia } from '@/app/dynamic/_components/media/RichMedia';
import { colorMap, getIntentColorName, guessColor, normalizeAspectRatio } from '@/app/dynamic/_components/cards/flashcard.styles';
import { SmartIcon } from '@/app/_shared/media/SmartIcon';

interface FlashcardProps {
    title: string;
    value: string;
    media?: {
        urls?: string[];
        query?: string;
        source?: 'unsplash' | 'pexels' | 'pixabay';
        aspectRatio?: 'auto' | 'video' | 'square' | 'portrait';
        mediaType?: 'image' | 'video';
    };
    icon?: string | { type: 'static'; ref: string; fallback?: string };
    layoutId?: string;
}

type FullFlashcardProps = FlashcardProps & FlashcardStyle;

export const Flashcard = React.memo(({
    title = 'Information',
    value = '',
    accentColor,
    icon,
    smartIcon,
    theme,
    size,
    layout = 'default',
    image,
    visual_intent,
    animation_style,
    dynamicMedia,
    media,
    layoutId,
}: FullFlashcardProps) => {
    const resolvedMedia = (dynamicMedia || media) as FlashcardProps['media'];
    const detectedColorName = (accentColor as string) || getIntentColorName(visual_intent, guessColor(title || value));
    const colors = colorMap[detectedColorName] || colorMap.zinc;

    const normalizedSize = (size === 'tiny' || size === 'extra-small') ? 'tiny'
        : (size === 'sm' || size === 'small') ? 'small'
            : (size === 'lg' || size === 'large') ? 'large'
                : (size === 'bento') ? 'bento' : 'medium';
    const normalizedTheme = theme || (visual_intent === 'cyberpunk' ? 'neon' : 'glass');

    const themeClasses = {
        glass: 'bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60',
        solid: 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-zinc-100/80',
        gradient: `bg-gradient-to-br from-white via-white to-${detectedColorName}-50/40 shadow-[0_15px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100`,
        neon: `bg-zinc-900 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-${detectedColorName}-500/50`,
    };

    const sizeClasses: Record<string, string> = {
        tiny: 'p-1.5 gap-1.5 w-full max-w-[150px] md:p-2.5 md:max-w-[200px]',
        small: 'p-2 gap-2 w-full max-w-[180px] md:p-3 md:max-w-[240px]',
        medium: 'p-2.5 gap-2.5 w-full max-w-[240px] md:p-6 md:gap-5 md:max-w-[400px]',
        large: 'p-4 w-full max-w-4xl md:p-8',
        bento: 'p-4 md:p-6 w-full',
    };

    const mediaData: FlashcardProps['media'] | undefined = resolvedMedia || (image?.url ? {
        urls: [image.url],
        aspectRatio: normalizeAspectRatio(image.aspectRatio),
        mediaType: 'image',
    } : undefined);
    const hasMedia = Boolean(mediaData?.query || (mediaData?.urls && mediaData.urls.length > 0));
    const showHorizontalMedia = layout === 'horizontal' && hasMedia;
    const showStackedMedia = layout !== 'horizontal' && hasMedia;

    const variants: Variants = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 350, damping: 25 },
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
    };

    const popVariants: Variants = {
        hidden: { opacity: 0, scale: 0.5 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring' } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
    };

    const slideVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
    };

    const selectedVariant: Variants = animation_style === 'pop' ? popVariants
        : animation_style === 'slide' ? slideVariants : variants;

    const renderContent = (text: string) => {
        if (!text) return null;

        return (
            <div className={`
                markdown-render
                ${normalizedTheme === 'neon' ? 'prose-invert text-zinc-300' : 'text-zinc-600'}
                prose prose-sm max-w-none
                prose-p:my-1 prose-p:leading-relaxed
                prose-headings:my-2 prose-headings:font-bold prose-headings:text-inherit
                prose-strong:text-inherit prose-strong:font-bold
                prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                prose-li:my-0.5
                text-[11px] md:text-sm
                ${layout === 'centered' ? 'text-center [&>*]:text-center' : ''}
            `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {text}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <motion.div
            layout
            layoutId={layoutId}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={selectedVariant}
            className={`
                group relative flex w-full flex-col self-start overflow-hidden rounded-[1.5rem] transition-colors md:rounded-[2rem]
                ${themeClasses[normalizedTheme as keyof typeof themeClasses]}
                ${sizeClasses[normalizedSize]}
            `}
        >
            <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full ${colors.glow} opacity-25 blur-[30px] md:h-64 md:w-64 md:opacity-40 md:blur-[60px]`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.14)_28%,rgba(255,255,255,0)_62%)]" />

            <div className={`relative z-10 flex flex-col ${layout === 'horizontal' ? 'gap-4 md:flex-row md:items-center md:gap-6' : 'gap-4 md:gap-5'} ${layout === 'centered' ? 'items-center justify-center text-center' : ''}`}>
                {showHorizontalMedia && (
                    <div className="w-full shrink-0 md:w-[min(40%,20rem)] md:max-w-[20rem]">
                        <div className="rounded-[1.35rem] bg-white/65 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-white/70 md:rounded-[1.6rem]">
                            <RichMedia
                                urls={mediaData?.urls}
                                query={mediaData?.query || title}
                                source={mediaData?.source}
                                aspectRatio={mediaData?.aspectRatio || 'video'}
                                alt={title}
                                mediaType={mediaData?.mediaType}
                            />
                        </div>
                    </div>
                )}

                <div className={`flex flex-col ${layout === 'horizontal' ? 'min-w-0 flex-1 justify-center' : 'w-full'}`}>
                    <div className={`flex items-start ${layout === 'centered' ? 'relative w-full justify-center' : 'justify-between'}`}>
                        <div className={`flex items-center gap-2 md:gap-3 ${layout === 'centered' ? 'flex-col gap-3' : ''}`}>
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 md:h-10 md:w-10 md:rounded-[14px] ${normalizedTheme === 'neon' ? `bg-gradient-to-br ${colors.gradient} text-white` : `bg-white ${colors.text} shadow-sm ring-1 ring-zinc-100`}`}>
                                <SmartIcon
                                    iconRef={smartIcon?.ref || (typeof icon === 'object' ? icon.ref : icon) || 'info'}
                                    type={smartIcon?.type || 'static'}
                                    className="h-4 w-4 md:h-5 md:w-5"
                                />
                            </div>

                            <div>
                                <h3 className={`text-xs font-bold leading-tight md:text-[15px] ${normalizedTheme === 'neon' ? 'text-white' : 'text-zinc-900'}`}>
                                    {title}
                                </h3>
                            </div>
                        </div>

                        {visual_intent === 'processing' ? (
                            <div className="mt-1 flex shrink-0 space-x-0.5 md:space-x-1">
                                <div className="h-0.5 w-0.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s] md:h-1.5 md:w-1.5" />
                                <div className="h-0.5 w-0.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s] md:h-1.5 md:w-1.5" />
                                <div className="h-0.5 w-0.5 animate-bounce rounded-full bg-blue-500 md:h-1.5 md:w-1.5" />
                            </div>
                        ) : (
                            <div className={`mt-1 h-1 w-1 shrink-0 rounded-full md:h-2 md:w-2 ${visual_intent === 'urgent' ? 'animate-ping bg-red-500' : 'bg-blue-500'}`} />
                        )}
                    </div>

                    {showStackedMedia && (
                        <div className="mt-4 rounded-[1.35rem] bg-white/65 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-white/70 md:rounded-[1.7rem]">
                            <RichMedia
                                urls={mediaData?.urls}
                                query={mediaData?.query || title}
                                source={mediaData?.source}
                                aspectRatio={mediaData?.aspectRatio || 'video'}
                                alt={title}
                                mediaType={mediaData?.mediaType}
                            />
                        </div>
                    )}

                    <div className={`mt-3 text-sm ${normalizedTheme === 'neon' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {renderContent(value)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

Flashcard.displayName = 'Flashcard';
