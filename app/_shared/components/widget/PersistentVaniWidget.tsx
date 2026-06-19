"use client";

/**
 * PersistentVaniWidget — mounts the Vani widget ONCE (from the root layout) and
 * keeps it alive across client-side navigation between the routes that show it
 * (WIDGET_ROUTES).
 *
 * Why this exists:
 *   widget.js appends its iframe to document.body and <VaniWidget> destroys that
 *   iframe on unmount. If the widget were mounted per-page, navigating from /vani
 *   to /products would unmount it → destroy the iframe → drop the LiveKit session
 *   and the entire chat history. Mounting it here — a child of the root layout,
 *   which never unmounts during client-side navigation — means the SAME VaniWidget
 *   instance (and therefore the same iframe + live conversation) survives the
 *   route change. The gate only unmounts the widget when we leave to a route that
 *   is NOT in WIDGET_ROUTES.
 *
 * It also bridges agent-driven navigation: the /embed iframe can't reach the host
 * router, so it postMessages { type: 'vani:navigate', url, path } up to this window
 * and we decide how to go there (see resolveNav) — keeping the widget (and its
 * session) untouched whenever the destination is one of our own SPA routes.
 */

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { VaniWidget } from "./VaniWidget";

// Routes that show the floating widget AND that we host as SPA pages — navigating
// to any of these is a client-side router.push, so the chat session survives.
// A page opts in by appearing here.
const WIDGET_ROUTES = ["/vani", "/products", "/services", "/about", "/partners"];

// 'local'  → everything is a client-side push (local dev: we only have our pages).
// 'site'   → production on intglobal.com: our SPA routes push client-side; every
//            other page is the real multi-page site, so we do a full navigation.
// Override with NEXT_PUBLIC_NAV_MODE.
const NAV_MODE = process.env.NEXT_PUBLIC_NAV_MODE === "site" ? "site" : "local";

// Only allow full (cross-page) navigation to the real company site — never to an
// arbitrary host a stray data packet might smuggle in.
const NAV_ALLOWED_HOST = "intglobal.com";

// Map a destination path to one of our SPA routes if we host it (exact match, or
// the section landing — e.g. "/services/ai" → "/services"). Returns null if we
// don't host it.
function toLocalRoute(path: string | undefined): string | null {
    if (!path || !path.startsWith("/")) return null;
    if (WIDGET_ROUTES.includes(path)) return path;
    const firstSeg = "/" + path.split("/").filter(Boolean)[0];
    return WIDGET_ROUTES.includes(firstSeg) ? firstSeg : null;
}

export function PersistentVaniWidget() {
    const pathname = usePathname();
    const router = useRouter();

    const showWidget = WIDGET_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Agent-driven navigation. The embed iframe posts { type: 'vani:navigate',
    // url, path } to its parent (this window). We route by destination:
    //   - one of our SPA routes  → client-side push, chat session survives
    //   - a real intglobal.com page (prod) → full navigation (chat survival there
    //     needs the separate session-resume work; see ROADMAP)
    useEffect(() => {
        function onMessage(e: MessageEvent) {
            if (e.origin !== window.location.origin) return;
            const data = e.data;
            if (!data || data.type !== "vani:navigate") return;

            const url: string = typeof data.url === "string" ? data.url : "";
            const path: string = typeof data.path === "string" ? data.path : url;
            const local = toLocalRoute(path);

            if (NAV_MODE === "local") {
                // Dev: keep the chat alive — always client-side. Fall back to the
                // raw path (may 404, but the widget persists) when we don't host it.
                router.push(local || (path.startsWith("/") ? path : "/"));
                return;
            }

            // Production ('site').
            if (local) {
                router.push(local);
                return;
            }
            if (url) {
                try {
                    const u = new URL(url, window.location.origin);
                    const sameSite =
                        u.hostname === window.location.hostname ||
                        u.hostname === NAV_ALLOWED_HOST ||
                        u.hostname.endsWith("." + NAV_ALLOWED_HOST);
                    if (sameSite) window.location.assign(u.href);
                } catch {
                    /* malformed url — ignore */
                }
            }
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, [router]);

    // Report the current host route to the loader (widget.js) on every change.
    // The loader can't observe the host's client-side navigation, so we push it;
    // the loader then relays it into the iframe, which forwards it to the agent.
    // (The very first page is covered by the loader reading location itself.)
    useEffect(() => {
        window.postMessage({ type: "vani:host-route", path: pathname }, window.location.origin);
    }, [pathname]);

    if (!showWidget) return null;
    return <VaniWidget />;
}
