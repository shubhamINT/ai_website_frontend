import React from 'react';

// ─── Shared markdown renderers ─────────────────────────────────────────────────
// Restyles every markdown element to mockup-grade visuals: blue check-circle
// bullets, accent-barred headings, gradient dividers, callouts. The per-block
// cascade comes from the `.md-stagger` CSS (globals.css). Used by both the
// Flashcard body and the infographic MarkdownBlock — single source of truth.

// Blue filled check-circle (the headline bullet visual). Inline SVG = crisp + cheap.
export const CheckDot = () => (
    <svg viewBox="0 0 24 24" className="mt-[0.15em] h-[1.15rem] w-[1.15rem] shrink-0 md:h-5 md:w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#3b82f6" />
        <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Track whether the current list is ordered so <li> renders a number vs a check.
export const OrderedListContext = React.createContext(false);

export const MD_COMPONENTS = {
    h1: ({ children }: any) => (
        <h1 className="font-display text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 mt-5 first:mt-0 mb-2">
            {children}
            <span className="mt-1.5 block h-[3px] w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
        </h1>
    ),
    h2: ({ children }: any) => (
        <h2 className="font-display text-lg md:text-xl font-semibold tracking-tight text-zinc-900 mt-5 first:mt-0 mb-2">
            {children}
            <span className="mt-1.5 block h-[3px] w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
        </h2>
    ),
    h3: ({ children }: any) => (
        <h3 className="font-display text-base md:text-lg font-semibold tracking-tight text-zinc-900 mt-4 first:mt-0 mb-1.5">{children}</h3>
    ),
    p: ({ children }: any) => (
        <p className="my-2.5 leading-[1.7] text-zinc-600">{children}</p>
    ),
    ul: ({ children }: any) => (
        <OrderedListContext.Provider value={false}>
            <ul className="my-3 flex list-none flex-col gap-2.5 pl-0">{children}</ul>
        </OrderedListContext.Provider>
    ),
    ol: ({ children }: any) => (
        <OrderedListContext.Provider value={true}>
            <ol className="my-3 flex list-none flex-col gap-2.5 pl-0 [counter-reset:md-step]">{children}</ol>
        </OrderedListContext.Provider>
    ),
    li: ({ children }: any) => {
        const ordered = React.useContext(OrderedListContext);
        if (ordered) {
            return (
                <li className="flex items-start gap-3 leading-[1.6] text-zinc-700 [counter-increment:md-step]">
                    <span className="mt-[0.1em] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[0.7rem] font-semibold text-blue-600 before:content-[counter(md-step)] md:h-6 md:w-6 md:text-xs" />
                    <span className="min-w-0">{children}</span>
                </li>
            );
        }
        return (
            <li className="flex items-start gap-3 leading-[1.6] text-zinc-700">
                <CheckDot />
                <span className="min-w-0">{children}</span>
            </li>
        );
    },
    a: ({ children, href }: any) => (
        <a href={href} target="_blank" rel="noreferrer" className="font-medium text-blue-600 underline-offset-2 decoration-blue-400 hover:underline">{children}</a>
    ),
    strong: ({ children }: any) => <strong className="font-semibold text-zinc-900">{children}</strong>,
    em: ({ children }: any) => <em className="italic text-zinc-700">{children}</em>,
    code: ({ children }: any) => (
        <code className="rounded bg-zinc-900/5 px-1.5 py-0.5 text-[0.85em] font-medium text-blue-700">{children}</code>
    ),
    blockquote: ({ children }: any) => (
        <blockquote className="my-3 rounded-r-lg border-l-2 border-blue-300 bg-blue-50/40 py-1 pl-4 italic text-zinc-500">{children}</blockquote>
    ),
    hr: () => (
        <hr className="my-4 h-px border-0 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
    ),
    table: ({ children }: any) => (
        <div className="my-3 overflow-hidden rounded-xl ring-1 ring-zinc-200">
            <table className="w-full border-collapse text-sm">{children}</table>
        </div>
    ),
    th: ({ children }: any) => (
        <th className="bg-zinc-50 px-3 py-2 text-left font-semibold text-zinc-700">{children}</th>
    ),
    td: ({ children }: any) => (
        <td className="border-t border-zinc-100 px-3 py-2 text-zinc-600">{children}</td>
    ),
    img: ({ src, alt }: any) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="my-3 w-full rounded-xl shadow-sm" />
    ),
};
