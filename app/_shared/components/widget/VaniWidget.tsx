"use client";

/**
 * VaniWidget — loads public/widget.js and mounts the Vani widget (the floating
 * launcher orb + chat card, which live inside a cross-origin iframe pointing at
 * /embed). This is the EXACT same loader external third-party sites use, so our
 * site and customers' sites never drift.
 *
 * The catch: widget.js appends its iframe to document.body, OUTSIDE React, and
 * destroy() tears it (and its LiveKit room) down. So this component must NOT be
 * remounted on every route, or the chat session would be lost on navigation.
 * It is mounted by <PersistentVaniWidget>, which keeps a single instance alive
 * across the routes that show the widget (see that file). destroy() runs only
 * when we leave those routes entirely.
 */

import Script from "next/script";
import { useEffect, useRef } from "react";

export function VaniWidget() {
    const instance = useRef<VaniWidgetInstance | null>(null);

    // Tear the widget down when this component is finally unmounted (i.e. we've
    // navigated away from every widget route).
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
