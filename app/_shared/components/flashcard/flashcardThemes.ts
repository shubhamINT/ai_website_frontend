// ─── Color System ──────────────────────────────────────────────────────────
// Derived purely from visual_intent — never sent by backend

export const INTENT_COLOR_MAP: Record<string, string> = {
    urgent:     'rose',
    warning:    'amber',
    success:    'emerald',
    processing: 'blue',
    cyberpunk:  'violet',
    neutral:    'zinc',
};

export type CardColors = {
    bg: string; text: string; ring: string; glow: string; gradient: string;
};

export const COLOR_PALETTE: Record<string, CardColors> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100', glow: 'bg-emerald-500/10', gradient: 'from-emerald-500 to-emerald-600' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    ring: 'ring-blue-100',    glow: 'bg-blue-500/10',    gradient: 'from-blue-500 to-blue-600'    },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100',   glow: 'bg-amber-500/10',   gradient: 'from-amber-500 to-amber-600'   },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    ring: 'ring-rose-100',    glow: 'bg-rose-500/10',    gradient: 'from-rose-500 to-rose-600'    },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  ring: 'ring-violet-100',  glow: 'bg-violet-500/10',  gradient: 'from-violet-500 to-violet-600'  },
    zinc:    { bg: 'bg-zinc-50',    text: 'text-zinc-600',    ring: 'ring-zinc-100',    glow: 'bg-zinc-500/10',    gradient: 'from-zinc-500 to-zinc-600'    },
    orange:  { bg: 'bg-orange-50',  text: 'text-orange-600',  ring: 'ring-orange-100',  glow: 'bg-orange-500/10',  gradient: 'from-orange-500 to-orange-600'  },
    cyan:    { bg: 'bg-cyan-50',    text: 'text-cyan-600',    ring: 'ring-cyan-100',    glow: 'bg-cyan-500/10',    gradient: 'from-cyan-500 to-cyan-600'    },
    pink:    { bg: 'bg-pink-50',    text: 'text-pink-600',    ring: 'ring-pink-100',    glow: 'bg-pink-500/10',    gradient: 'from-pink-500 to-pink-600'    },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  ring: 'ring-indigo-100',  glow: 'bg-indigo-500/10',  gradient: 'from-indigo-500 to-indigo-600'  },
};

// Rotation order for text posters — one vivid color per card index so every
// poster in a batch looks distinct. Cycles back after the last entry.
export const POSTER_COLOR_ROTATION = [
    'blue', 'emerald', 'orange', 'violet', 'amber', 'cyan', 'rose', 'indigo', 'pink',
];
