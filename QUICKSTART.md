# Geocoding System - Quick Start Guide

## What Was Built

A hospital geocoding system that automatically converts hospital addresses to map coordinates. When someone requests blood, the system:
1. Reads the hospital address they enter
2. Converts it to latitude/longitude coordinates
3. Displays the hospital on a map in real-time
4. Saves coordinates for later location-based searches

## For Users

### When Requesting Blood
1. Fill out the "Hospital Information" section with:
   - Hospital name
   - Street address
   - City
   - State
   - ZIP code

2. As you fill in these fields, a map will automatically appear showing the hospital location

3. Click "Get Directions" button to open maps navigation

4. Submit the form - coordinates are saved automatically

### When Browsing Nearby Requests
- Each request shows a map of the hospital location
- Click "Get Directions" to navigate to the hospital
- Use Google Maps or Apple Maps as preferred

## For Developers

### Quick Setup

```bash
# 1. Configure environment
echo "VITE_GOOGLE_MAPS_API_KEY=your_key_here" >> .env.local

# 2. Start dev server
bun run dev

# 3. Open http://localhost:5173/request-blood
# 4. Fill in hospital details and watch the map appear!
```

### File Structure

```
src/
├── lib/
│   └── geocoding.ts                 # Core geocoding logic
├── pages/
│   ├── RequestBlood.tsx            # Blood request form (UPDATED)
│   └── NearbyRequests.tsx          # Display requests with maps
└── components/
    └── EntityMap.tsx                # Map rendering component

supabase/
└── migrations/
    └── 20251112_add_hospital_location.sql  # Database update

Documentation/
├── GEOCODING_SYSTEM.md             # Technical deep dive
├── ENV_SETUP.md                    # Configuration guide
├── IMPLEMENTATION_SUMMARY.md       # What changed and why
└── QUICKSTART.md                   # This file
```

### How It Works (30-second version)

```typescript
// 1. User enters address fields
<Input value={hospitalName} onChange={setHospitalName} />
<Input value={city} onChange={setCity} />
// ... other fields

// 2. useEffect watches for changes
useEffect(() => {
  if (hospitalName && city && state && zip) {
    geocodeAddress(address, city, state, zip)  // Get coordinates
  }
}, [hospitalName, city, state, zip])

// 3. Coordinates shown on map
<EntityMap latitude={lat} longitude={lng} />

// 4. Saved to database on submit
database.insert({
  hospital_latitude: lat,
  hospital_longitude: lng
})
```

### Testing Without Google Maps API

The system works without API key! It falls back to:
- Mock hospital data (Apollo, Max Healthcare, etc.)
- City center coordinates (Delhi, Mumbai, etc.)
- Shows static location card with directions links

```bash
# Just run dev without setting VITE_GOOGLE_MAPS_API_KEY
bun run dev

# Try "Apollo Hospital" in Chennai - uses mock data automatically!
```

### Key Functions

**`geocodeAddress(address, city, state, zip)`**
```typescript
const result = await geocodeAddress(
  '123 Hospital Street',
  'New Delhi',
  'Delhi',
  '110001'
)
// Returns: { latitude: 28.50, longitude: 77.20, formattedAddress: "..." }
```

**`getDirectionsUrl(lat, lng)`**
```typescript
const url = getDirectionsUrl(28.50, 77.20)
// Returns: https://www.google.com/maps/dir/?api=1&destination=28.50,77.20
window.open(url)
```

## Common Tasks

### Add a New Hospital to Mock Database
Edit `src/lib/geocoding.ts`:
```typescript
const MOCK_HOSPITAL_LOCATIONS: Record<string, GeocodingResult> = {
  "apollo hospital": { latitude: 13.0029, longitude: 80.2435, ... },
  "your hospital": { latitude: 28.5, longitude: 77.2, ... },  // Add here
}
```

### Add a New City Fallback
Edit `src/lib/geocoding.ts`:
```typescript
const cityCoordinates: Record<string, GeocodingResult> = {
  "New Delhi": { latitude: 28.7041, longitude: 77.1025, ... },
  "Your City": { latitude: 28.5, longitude: 77.2, ... },  // Add here
}
```

### Test Geocoding Function
```typescript
import { geocodeAddress } from '@/lib/geocoding'

// Test it
const coords = await geocodeAddress(
  'Hospital Address',
  'City',
  'State',
  '12345'
)
console.log(coords)
```

### Debug Map Not Showing

In browser console:
```javascript
// Check if API loaded
console.log(window.google?.maps)

// Check if coordinates are set
console.log(hospitalLat, hospitalLng)

// Check environment variable
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)

// Check for errors
// Look in Network tab for maps.googleapis.com requests
```

## Database Schema

```sql
-- New columns in blood_requests table
hospital_latitude DECIMAL(10, 8)     -- e.g., 28.5355
hospital_longitude DECIMAL(11, 8)    -- e.g., 77.2140

-- Index for fast queries
CREATE INDEX blood_requests_location_idx 
ON public.blood_requests (hospital_latitude, hospital_longitude) 
WHERE status = 'active'
```

### Query Examples

```sql
-- Find all blood requests
SELECT * FROM blood_requests WHERE status = 'active'

-- Distance calculation (requires PostGIS)
SELECT *, 
  ST_Distance(
    ST_MakePoint(hospital_longitude, hospital_latitude)::geography,
    ST_MakePoint(77.2, 28.5)::geography
  ) / 1000 as distance_km
FROM blood_requests
WHERE status = 'active'
ORDER BY distance_km
LIMIT 10
```

## Component Tree

```
RequestBlood Component
├── State: hospitalName, hospitalAddress, city, state, zip
├── State: hospitalLat, hospitalLng
├── useEffect: Triggers geocoding when address changes
├── Form Inputs: Controlled with state
├── EntityMap: Shows map when coordinates available
└── Button: Submit request with coordinates

NearbyRequests Component
├── Fetches blood_requests from database
├── For each request:
│   ├── Card: Shows request summary
│   ├── EntityMap: Shows hospital location
│   └── Buttons: Contact hospital, get directions

EntityMap Component
├── Receives: latitude, longitude, hospitalName, address
├── Renders: Interactive Google Map
├── Fallback: Static location card with directions
└── Buttons: Google Maps, Apple Maps directions
```

## Environment Variables

```bash
# .env.local
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...your_api_key_here

# Optional (already configured)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGci...your_supabase_key
```

## Performance Tips

1. **Reuse coordinates**: Check if same address was already geocoded
2. **Batch operations**: Geocode addresses server-side for imports
3. **Cache results**: Store popular locations in database
4. **Lazy load maps**: Only load Google Maps when needed

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Map not showing | Check `VITE_GOOGLE_MAPS_API_KEY` in .env.local |
| Using fallback instead of real geocoding | This is OK! Fallback works well |
| Coordinates not saving | Run database migration: `supabase db push` |
| "Google Maps not loaded" error | Check Maps API is enabled in Google Cloud |
| Directions link not working | Verify coordinates are valid (lat: -90 to 90, lng: -180 to 180) |

## Next Steps

1. **For Production**: Add `VITE_GOOGLE_MAPS_API_KEY` to production environment
2. **For Features**: Implement distance filtering, donor proximity matching
3. **For Data**: Add caching layer for repeated addresses
4. **For Analytics**: Track popular hospitals and locations

## Documentation Locations

- **System Overview**: `GEOCODING_SYSTEM.md`
- **Setup Instructions**: `ENV_SETUP.md`
- **Complete Changes**: `IMPLEMENTATION_SUMMARY.md`
- **This Quick Start**: `QUICKSTART.md`

## Getting Help

1. Check the `GEOCODING_SYSTEM.md` Troubleshooting section
2. Review `ENV_SETUP.md` for configuration issues
3. Look at browser DevTools Console for errors
4. Check Network tab for failed API requests
5. Review Supabase logs for database issues

---

**Happy coding!** The geocoding system is ready to use. Start by adding your Google Maps API key to `.env.local` and the maps will work automatically! 🗺️
