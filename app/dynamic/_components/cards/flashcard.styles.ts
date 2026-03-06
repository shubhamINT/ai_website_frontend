export type CardColors = {
    bg: string;
    text: string;
    ring: string;
    glow: string;
    border: string;
    gradient: string;
};

export const colorMap: Record<string, CardColors> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', glow: 'bg-blue-500/10', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100', glow: 'bg-amber-500/10', border: 'border-amber-200', gradient: 'from-amber-500 to-amber-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100', glow: 'bg-indigo-500/10', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', glow: 'bg-rose-500/10', border: 'border-rose-200', gradient: 'from-rose-500 to-rose-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100', glow: 'bg-violet-500/10', border: 'border-violet-200', gradient: 'from-violet-500 to-violet-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-100', glow: 'bg-orange-500/10', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-100', glow: 'bg-cyan-500/10', border: 'border-cyan-200', gradient: 'from-cyan-500 to-cyan-600' },
    fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', ring: 'ring-fuchsia-100', glow: 'bg-fuchsia-500/10', border: 'border-fuchsia-200', gradient: 'from-fuchsia-500 to-fuchsia-600' },
    zinc: { bg: 'bg-zinc-50', text: 'text-zinc-600', ring: 'ring-zinc-100', glow: 'bg-zinc-500/10', border: 'border-zinc-200', gradient: 'from-zinc-500 to-zinc-600' },
};

export function getIntentColorName(intent = 'neutral', fallbackColor: string) {
    const intentColorMap: Record<string, string> = {
        urgent: 'rose',
        warning: 'amber',
        success: 'emerald',
        processing: 'blue',
        cyberpunk: 'violet',
        neutral: 'zinc',
    };

    return intentColorMap[intent] ? intentColorMap[intent] : fallbackColor || 'zinc';
}

export function guessColor(keyword: string) {
    const normalizedKeyword = keyword.toLowerCase();

    if (normalizedKeyword.includes('price') || normalizedKeyword.includes('cost') || normalizedKeyword.includes('money') || normalizedKeyword.includes('success')) return 'emerald';
    if (normalizedKeyword.includes('location') || normalizedKeyword.includes('map') || normalizedKeyword.includes('blue')) return 'blue';
    if (normalizedKeyword.includes('alert') || normalizedKeyword.includes('warn') || normalizedKeyword.includes('time')) return 'amber';
    if (normalizedKeyword.includes('error') || normalizedKeyword.includes('critical')) return 'rose';
    if (normalizedKeyword.includes('ai') || normalizedKeyword.includes('smart')) return 'violet';
    return 'zinc';
}

export function normalizeAspectRatio(aspectRatio?: string) {
    if (aspectRatio === 'portrait' || aspectRatio === 'square' || aspectRatio === 'auto') {
        return aspectRatio;
    }

    return 'video';
}
