"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] text-zinc-900 selection:bg-blue-100 selection:text-blue-900">

            {/* Ultra-subtle Premium Gradient Background */}
            <div className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden">
                <div className="absolute -top-[20%] left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(219,234,254,0.4)_0%,rgba(255,255,255,0)_70%)] blur-3xl opacity-60"></div>
                <div className="absolute top-[40%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(224,231,255,0.3)_0%,rgba(255,255,255,0)_70%)] blur-3xl opacity-50"></div>
            </div>

            <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-10 px-6 text-center">

                {/* Logo - Minimal Setup */}
                <div
                    className={`flex flex-col items-center gap-6 transition-all duration-1000 ease-out ${mounted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
                        }`}
                >
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)] ring-1 ring-zinc-100/80 backdrop-blur-sm transition-transform hover:scale-105">
                        <Image
                            src="/int-logo.svg"
                            alt="Indusnet Technologies Logo"
                            width={64}
                            height={64}
                            priority
                            className="h-auto w-full object-contain p-2"
                        />
                    </div>
                </div>

                {/* Typography - Headline & Subhead */}
                <div className="space-y-6">
                    <h1
                        className={`max-w-2xl text-5xl font-semibold tracking-tight text-zinc-900 sm:text-6xl md:text-7xl lg:leading-[1.1] transition-all duration-1000 delay-100 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            }`}
                    >
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                            Indusnet Technologies
                        </span>
                    </h1>

                    <p
                        className={`mx-auto max-w-lg text-lg text-zinc-500 font-light leading-relaxed transition-all duration-1000 delay-200 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            }`}
                    >
                        Empowering enterprises with next-generation intelligent solutions.
                        Precision, elegance, and performance.
                    </p>
                </div>

                {/* CTA Button - Sleek & Minimal */}
                <div
                    className={`pt-4 transition-all duration-1000 delay-300 ease-out ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        }`}
                >
                    <Link
                        href="/dynamic"
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-zinc-900 px-8 text-sm font-medium text-white transition-all duration-300 hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-200/50"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Start Experience
                            <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </Link>
                </div>

            </main>

            {/* Footer - Minimal */}
            <footer
                className={`absolute bottom-8 w-full text-center transition-all duration-1000 delay-500 ease-out ${mounted ? "opacity-100" : "opacity-0"
                    }`}
            >
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Premium AI Experience
                </p>
            </footer>
        </div>
    );
}
