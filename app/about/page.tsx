/**
 * /about — placeholder About / Company / CEO page (local test target for VAANI
 * navigation). Client-side routing keeps the widget's chat session alive.
 */

import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-6 text-center text-white">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Redirected to About / Company Page
            </h1>
            <Link
                href="/vani"
                className="text-sm font-medium text-blue-400 underline-offset-4 transition hover:text-blue-300 hover:underline"
            >
                ← Back to home
            </Link>
        </main>
    );
}
