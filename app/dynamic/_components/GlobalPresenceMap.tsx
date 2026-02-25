"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const HQIcon = L.divIcon({
    html: `<div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-ping opacity-75"></div>
        <div class="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
    </div>`,
    className: 'custom-marker',
    iconSize: [0, 0],
});

const RegionIcon = L.divIcon({
    html: `<div class="relative">
        <div class="absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white shadow-md"></div>
    </div>`,
    className: 'custom-marker',
    iconSize: [0, 0],
});

// Fixed Coordinates Mapping for provided addresses
const COORDINATES_MAP: Record<string, [number, number]> = {
    "1310 S Vista Ave Ste 28, Boise, Idaho – 83705": [43.5891, -116.2081],
    "120 Adelaide Street West, Suite 2500, M5H 1T1": [43.6499, -79.3842],
    "13 More London Riverside, London SE1 2RE": [51.5048, -0.0786],
    "BARTYCKA 22B M21A, 00-716 WARSZAWA": [52.2131, 21.0531],
    "Indus Net Technologies PTE Ltd., 60 Paya Lebar Road, #09-43 Paya Lebar Square – 409051": [1.3182, 103.8931],
    "4th Floor, SDF Building Saltlake Electronic Complex, Kolkata, West Bengal 700091": [22.5726, 88.4339],
    "4th Floor, Block-2b, ECOSPACE BUSINESS PARK, AA II, Newtown, Chakpachuria, West Bengal 700160": [22.5835, 88.4735],
};

const getCoordinates = (address: string): [number, number] | null => {
    // Exact match or contains check
    for (const [key, coords] of Object.entries(COORDINATES_MAP)) {
        if (address.includes(key) || key.includes(address)) return coords;
    }
    // Fallback based on country keywords if address not in map
    if (address.toLowerCase().includes('usa') || address.toLowerCase().includes('boise')) return [43.6150, -116.2023];
    if (address.toLowerCase().includes('canada')) return [43.6532, -79.3832];
    if (address.toLowerCase().includes('uk') || address.toLowerCase().includes('london')) return [51.5074, -0.1278];
    if (address.toLowerCase().includes('poland')) return [52.2297, 21.0122];
    if (address.toLowerCase().includes('singapore')) return [1.3521, 103.8198];
    if (address.toLowerCase().includes('india') || address.toLowerCase().includes('kolkata')) return [22.5726, 88.3639];
    
    return null;
};

interface LocationPoint {
    id: string;
    type: 'hq' | 'region';
    address: string;
    label: string;
    coords: [number, number];
}

const ChangeView = ({ positions }: { positions: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [100, 100], animate: true, duration: 2 });
        }
    }, [positions, map]);
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
        
        // Add Headquarters
        Object.entries(data.headquarters).forEach(([country, address], idx) => {
            const coords = getCoordinates(address);
            if (coords) {
                points.push({
                    id: `hq-${idx}-${country}`,
                    type: 'hq',
                    address,
                    label: `${country} (HQ)`,
                    coords
                });
            }
        });

        // Add Regions
        Object.entries(data.regions).forEach(([country, address], idx) => {
            const coords = getCoordinates(address);
            if (coords) {
                points.push({
                    id: `region-${idx}-${country}`,
                    type: 'region',
                    address,
                    label: country,
                    coords
                });
            }
        });

        return points;
    }, [data]);

    useEffect(() => {
        setVisiblePoints([]);
        const timers: NodeJS.Timeout[] = [];
        
        allPoints.forEach((point, index) => {
            const timer = setTimeout(() => {
                setVisiblePoints(prev => [...prev, point]);
            }, index * 800); // Drop one by one every 800ms
            timers.push(timer);
        });

        return () => timers.forEach(t => clearTimeout(t));
    }, [allPoints]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative h-[500px] w-full overflow-hidden rounded-[32px] bg-zinc-900 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] md:h-[600px]"
        >
            <div className="absolute top-6 left-6 z-[1000] space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Global Presence</h3>
                <p className="text-sm text-zinc-400">Our footprint across the globe</p>
            </div>

            <div className="absolute top-6 right-6 z-[1000] flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                    <span className="text-[10px] font-medium text-white uppercase tracking-wider">Headquarters</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 backdrop-blur-md border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-wider">Regions</span>
                </div>
            </div>

            <MapContainer 
                center={[20, 0]} 
                zoom={2} 
                style={{ height: '100%', width: '100%', background: '#111' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                
                {visiblePoints.map((point) => (
                    <Marker 
                        key={point.id} 
                        position={point.coords} 
                        icon={point.type === 'hq' ? HQIcon : RegionIcon}
                    >
                        <Popup className="premium-popup">
                            <div className="p-1">
                                <div className="text-sm font-bold text-zinc-900 mb-1">{point.label}</div>
                                <div className="text-[10px] text-zinc-500 leading-tight leading-relaxed max-w-[200px]">{point.address}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <ChangeView positions={visiblePoints.map(p => p.coords)} />
            </MapContainer>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-6 left-6 right-6 z-[1000]">
                <div className="flex items-center justify-between rounded-2xl bg-black/40 p-4 backdrop-blur-xl border border-white/10 shadow-lg">
                    <div className="flex gap-8">
                        <div>
                            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Locations Found</div>
                            <div className="text-xl font-bold text-white">{visiblePoints.length}<span className="text-zinc-600"> / {allPoints.length}</span></div>
                        </div>
                        <div className="h-10 w-px bg-white/10"></div>
                        <div>
                            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Countries</div>
                            <div className="text-xl font-bold text-white">
                                {new Set(allPoints.map(p => p.label.split(' ')[0])).size}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex -space-x-2">
                        {visiblePoints.slice(0, 5).map((p, i) => (
                            <div 
                                key={i}
                                className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white"
                            >
                                {p.label.charAt(0)}
                            </div>
                        ))}
                        {visiblePoints.length > 5 && (
                            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">
                                +{visiblePoints.length - 5}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes drop {
                    0% { transform: translateY(-40px) scale(0); opacity: 0; }
                    60% { transform: translateY(5px) scale(1.1); opacity: 1; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                .premium-popup .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(8px);
                    border-radius: 16px;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .premium-popup .leaflet-popup-tip {
                    background: rgba(255, 255, 255, 0.95);
                }
                .leaflet-container {
                    background: #111 !important;
                }
                .custom-marker {
                    animation: drop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
            `}</style>
        </motion.div>
    );
};
