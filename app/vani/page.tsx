"use client";

/**
 * Vani — chat-window experience.
 *
 * Static INT Global hero (video background, navbar, client logo marquee) with a
 * floating voice-bot launcher. The launcher is the SAME public/widget.js that
 * external sites embed (it iframes /embed). It is mounted globally by
 * <PersistentVaniWidget> in the root layout (so it survives navigation to other
 * widget routes like /products without dropping the chat session), not here.
 * /dynamic keeps the immersive full-window experience.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Background video. Change YT_VIDEO_ID to swap the clip.
// NOTE: a YouTube embed always carries some player chrome; we hide it with
// controls=0, no keyboard/captions/annotations, a click-shield, and by scaling
// the iframe past the viewport so the title/control strips crop off-screen.
// For a 100% clean background, host an .mp4 and switch this to <video>.
const YT_VIDEO_ID = "iOvGVR7Lo_A";
const YT_SRC = `https://www.youtube-nocookie.com/embed/${YT_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_VIDEO_ID}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0`;

// `href` opts a link into real client-side navigation (Next <Link>); the rest
// are placeholder anchors for now.
const NAV_LINKS: { label: string; caret: boolean; href?: string }[] = [
    { label: "Services", caret: true },
    { label: "Products", caret: true, href: "/products" },
    { label: "Industries", caret: true },
    { label: "Company", caret: true },
    { label: "Investors", caret: true },
    { label: "Partners", caret: false },
    { label: "Resources", caret: true },
    { label: "Contact Us", caret: false },
];

const CLIENT_LOGOS = [
    "TESCO Bank",
    "Cipla",
    "IndusInd Bank",
    "Honeywell",
    "Lyca Mobile",
    "KONVERGENCE®",
    "CASHPOINT",
];

const BADGES = [
    { id: "deloitte-india",  type: "deloitte", award: "Technology Fast50",  region: "India",        border: "border-white/40"       },
    { id: "clutch",          type: "clutch",   rating: "4.9",               border: "border-orange-400/50"                           },
    { id: "deloitte-asia",   type: "deloitte", award: "Technology Fast500", region: "Asia Pacific", border: "border-green-400/40"   },
];

export default function VaniPage() {
    const [badgeIndex, setBadgeIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setBadgeIndex(i => (i + 1) % BADGES.length), 4000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="relative w-full overflow-x-hidden bg-[#0a0a0a]">

            {/* ───────────────────────── HERO ───────────────────────── */}
            <section className="relative flex h-[88vh] min-h-[580px] w-full flex-col overflow-hidden">

                {/* Background video — scaled past viewport so YouTube chrome crops off-screen */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                    <iframe
                        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-[1.35]"
                        src={YT_SRC}
                        title="INT Global"
                        allow="autoplay; encrypted-media"
                        style={{ border: 0 }}
                    />
                    {/* Click-shield: blocks all player interaction (pause/seek popups) */}
                    <div className="absolute inset-0" />
                </div>

                {/* Dark gradient overlay (left-heavy) + bottom fade */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/55 to-black/15" />
                <div className="absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-t from-black/55 to-transparent" />

                {/* ── Navbar ── */}
                <nav className="relative z-50 px-4 pt-10 sm:px-6 sm:pt-12 lg:px-10 lg:pt-14">
                    <div className="flex items-center gap-4 rounded-full bg-white px-1 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.14)] sm:py-2">

                        {/* Logo — circle, h-[86px] w-[86px] (1.2× of 72px), 5px left margin */}
                        <Link
                            href="/landing"
                            className="ml-[5px] flex h-[86px] w-[86px] shrink-0 items-center justify-center rounded-full bg-[#1a52a0] shadow-[0_4px_14px_rgba(26,82,160,0.45)] transition hover:scale-105"
                            aria-label="Back to home"
                        >
                            <span className="text-[30px] font-bold tracking-tight text-white">INT.</span>
                        </Link>

                        {/* Nav links — centered inside a transparent inner pill */}
                        <div className="hidden flex-1 items-center justify-center lg:flex">
                            <div className="flex items-center gap-0.5 rounded-full bg-slate-100/80 px-2 py-1.5 ring-1 ring-black/6">
                                {NAV_LINKS.map((item) => {
                                    const className =
                                        "flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[14px] font-medium text-slate-700 transition hover:bg-white hover:text-slate-900 hover:shadow-sm xl:px-4 xl:text-[15px]";
                                    const content = (
                                        <>
                                            {item.label}
                                            {item.caret && <span className="text-[10px] opacity-50">▾</span>}
                                        </>
                                    );
                                    // Client-side navigation keeps the floating widget (and its chat
                                    // session) alive; a plain reload would reset it.
                                    return item.href ? (
                                        <Link key={item.label} href={item.href} className={className}>
                                            {content}
                                        </Link>
                                    ) : (
                                        <a key={item.label} href="#" className={className}>
                                            {content}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* CTA — right, inside the white bar */}
                        <a
                            href="#"
                            className="group ml-auto mr-5 flex shrink-0 items-center gap-2 rounded-full bg-[#1a52a0] px-[26px] py-[13px] text-[18px] font-bold text-white shadow-[0_4px_16px_rgba(26,82,160,0.4)] transition hover:-translate-y-0.5 hover:bg-[#154590] hover:shadow-[0_8px_24px_rgba(26,82,160,0.5)] sm:px-[31px]"
                        >
                            Book a Free Consultation
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-5 w-5 -translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                            >
                                <path d="M7 17L17 7M7 7h10v10" />
                            </svg>
                        </a>

                    </div>
                </nav>

                {/* ── Hero content ── */}
                <div className="relative z-10 flex max-w-[860px] flex-1 flex-col justify-start pl-24 pr-8 pt-8 sm:pl-[168px] sm:pr-14 sm:pt-10">
                    <div className="mb-6 h-[38px]">
                        <AnimatePresence mode="wait">
                            {(() => {
                                const badge = BADGES[badgeIndex];
                                return (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className={`flex w-fit items-center gap-3 rounded-lg border ${badge.border} bg-white/5 px-4 py-2 backdrop-blur-md`}
                                    >
                                        {badge.type === "deloitte" ? (
                                            <>
                                                <span className="text-[13px] font-black tracking-tight text-white">
                                                    Deloitte<span className="text-green-400">.</span>
                                                </span>
                                                <span className="h-4 w-px bg-white/30" />
                                                <span className="text-[11px] font-medium tracking-wide text-white/85">
                                                    {badge.award} <span className="mx-0.5 text-white/40">|</span> {badge.region}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[13px] font-bold text-white">{badge.rating}</span>
                                                <span className="text-orange-400">★</span>
                                                <span className="text-[11px] font-medium text-white/85">on Clutch</span>
                                            </>
                                        )}
                                    </motion.div>
                                );
                            })()}
                        </AnimatePresence>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-6 text-[clamp(32px,3.8vw,50px)] font-normal leading-[1.12] tracking-[-1.5px] text-white"
                    >
                        Beyond Solutions,<br />
                        We Build Success – Partnering<br />
                        in Your Growth Journey
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-10 max-w-[520px] text-[15px] leading-relaxed text-white/80"
                    >
                        We unite Technology, Data, Cloud, Security, CX &amp; Marketing to align
                        your offerings with customer needs
                    </motion.p>

                    <motion.a
                        href="#"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="group flex w-fit items-center gap-2.5 rounded-lg border-2 border-white/85 px-7 py-3.5 text-[15px] font-semibold text-white backdrop-blur-sm transition hover:translate-x-1 hover:border-white hover:bg-white/15"
                    >
                        See Us in Action
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                    </motion.a>
                </div>
            </section>

            {/* ───────────────────── CLIENT LOGO BAR ───────────────────── */}
            <div className="group relative z-10 flex h-20 items-center overflow-hidden border-t border-slate-200 bg-white">
                <div className="flex animate-marquee items-center whitespace-nowrap group-hover:[animation-play-state:paused]">
                    {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((name, i) => (
                        <span
                            key={i}
                            className="flex h-20 shrink-0 items-center border-r border-slate-200 px-[52px] text-[17px] font-bold tracking-tight text-slate-900 opacity-55 transition hover:opacity-90"
                        >
                            {name}
                        </span>
                    ))}
                </div>
            </div>

            {/* The floating voice-bot launcher is mounted globally by
                <PersistentVaniWidget> in the root layout — see header note. */}
        </div>
    );
}
