import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlashcardStyle } from '../../hooks/agentTypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SmartIcon } from './SmartIcon';
import { RichMedia } from './RichMedia';

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
}

type FullFlashcardProps = FlashcardProps & FlashcardStyle;

const getIntentColors = (intent: string = 'neutral', fallbackColor: string) => {
    const map: Record<string, string> = {
        urgent: 'rose',
        warning: 'amber',
        success: 'emerald',
        processing: 'blue',
        cyberpunk: 'violet',
        neutral: 'zinc'
    };
    const colorKey = map[intent] ? map[intent] : (fallbackColor || 'zinc');
    return colorKey;
};

const colorMap: Record<string, any> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', glow: 'bg-blue-500/10', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', glow: 'bg-amber-500/10', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', glow: 'bg-indigo-500/10', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', glow: 'bg-rose-500/10', border: 'border-rose-200', gradient: 'from-rose-500 to-rose-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100', glow: 'bg-violet-500/10', border: 'border-violet-200', gradient: 'from-violet-500 to-violet-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100', glow: 'bg-orange-500/10', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-100', glow: 'bg-cyan-500/10', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' },
    fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', ring: 'ring-fuchsia-100', glow: 'bg-fuchsia-500/10', border: 'border-fuchsia-200', gradient: 'from-fuchsia-500 to-fuchsia-600' },
    zinc: { bg: 'bg-zinc-50', text: 'text-zinc-600', ring: 'ring-zinc-100', glow: 'bg-zinc-500/10', border: 'border-zinc-200', gradient: 'from-zinc-500 to-zinc-600' }
};

const guessColor = (keyword: string) => {
    const k = keyword.toLowerCase();
    if (k.includes('price') || k.includes('cost') || k.includes('money') || k.includes('success')) return 'emerald';
    if (k.includes('location') || k.includes('map') || k.includes('blue')) return 'blue';
    if (k.includes('alert') || k.includes('warn') || k.includes('time')) return 'amber';
    if (k.includes('error') || k.includes('critical')) return 'rose';
    if (k.includes('ai') || k.includes('smart')) return 'violet';
    return 'zinc';
};

export const Flashcard = React.memo(({
    title = "Information",
    value = "",
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
    media
}: FullFlashcardProps) => {

    const resolvedMedia = (dynamicMedia || media) as FlashcardProps['media'];
    const detectedColorName = (accentColor as string) || getIntentColors(visual_intent, guessColor(title || value));
    const colors = colorMap[detectedColorName] || colorMap.zinc;

    const normalizedSize = (size === 'tiny' || size === 'extra-small') ? 'tiny' :
        (size === 'sm' || size === 'small') ? 'small' :
            (size === 'lg' || size === 'large') ? 'large' :
                (size === 'bento') ? 'bento' : 'medium';
    const normalizedTheme = theme || (visual_intent === 'cyberpunk' ? 'neon' : 'glass');

    const themeClasses = {
        glass: 'bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-white/60',
        solid: 'bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] ring-1 ring-zinc-100/80',
        gradient: `bg-gradient-to-br from-white via-white to-${detectedColorName}-50/40 shadow-[0_15px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100`,
        neon: `bg-zinc-900 text-white shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-${detectedColorName}-500/50`
    };

    const sizeClasses: Record<string, string> = {
        tiny: 'p-1.5 gap-1.5 w-full max-w-[150px] md:p-2.5 md:max-w-[200px]',
        small: 'p-2 gap-2 w-full max-w-[180px] md:p-3 md:max-w-[240px]',
        medium: 'p-2.5 gap-2.5 w-full max-w-[240px] md:p-6 md:gap-5 md:max-w-[400px]',
        large: 'p-4 w-full max-w-4xl md:p-8',
        bento: 'p-4 md:p-6 w-full h-full'
    };

    const variants = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 350, damping: 25 }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
        pop: {
            hidden: { opacity: 0, scale: 0.5 },
            visible: { opacity: 1, scale: 1, transition: { type: 'spring' } }
        },
        slide: {
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
        }
    };

    const selectedVariant = animation_style === 'pop' ? variants.pop :
        animation_style === 'slide' ? variants.slide : variants;

    const renderContent = (text: string) => {
        if (!text) return null;
        
        return (
            <div className={`
                markdown-render 
                ${normalizedTheme === 'neon' ? 'prose-invert text-zinc-300' : 'text-zinc-600'}
                prose prose-sm max-w-none
                prose-p:leading-relaxed prose-p:my-1
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
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={selectedVariant as any}
            className={`
                relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem]
                ${themeClasses[normalizedTheme as keyof typeof themeClasses]} 
                ${sizeClasses[normalizedSize]}
                group transition-colors h-full flex flex-col w-full
            `}
        >
            <div className={`absolute -right-20 -top-20 h-40 w-40 md:h-64 md:w-64 rounded-full ${colors.glow} blur-[30px] md:blur-[60px] opacity-25 md:opacity-40`} />

            {/* Inner Content flex-grow ensures space is beautifully utilized if card stretches */}
            <div className={`relative z-10 flex flex-col flex-grow
                ${layout === 'horizontal' ? 'md:flex-row gap-4 md:gap-6 md:items-center p-2' : 'gap-3 md:gap-4'} 
                ${layout === 'centered' ? 'justify-center text-center items-center' : ''}
            `}>

                {/* Horizontal Layout Image: Standardized to slightly wider card ratio instead of cramped portrait */}
                {layout === 'horizontal' && (image || resolvedMedia) && (
                    <div className="w-full sm:w-[180px] md:w-[220px] shrink-0 mx-auto md:my-auto">
                         <div className={`rounded-xl md:rounded-[1.5rem] overflow-hidden relative w-full h-full p-2
                            ${resolvedMedia?.aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'}
                         `}>
                            <RichMedia
                                urls={resolvedMedia?.urls}
                                query={resolvedMedia?.query || (image ? undefined : title)}
                                source={resolvedMedia?.source}
                                 aspectRatio={resolvedMedia?.aspectRatio || "video"} 
                                alt={title}
                                mediaType={resolvedMedia?.mediaType}
                            />
                            {!resolvedMedia && image?.url && (
                                 <img src={image.url} alt={image.alt} className="absolute inset-0 w-full h-full object-contain p-1 transition-transform duration-700 group-hover:scale-110" />
                            )}
                         </div>
                    </div>
                )}

                {/* Main Content Column */}
                <div className={`flex flex-col flex-grow ${layout === 'horizontal' ? 'flex-1 min-w-0 justify-center' : 'w-full'}`}>
                    
                    {/* Header */}
                    <div className={`flex items-start ${layout === 'centered' ? 'justify-center w-full relative' : 'justify-between'}`}>
                        <div className={`flex items-center gap-2 md:gap-3 ${layout === 'centered' ? 'flex-col gap-3' : ''}`}>
                            <div className={`
                                flex shrink-0 h-8 w-8 items-center justify-center rounded-lg md:h-10 md:w-10 md:rounded-[14px]
                                ${normalizedTheme === 'neon' ? `bg-gradient-to-br ${colors.gradient} text-white` : `bg-white ${colors.text} ring-1 ring-zinc-100 shadow-sm`}
                                transition-all duration-300 group-hover:scale-110
                            `}>
                                <SmartIcon
                                    iconRef={smartIcon?.ref || (typeof icon === 'object' ? icon.ref : icon) || 'info'}
                                    type={smartIcon?.type || 'static'}
                                    className="w-4 h-4 md:w-5 md:h-5"
                                />
                            </div>

                            <div>
                                <h3 className={`text-xs md:text-[15px] font-bold leading-tight ${normalizedTheme === 'neon' ? 'text-white' : 'text-zinc-900'}`}>
                                    {title}
                                </h3>
                            </div>
                        </div>

                        {visual_intent === 'processing' ? (
                            <div className="flex shrink-0 space-x-0.5 md:space-x-1 mt-1">
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-0.5 h-0.5 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                            </div>
                        ) : (
                            <div className={`shrink-0 w-1 h-1 md:w-2 md:h-2 rounded-full mt-1 ${visual_intent === 'urgent' ? 'bg-red-500 animate-ping' : 'bg-blue-500'}`} />
                        )}
                    </div>

                    {/* Vertical Media: DYNAMIC Aspect Ratio ensures 'Full Size' visibility without cropping */}
                    {layout !== 'horizontal' && (image || resolvedMedia) && (
                        <div className={`mt-3 mb-1 w-full rounded-xl md:rounded-[1.8rem] overflow-hidden relative shrink-0 p-3
                            ${resolvedMedia?.aspectRatio === 'portrait' ? 'aspect-[3/4]' : 
                              resolvedMedia?.aspectRatio === 'square' ? 'aspect-square' : 
                              'aspect-video'}
                        `}>
                            <RichMedia
                                urls={resolvedMedia?.urls}
                                query={resolvedMedia?.query || (image ? undefined : title)}
                                source={resolvedMedia?.source}
                                 aspectRatio={resolvedMedia?.aspectRatio || "video"} // <-- Use provided aspect ratio or default to video
                                alt={title}
                                mediaType={resolvedMedia?.mediaType}
                            />
                            {!resolvedMedia && image?.url && (
                                <img src={image.url} alt={image.alt} className="absolute inset-0 w-full h-full object-contain p-1" />
                            )}
                        </div>
                    )}

                    {/* Content Section: flex-grow expands smoothly to bottom border if card is stretched */}
                    <div className={`text-sm ${normalizedTheme === 'neon' ? 'text-zinc-300' : 'text-zinc-600'} flex-grow ${layout === 'horizontal' ? 'mt-2' : 'mt-2'}`}>
                        {renderContent(value)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});