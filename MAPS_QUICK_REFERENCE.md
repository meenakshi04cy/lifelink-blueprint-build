# Maps Implementation Quick Reference

## Files Created

### Hooks (2 files)
- ✅ `src/hooks/useGeolocation.ts` - Permission-based location access
- ✅ `src/hooks/useMapLoader.ts` - Dynamic Google Maps API loading

### Utilities (1 file)
- ✅ `src/lib/geo.ts` - Distance calculations, coordinate validation, helpers

### Components (4 files)
- ✅ `src/components/MapPlaceholder.tsx` - Fallback UI (loading/error/no-key)
- ✅ `src/components/Map.tsx` - Google Maps wrapper with markers
- ✅ `src/components/MapPicker.tsx` - Interactive location selector
- ✅ `src/components/LocationBadge.tsx` - Distance display badge

### Documentation (1 file)
- ✅ `MAPS_INTEGRATION.md` - Comprehensive integration guide

---

## Setup Steps

### 1. Set Environment Variable

Create or update `.env.local`:
```bash
NEXT_PUBLIC_MAP_API_KEY=your_google_maps_api_key
# Or for development/demo:
NEXT_PUBLIC_MAP_API_KEY=dummy
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "Maps JavaScript API"
4. Create an API key
5. Restrict to your domain
6. Add to `.env.local`

### 3. Common Imports

```typescript
// Hooks
import { useGeolocation } from '../hooks/useGeolocation';
import { useMapLoader } from '../hooks/useMapLoader';

// Components
import Map from '../components/Map';
import MapPicker from '../components/MapPicker';
import MapPlaceholder from '../components/MapPlaceholder';
import LocationBadge from '../components/LocationBadge';

// Utilities
import {
  calculateDistance,
  isValidCoordinate,
  parseCoordinates,
  formatCoordinates,
  getBoundingBox,
  isWithinRadius,
  sortByDistance,
  getDirectionsUrl,
  getMapUrl,
} from '../lib/geo';

// Types
import type { Coordinates, LocationData } from '../lib/geo';
import type { MapMarker, MapProps } from '../components/Map';
import type { MapPickerProps } from '../components/MapPicker';
```

---

## Component Usage Patterns

### Pattern 1: Simple Location Display

```tsx
import Map from '../components/Map';

export function LocationView() {
  return (
    <Map
      center={{ lat: 28.6139, lng: 77.2090 }}
      zoom={15}
      height="h-96"
    />
  );
}
```

### Pattern 2: With Markers

```tsx
import Map from '../components/Map';

export function DonorMap({ donors }) {
  return (
    <Map
      center={donors[0]?.location}
      markers={donors.map(d => ({
        id: d.id,
        position: d.location,
        title: d.name,
        description: d.city
      }))}
      onMarkerClick={(id) => console.log('Clicked:', id)}
    />
  );
}
```

### Pattern 3: Location Picker in Form

```tsx
import { useState } from 'react';
import MapPicker from '../components/MapPicker';

export function CreateRequest() {
  const [location, setLocation] = useState(null);

  return (
    <form>
      <MapPicker
        value={location}
        onChange={setLocation}
        showCurrentLocation={true}
      />
    </form>
  );
}
```

### Pattern 4: List with Distance

```tsx
import { useGeolocation } from '../hooks/useGeolocation';
import { sortByDistance } from '../lib/geo';
import LocationBadge from '../components/LocationBadge';

export function NearbyList({ items }) {
  const { coords } = useGeolocation();
  
  const userLoc = coords ? { 
    lat: coords.latitude, 
    lng: coords.longitude 
  } : null;
  
  const sorted = userLoc 
    ? sortByDistance(items, userLoc) 
    : items;

  return (
    <div>
      {sorted.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <LocationBadge
            city={item.city}
            location={item.location}
            userLocation={userLoc}
          />
        </div>
      ))}
    </div>
  );
}
```

### Pattern 5: Use Current Location Button

```tsx
import { useGeolocation } from '../hooks/useGeolocation';
import { Button } from '../components/ui/button';

export function GetLocationButton() {
  const { requestLocation, loading, coords, error } = useGeolocation();

  return (
    <div>
      <Button 
        onClick={requestLocation} 
        disabled={loading}
      >
        {loading ? 'Getting location...' : 'Use My Location'}
      </Button>
      
      {error && <p className="text-red-600">{error}</p>}
      {coords && <p className="text-green-600">Location acquired!</p>}
    </div>
  );
}
```

---

## Distance Calculation Examples

```typescript
import { calculateDistance, isWithinRadius, sortByDistance } from '../lib/geo';

// Calculate distance between two points
const distance = calculateDistance(
  { lat: 28.6139, lng: 77.2090 },  // Start
  { lat: 28.7041, lng: 77.1025 }   // End
);
// Result: 12.5 km

// Check if point is within radius
const nearby = isWithinRadius(
  { lat: 28.61, lng: 77.21 },      // Point
  { lat: 28.6139, lng: 77.2090 },  // Center
  5                                  // Radius in km
);
// Result: true (within 5km)

// Sort items by distance from user
const sorted = sortByDistance(donors, userLocation);
// Result: sorted array with .distance property on each item

// Items now accessible as:
sorted.forEach(donor => {
  console.log(`${donor.name} is ${donor.distance}km away`);
});
```

---

## Error Handling Patterns

### Geolocation Errors

```typescript
const { coords, error, permissionDenied, loading } = useGeolocation();

if (loading) {
  return <p>Requesting location...</p>;
}

if (permissionDenied) {
  return <p>Please enable location access in settings.</p>;
}

if (error) {
  return <p>Could not get location: {error}</p>;
}

// Use coords
```

### Map Loading Errors

```typescript
const { isLoaded, isLoading, error, hasValidKey } = useMapLoader();

if (isLoading) {
  return <MapPlaceholder type="loading" />;
}

if (!hasValidKey) {
  return <MapPlaceholder type="no-key" />;
}

if (error) {
  return <MapPlaceholder type="error" errorMessage={error} />;
}

// Use map
```

---

## Testing with Mock Data

### Mock Locations (India)

```typescript
const MOCK_LOCATIONS = {
  delhi: { lat: 28.6139, lng: 77.2090 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

// Use in tests
const distance = calculateDistance(
  MOCK_LOCATIONS.delhi,
  MOCK_LOCATIONS.mumbai
);
// Result: ~1400 km
```

---

## Performance Tips

### For Large Datasets (1000+ markers)

1. Use marker clustering
2. Implement pagination
3. Filter before rendering
4. Use bounds-based loading

```typescript
// Example: Load only visible markers
const visibleMarkers = markers.filter(m => 
  isWithinRadius(m.location, mapCenter, 50)
);
```

### For Distance Calculations

1. Calculate on client-side (fast)
2. Cache results in state
3. Update on user location change
4. Use debouncing for frequent updates

```typescript
// Example: Debounced sort
const debouncedSort = useMemo(
  () => debounce((items, center) => {
    return sortByDistance(items, center);
  }, 300),
  []
);
```

---

## Coordinate Format Reference

Always use this format:
```typescript
interface Coordinates {
  lat: number;   // -90 to 90
  lng: number;   // -180 to 180
}

// Example:
{ lat: 28.6139, lng: 77.2090 }  // ✅ Correct
{ latitude: 28.6139, longitude: 77.2090 }  // ❌ Wrong

// In geolocation hook:
coords.latitude    // ✅ From browser API
coords.longitude   // ✅ From browser API
// Convert to:
{ lat: coords.latitude, lng: coords.longitude }  // ✅ For components
```

---

## Common Tasks

### Show user location on map

```tsx
const { coords } = useGeolocation();

<Map
  center={coords ? { lat: coords.latitude, lng: coords.longitude } : defaultCenter}
  markers={coords ? [{
    id: 'user',
    position: { lat: coords.latitude, lng: coords.longitude },
    title: 'You are here'
  }] : []}
/>
```

### Find nearby items

```tsx
const { coords } = useGeolocation();

const userLoc = coords ? { lat: coords.latitude, lng: coords.longitude } : null;
const nearby = userLoc 
  ? items.filter(i => isWithinRadius(i.location, userLoc, 10))
  : [];
```

### Sort by distance

```tsx
const { coords } = useGeolocation();

const userLoc = coords ? { lat: coords.latitude, lng: coords.longitude } : null;
const sorted = userLoc ? sortByDistance(items, userLoc) : items;
```

### Get directions URL

```tsx
import { getDirectionsUrl } from '../lib/geo';

const url = getDirectionsUrl(destination, origin);
// Opens Google Maps with directions
<a href={url} target="_blank">Directions</a>
```

---

## Next Steps

### Immediate (Next Session)

1. **Integrate MapPicker into forms:**
   - `/request-blood` - Location of request
   - `/become-donor` - Donor location
   - `/hospitals/register` - Hospital location

2. **Update search pages:**
   - `/search` - Add Map/List toggle
   - `/nearby-donations` - Show distance
   - `/nearby-requests` - Show distance

3. **Update profile pages:**
   - Donor profile - Show location badge
   - Hospital profile - Show mini map

### Later (Future Sessions)

1. Places Autocomplete for address search
2. Marker clustering for large datasets
3. Audit logging for location sharing
4. Distance-based notifications
5. Route optimization algorithms

---

## Debugging

### Check API Key

```javascript
// In browser console
console.log('API Key:', process.env.NEXT_PUBLIC_MAP_API_KEY)
console.log('Google loaded:', window.google?.maps)
```

### Test Geolocation

```javascript
// In browser console
navigator.geolocation.getCurrentPosition(
  pos => console.log('Location:', pos.coords),
  err => console.error('Error:', err)
)
```

### Test Distance Calculation

```javascript
// Import and test
import { calculateDistance } from './src/lib/geo'
calculateDistance(
  { lat: 28.6139, lng: 77.2090 },
  { lat: 28.7041, lng: 77.1025 }
)
```

---

## Support Resources

- **Maps Integration Guide**: See `MAPS_INTEGRATION.md`
- **Component Examples**: Review component TSDoc comments
- **Utility Functions**: See `src/lib/geo.ts` for full API
- **Error Handling**: Check component placeholder states
