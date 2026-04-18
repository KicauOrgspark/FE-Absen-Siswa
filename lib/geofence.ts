export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Koordinat & radius sekolah — sesuaikan!
export const SCHOOL_LOCATION: Coordinates = {
  latitude: -6.467184782305172,   // ganti dengan koordinat sekolah
  longitude: 106.8646612685341,
};
export const ALLOWED_RADIUS_METERS = 500; // radius 100m

/** Haversine formula — jarak dua titik GPS dalam meter */
export function getDistanceMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const aVal =
    sinDLat * sinDLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
}

export function isInsideSchool(coords: Coordinates): boolean {
  return getDistanceMeters(coords, SCHOOL_LOCATION) <= ALLOWED_RADIUS_METERS;
}