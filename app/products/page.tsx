/**
 * /products — placeholder Products page.
 *
 * Reachable two ways, both client-side so the floating Vani widget (mounted by
 * <PersistentVaniWidget> in the root layout) keeps its chat session alive:
 *   1. the "Products" link in the /vani navbar, and
 *   2. the Vani agent's navigate_to_page tool (ui.navigate → router.push).
 */

import Link from "next/link";

export default function ProductsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-6 text-center text-white">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Redirected to Product Page
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
