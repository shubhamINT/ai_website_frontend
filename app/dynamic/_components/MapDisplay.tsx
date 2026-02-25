"use client";

import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;


const decodePolyline = (str: string) => {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates = [];
    let shift = 0;
    let result = 0;
    let byte = null;
    let latitude_change, longitude_change;

    while (index < str.length) {
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / 1e5, lng / 1e5] as [number, number]);
    }

    return coordinates;
};

const ChangeView = ({ bounds }: { bounds: L.LatLngBounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
    }, [bounds, map]);
    return null;
};



interface MapDisplayProps {
    polyline: string;
    origin?: string;
    destination?: string;
    travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
    distance?: string;
    duration?: string;
}

const TravelModeIcon = ({ mode }: { mode?: string }) => {
    switch (mode) {
        case 'walking':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M13.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM6.75 6a.75.75 0 0 0-.75.75v6.75a.75.75 0 0 0 1.5 0v-4.39l1.583 1.583a.75.75 0 0 0 1.06 0l2.25-2.25a.75.75 0 0 0 0-1.06L9.64 4.879A2.25 2.25 0 0 0 8.05 4.25H6.75ZM15 7.5a.75.75 0 0 1 .75-.75h.75a2.25 2.25 0 0 1 2.25 2.25v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 0-.75-.75h-.75A.75.75 0 0 1 15 7.5ZM5.25 15.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75ZM13.5 18a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3A.75.75 0 0 1 13.5 18ZM6.75 18.75a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H7.5a.75.75 0 0 1-.75-.75Z" />
                </svg>
            );
        case 'driving':
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M11.25 4.5a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM18.664 6.352a.75.75 0 0 1 .536.216l.3.3a.75.75 0 0 1-1.06 1.06l-.3-.3a.75.75 0 0 1 .524-1.276ZM4.8 6.352a.75.75 0 0 1 .524 1.276l-.3.3a.75.75 0 0 1-1.06-1.06l.3-.3a.75.75 0 0 1 .536-.216ZM12 7.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
                    <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Zm9-7.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z" clipRule="evenodd" />
                </svg>
            );
    }
}

export const MapDisplay = React.memo(({ polyline, origin, destination, travelMode, distance, duration }: MapDisplayProps) => {
    const positions = useMemo(() => decodePolyline(polyline), [polyline]);
    
    const bounds = useMemo(() => {
        if (positions.length === 0) return null;
        return L.latLngBounds(positions);
    }, [positions]);

    if (positions.length === 0) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 ring-1 ring-black/5">
                No route data available
            </div>
        );
    }

    const startPoint = positions[0];
    const endPoint = positions[positions.length - 1];

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="group relative h-[400px] w-full overflow-hidden rounded-[32px] bg-white/40 p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] backdrop-blur-2xl transition-all hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] md:h-[500px]"
        >
            <div className="absolute inset-0 z-10 pointer-events-none rounded-[30px] border-[6px] border-white/50 shadow-inner"></div>
            
            <MapContainer 
                center={startPoint} 
                zoom={13} 
                style={{ height: '100%', width: '100%', borderRadius: '26px' }}
                zoomControl={false}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                <Polyline 
                    positions={positions} 
                    pathOptions={{ 
                        color: '#2563eb', 
                        weight: 5, 
                        opacity: 0.8,
                        lineCap: 'round',
                        lineJoin: 'round'
                    }} 
                />

                <Marker position={startPoint}>
                    <Popup>
                        <div className="text-xs font-semibold">{origin || "Current Location"}</div>
                    </Popup>
                </Marker>

                <Marker position={endPoint}>
                    <Popup>
                        <div className="text-xs font-semibold">{destination || "Destination"}</div>
                    </Popup>
                </Marker>

                {bounds && <ChangeView bounds={bounds} />}
            </MapContainer>

            {/* Premium Overlay Elements */}
            <div className="absolute top-4 left-4 z-[1000] flex gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-white shadow-lg backdrop-blur-md">
                    <TravelModeIcon mode={travelMode} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{travelMode || 'driving'}</span>
                </div>
                {(distance || duration) && (
                    <div className="flex items-center gap-3 rounded-xl bg-white/90 px-3 py-1.5 text-zinc-900 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
                        {distance && (
                            <div className="flex flex-col">
                                <span className="text-[8px] font-medium text-zinc-500 uppercase">Distance</span>
                                <span className="text-xs font-bold">{distance}</span>
                            </div>
                        )}
                        {distance && duration && <div className="h-4 w-px bg-zinc-200"></div>}
                        {duration && (
                            <div className="flex flex-col">
                                <span className="text-[8px] font-medium text-zinc-500 uppercase">Time</span>
                                <span className="text-xs font-bold text-blue-600">{duration}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                                <div className="h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white"></div>
                                <div className="h-4 w-0.5 border-l border-dashed border-zinc-300"></div>
                                <div className="h-2.5 w-2.5 rounded-sm bg-red-500"></div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">Your Location</span>
                                    <span className="text-xs font-semibold text-zinc-900 truncate max-w-[150px]">{origin || "Current Position"}</span>
                                </div>
                                <div className="h-px bg-zinc-100"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">Destination</span>
                                    <span className="text-xs font-semibold text-zinc-900 truncate max-w-[200px]">{destination || "Calculating..."}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

MapDisplay.displayName = 'MapDisplay';