import L from 'leaflet';

export const COORDINATES_MAP: Record<string, [number, number]> = {
    '1310 S Vista Ave Ste 28, Boise, Idaho - 83705': [43.5891, -116.2081],
    '120 Adelaide Street West, Suite 2500, M5H 1T1': [43.6499, -79.3842],
    '13 More London Riverside, London SE1 2RE': [51.5048, -0.0786],
    'BARTYCKA 22B M21A, 00-716 WARSZAWA': [52.2131, 21.0531],
    'Indus Net Technologies PTE Ltd., 60 Paya Lebar Road, #09-43 Paya Lebar Square - 409051': [1.3182, 103.8931],
    '4th Floor, SDF Building Saltlake Electronic Complex, Kolkata, West Bengal 700091': [22.5726, 88.4339],
    '4th Floor, Block-2b, ECOSPACE BUSINESS PARK, AA II, Newtown, Chakpachuria, West Bengal 700160': [22.5835, 88.4735],
};

function normalizeAddress(value: string) {
    return value.replace(/[\u2013\u2014]/g, '-');
}

export function getCoordinates(address: string): [number, number] | null {
    const normalizedAddress = normalizeAddress(address);

    for (const [key, coords] of Object.entries(COORDINATES_MAP)) {
        const normalizedKey = normalizeAddress(key);
        if (normalizedAddress.includes(normalizedKey) || normalizedKey.includes(normalizedAddress)) return coords;
    }

    const lower = normalizedAddress.toLowerCase();
    if (lower.includes('usa') || lower.includes('boise')) return [43.6150, -116.2023];
    if (lower.includes('canada')) return [43.6532, -79.3832];
    if (lower.includes('uk') || lower.includes('london')) return [51.5074, -0.1278];
    if (lower.includes('poland')) return [52.2297, 21.0122];
    if (lower.includes('singapore')) return [1.3521, 103.8198];
    if (lower.includes('india') || lower.includes('kolkata')) return [22.5726, 88.3639];
    return null;
}

export function decodePolyline(str: string) {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates = [];

    while (index < str.length) {
        let shift = 0;
        let result = 0;
        let byte;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const latitudeChange = result & 1 ? ~(result >> 1) : result >> 1;

        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        const longitudeChange = result & 1 ? ~(result >> 1) : result >> 1;

        lat += latitudeChange;
        lng += longitudeChange;
        coordinates.push([lat / 1e5, lng / 1e5] as [number, number]);
    }

    return coordinates;
}

export function createBounds(points: [number, number][]) {
    return L.latLngBounds(points);
}
