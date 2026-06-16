import React from 'react';
import { motion } from 'framer-motion';

// ─── Preset graphics ───────────────────────────────────────────────────────
// Bundled vector art keyed by `hero.graphic` / `icon_bullets.graphic`. Never a
// URL, never inline SVG from the backend. `<PresetGraphic name>` maps key →
// component and renders NOTHING on an unknown key. Keep this key list in sync
// with the backend prompt's PRESET GRAPHIC KEYS section.
//
// House palette: blue (#3b82f6) → emerald (#10b981), on the Vani glass surface.

interface GraphicProps {
    className?: string;
}

// Shared draw-in transition for line art (Apple-style stroke reveal).
const draw = (delay = 0) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] as const }, opacity: { duration: 0.3, delay } },
});

const pop = (delay = 0) => ({
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { delay, type: 'spring' as const, stiffness: 260, damping: 18 },
});

// DevOps / CI-CD infinity loop
const DevopsLoop = ({ className }: GraphicProps) => (
    <svg viewBox="0 0 200 96" fill="none" className={className} aria-hidden="true">
        <defs>
            <linearGradient id="pg-devops" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#10b981" />
            </linearGradient>
        </defs>
        <motion.path
            d="M64 48c0-18 24-18 36 0s36 18 36 0-24-18-36 0-36 18-36 0z"
            stroke="url(#pg-devops)" strokeWidth="6" strokeLinecap="round"
            {...draw(0.1)}
        />
        <motion.circle cx="64" cy="48" r="7" fill="#3b82f6" {...pop(1.0)} />
        <motion.circle cx="136" cy="48" r="7" fill="#10b981" {...pop(1.15)} />
    </svg>
);

// build → test → deploy pipeline
const CicdPipeline = ({ className }: GraphicProps) => {
    const xs = [34, 100, 166];
    return (
        <svg viewBox="0 0 200 96" fill="none" className={className} aria-hidden="true">
            <defs>
                <linearGradient id="pg-cicd" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#10b981" />
                </linearGradient>
            </defs>
            <motion.line x1="34" y1="48" x2="166" y2="48" stroke="url(#pg-cicd)" strokeWidth="5" strokeLinecap="round" {...draw(0.1)} />
            {xs.map((x, i) => (
                <motion.g key={x} {...pop(0.5 + i * 0.18)}>
                    <circle cx={x} cy="48" r="16" fill="#fff" stroke={i === 2 ? '#10b981' : '#3b82f6'} strokeWidth="4" />
                    <circle cx={x} cy="48" r="5" fill={i === 2 ? '#10b981' : '#3b82f6'} />
                </motion.g>
            ))}
        </svg>
    );
};

// cloud architecture / infra layers
const CloudStack = ({ className }: GraphicProps) => (
    <svg viewBox="0 0 200 96" fill="none" className={className} aria-hidden="true">
        <defs>
            <linearGradient id="pg-cloud" x1="0" y1="0" x2="0" y2="96" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#10b981" />
            </linearGradient>
        </defs>
        {[0, 1, 2].map((i) => (
            <motion.rect
                key={i}
                x={56 - i * 0} y={20 + i * 22} width="88" height="16" rx="8"
                fill="url(#pg-cloud)" opacity={0.35 + i * 0.25}
                initial={{ opacity: 0, y: 10 + i * 22 }}
                animate={{ opacity: 0.35 + i * 0.25, y: 20 + i * 22 }}
                transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 220, damping: 22 }}
            />
        ))}
        <motion.path
            d="M74 20a18 18 0 0136 0"
            stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" {...draw(0.1)}
        />
    </svg>
);

// AI / ML data pipeline lifecycle — neural fan
const AiWorkflow = ({ className }: GraphicProps) => {
    const right = [28, 48, 68];
    return (
        <svg viewBox="0 0 200 96" fill="none" className={className} aria-hidden="true">
            <defs>
                <linearGradient id="pg-ai" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3b82f6" />
                    <stop offset="1" stopColor="#10b981" />
                </linearGradient>
            </defs>
            {right.map((y, i) => (
                <motion.line key={i} x1="60" y1="48" x2="140" y2={y} stroke="url(#pg-ai)" strokeWidth="3" strokeLinecap="round" {...draw(0.2 + i * 0.1)} />
            ))}
            <motion.circle cx="60" cy="48" r="12" fill="#3b82f6" {...pop(0.4)} />
            {right.map((y, i) => (
                <motion.circle key={i} cx="140" cy={y} r="8" fill="#10b981" {...pop(0.9 + i * 0.12)} />
            ))}
        </svg>
    );
};

// cybersecurity / compliance shield
const SecurityShield = ({ className }: GraphicProps) => (
    <svg viewBox="0 0 200 96" fill="none" className={className} aria-hidden="true">
        <defs>
            <linearGradient id="pg-sec" x1="100" y1="8" x2="100" y2="92" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#10b981" />
            </linearGradient>
        </defs>
        <motion.path
            d="M100 10l34 12v24c0 22-16 34-34 40-18-6-34-18-34-40V22z"
            fill="url(#pg-sec)" opacity="0.15"
            initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 0.15 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 220, damping: 20 }}
            style={{ transformOrigin: '100px 50px' }}
        />
        <motion.path
            d="M100 10l34 12v24c0 22-16 34-34 40-18-6-34-18-34-40V22z"
            stroke="url(#pg-sec)" strokeWidth="5" strokeLinejoin="round" {...draw(0.1)}
        />
        <motion.path d="M84 48l11 11 22-24" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" {...draw(0.9)} />
    </svg>
);

const GRAPHICS: Record<string, React.FC<GraphicProps>> = {
    devops_loop: DevopsLoop,
    cicd_pipeline: CicdPipeline,
    cloud_stack: CloudStack,
    ai_workflow: AiWorkflow,
    security_shield: SecurityShield,
};

interface PresetGraphicProps {
    name?: string;
    className?: string;
}

// Unknown / missing key → render nothing (graceful).
export const PresetGraphic = ({ name, className }: PresetGraphicProps) => {
    if (!name) return null;
    const Graphic = GRAPHICS[name];
    if (!Graphic) return null;
    return <Graphic className={className ?? 'h-20 w-auto md:h-24'} />;
};
