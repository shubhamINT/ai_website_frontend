"use client";

/**
 * VaniWidget — mounts the Vani widget on the /vani page.
 *
 * /vani is just a normal page, so it loads the EXACT same public/widget.js that
 * external third-party sites use, which iframes /embed. One widget, one loader,
 * zero drift between our site and customers' sites.
 *
 * The catch: widget.js appends its iframe to document.body, outside React. In a
 * SPA that would leak the orb onto other routes after client-side navigation, so
 * we load it with data-vani-manual (no auto-mount) and drive mount/destroy here —
 * destroy() on unmount removes the iframe (and tears down its LiveKit room).
 */

import Script from "next/script";
import { useEffect, useRef } from "react";

export function VaniWidget() {
    const instance = useRef<VaniWidgetInstance | null>(null);

    // Tear the widget down when leaving /vani.
    useEffect(() => {
        return () => {
            instance.current?.destroy();
            instance.current = null;
        };
    }, []);

    return (
        <Script
            src="/widget.js"
            data-vani-manual="true"
            strategy="afterInteractive"
            onReady={() => {
                // onReady can re-fire (cached re-navigation, StrictMode) — guard.
                if (instance.current || !window.VaniWidget) return;
                instance.current = window.VaniWidget.mount({ origin: window.location.origin });
            }}
        />
    );
}
