"use client";

/**
 * VaaniWidget — mounts the Vaani widget on the /Vaani page.
 *
 * /Vaani is just a normal page, so it loads the EXACT same public/widget.js that
 * external third-party sites use, which iframes /embed. One widget, one loader,
 * zero drift between our site and customers' sites.
 *
 * The catch: widget.js appends its iframe to document.body, outside React. In a
 * SPA that would leak the orb onto other routes after client-side navigation, so
 * we load it with data-Vaani-manual (no auto-mount) and drive mount/destroy here —
 * destroy() on unmount removes the iframe (and tears down its LiveKit room).
 */

import Script from "next/script";
import { useEffect, useRef } from "react";

export function VaaniWidget() {
    const instance = useRef<VaaniWidgetInstance | null>(null);

    // Tear the widget down when leaving /Vaani.
    useEffect(() => {
        return () => {
            instance.current?.destroy();
            instance.current = null;
        };
    }, []);

    return (
        <Script
            src="/widget.js"
            data-Vaani-manual="true"
            strategy="afterInteractive"
            onReady={() => {
                // onReady can re-fire (cached re-navigation, StrictMode) — guard.
                if (instance.current || !window.VaaniWidget) return;
                instance.current = window.VaaniWidget.mount({ origin: window.location.origin });
            }}
        />
    );
}
