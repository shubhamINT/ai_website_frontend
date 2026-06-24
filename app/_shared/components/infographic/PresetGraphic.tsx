import React from 'react';
import { motion } from 'framer-motion';

// ─── Preset graphics ───────────────────────────────────────────────────────
// Bundled vector art keyed by `hero.graphic` / `icon_bullets.graphic`. Never a
// URL, never inline SVG from the backend. `<PresetGraphic name>` maps key →
// component and renders NOTHING on an unknown key. Keep this key list in sync
// with the backend prompt's PRESET GRAPHIC KEYS section and `PresetGraphicKey`.
//
// House palette: blue (#3b82f6) → emerald (#10b981) on the Vaani glass surface.
// Each graphic is a small *illustration*, not a wireframe: layered fills,
// soft glow, depth shadow, and a staggered entrance so a card with only a
// hero still feels designed. ViewBox is 220×150 across the set so sizes match.

interface GraphicProps {
    className?: string;
}

const VB = '0 0 220 150';

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

const rise = (delay = 0, y = 14) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { delay, type: 'spring' as const, stiffness: 220, damping: 22 },
});

// Reusable <defs>: blue→emerald gradients + a soft glow filter. `id` namespaces
// every def so multiple graphics on one card never collide.
const Defs = ({ id }: { id: string }) => (
    <defs>
        <linearGradient id={`${id}-h`} x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" />
            <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60a5fa" />
            <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="45%" r="55%">
            <stop stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1e3a8a" floodOpacity="0.18" />
        </filter>
    </defs>
);

// Ambient backdrop glow shared by every graphic.
const Backdrop = ({ id }: { id: string }) => (
    <motion.ellipse cx="110" cy="70" rx="100" ry="62" fill={`url(#${id}-glow)`}
        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }} style={{ transformOrigin: '110px 70px' }} />
);

// ── DevOps / CI-CD infinity loop ────────────────────────────────────────────
const DevopsLoop = ({ className }: GraphicProps) => {
    const id = 'pg-devops';
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            {/* echo ring for depth */}
            <motion.path d="M58 75c0-26 30-26 52 0s52 26 52 0-30-26-52 0-52 26-52 0z"
                stroke={`url(#${id}-h)`} strokeWidth="14" strokeLinecap="round" opacity="0.14" {...draw(0.05)} />
            {/* main loop */}
            <motion.path d="M58 75c0-26 30-26 52 0s52 26 52 0-30-26-52 0-52 26-52 0z"
                stroke={`url(#${id}-h)`} strokeWidth="8" strokeLinecap="round" filter={`url(#${id}-soft)`} {...draw(0.15)} />
            <motion.circle cx="58" cy="75" r="9" fill="#3b82f6" filter={`url(#${id}-soft)`} {...pop(1.0)} />
            <motion.circle cx="162" cy="75" r="9" fill="#10b981" filter={`url(#${id}-soft)`} {...pop(1.15)} />
            <motion.circle cx="110" cy="75" r="6" fill="#fff" stroke={`url(#${id}-h)`} strokeWidth="3" {...pop(1.3)} />
        </svg>
    );
};

// ── build → test → deploy pipeline ───────────────────────────────────────────
const CicdPipeline = ({ className }: GraphicProps) => {
    const id = 'pg-cicd';
    const xs = [44, 110, 176];
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            <motion.line x1="44" y1="75" x2="176" y2="75" stroke={`url(#${id}-h)`} strokeWidth="6" strokeLinecap="round" {...draw(0.1)} />
            {/* flowing pulse along the line */}
            <motion.circle r="4" fill="#fff" stroke="#10b981" strokeWidth="2"
                initial={{ opacity: 0 }} animate={{ cx: xs, opacity: [0, 1, 1, 0] }}
                transition={{ delay: 1.1, duration: 1.8, repeat: Infinity, repeatDelay: 0.6 }} cy="75" />
            {xs.map((x, i) => (
                <motion.g key={x} {...pop(0.4 + i * 0.18)} filter={`url(#${id}-soft)`}>
                    <circle cx={x} cy="75" r="20" fill="#fff" stroke={i === 2 ? '#10b981' : '#3b82f6'} strokeWidth="5" />
                    <circle cx={x} cy="75" r="6" fill={i === 2 ? '#10b981' : '#3b82f6'} />
                </motion.g>
            ))}
        </svg>
    );
};

// ── cloud architecture / infra layers ────────────────────────────────────────
const CloudStack = ({ className }: GraphicProps) => {
    const id = 'pg-cloud';
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            {/* cloud */}
            <motion.path d="M78 52a20 20 0 0139-6 16 16 0 0118 16 14 14 0 01-3 28H82a16 16 0 01-4-31z"
                fill={`url(#${id}-v)`} opacity="0.9" filter={`url(#${id}-soft)`} {...rise(0.1)} />
            {/* stacked server layers */}
            {[0, 1, 2].map((i) => (
                <motion.g key={i} {...rise(0.45 + i * 0.14, 18)}>
                    <rect x="64" y={98 + i * 16} width="92" height="12" rx="6"
                        fill={`url(#${id}-h)`} opacity={0.85 - i * 0.16} filter={`url(#${id}-soft)`} />
                    <circle cx="74" cy={104 + i * 16} r="2.6" fill="#fff" opacity="0.9" />
                    <circle cx="83" cy={104 + i * 16} r="2.6" fill="#fff" opacity="0.55" />
                </motion.g>
            ))}
        </svg>
    );
};

// ── AI / ML neural network ───────────────────────────────────────────────────
const AiWorkflow = ({ className }: GraphicProps) => {
    const id = 'pg-ai';
    const inY = [50, 100];
    const midY = [38, 75, 112];
    const outY = [62, 88];
    const edges: [number, number, number, number][] = [];
    inY.forEach((y1) => midY.forEach((y2) => edges.push([56, y1, 110, y2])));
    midY.forEach((y1) => outY.forEach((y2) => edges.push([110, y1, 164, y2])));
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            {edges.map((e, i) => (
                <motion.line key={i} x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]}
                    stroke={`url(#${id}-h)`} strokeWidth="1.5" opacity="0.4" {...draw(0.15 + i * 0.03)} />
            ))}
            {inY.map((y, i) => <motion.circle key={`i${i}`} cx="56" cy={y} r="8" fill="#3b82f6" filter={`url(#${id}-soft)`} {...pop(0.5 + i * 0.1)} />)}
            {midY.map((y, i) => <motion.circle key={`m${i}`} cx="110" cy={y} r="9" fill="url(#pg-ai-v)" filter={`url(#${id}-soft)`} {...pop(0.7 + i * 0.1)} />)}
            {outY.map((y, i) => <motion.circle key={`o${i}`} cx="164" cy={y} r="8" fill="#10b981" filter={`url(#${id}-soft)`} {...pop(0.95 + i * 0.1)} />)}
        </svg>
    );
};

// ── cybersecurity / compliance shield ────────────────────────────────────────
const SecurityShield = ({ className }: GraphicProps) => {
    const id = 'pg-sec';
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            <motion.path d="M110 22l40 14v30c0 27-19 42-40 49-21-7-40-22-40-49V36z"
                fill={`url(#${id}-v)`} opacity="0.9" filter={`url(#${id}-soft)`}
                initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 0.92 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 20 }} style={{ transformOrigin: '110px 75px' }} />
            {/* inner highlight */}
            <motion.path d="M110 34l28 10v22c0 19-13 30-28 35-15-5-28-16-28-35V44z"
                fill="#fff" opacity="0.16" {...rise(0.35, 6)} />
            <motion.path d="M95 74l11 12 24-27" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" {...draw(0.7)} />
            {/* orbit particles */}
            {[40, 180].map((x, i) => <motion.circle key={i} cx={x} cy={i ? 110 : 50} r="3" fill="#10b981" {...pop(1.1 + i * 0.1)} />)}
        </svg>
    );
};

// ── growth / business impact chart ───────────────────────────────────────────
const GrowthChart = ({ className }: GraphicProps) => {
    const id = 'pg-growth';
    const bars = [[56, 44], [92, 64], [128, 86], [164, 110]]; // [x, height]
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            {bars.map(([x, h], i) => (
                <motion.rect key={i} x={x} width="22" rx="5" fill={`url(#${id}-v)`} filter={`url(#${id}-soft)`}
                    initial={{ height: 0, y: 124 }} animate={{ height: h, y: 124 - h }}
                    transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 180, damping: 20 }} />
            ))}
            {/* trend line + arrow */}
            <motion.path d="M52 96l36-22 36-16 40-30" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" {...draw(0.8)} />
            <motion.path d="M150 28h16v16" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" {...draw(1.4)} />
        </svg>
    );
};

// ── web / app development ────────────────────────────────────────────────────
const WebDevelopment = ({ className }: GraphicProps) => {
    const id = 'pg-web';
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            <motion.g {...rise(0.1, 16)} filter={`url(#${id}-soft)`}>
                <rect x="48" y="34" width="124" height="82" rx="12" fill="#fff" stroke={`url(#${id}-h)`} strokeWidth="4" />
                <path d="M48 56h124" stroke={`url(#${id}-h)`} strokeWidth="3" />
                <circle cx="62" cy="45" r="3" fill="#3b82f6" />
                <circle cx="73" cy="45" r="3" fill="#10b981" />
                <circle cx="84" cy="45" r="3" fill="#93c5fd" />
            </motion.g>
            {/* </> code glyph */}
            <motion.path d="M96 74l-12 12 12 12" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" {...draw(0.7)} />
            <motion.path d="M124 74l12 12-12 12" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" {...draw(0.9)} />
            <motion.line x1="112" y1="70" x2="108" y2="102" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" {...draw(1.1)} />
        </svg>
    );
};

// ── data analytics / dashboard ───────────────────────────────────────────────
const DataAnalytics = ({ className }: GraphicProps) => {
    const id = 'pg-data';
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            {/* donut */}
            <motion.circle cx="78" cy="75" r="30" stroke="#dbeafe" strokeWidth="14" {...pop(0.2)} />
            <motion.circle cx="78" cy="75" r="30" stroke={`url(#${id}-h)`} strokeWidth="14" strokeLinecap="round"
                transform="rotate(-90 78 75)" pathLength={1}
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 0.68, opacity: 1 }}
                transition={{ pathLength: { duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.3, delay: 0.4 } }} />
            {/* mini bars */}
            {[[140, 40], [160, 60], [180, 30]].map(([x, h], i) => (
                <motion.rect key={i} x={x} width="12" rx="3" fill={`url(#${id}-v)`}
                    initial={{ height: 0, y: 100 }} animate={{ height: h, y: 100 - h }}
                    transition={{ delay: 0.7 + i * 0.12, type: 'spring', stiffness: 200, damping: 20 }} />
            ))}
        </svg>
    );
};

// ── team / collaboration ─────────────────────────────────────────────────────
const TeamCollaboration = ({ className }: GraphicProps) => {
    const id = 'pg-team';
    const nodes: [number, number][] = [[110, 44], [60, 104], [160, 104]];
    const Person = ({ x, y }: { x: number; y: number }) => (
        <g filter={`url(#${id}-soft)`}>
            <circle cx={x} cy={y} r="12" fill={`url(#${id}-v)`} />
            <path d={`M${x - 16} ${y + 30}a16 16 0 0132 0z`} fill={`url(#${id}-v)`} />
        </g>
    );
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            <motion.path d="M110 44L60 104M110 44L160 104M60 104H160" stroke={`url(#${id}-h)`} strokeWidth="3" opacity="0.5" {...draw(0.2)} />
            {nodes.map(([x, y], i) => <motion.g key={i} {...pop(0.5 + i * 0.14)}><Person x={x} y={y} /></motion.g>)}
        </svg>
    );
};

// ── digital marketing / growth funnel ────────────────────────────────────────
const DigitalMarketing = ({ className }: GraphicProps) => {
    const id = 'pg-mkt';
    return (
        <svg viewBox={VB} fill="none" className={className} aria-hidden="true">
            <Defs id={id} />
            <Backdrop id={id} />
            {/* megaphone */}
            <motion.path d="M70 62l48-18v62l-48-18z" fill={`url(#${id}-h)`} filter={`url(#${id}-soft)`} {...rise(0.1, 12)} />
            <motion.rect x="58" y="58" width="14" height="34" rx="5" fill="#3b82f6" {...rise(0.2, 10)} />
            <motion.path d="M90 96l6 22a8 8 0 0015-5l-3-13" fill="#10b981" {...rise(0.35, 8)} />
            {/* sound arcs */}
            {[14, 24, 34].map((r, i) => (
                <motion.path key={i} d={`M128 ${75 - r}a${r} ${r} 0 010 ${r * 2}`} stroke="#10b981" strokeWidth="3" strokeLinecap="round" {...draw(0.5 + i * 0.15)} />
            ))}
        </svg>
    );
};

const GRAPHICS: Record<string, React.FC<GraphicProps>> = {
    devops_loop: DevopsLoop,
    cicd_pipeline: CicdPipeline,
    cloud_stack: CloudStack,
    ai_workflow: AiWorkflow,
    security_shield: SecurityShield,
    growth_chart: GrowthChart,
    web_development: WebDevelopment,
    data_analytics: DataAnalytics,
    team_collaboration: TeamCollaboration,
    digital_marketing: DigitalMarketing,
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
    return <Graphic className={className ?? 'h-28 w-auto md:h-36'} />;
};
