"use client";

/**
 * VaniChatWindow — the chat-window experience.
 *
 * A floating launcher (bottom-right) that expands into a panel. The panel mounts
 * the SAME agent engine and UI as /dynamic, just sized to a window:
 *   useLiveKitConnection → <LiveKitRoom> → <AgentInterface variant="window" />.
 *
 * LiveKit connects lazily (only on first open) so the static page stays cheap, and
 * disconnects on close — closing collapses to the launcher, it does NOT navigate away.
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveKitRoom } from "@livekit/components-react";
import { useLiveKitConnection } from "@/app/_shared/hooks/useLiveKitConnection";
import { AgentInterface } from "@/app/_shared/components/agent/AgentInterface";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

export const VaniChatWindow: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { token, error, connect, disconnect } = useLiveKitConnection();

    // Connect on open, disconnect on close — keeps the room tied to the window's lifecycle.
    useEffect(() => {
        if (isOpen) {
            connect();
            return () => disconnect();
        }
    }, [isOpen, connect, disconnect]);

    const handleClose = () => setIsOpen(false);

    return (
        <>
            {/* Launcher button — bottom-right */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="launcher"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_12px_40px_-8px_rgba(37,99,235,0.5)] ring-1 ring-blue-500/20 transition-all hover:scale-110 hover:bg-blue-500 active:scale-95"
                        aria-label="Open Vani chat"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                            <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223Z" clipRule="evenodd" />
                        </svg>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.96 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        // mobile: full-screen sheet; sm+: anchored bottom-right panel
                        className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white shadow-2xl ring-1 ring-black/10 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[640px] sm:max-h-[calc(100dvh-3rem)] sm:w-[400px] sm:rounded-3xl"
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">V</span>
                                <span className="text-sm font-semibold text-zinc-900">Vani</span>
                            </div>
                            <button
                                onClick={handleClose}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                                aria-label="Close chat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Body — mirrors /dynamic's connection states */}
                        <div className="relative flex-1 overflow-hidden bg-[#FAFAFA]">
                            {error ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                                    <p className="text-sm font-medium text-red-500">Connection failed</p>
                                    <p className="text-xs text-zinc-500">{error.message}</p>
                                    <button
                                        onClick={() => connect()}
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
                                    serverUrl={LIVEKIT_URL}
                                    connect={true}
                                    video={false}
                                    audio={{
                                        echoCancellation: true,
                                        noiseSuppression: true,
                                        autoGainControl: true,
                                    }}
                                    data-lk-theme="default"
                                    style={{ height: "100%" }}
                                    onDisconnected={handleClose}
                                    onError={(err) => console.error("LiveKit Room Error:", err)}
                                >
                                    <AgentInterface variant="window" onDisconnect={handleClose} />
                                </LiveKitRoom>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
