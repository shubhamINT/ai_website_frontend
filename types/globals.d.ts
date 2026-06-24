declare module "*.css";

/** Handle returned by the Vaani widget loader (public/widget.js). */
interface VaaniWidgetInstance {
    destroy(): void;
}

/** Public API exposed by public/widget.js for manual (SPA) mounting. */
interface VaaniWidgetApi {
    mount(opts?: { origin?: string }): VaaniWidgetInstance;
}

interface Window {
    VaaniWidget?: VaaniWidgetApi;
    __VaaniWidgetLoaded?: boolean;
}
