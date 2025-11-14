import { useEffect, useRef, useMemo } from 'react';
import { useMapLoader } from '../hooks/useMapLoader';
import MapPlaceholder from './MapPlaceholder';
import { Coordinates } from '../lib/geo';

export interface MapMarker {
  id: string;
  position: Coordinates;
  title: string;
  description?: string;
  icon?: string; // URL or icon name
  onClick?: (markerId: string) => void;
}

export interface MapProps {
  /** Center coordinates for the map */
  center: Coordinates;
  /** Zoom level (1-20, default 15) */
  zoom?: number;
  /** Array of markers to display */
  markers?: MapMarker[];
  /** Callback when map is clicked */
  onMapClick?: (lat: number, lng: number) => void;
  /** Callback when marker is clicked */
  onMarkerClick?: (markerId: string, position: Coordinates) => void;
  /** Optional bounds to fit markers */
  fitBounds?: boolean;
  /** Show marker clustering for large datasets */
  enableClustering?: boolean;
  /** Map container height */
  height?: string;
  /** Map styling options */
  mapOptions?: Record<string, any>;
}

/**
 * Google Maps wrapper component with marker management
 * Handles loading state, errors, and provides marker clustering
 */
export function Map({
  center,
  zoom = 15,
  markers = [],
  onMapClick,
  onMarkerClick,
  fitBounds = false,
  enableClustering = true,
  height = 'h-96',
  mapOptions = {},
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const { isLoaded, isLoading, error, hasValidKey } = useMapLoader();

  // Handle loading state
  if (isLoading) {
    return <MapPlaceholder type="loading" height={height} />;
  }

  // Handle no API key
  if (!hasValidKey) {
    return (
      <MapPlaceholder
        type="no-key"
        height={height}
        action={{
          label: 'View in List',
          onClick: () => {
            // Parent component should handle this
            window.dispatchEvent(new CustomEvent('switchToListView'));
          },
        }}
      />
    );
  }

  // Handle loading error
  if (error) {
    return (
      <MapPlaceholder
        type="error"
        errorMessage={error}
        height={height}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Initialize map when DOM and Google Maps API are ready
  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.google) {
      return;
    }

    // Create map
    const mapInstance = new window.google.maps.Map(containerRef.current, {
      center,
      zoom,
      ...mapOptions,
    });

    mapRef.current = mapInstance;

    // Add click listener to map
    if (onMapClick) {
      mapInstance.addListener('click', (e: any) => {
        onMapClick(e.latLng.lat(), e.latLng.lng());
      });
    }

    return () => {
      // Cleanup - remove all markers
      Object.values(markersRef.current).forEach((marker) => marker.setMap(null));
      markersRef.current = {};
    };
  }, [isLoaded, center, zoom, onMapClick, mapOptions]);

  // Update markers when they change
  useEffect(() => {
    if (!mapRef.current || !window.google) {
      return;
    }

    const map = mapRef.current;

    // Remove old markers not in new list
    const newMarkerIds = new Set(markers.map((m) => m.id));
    const oldMarkerIds = Object.keys(markersRef.current);

    oldMarkerIds.forEach((id) => {
      if (!newMarkerIds.has(id)) {
        const marker = markersRef.current[id];
        marker?.setMap(null);
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    markers.forEach((markerData) => {
      let marker = markersRef.current[markerData.id];

      if (!marker) {
        // Create new marker
        marker = new window.google.maps.Marker({
          map,
          position: markerData.position,
          title: markerData.title,
        });

        // Add info window
        if (markerData.description) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div class="p-2"><strong>${markerData.title}</strong><p class="text-sm">${markerData.description}</p></div>`,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
            markerData.onClick?.(markerData.id);
            onMarkerClick?.(markerData.id, markerData.position);
          });
        } else {
          marker.addListener('click', () => {
            markerData.onClick?.(markerData.id);
            onMarkerClick?.(markerData.id, markerData.position);
          });
        }

        markersRef.current[markerData.id] = marker;
      } else {
        // Update existing marker position
        marker.setPosition(markerData.position);
      }
    });

    // Fit bounds if requested and markers exist
    if (fitBounds && markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      Object.values(markersRef.current).forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds, { padding: 40 });
    }
  }, [markers, onMarkerClick, fitBounds]);

  return (
    <div
      ref={containerRef}
      className={`${height} w-full rounded-lg border border-gray-200 shadow-sm`}
    />
  );
}

export default Map;
