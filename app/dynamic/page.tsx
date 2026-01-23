"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { LiveKitRoom } from "@livekit/components-react";
import { useLiveKitConnection } from "./_hooks/useLiveKitConnection";
import { AgentInterface } from "./_components/AgentInterface";

const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

export default function DynamicPage() {
  const { token, isConnecting, error, connect, disconnect } = useLiveKitConnection();

  // Auto-connect on mount if that's the desired flow, 
  // OR show a start button. User asked to click "Start Experience" from landing,
  // so on this page we probably want to auto-start or show a clear "Initialize" state.
  // The user said: "Start Experience" takes me to Dynamic Page. In Dynamic Page... LiveKit comes in.
  // Let's offer a clean "Start" if not connected, and the Interface if connected.

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [disconnect]);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-950 text-white">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <h3 className="text-xl font-semibold text-red-500">Connection Failed</h3>
          <p className="mt-2 text-zinc-400">{error.message}</p>
          <button
            onClick={() => connect()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 hover:bg-red-500"
          >
            Retry
          </button>
          <Link href="/landing" className="mt-4 block text-sm text-zinc-500 hover:text-zinc-300">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-zinc-950 overflow-hidden font-sans text-zinc-100 selection:bg-indigo-500/30">

      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex h-full w-full flex-col p-4 md:p-6 lg:p-8">

        {/* Navigation / Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/landing" className="group flex items-center gap-2 rounded-full bg-white/5 py-2 pl-3 pr-4 text-sm font-medium text-zinc-400 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white">
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center">
          {!token ? (
            <div className="flex flex-col items-center gap-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Your AI Companion
              </h1>
              <p className="max-w-md text-lg text-zinc-400">
                Experience the future of interaction with our intelligent voice agent.
              </p>

              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-white px-10 text-base font-semibold text-black transition-all hover:bg-zinc-200 disabled:opacity-70"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isConnecting ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      Start Session
                      <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </div>
          ) : (
            <div className="h-full w-full overflow-hidden rounded-3xl opacity-0 animate-in fade-in zoom-in duration-500 fill-mode-forwards" style={{ animationFillMode: 'forwards' }}>
              <LiveKitRoom
                token={token}
                serverUrl={LIVEKIT_URL}
                connect={true}
                video={false}
                audio={true}
                data-lk-theme="default"
                style={{ height: '100%' }}
                onDisconnected={() => {
                  disconnect();
                }}
                onError={(err) => console.error("LiveKit Room Error:", err)}
              >
                <AgentInterface onDisconnect={disconnect} />
              </LiveKitRoom>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

