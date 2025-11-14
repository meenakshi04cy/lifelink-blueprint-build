/**
 * Geographic utility functions
 * - Distance calculations using Haversine formula
 * - Coordinate validation
 * - Address formatting
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  city?: string;
  formattedAddress?: string;
  placeId?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers, rounded to 1 decimal place
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const toRad = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Validate if coordinates are within valid ranges
 */
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Parse coordinates from string (format: "lat,lng" or "lat, lng")
 */
export const parseCoordinates = (str: string): Coordinates | null => {
  try {
    const [latStr, lngStr] = str.split(',').map((s) => s.trim());
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isValidCoordinate(lat, lng)) {
      return { lat, lng };
    }
  } catch (e) {
    // Invalid format
  }
  return null;
};

/**
 * Format coordinates to string
 */
export const formatCoordinates = (coords: Coordinates): string => {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
};

/**
 * Get approximate bounds for a search radius
 * Returns { north, south, east, west } for use in mapBounds
 */
export const getBoundingBox = (center: Coordinates, radiusKm: number) => {
  const latOffset = radiusKm / 111; // 1 degree latitude ≈ 111 km
  const lngOffset = radiusKm / (111 * Math.cos(toRad(center.lat)));

  return {
    north: center.lat + latOffset,
    south: center.lat - latOffset,
    east: center.lng + lngOffset,
    west: center.lng - lngOffset,
  };
};

/**
 * Check if coordinate is within a radius of center
 */
export const isWithinRadius = (
  point: Coordinates,
  center: Coordinates,
  radiusKm: number
): boolean => {
  return calculateDistance(point, center) <= radiusKm;
};

/**
 * Sort locations by distance from a reference point
 */
export const sortByDistance = <T extends { location: Coordinates }>(
  items: T[],
  center: Coordinates
): Array<T & { distance: number }> => {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(center, item.location),
    }))
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Approximate city from coordinates using reverse geocoding (client-side mock)
 * In production, use Google Geocoding API
 */
export const approximateCityFromCoords = (coords: Coordinates): string => {
  // This is a placeholder; real implementation should call Google Geocoding API
  // For now, return generic location string
  return `${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`;
};

/**
 * Extract city from formatted address
 */
export const extractCityFromAddress = (address: string): string => {
  // Simple extraction: take the last meaningful component
  // Google returns: "Street, City, State, Country"
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 2]; // Usually the city/region
  }
  return address;
};

/**
 * Create URL for Google Maps directions
 */
export const getDirectionsUrl = (destination: Coordinates, origin?: Coordinates): string => {
  const destParam = `${destination.lat},${destination.lng}`;
  const originParam = origin ? `&origin=${origin.lat},${origin.lng}` : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${destParam}${originParam}`;
};

/**
 * Create URL for Google Maps location view
 */
export const getMapUrl = (location: Coordinates): string => {
  return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
};
