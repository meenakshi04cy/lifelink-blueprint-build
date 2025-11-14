# Maps & Geolocation Integration Guide

## Overview

This document describes the complete maps and geolocation infrastructure added to LifeLink. The system provides location-aware features for finding nearby blood donors/hospitals and managing location privacy.

## Architecture

### 1. Core Hooks

#### `useGeolocation.ts`
Manages browser geolocation requests with privacy-first approach.

**Key Features:**
- Permission-based location access (never auto-requests)
- Error handling for PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT
- State tracking: `loading`, `error`, `coords`, `permissionDenied`
- Manual watch and clear functions

**Usage:**
```typescript
const { coords, loading, error, permissionDenied, requestLocation } = useGeolocation();

// Request location (usually triggered by user click)
await requestLocation();

// Access coordinates
if (coords) {
  const { latitude, longitude, accuracy } = coords;
}
```

#### `useMapLoader.ts`
Dynamically loads Google Maps JS API with fallback handling.

**Key Features:**
- Checks for `NEXT_PUBLIC_MAP_API_KEY` environment variable
- Client-side only loading (prevents SSR issues)
- Returns state: `isLoaded`, `isLoading`, `error`, `apiKey`, `hasValidKey`
- Graceful fallback when API key missing

**Usage:**
```typescript
const { isLoaded, hasValidKey, error } = useMapLoader();

if (!hasValidKey) {
  // Show fallback UI
}
```

### 2. Utility Functions (`lib/geo.ts`)

**Distance Calculation:**
```typescript
const distance = calculateDistance(
  { lat: 28.6139, lng: 77.2090 },  // User location
  { lat: 28.7041, lng: 77.1025 }   // Hospital location
);
// Returns: 12.5 km
```

**Coordinate Validation:**
```typescript
const isValid = isValidCoordinate(lat, lng);  // true if -90..90, -180..180
```

**Parsing & Formatting:**
```typescript
const coords = parseCoordinates("28.6139, 77.2090");  // { lat, lng }
const str = formatCoordinates({ lat: 28.6139, lng: 77.2090 });  // "28.6139, 77.2090"
```

**Bounding Boxes:**
```typescript
const bounds = getBoundingBox(center, radiusKm);  // { north, south, east, west }
const inRadius = isWithinRadius(point, center, 5);  // true if within 5km
```

**Sorting by Distance:**
```typescript
const sorted = sortByDistance(items, userLocation);
// Items now have .distance property, sorted ascending
```

**Map URLs:**
```typescript
getDirectionsUrl(destination, origin);  // Opens Google Maps directions
getMapUrl(location);  // Opens Google Maps at location
```

### 3. UI Components

#### `MapPlaceholder.tsx`
Fallback UI when maps unavailable. Handles 4 states:
- `loading` - Map is loading
- `error` - Map load failed
- `no-key` - No API key configured
- `no-location` - No location available

**Features:**
- Animated mock markers for demo
- Retry and action buttons
- Responsive grid background

**Usage:**
```tsx
<MapPlaceholder 
  type="no-key" 
  height="h-96"
  action={{ label: 'Use List', onClick: () => {} }}
/>
```

#### `Map.tsx`
Google Maps wrapper component.

**Features:**
- Marker management (add/remove/update)
- Click handling for location selection
- Info windows on marker click
- Bounds fitting for marker clusters
- Dynamic marker updates

**Usage:**
```tsx
<Map
  center={{ lat: 28.6139, lng: 77.2090 }}
  zoom={15}
  markers={[
    {
      id: 'donor-1',
      position: { lat: 28.61, lng: 77.21 },
      title: 'Donor Name',
      description: '5km away'
    }
  ]}
  onMapClick={(lat, lng) => console.log('Selected:', lat, lng)}
  onMarkerClick={(id, pos) => console.log('Marker clicked:', id)}
  height="h-96"
  fitBounds={true}
/>
```

#### `MapPicker.tsx`
Interactive location selection with map + search.

**Features:**
- Click map to select location
- "Use My Location" button with geolocation
- Address search support (extensible)
- Real-time coordinate display
- Integrated with `useGeolocation` hook

**Usage:**
```tsx
<MapPicker
  value={selectedLocation}
  onChange={(coords, address) => setLocation(coords)}
  showCurrentLocation={true}
  initialCenter={{ lat: 28.6139, lng: 77.2090 }}
  mapHeight="h-96"
/>
```

#### `LocationBadge.tsx`
Compact location display showing city and distance.

**Features:**
- Shows city + distance from user
- Optional "Get Directions" button
- Two variants: `LocationBadge` and `LocationBadgeCompact`

**Usage:**
```tsx
<LocationBadge
  city="New Delhi"
  userLocation={userCoords}
  location={donorLocation}
  showDirections={true}
/>
```

## Environment Configuration

### Required Environment Variables

Add to `.env.local`:

```bash
# Google Maps API Key (get from Google Cloud Console)
NEXT_PUBLIC_MAP_API_KEY=your_api_key_here

# For development/demo without real key:
NEXT_PUBLIC_MAP_API_KEY=dummy
```

**Setting up API Key:**
1. Go to Google Cloud Console
2. Create project
3. Enable "Maps JavaScript API"
4. Create API key (restrict to your domain)
5. Add to `.env.local`

### Fallback Behavior

- If `NEXT_PUBLIC_MAP_API_KEY` is not set → Shows `MapPlaceholder` with "Map Unavailable"
- If API key is "dummy" → Shows `MapPlaceholder` for demo
- If real API key → Loads full Google Maps

## Integration Examples

### 1. Search Page with Distance

```tsx
import { useGeolocation } from '../hooks/useGeolocation';
import { sortByDistance, calculateDistance } from '../lib/geo';
import { LocationBadge } from '../components/LocationBadge';
import Map from '../components/Map';

export function SearchPage() {
  const { coords } = useGeolocation();
  const [listings, setListings] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  useEffect(() => {
    if (coords) {
      // Sort by distance from user
      const sorted = sortByDistance(listings, {
        lat: coords.latitude,
        lng: coords.longitude
      });
      setListings(sorted);
    }
  }, [coords]);

  if (viewMode === 'map') {
    return (
      <Map
        center={coords ? { lat: coords.latitude, lng: coords.longitude } : initialCenter}
        markers={listings.map(item => ({
          id: item.id,
          position: item.location,
          title: item.name,
          description: `${calculateDistance(...)} km away`
        }))}
      />
    );
  }

  return (
    <div>
      {listings.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <LocationBadge
            city={item.city}
            location={item.location}
            userLocation={coords ? { lat: coords.latitude, lng: coords.longitude } : undefined}
          />
        </div>
      ))}
    </div>
  );
}
```

### 2. Donation Request Form with Location Picker

```tsx
import { MapPicker } from '../components/MapPicker';
import { useState } from 'react';

export function RequestBloodForm() {
  const [location, setLocation] = useState(null);

  return (
    <form>
      <h3>Select Request Location</h3>
      <MapPicker
        value={location}
        onChange={(coords) => setLocation(coords)}
        showCurrentLocation={true}
      />
      
      <button type="submit" disabled={!location}>
        Submit Request
      </button>
    </form>
  );
}
```

### 3. Hospital Profile with Mini Map

```tsx
import Map from '../components/Map';
import { getDirectionsUrl } from '../lib/geo';

export function HospitalProfile({ hospital }) {
  return (
    <div>
      <h1>{hospital.name}</h1>
      
      {/* Mini map showing hospital location */}
      <Map
        center={hospital.location}
        zoom={17}
        markers={[{
          id: 'hospital',
          position: hospital.location,
          title: hospital.name,
          description: hospital.address
        }]}
        height="h-64"
      />
      
      {/* Directions button */}
      <a href={getDirectionsUrl(hospital.location)} target="_blank">
        Get Directions
      </a>
    </div>
  );
}
```

## Privacy & Security

### Geolocation Privacy

1. **Never Auto-Request**: Geolocation only requested on explicit user action
2. **Permission Checking**: Display permission denied errors clearly
3. **Location Accuracy**: Uses general accuracy (±100m) not high-precision
4. **Storage**: Location stored locally, sent to server only when needed
5. **Audit Trail**: Track location sharing in database (future)

### API Key Security

1. **Environment Variable**: API key in `.env.local`, never committed
2. **Domain Restriction**: API key restricted to your domain in Google Cloud
3. **API Restrictions**: Restrict API to Maps JS API only
4. **Rate Limiting**: Implement rate limiting on location queries

### Database Schema (Future)

```sql
-- Track location sharing for audit
CREATE TABLE location_shares (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES auth.users,
  shared_at TIMESTAMP DEFAULT NOW(),
  shared_by TEXT,  -- 'donor', 'recipient', 'hospital'
  location_lat FLOAT,
  location_lng FLOAT,
  ip_address INET
);
```

## Error Handling

### Geolocation Errors

```typescript
const { error, permissionDenied, coords } = useGeolocation();

if (permissionDenied) {
  // Show: "Enable location in settings"
}

if (error && !permissionDenied) {
  // Show: "Location unavailable. Check your connection."
}

if (coords) {
  // Use coordinates
}
```

### Map Loading Errors

```typescript
const { hasValidKey, error, isLoading } = useMapLoader();

if (isLoading) {
  // Show spinner
}

if (!hasValidKey) {
  // Show MapPlaceholder with fallback UI
}

if (error) {
  // Show error state with retry button
}
```

## Performance Considerations

### Distance Calculations

- Haversine formula runs client-side (no network)
- Calculate only when needed (on user filter/sort)
- Cache results in React state
- For 1000+ items, consider Web Worker

### Map Rendering

- Limit markers to ~50 on screen (use clustering for more)
- Use `fitBounds` only when necessary
- Implement marker clustering for large datasets
- Consider lazy loading markers outside viewport

### API Quota

- Free tier: 25,000 loads/day
- Track API usage in Google Cloud Console
- Implement rate limiting client-side
- Consider caching geocoding results

## Roadmap

### Phase 1 (Complete ✅)
- [x] Geolocation hook with permission handling
- [x] Map loader with fallback
- [x] Distance calculation utilities
- [x] Map component with markers
- [x] MapPicker for location selection
- [x] LocationBadge for distance display

### Phase 2 (In Progress)
- [ ] Integrate MapPicker into forms
- [ ] Update search pages with distance/map toggle
- [ ] Add location to donor/hospital profiles
- [ ] Implement marker clustering

### Phase 3 (Future)
- [ ] Places Autocomplete for address search
- [ ] Reverse geocoding for address display
- [ ] Audit logging for location sharing
- [ ] Distance-based sorting algorithms
- [ ] Heatmaps for hotspot detection
- [ ] Route optimization for blood drives

## Troubleshooting

### Map Not Loading

1. Check `NEXT_PUBLIC_MAP_API_KEY` is set
2. Verify API key is valid in Google Cloud Console
3. Check domain is whitelisted
4. Look at browser console for errors

### Geolocation Not Working

1. Check if browser supports geolocation
2. Verify user granted permission
3. Check HTTPS is enabled (required for geolocation)
4. Try incognito window (check browser extensions)

### Distance Calculations Wrong

1. Verify coordinates format: `{ lat: number, lng: number }`
2. Check lat/lng bounds: lat [-90, 90], lng [-180, 180]
3. Distance returned in kilometers
4. Accuracy affected by GPS signal quality

## Resources

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [React Google Maps](https://react-google-maps-api-docs.web.app/)

## Support

For issues or questions:
1. Check browser console for errors
2. Review environment configuration
3. Test with dummy API key first
4. Consult this guide's troubleshooting section
