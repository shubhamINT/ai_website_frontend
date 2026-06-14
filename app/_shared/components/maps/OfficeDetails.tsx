"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { OfficeDetailsData } from '@/app/_shared/types/agentTypes';
import { SmartIcon } from '../primitives/SmartIcon';

interface OfficeDetailsProps {
    data: OfficeDetailsData;
}

/**
 * OfficeDetails — a single, focused office card (tool: publish_office_details).
 *
 * Same classy blue/white glass language as NearbyOffices, but one prominent card
 * with a hero image, address, an embedded location map (when lat/lng are present),
 * and a directions link. Replaces the whole canvas (one visual at a time).
 */
export const OfficeDetails: React.FC<OfficeDetailsProps> = ({ data }) => {
    const office = data?.office;
    if (!office) return null;

    const hasCoords = typeof office.lat === 'number' && typeof office.lng === 'number';
    const mapsQuery = hasCoords ? `${office.lat},${office.lng}` : encodeURIComponent(office.address ?? office.name);
    const embedSrc = `https://maps.google.com/maps?q=${mapsQuery}&z=15&output=embed`;
    const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

    const container = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
    };
    const item = {
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex w-full flex-col items-center gap-5 px-3 py-6 md:px-6 md:py-8"
        >
            {/* Header */}
            <motion.div variants={item} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 shadow-sm">
                    <SmartIcon iconRef="building-2" className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-zinc-900 md:text-3xl">
                    Our <span className="text-blue-600">Office</span>
                </h2>
            </motion.div>

            {/* Card */}
            <motion.div
                variants={item}
                className="group relative w-full overflow-hidden rounded-[2rem] bg-white/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.06)] ring-1 ring-white/60 backdrop-blur-2xl"
            >
                {/* Hero image */}
                {office.image_url ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-zinc-100">
                        <img
                            src={office.image_url}
                            alt={office.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                    </div>
                ) : (
                    <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-zinc-100 to-zinc-50">
                        <SmartIcon iconRef="building-2" className="h-14 w-14 text-zinc-300" />
                    </div>
                )}

                {/* Info */}
                <div className="flex flex-col gap-4 p-3 md:p-4">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-bold leading-tight text-zinc-900 md:text-2xl">
                            {office.name}
                        </h3>
                        <div className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 ring-1 ring-blue-100">
                            INT Office
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-zinc-400 ring-1 ring-zinc-100">
                            <SmartIcon iconRef="map-pin" className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-zinc-600">
                            {office.address}
                        </p>
                    </div>

                    {/* Embedded location map */}
                    <div className="h-52 w-full overflow-hidden rounded-[1.25rem] ring-1 ring-zinc-100 md:h-60">
                        <iframe
                            title={`Map of ${office.name}`}
                            src={embedSrc}
                            className="h-full w-full border-0"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>

                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-500 hover:shadow-[0_12px_32px_rgba(37,99,235,0.4)] active:scale-95"
                    >
                        <SmartIcon iconRef="external-link" className="h-4 w-4" />
                        Get Directions
                    </a>
                </div>

                {/* Decorative glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
            </motion.div>
        </motion.div>
    );
};
