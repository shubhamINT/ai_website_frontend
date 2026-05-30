"use client";

/**
 * Vani — chat-window experience.
 *
 * A static page (hero + copy) with a floating chat window. The window
 * (<VaniChatWindow />) mounts the shared agent engine + UI from
 * @/app/_shared/components, sized to a panel instead of full screen.
 * /dynamic keeps the immersive full-window experience.
 */

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageBackground } from "@/app/_shared/ui/PageBackground";
import { VaniChatWindow } from "./_components/VaniChatWindow";

export default function VaniPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">

            {/* Background Texture/Gradient - matches landing */}
            <PageBackground />

            {/* Logo - links back to landing */}
            <Link
                href="/landing"
                className="absolute top-8 left-8 z-20 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-[0_4px_24px_-4px_rgba(37,99,235,0.08)] ring-1 ring-slate-900/[0.03] transition hover:ring-blue-200"
                aria-label="Back to home"
            >
                <Image
                    src="/int-logo.svg"
                    alt="Indus Net Technologies Logo"
                    width={32}
                    height={32}
                    priority
                    className="h-auto w-full object-contain p-2 opacity-90"
                />
            </Link>

            <main className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-6 px-6 text-center">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-blue-600 ring-1 ring-blue-100"
                >
                    Try Vani
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl"
                >
                    Meet Vani, your AI assistant
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-xl text-lg font-light leading-relaxed text-slate-500"
                >
                    Ask anything by voice or text. Tap the chat button in the corner to start
                    a conversation — Vani can show locations, book meetings, and more, right
                    inside the window.
                </motion.p>
            </main>

            {/* Floating chat window — the Vani experience */}
            <VaniChatWindow />
        </div>
    );
}
