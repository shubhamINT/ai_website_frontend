"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

import { HQIcon, RegionIcon } from '@/app/dynamic/_components/maps/leaflet-icons';
import { getCoordinates } from '@/app/dynamic/_components/maps/map.utils';

interface LocationPoint {
    id: string;
    type: 'hq' | 'region';
    address: string;
    label: string;
    coords: [number, number];
}

const ChangeView = ({ positions, isComplete }: { positions: [number, number][]; isComplete: boolean }) => {
    const map = useMap();

    useEffect(() => {
        if (isComplete && positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.flyToBounds(bounds, {
                padding: [100, 100],
                duration: 3,
                easeLinearity: 0.1,
            });
        }
    }, [isComplete, positions, map]);

    return null;
};

export interface GlobalPresenceMapProps {
    data: {
        regions: Record<string, string>;
        headquarters: Record<string, string>;
    };
}

export const GlobalPresenceMap = ({ data }: GlobalPresenceMapProps) => {
    const [visiblePoints, setVisiblePoints] = useState<LocationPoint[]>([]);

    const allPoints = useMemo(() => {
        const points: LocationPoint[] = [];

        Object.entries(data.headquarters).forEach(([country, address], index) => {
            const coords = getCoordinates(address);
            if (coords) points.push({ id: `hq-${index}-${country}`, type: 'hq', address, label: country, coords });
        });

        Object.entries(data.regions).forEach(([country, address], index) => {
            const coords = getCoordinates(address);
            if (coords) points.push({ id: `region-${index}-${country}`, type: 'region', address, label: country, coords });
        });

        return points;
    }, [data]);

    const countriesList = useMemo(() => {
        return Array.from(new Set(allPoints.map((point) => ({
            name: point.label.split(' ')[0],
            coords: point.coords,
        })))).filter((value, index, array) => array.findIndex((item) => item.name === value.name) === index);
    }, [allPoints]);

    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];

        const resetTimer = setTimeout(() => {
            setVisiblePoints([]);
        }, 0);
        timers.push(resetTimer);

        allPoints.forEach((point, index) => {
            const timer = setTimeout(() => {
                setVisiblePoints((prev) => [...prev, point]);
            }, (index + 1) * 400);
            timers.push(timer);
        });

        return () => timers.forEach((timer) => clearTimeout(timer));
    }, [allPoints]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: 'spring', stiffness: 350, damping: 25 },
            }}
            className="group relative z-0 h-[500px] w-full overflow-hidden rounded-[1.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-zinc-100/80 md:h-[600px] md:rounded-[2rem]"
        >
            <div className="pointer-events-none absolute -right-20 -top-20 z-[400] h-64 w-64 rounded-full bg-blue-500/10 blur-[60px]" />

            <div className="pointer-events-none absolute left-4 top-4 z-[500] max-w-[60%] md:left-10 md:top-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                    <h3 className="text-lg font-black uppercase leading-tight tracking-tight text-zinc-900 md:text-3xl">
                        Global <span className="text-blue-600">Network</span>
                    </h3>
                </motion.div>
            </div>

            <div className="absolute right-4 top-4 z-[500] flex flex-col items-end gap-1.5 md:right-10 md:top-10 md:flex-row md:gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-white/90 px-2 py-1 shadow-sm ring-1 ring-zinc-100 backdrop-blur-xl md:rounded-xl md:px-3 md:py-1.5">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600 md:h-2.5 md:w-2.5" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-700 md:text-[10px]">HQ</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-white/90 px-2 py-1 shadow-sm ring-1 ring-zinc-100 backdrop-blur-xl md:rounded-xl md:px-3 md:py-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 md:h-2.5 md:w-2.5" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 md:text-[10px]">Regions</span>
                </div>
            </div>

            <div className="absolute inset-0 z-0 overflow-hidden bg-[#aadaff] pointer-events-auto">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%', background: 'transparent' }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    {visiblePoints.map((point) => (
                        <Marker key={point.id} position={point.coords} icon={point.type === 'hq' ? HQIcon : RegionIcon}>
                            <Popup className="flashcard-popup">
                                <div className="min-w-[180px] p-1">
                                    <div className="mb-1 flex items-center justify-between text-[13px] font-bold text-zinc-900 md:text-[15px]">
                                        {point.label}
                                        {point.type === 'hq' && (
                                            <span className="ml-2 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-blue-600 ring-1 ring-blue-100">HQ</span>
                                        )}
                                    </div>
                                    <div className="text-xs font-medium leading-relaxed text-zinc-600 md:text-sm">
                                        {point.address}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <ChangeView positions={allPoints.map((point) => point.coords)} isComplete={visiblePoints.length === allPoints.length} />
                </MapContainer>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-[500] md:bottom-10 md:left-10 md:right-10">
                <div className="group/status flex flex-col justify-between gap-4 rounded-[1.5rem] bg-white/90 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.15)] ring-1 ring-white/60 backdrop-blur-3xl transition-all duration-500 hover:ring-blue-200 md:flex-row md:items-center md:gap-6 md:rounded-[2rem] md:px-8">
                    <div className="flex items-center justify-between gap-6 md:justify-start md:gap-16">
                        <div className="group/stat">
                            <div className="mb-0.5 text-[8px] font-black uppercase tracking-widest text-zinc-400 transition-colors group-hover/stat:text-blue-500 md:mb-1.5 md:text-[10px]">Hubs</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black leading-none text-zinc-900 md:text-4xl">{visiblePoints.length}</span>
                                <span className="text-[8px] font-bold text-zinc-400 md:text-xs">Nodes</span>
                            </div>
                        </div>

                        <div className="h-8 w-[1px] rotate-12 bg-zinc-200/80 transition-transform duration-700 group-hover/status:rotate-0 md:h-12" />

                        <div className="group/stat">
                            <div className="mb-0.5 text-[8px] font-black uppercase tracking-widest text-zinc-400 transition-colors group-hover/stat:text-blue-500 md:mb-1.5 md:text-[10px]">Nations</div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black leading-none text-zinc-900 md:text-4xl">{countriesList.length}</span>
                                <span className="text-[8px] font-bold text-zinc-400 md:text-xs">Reach</span>
                            </div>
                        </div>
                    </div>

                    <div className="no-scrollbar flex max-w-full flex-wrap items-center gap-1.5 overflow-x-auto p-1 md:max-w-[50%] md:justify-end md:gap-2 md:p-0">
                        {countriesList.map((country) => (
                            <button
                                key={country.name}
                                onClick={(event) => {
                                    const map = (event.currentTarget.closest('.group') as HTMLDivElement | null)?.querySelector('.leaflet-container') as (HTMLElement & { _leaflet_map?: L.Map }) | null;
                                    map?._leaflet_map?.flyTo(country.coords, 5, { duration: 1.5 });
                                }}
                                className="whitespace-nowrap rounded-full bg-zinc-100/80 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-600 transition-all hover:scale-105 hover:bg-blue-600 hover:text-white hover:shadow-lg active:scale-95 md:px-3 md:py-1.5 md:text-[11px]"
                            >
                                {country.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes drop {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }

                .custom-marker {
                    animation: drop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .flashcard-popup .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                    padding: 4px;
                }

                .flashcard-popup .leaflet-popup-tip {
                    background: rgba(255, 255, 255, 0.95);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                }

                .flashcard-popup .leaflet-popup-content {
                    margin: 12px 14px;
                }

                .leaflet-container {
                    background: transparent !important;
                }
            `}</style>
        </motion.div>
    );
};
