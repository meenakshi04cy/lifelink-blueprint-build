# Hospital Geocoding System Documentation

## Overview
The hospital geocoding system automatically converts hospital addresses to geographic coordinates (latitude/longitude) when a blood request is created. This enables location-based features like mapping and nearby request discovery.

## Components

### 1. Geocoding Utility (`src/lib/geocoding.ts`)
The core geocoding module that handles address-to-coordinate conversion.

#### Functions

**`geocodeAddress(address, city, state, zip)`**
- Converts a hospital address to latitude/longitude coordinates
- **Parameters:**
  - `address`: Street address of the hospital
  - `city`: City name
  - `state`: State name
  - `zip`: ZIP code
- **Returns:** `GeocodingResult | null` with latitude, longitude, and formatted address
- **Behavior:**
  1. First tries Google Maps Geocoding API if `VITE_GOOGLE_MAPS_API_KEY` is configured
  2. Falls back to mock hospital database for known hospitals
  3. Falls back to city center coordinates for recognized cities
  4. Returns `null` if no match is found

**`getDirectionsUrl(latitude, longitude)`**
- Generates a Google Maps directions URL
- Returns URL that opens Google Maps with the hospital as destination

**`getAppleMapsUrl(latitude, longitude)`**
- Generates an Apple Maps directions URL
- Returns URL that opens Apple Maps with the hospital as destination

### 2. Request Blood Page (`src/pages/RequestBlood.tsx`)
Enhanced form that automatically geocodes hospital location as user enters address details.

#### Key Features
- **Automatic Geocoding:** When user enters hospital name, address, city, state, and ZIP code, the system automatically geocodes the location
- **Real-time Map Display:** Shows hospital location on Google Map as soon as geocoding completes
- **State Management:** Uses React hooks to manage hospital location data:
  - `hospitalName`: Hospital name
  - `hospitalAddressInput`: Street address input
  - `city`, `state`, `zip`: Location details
  - `hospitalLat`, `hospitalLng`: Geocoded coordinates
- **Database Integration:** Stores coordinates in `blood_requests` table for future queries

### 3. Database Schema
New columns added to `blood_requests` table:
```sql
hospital_latitude DECIMAL(10, 8)    -- Latitude coordinate
hospital_longitude DECIMAL(11, 8)   -- Longitude coordinate
```

**Index for Performance:**
```sql
CREATE INDEX blood_requests_location_idx 
ON public.blood_requests (hospital_latitude, hospital_longitude) 
WHERE status = 'active'
```

### 4. Nearby Requests Page (`src/pages/NearbyRequests.tsx`)
Displays blood requests with hospital locations and mapping capabilities.

#### Features
- Shows hospital location on map for each request
- Provides directions links to Google Maps and Apple Maps
- Uses EntityMap component to render location data

### 5. Entity Map Component (`src/components/EntityMap.tsx`)
Reusable map component for displaying locations.

#### Features
- **Google Maps Integration:** Displays interactive map with markers
- **Fallback UI:** Shows location info with directions links if map unavailable
- **Responsive:** Supports custom height and zoom levels
- **Directions:** Buttons for Google Maps and Apple Maps navigation

## Environment Configuration

### Required Environment Variable
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

If not configured, the system will:
1. Use mock hospital data for known hospitals
2. Use city center coordinates as fallback
3. Show a static location card instead of interactive map

## Data Flow

```
User enters hospital details
         ↓
RequestBlood component captures input
         ↓
useEffect triggers geocoding
         ↓
geocodeAddress() function called
         ↓
Tries Google Maps API → Falls back to mock data → Falls back to city center
         ↓
Coordinates stored in state
         ↓
EntityMap component renders with coordinates
         ↓
Form submission saves coordinates to database
```

## Mock Hospital Database
Pre-configured hospitals for quick fallback:
- Apollo Hospital (Chennai)
- Max Healthcare (Delhi)
- Fortis Hospital (Delhi)
- Manipal Hospital (Bangalore)
- Global Hospital (Chennai)

## Known Cities with Fallback Coordinates
- New Delhi, Delhi
- Mumbai
- Bangalore
- Chennai
- Hyderabad
- Kolkata

## Integration Points

### 1. Blood Request Creation
- Hospitals are automatically geocoded before form submission
- Coordinates stored with request in database

### 2. Nearby Requests Discovery
- Uses hospital coordinates to display location-based information
- Future: Can implement distance calculation and sorting

### 3. Donor Matching
- Can calculate distance between donor location and hospital
- Enables "nearby donors" features

## Future Enhancements

1. **Geospatial Queries:** Use PostGIS extension for distance-based queries
2. **Route Optimization:** Calculate optimal routes for blood collection
3. **Real-time Updates:** Stream location changes for mobile donors
4. **Clustering:** Group nearby requests on map for better UX
5. **Search Radius:** Filter requests by distance from user location
6. **Multiple Locations:** Support multiple blood collection points per request

## Testing

### Manual Testing Checklist
- [ ] Enter hospital details and verify map appears
- [ ] Test with known hospital names (Apollo, Max Healthcare, etc.)
- [ ] Verify fallback behavior when Google Maps API is unavailable
- [ ] Check that coordinates are saved to database
- [ ] Verify directions links work on desktop and mobile
- [ ] Test with various city names

### API Testing
```javascript
// Test geocoding directly
import { geocodeAddress } from '@/lib/geocoding'

const result = await geocodeAddress(
  '123 Hospital Street',
  'New Delhi',
  'Delhi',
  '110001'
)
console.log(result) // { latitude, longitude, formattedAddress }
```

## Troubleshooting

### Map not appearing
1. Verify `VITE_GOOGLE_MAPS_API_KEY` is set
2. Check browser console for CORS errors
3. Verify API key has Maps JavaScript API enabled
4. Check that coordinates are valid

### Fallback being used instead of Google Maps
- This is expected when:
  - API key is not configured
  - Hospital address doesn't match Google's database
  - Network request fails
  - API quota exceeded

### Coordinates not saving
1. Check Supabase connection
2. Verify migration was applied: `20251112_add_hospital_location.sql`
3. Check RLS policies allow INSERT on new columns
4. Verify coordinates are being passed to database

## API References
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)
- [Supabase PostGIS](https://supabase.com/docs/guides/database/extensions/postgis)
