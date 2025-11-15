import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      maps: any;
    };
  }
}

interface EntityMapProps {
  latitude?: number;
  longitude?: number;
  hospitalName?: string;
  address?: string;
  height?: string;
  zoom?: number;
}

/**
 * EntityMap Component
 * Displays hospital location on Google Map or static map fallback
 * Shows directions button to navigate to hospital
 */
const EntityMap = ({
  latitude,
  longitude,
  hospitalName = "Location",
  address = "",
  height = "h-80",
  zoom = 15,
}: EntityMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) {
      setMapLoaded(true); // Use fallback UI
      return;
    }

    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      setMapError("Failed to load Google Maps");
      setMapLoaded(true); // Show fallback
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !latitude || !longitude || mapError) {
      return;
    }

    if (!window.google?.maps) {
      return; // Maps not loaded yet or not available
    }

    try {
      const location = { lat: latitude, lng: longitude };

      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: zoom,
        center: location,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
      });

      // Add marker
      new window.google.maps.Marker({
        position: location,
        map: map,
        title: hospitalName,
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red marker for hospital
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${hospitalName}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${address}</p>
            <p style="margin: 0; font-size: 12px; color: #999;">📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</p>
          </div>
        `,
      });

      map.addListener("click", () => {
        infoWindow.open(map, new window.google.maps.Marker({ position: location }));
      });

      // Open info window by default
      infoWindow.open(map, new window.google.maps.Marker({ position: location }));

      mapInstanceRef.current = map;
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map");
    }
  }, [mapLoaded, latitude, longitude, hospitalName, address, zoom, mapError]);

  const getDirectionsUrl = () => {
    if (!latitude || !longitude) return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
  };

  const getAppleMapsUrl = () => {
    if (!latitude || !longitude) return null;
    return `http://maps.apple.com/?daddr=${latitude},${longitude}`;
  };

  // Fallback UI if map not available
  if (!mapLoaded || !latitude || !longitude || !window.google?.maps || mapError) {
    return (
      <div className={`${height} bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg border-2 border-gray-200 flex flex-col items-center justify-center p-6`}>
        <MapPin className="w-12 h-12 text-blue-600 mb-4" />
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg text-gray-900">{hospitalName}</h3>
          {address && <p className="text-sm text-gray-600 mt-2">{address}</p>}
          {latitude && longitude && (
            <p className="text-xs text-gray-500 mt-2">
              📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </p>
          )}
        </div>

        {mapError && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <span>{mapError}</span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap justify-center">
          {getDirectionsUrl() && (
            <Button
              onClick={() => window.open(getDirectionsUrl(), "_blank")}
              className="gap-2"
              size="sm"
            >
              <Navigation className="w-4 h-4" />
              Google Maps
            </Button>
          )}
          {getAppleMapsUrl() && (
            <Button
              onClick={() => window.open(getAppleMapsUrl(), "_blank")}
              variant="outline"
              size="sm"
            >
              Apple Maps
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={mapRef}
        className={`${height} rounded-lg border border-gray-300 shadow-md overflow-hidden`}
        style={{ minHeight: "300px" }}
      />
      {getDirectionsUrl() && (
        <Button
          onClick={() => window.open(getDirectionsUrl(), "_blank")}
          className="w-full gap-2"
        >
          <Navigation className="w-4 h-4" />
          Get Directions on Google Maps
        </Button>
      )}
    </div>
  );
};

export default EntityMap;
