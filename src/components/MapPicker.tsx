import { useState, useCallback, useMemo, useEffect } from 'react';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import Map, { MapMarker } from './Map';
import { useGeolocation } from '../hooks/useGeolocation';
import { Coordinates } from '../lib/geo';

export interface MapPickerProps {
  /** Selected location */
  value?: Coordinates;
  /** Callback when location is selected */
  onChange: (coordinates: Coordinates, address?: string) => void;
  /** Placeholder address text */
  addressPlaceholder?: string;
  /** Show use-current-location button */
  showCurrentLocation?: boolean;
  /** Initial map center */
  initialCenter?: Coordinates;
  /** Map height */
  mapHeight?: string;
  /** Allow searching by address */
  allowAddressSearch?: boolean;
}

/**
 * Interactive location picker with map and address search
 * Allows users to click on map or search by address
 */
export function MapPicker({
  value,
  onChange,
  addressPlaceholder = 'Search location...',
  showCurrentLocation = true,
  initialCenter = { lat: 20.5937, lng: 78.9629 }, // India center
  mapHeight = 'h-96',
  allowAddressSearch = true,
}: MapPickerProps) {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [mapCenter, setMapCenter] = useState<Coordinates>(value || initialCenter);

  const { requestLocation, loading: isGeoLoading, coords, error: geoError } = useGeolocation();

  // Update map center and trigger onChange when geolocation succeeds
  useEffect(() => {
    if (coords && !isGeoLoading) {
      const coordinates: Coordinates = {
        lat: coords.latitude,
        lng: coords.longitude,
      };
      setMapCenter(coordinates);
      onChange(coordinates, 'Your Current Location');
      setSearchError('');
    }
  }, [coords, isGeoLoading, onChange]);

  // Create marker for selected location
  const selectedMarker: MapMarker | undefined = useMemo(() => {
    if (value) {
      return {
        id: 'selected',
        position: value,
        title: 'Selected Location',
        description: `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`,
      };
    }
    return undefined;
  }, [value]);

  // Handle map click to select location
  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      const coords = { lat, lng };
      setMapCenter(coords);
      onChange(coords);
      setSearchError('');
    },
    [onChange]
  );

  // Handle use current location
  const handleUseCurrentLocation = useCallback(async () => {
    setSearchError('');
    if (geoError) {
      setSearchError(geoError);
    }
    await requestLocation();
  }, [requestLocation, geoError]);

  // Handle address search (placeholder - integrates with Places API)
  const handleAddressSearch = useCallback(async () => {
    if (!allowAddressSearch || !searchInput.trim()) {
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      // This would call Google Places API in production
      // For now, show a placeholder error
      setSearchError('Address search requires Google Places API configuration');
    } finally {
      setIsSearching(false);
    }
  }, [searchInput, allowAddressSearch]);

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSearch();
    }
  };

  const markerList = selectedMarker ? [selectedMarker] : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Select Location
        </h3>
        <p className="text-xs text-gray-600">
          Click on the map or search by address to select a location
        </p>
      </div>

      {/* Search Bar */}
      {allowAddressSearch && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={addressPlaceholder}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              disabled={isSearching}
              className="pr-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
            )}
          </div>
          <Button
            onClick={handleAddressSearch}
            disabled={isSearching || !searchInput.trim()}
            variant="outline"
            size="sm"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {showCurrentLocation && (
          <Button
            onClick={handleUseCurrentLocation}
            disabled={isGeoLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isGeoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            Use My Location
          </Button>
        )}
      </div>

      {/* Error Display */}
      {searchError && (
        <Card className="p-3 bg-amber-50 border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{searchError}</p>
        </Card>
      )}

      {/* Map */}
      <Map
        center={mapCenter}
        zoom={15}
        markers={markerList}
        onMapClick={handleMapClick}
        height={mapHeight}
        fitBounds={false}
      />

      {/* Selected Coordinates Display */}
      {value && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-1">Selected Location</p>
          <p className="text-xs text-blue-700 font-mono">
            Latitude: {value.lat.toFixed(6)}
            <br />
            Longitude: {value.lng.toFixed(6)}
          </p>
        </Card>
      )}
    </div>
  );
}

export default MapPicker;
