/**
 * Geocoding utility for converting addresses to coordinates
 * Uses multiple methods: Google Maps Geocoding API, or fallback to mock data
 */

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

// Mock hospital locations for common hospitals (fallback data)
const MOCK_HOSPITAL_LOCATIONS: Record<string, GeocodingResult> = {
  "apollo hospital": {
    latitude: 13.0029,
    longitude: 80.2435,
    formattedAddress: "Apollo Hospital, Chennai",
  },
  "max healthcare": {
    latitude: 28.5355,
    longitude: 77.2145,
    formattedAddress: "Max Healthcare, Delhi",
  },
  "fortis hospital": {
    latitude: 28.5355,
    longitude: 77.2145,
    formattedAddress: "Fortis Hospital, Delhi",
  },
  "manipal hospital": {
    latitude: 13.0337,
    longitude: 77.5998,
    formattedAddress: "Manipal Hospital, Bangalore",
  },
  "global hospital": {
    latitude: 13.0029,
    longitude: 80.2435,
    formattedAddress: "Global Hospital, Chennai",
  },
};

/**
 * Geocode an address to get latitude and longitude
 * Tries Google Maps API first, then fallback to mock data
 */
export async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zip: string
): Promise<GeocodingResult | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const fullAddress = `${address}, ${city}, ${state} ${zip}`;

  // Try Google Maps Geocoding API if available
  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          fullAddress
        )}&key=${apiKey}`
      );

      if (!response.ok) throw new Error("Geocoding failed");

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: data.results[0].formatted_address,
        };
      }
    } catch (error) {
      console.warn("Google Maps geocoding failed, using fallback", error);
    }
  }

  // Fallback: Check mock data
  const hospitalName = address.toLowerCase();
  for (const [key, location] of Object.entries(MOCK_HOSPITAL_LOCATIONS)) {
    if (hospitalName.includes(key)) {
      return location;
    }
  }

  // If no match found and city is known, return approximate city center
  const cityCoordinates: Record<string, GeocodingResult> = {
    "New Delhi": {
      latitude: 28.7041,
      longitude: 77.1025,
      formattedAddress: `${address}, ${city}, ${state}`,
    },
    Delhi: {
      latitude: 28.7041,
      longitude: 77.1025,
      formattedAddress: `${address}, ${city}, ${state}`,
    },
    Mumbai: {
      latitude: 19.076,
      longitude: 72.8777,
      formattedAddress: `${address}, ${city}, ${state}`,
    },
    Bangalore: {
      latitude: 12.9716,
      longitude: 77.5946,
      formattedAddress: `${address}, ${city}, ${state}`,
    },
    Chennai: {
      latitude: 13.0827,
      longitude: 80.2707,
      formattedAddress: `${address}, ${city}, ${state}`,
    },
    Hyderabad: {
      latitude: 17.385,
      longitude: 78.4867,
      formattedAddress: `${address}, ${city}, ${state}`,
    },
    Kolkata: {
      latitude: 22.5726,
      longitude: 88.3639,
      formattedAddress: `${address}, ${city}, ${state}`,
    },
  };

  if (cityCoordinates[city]) {
    return cityCoordinates[city];
  }

  return null;
}

/**
 * Get directions URL for hospital
 */
export function getDirectionsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

/**
 * Get Apple Maps directions URL
 */
export function getAppleMapsUrl(latitude: number, longitude: number): string {
  return `http://maps.apple.com/?daddr=${latitude},${longitude}`;
}
