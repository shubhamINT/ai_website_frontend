import React, { useState, useRef, useEffect, useMemo } from 'react';

export const SubtitleOverlay = ({ text, isInterim }: { text: string | null; isInterim: boolean }) => {
    const [visibleText, setVisibleText] = useState<string | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const processedText = useMemo(() => {
        if (!text) return null;
        if (text.length > 120) {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            return sentences[sentences.length - 1].trim();
        }
        return text;
    }, [text]);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (processedText) {
            timeoutRef.current = setTimeout(() => {
                setVisibleText(processedText);
            }, 0);

            if (!isInterim) {
                const hideTimer = setTimeout(() => {
                    setVisibleText(null);
                }, 4000);
                return () => clearTimeout(hideTimer);
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [processedText, isInterim]);

    if (!visibleText) return null;

    return (
        <div className="pointer-events-none absolute bottom-28 left-0 right-0 z-20 flex justify-center px-4 md:bottom-32">
            <div className={`max-w-2xl text-center transition-all duration-300 ${visibleText ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <span className={`inline-block rounded-xl bg-black/60 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-md md:rounded-2xl md:px-6 md:py-3 md:text-lg ${isInterim ? 'animate-pulse' : ''}`}>
                    {visibleText}
                </span>
            </div>
        </div>
    );
};
