import L from 'leaflet';

export const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export const StartIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export const EndIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export const HQIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-12 h-12 group">
            <div class="absolute w-full h-full bg-blue-500/10 rounded-full animate-[pulse_3s_infinite]"></div>
            <div class="absolute w-2/3 h-2/3 bg-blue-500/20 rounded-full animate-[pulse_2s_infinite]"></div>
            <div class="absolute w-4 h-4 bg-blue-600 rounded-full border-[3px] border-white shadow-[0_0_15px_rgba(37,99,235,0.6)] z-10 transition-transform group-hover:scale-125"></div>
            <div class="absolute w-8 h-8 rounded-full border border-blue-400/30 animate-[spin_8s_linear_infinite] border-dashed"></div>
        </div>
    `,
    className: 'custom-marker-hq',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
});

export const RegionIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center w-8 h-8 group">
            <div class="absolute w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-lg ring-1 ring-blue-100 transition-all group-hover:scale-150 group-hover:bg-blue-500"></div>
            <div class="absolute w-full h-full bg-blue-400/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
        </div>
    `,
    className: 'custom-marker-region',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

L.Marker.prototype.options.icon = DefaultIcon;
