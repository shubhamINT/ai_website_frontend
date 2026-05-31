"use client";

/**
 * ChatWindowShell — the Vani widget UI (the whole /embed surface).
 *
 * Renders the launcher orb + the bottom-right popup card (header, connecting/error
 * states, and the mounted <AgentInterface variant="window">). Lives under /embed
 * because /embed is the single widget surface — /vani reaches it by iframing /embed
 * via public/widget.js, so this is the one chat-window UI everywhere.
 *
 * This component is PURELY PRESENTATIONAL — it owns no connection logic and no
 * effects. The parent (embed/page.tsx) owns the LiveKit lifecycle and the iframe
 * postMessage resizing, then hands this component the connection state + callbacks.
 *
 * Layout is driven by the explicit `isMobile` flag, NOT Tailwind's `sm:` breakpoint:
 * inside the narrow embed iframe `sm:` keys off the iframe width, not the host
 * viewport, so the parent (which knows the real form factor) tells us instead.
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveKitRoom } from "@livekit/components-react";
import { AgentInterface } from "@/app/_shared/components/agent/AgentInterface";

interface ChatWindowShellProps {
    isOpen: boolean;
    onOpen: () => void;
    /** Collapse the window. Also passed to AgentInterface as onDisconnect. */
    onClose: () => void;

    // Connection state, rendered in the card body.
    token: string | null;
    error: Error | null;
    connect: () => void;
    livekitUrl: string;

    /** Host/viewport form factor: mobile → full-screen sheet, desktop → bottom-right card. */
    isMobile: boolean;

    // Expand/shrink. The expand button only renders when onToggleExpand is provided.
    isExpanded?: boolean;
    onToggleExpand?: () => void;

    /** Fires after the card's pop-out finishes (embed uses it to defer the iframe shrink). */
    onExitComplete?: () => void;
    /** Launcher offset, e.g. "bottom-8 right-8" (default) or "bottom-4 right-4". */
    launcherClassName?: string;
}

export const ChatWindowShell: React.FC<ChatWindowShellProps> = ({
    isOpen,
    onOpen,
    onClose,
    token,
    error,
    connect,
    livekitUrl,
    isMobile,
    isExpanded = false,
    onToggleExpand,
    onExitComplete,
    launcherClassName = "bottom-8 right-8",
}) => {
    return (
        <>
            {/* ── Launcher orb ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        key="launcher"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`group fixed z-50 flex items-center gap-3 ${launcherClassName}`}
                    >
                        {/* Slide-in label */}
                        <span className="pointer-events-none translate-x-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-800 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                            Talk to Vani
                        </span>

                        <button
                            onClick={onOpen}
                            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-[0_8px_30px_rgba(37,99,235,0.45)] ring-1 ring-white/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_14px_44px_rgba(37,99,235,0.6)] active:scale-95"
                            aria-label="Talk to Vani"
                        >
                            {/* Soft breathing halo */}
                            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-blue-500/30 [animation-duration:3s]" />
                            {/* Top sheen for depth */}
                            <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/15" />

                            {/* Mic icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="relative h-7 w-7 drop-shadow-sm">
                                <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                                <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Popup card ── */}
            <AnimatePresence onExitComplete={onExitComplete}>
                {isOpen && (
                    <motion.div
                        key="card"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        // mobile: solid full-screen sheet; desktop: frosted-glass card,
                        // bottom-right, wider when expanded. Glass = translucent white so
                        // the host page tints through the (transparent) iframe.
                        className={`fixed z-50 flex flex-col overflow-hidden ${isMobile
                            ? "inset-0 bg-white shadow-2xl ring-1 ring-black/10"
                            : `bottom-6 right-6 h-[720px] max-h-[calc(100dvh-3rem)] rounded-[28px] bg-white/75 backdrop-blur-2xl ring-1 ring-white/60 shadow-[0_28px_80px_-12px_rgba(15,23,42,0.28)] ${isExpanded ? "w-[860px]" : "w-[480px]"}`
                            }`}
                    >
                        {/* Header */}
                        <div className={`flex shrink-0 items-center justify-between px-4 py-3 ${isMobile ? "border-b border-zinc-100" : "border-b border-white/50"}`}>
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">V</span>
                                <span className="text-sm font-semibold text-zinc-900">Vani</span>
                            </div>

                            <div className="flex items-center gap-1">
                                {/* Expand / shrink — wider card for rich visuals (desktop only) */}
                                {onToggleExpand && (
                                    <button
                                        onClick={onToggleExpand}
                                        className={`h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 ${isMobile ? "hidden" : "flex"}`}
                                        aria-label={isExpanded ? "Shrink panel" : "Expand panel"}
                                        title={isExpanded ? "Shrink" : "Expand"}
                                    >
                                        {isExpanded ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9 4.5 4.5M9 9V5.25M9 9H5.25m9.75 0 4.5-4.5M15 9V5.25M15 9h3.75M9 15l-4.5 4.5M9 15v3.75M9 15H5.25m9.75 0 4.5 4.5M15 15v3.75m0-3.75h3.75" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                    aria-label="Close chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body — connection states */}
                        <div className={`relative flex-1 overflow-hidden ${isMobile ? "bg-[#FAFAFA]" : "bg-white/25"}`}>
                            {error ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                                    <p className="text-sm font-medium text-red-500">Connection failed</p>
                                    <p className="text-xs text-zinc-500">{error.message}</p>
                                    <button
                                        onClick={connect}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : !token ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                                    <div className="relative flex h-16 w-16 items-center justify-center">
                                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75" />
                                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                                            <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-500">Connecting to Vani…</p>
                                </div>
                            ) : (
                                <LiveKitRoom
                                    token={token}
                                    serverUrl={livekitUrl}
                                    connect={true}
                                    video={false}
                                    audio={{
                                        echoCancellation: true,
                                        noiseSuppression: true,
                                        autoGainControl: true,
                                    }}
                                    data-lk-theme="default"
                                    style={{ height: "100%" }}
                                    onDisconnected={onClose}
                                    onError={(err) => console.error("LiveKit Room Error:", err)}
                                >
                                    <AgentInterface variant="window" onDisconnect={onClose} />
                                </LiveKitRoom>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
