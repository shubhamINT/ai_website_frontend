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

interface MapDisplayProps {
    polyline: string;
    origin?: string;
    destination?: string;
}

/**
 * Decodes a Google Maps encoded polyline string into an array of [lat, lng] coordinates.
 */
function decodePolyline(encoded: string): [number, number][] {
    if (!encoded) return [];
    const poly: [number, number][] = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        poly.push([lat / 1e5, lng / 1e5]);
    }
    return poly;
}

// Component to handle map bounds and auto-zooming
function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [40, 40], animate: true });
        }
    }, [bounds, map]);
    return null;
}

export const MapDisplay = React.memo(({ polyline, origin, destination }: MapDisplayProps) => {
    console.log('--- MAPDISPLAY: Rendering ---', { origin, destination, polylineLength: polyline?.length });
    const positions = useMemo(() => {
        const decoded = decodePolyline(polyline);
        console.log('--- MAPDISPLAY: Polylines decoded ---', { count: decoded.length });
        return decoded;
    }, [polyline]);
    
    const bounds = useMemo(() => {
        if (positions.length === 0) return null;
        return L.latLngBounds(positions);
    }, [positions]);

    useEffect(() => {
        console.log('--- MAPDISPLAY: Component mounted ---');
    }, []);

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
            className="group relative h-[350px] w-full overflow-hidden rounded-[32px] bg-white/40 p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] backdrop-blur-2xl transition-all hover:shadow-[0_25px_50px_rgba(0,0,0,0.12)] md:h-[450px]"
        >
            <div className="absolute inset-0 z-10 pointer-events-none rounded-[30px] border-[6px] border-white/50 shadow-inner"></div>
            
            <MapContainer 
                center={startPoint} 
                zoom={13} 
                style={{ height: '100%', width: '100%', borderRadius: '26px' }}
                zoomControl={false}
                scrollWheelZoom={false}
            >
                {/* Clean, light-themed map tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                <Polyline 
                    positions={positions} 
                    pathOptions={{ 
                        color: '#2563eb', 
                        weight: 4, 
                        opacity: 0.8,
                        lineCap: 'round',
                        lineJoin: 'round'
                    }} 
                />

                <Marker position={startPoint}>
                    <Popup>
                        <div className="text-xs font-semibold">{origin || "Start Point"}</div>
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
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col gap-2">
                {(origin || destination) && (
                    <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur-md">
                        <div className="flex flex-col gap-1 flex-1">
                            {origin && (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Origin</span>
                                    <span className="text-xs font-semibold text-zinc-900 truncate">{origin}</span>
                                </div>
                            )}
                            {destination && (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                    <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Destination</span>
                                    <span className="text-xs font-semibold text-zinc-900 truncate">{destination}</span>
                                </div>
                            )}
                        </div>
                        <div className="h-8 w-px bg-zinc-200"></div>
                        <div className="px-1 text-blue-600">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                                <path fillRule="evenodd" d="M8.161 2.58a.75.75 0 0 1 .753-.018l9 5.25a.75.75 0 0 1 0 1.288l-9 5.25a.75.75 0 0 1-1.127-.644V2.984a.75.75 0 0 1 .374-.648ZM21 12.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H21Z" clipRule="evenodd" />
                             </svg>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
});

MapDisplay.displayName = 'MapDisplay';
