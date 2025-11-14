# Map Display Issue - Fixed

## Problem
When clicking "Show Map View", nothing was displayed.

## Root Causes & Fixes

### 1. **React-Leaflet Type Incompatibility**
- **Issue**: react-leaflet v5 API differs from v4; TypeScript definitions were mismatched
- **Solution**: Rewrote `BloodRequestMap.tsx` using vanilla Leaflet API with `useRef` instead of react-leaflet components
- **Result**: Map initializes properly and renders on demand

### 2. **Geocoding Rate Limiting**
- **Issue**: Nominatim API has 1 request/second rate limit; parallel requests were getting throttled/blocked
- **Solution**: Changed from `Promise.all()` (parallel) to sequential loop with 1.2 second delays
- **Result**: All hospitals get geocoded reliably

### 3. **Empty Coordinates**
- **Issue**: If geocoding failed, hospitals had lat=0, lng=0 (invalid coordinates)
- **Solution**: 
  - Added fallback message when no hospitals have valid coordinates
  - Improved error logging to track geocoding failures
  - Added User-Agent header to Nominatim API requests

### 4. **Import Path Issue**
- **Issue**: TypeScript module resolution cached the old import path
- **Solution**: Changed from `@/components/BloodRequestMap` to relative path `../components/BloodRequestMap`

## Changes Made

### `src/components/BloodRequestMap.tsx` (Rewritten)
- Uses vanilla Leaflet API with `useEffect` and `useRef`
- Properly initializes/cleans up map on mount/unmount
- Shows user location, hospital markers, and radius circle
- Displays debug info in popups

### `src/lib/geolocation.ts` (Enhanced)
- Added `delayMs` parameter for rate-limiting
- Added User-Agent header
- Improved error logging with hospital names
- Better response validation

### `src/pages/NearbyRequests.tsx` (Updated)
- Changed geocoding from parallel to sequential
- Added debug logging for tracking geocoding progress
- Added fallback UI when no hospitals available
- Fixed import path

## Testing Steps

1. ✅ Visit `/nearby-requests`
2. ✅ Allow geolocation access
3. ✅ Click "Show Map View"
4. ✅ Should see:
   - Blue marker for your location
   - Red markers for hospitals
   - Blue circle for search radius
   - Popup info when clicking markers

## Performance Notes

- Geocoding now takes longer (sequential, 1.2s per request)
- But it's reliable and won't get rate-limited
- ~1.2s delay × number of requests
- Progress can be seen in browser console

## Future Improvements

1. Store hospital coordinates in database to eliminate geocoding
2. Batch geocoding with proper queue management
3. Cache geocoding results
4. Add loading progress indicator
