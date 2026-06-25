"use client";

/**
 * /embed — the Vani widget, rendered INSIDE the loader's iframe.
 *
 * This is the entire embeddable surface. It renders the shared <ChatWindowShell>
 * (launcher orb → bottom-right popup card), identical to /vani.
 *
 * Because it lives in a cross-origin iframe, it can't resize itself — it asks the
 * host loader (public/widget.js) to resize the iframe via postMessage:
 *     { type: 'vani:resize', mode: 'collapsed' | 'open', width }
 * The loader owns the iframe geometry; this page owns what's drawn inside it. The
 * loader also tells us the host form factor ({ type: 'vani:host', isMobile }), since
 * CSS `sm:` here keys off the narrow iframe, not the host viewport.
 *
 * LiveKit connects lazily on first open and disconnects on close, so an embedded
 * site pays nothing until the visitor actually opens Vani.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLiveKitConnection } from "@/app/_shared/hooks/useLiveKitConnection";
import { ChatWindowShell } from "./_components/ChatWindowShell";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

// Card widths the loader sizes the iframe around (px). Must match the shell's
// w-[480px] / w-[860px] classes. Mobile ignores these and goes full-screen.
const WIDTH_DEFAULT = 400;   // 480 × 0.96
const WIDTH_EXPANDED = 800;  // 860 × 0.96

// Tell the host loader how big the iframe should be. Safe no-op when opened
// directly (not embedded) — the message just goes to our own window.
function postResize(mode: "collapsed" | "open", width?: number) {
    if (typeof window === "undefined") return;
    // "*" is intentional — the parent (host) origin is unknown for a cross-site
    // embed. Safe here: the message carries only layout state, no credentials.
    window.parent.postMessage({ type: "vani:resize", mode, width }, "*");
}

export default function EmbedPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    // Host form factor, told to us by the loader (public/widget.js) — the CSS `sm:`
    // breakpoint can't be trusted here, it keys off the iframe width. Default desktop;
    // corrected as soon as the host pings.
    const [isMobileHost, setIsMobileHost] = useState(false);
    // isPaused — widget shows the "I'm still here / Resume" screen.
    const [isPaused, setIsPaused] = useState(false);
    const { token, error, connect, disconnect } = useLiveKitConnection();

    // Mirror isOpen for the disconnect callback (which captures a stale closure).
    const isOpenRef = useRef(false);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    // Connect on open, disconnect on close — room lifecycle follows the card.
    useEffect(() => {
        if (isOpen) {
            setIsPaused(false);
            connect();
            return () => disconnect();
        }
    }, [isOpen, connect, disconnect]);

    // Listen for the host's form-factor pings, and announce we're ready so the
    // loader sends the first one even if it mounted before us.
    useEffect(() => {
        function onHostMessage(e: MessageEvent) {
            if (e.data?.type === "vani:host") setIsMobileHost(!!e.data.isMobile);
        }
        window.addEventListener("message", onHostMessage);
        window.parent.postMessage({ type: "vani:ready" }, "*");
        return () => window.removeEventListener("message", onHostMessage);
    }, []);

    // Grow the iframe as soon as we open (so the card has room to pop into), and on
    // expand/shrink. Collapsing back is deferred to onExitComplete so the pop-out
    // animation isn't clipped by an early shrink.
    useEffect(() => {
        if (isOpen) postResize("open", isExpanded ? WIDTH_EXPANDED : WIDTH_DEFAULT);
    }, [isOpen, isExpanded]);

    const handleClose = useCallback(() => {
        isOpenRef.current = false; // sync, so the unmount's onDisconnected won't pause
        setIsOpen(false);
        setIsExpanded(false);
        setIsPaused(false);
    }, []);

    // The LiveKit room disconnected while the widget is still open (idle timeout).
    const handleRoomDisconnected = useCallback(() => {
        if (!isOpenRef.current) return;
        setIsPaused(true);
    }, []);

    // Backend watchdog force-paused without disconnecting — show the pause screen.
    const handleForcePause = useCallback(() => {
        setIsPaused(true);
    }, []);

    // Resume from pause — always start a fresh session so VoiceDock state
    // resets cleanly (mic unmuted, isConvoPaused=false). Works for both the
    // force-pause case (session was still alive) and the idle-timeout case.
    const handleResume = useCallback(() => {
        setIsPaused(false);
        disconnect();
        connect();
    }, [connect, disconnect]);

    return (
        <ChatWindowShell
            isOpen={isOpen}
            onOpen={() => setIsOpen(true)}
            onClose={handleClose}
            token={token}
            error={error}
            connect={connect}
            livekitUrl={LIVEKIT_URL}
            isMobile={isMobileHost}
            isExpanded={isExpanded}
            isPaused={isPaused}

            onResume={handleResume}
            onForcePause={handleForcePause}
            onRoomDisconnected={handleRoomDisconnected}
            onToggleExpand={() => setIsExpanded((v) => !v)}
            onExitComplete={() => postResize("collapsed")}
            launcherClassName="bottom-4 right-4"
        />
    );
}
