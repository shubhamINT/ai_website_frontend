"use client";

import { useState } from "react";
import Link from "next/link";

export default function DynamicPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchExternalFastAPI = async () => {
    setLoading(true);
    try {
      // For demonstration, we use JSONPlaceholder to simulate your FastAPI
      const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      const json = await res.json();
      setData({ ...json, _source: "Simulated FastAPI (JSONPlaceholder)" });
    } catch (err) {
      setData({ error: "Failed to fetch FastAPI" });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center shadow-lg">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Backend Integration Demo
          </h1>
          <p className="text-sm text-zinc-400">
            Next.js is a full-stack framework. You can call internal API routes or external FastAPI servers.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={fetchExternalFastAPI}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-700 px-6 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Call FastAPI (Simulated)"}
          </button>
        </div>

        {data && (
          <div className="w-full text-left">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Response Data:</p>
            <pre className="overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300 border border-zinc-800">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        <div className="h-px w-full bg-zinc-800" />

        <Link
          className="text-sm font-medium text-zinc-400 transition hover:text-white"
          href="/landing"
        >
          ← Back to AI Website
        </Link>
      </main>
    </div>
  );
}

