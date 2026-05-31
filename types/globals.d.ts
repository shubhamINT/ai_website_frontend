declare module "*.css";

/** Handle returned by the Vani widget loader (public/widget.js). */
interface VaniWidgetInstance {
    destroy(): void;
}

/** Public API exposed by public/widget.js for manual (SPA) mounting. */
interface VaniWidgetApi {
    mount(opts?: { origin?: string }): VaniWidgetInstance;
}

interface Window {
    VaniWidget?: VaniWidgetApi;
    __vaniWidgetLoaded?: boolean;
}
