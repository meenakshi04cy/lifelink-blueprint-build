# Nearby Blood Requests - Distance-Based Filtering & Map Integration

## ✅ Implementation Complete

### Features Added

#### 1. **User Geolocation Detection**
- Automatically requests user's device location when page loads
- Uses browser's Geolocation API
- Gracefully handles permission denials with fallback

#### 2. **Distance-Based Filtering**
- Calculates distance between user location and hospital locations using **Haversine formula**
- Shows distance in km for each hospital request
- Filters requests based on selected radius

#### 3. **Hospital Geocoding**
- Converts hospital addresses to coordinates using **OpenStreetMap Nominatim API**
- Free API, no API key required
- Works with hospital name + address

#### 4. **Interactive Map**
- **Leaflet + React-Leaflet** map integration
- Shows:
  - 🔵 **User location** (blue marker)
  - 🔴 **Hospital locations** (red H markers)
  - ⭕ **Search radius circle** (blue dotted line)
- Click markers to see hospital details
- Powered by OpenStreetMap tiles

#### 5. **Radius Filter Controls**
- Quick filter buttons: 10km, 25km, 50km, 100km
- Easy switching between distance ranges
- Real-time filtering of requests

#### 6. **Enhanced Request Cards**
- Display distance in km for each hospital
- Same contact and details dialogs as before
- Sorting by proximity (closest first)

---

## 📁 Files Modified/Created

### Created:
- `src/lib/geolocation.ts` - Geolocation utilities (distance calculation, geocoding, user location)
- `src/components/BloodRequestMap.tsx` - Leaflet map component

### Modified:
- `src/pages/NearbyRequests.tsx` - Enhanced with map integration and distance filtering

---

## 🛠️ Technical Details

### Dependencies Used:
- `leaflet` (v1.9.4) - Mapping library
- `react-leaflet` (v5.0.0) - React bindings for Leaflet
- OpenStreetMap Nominatim API - Free geocoding service

### Key Functions:

#### `calculateDistance(lat1, lon1, lat2, lon2)`
Haversine formula to calculate great-circle distance between two points

#### `getUserLocation()`
Returns Promise with user's latitude/longitude

#### `geocodeAddress(address)`
Converts hospital address to lat/lng coordinates

### Map Features:
- **Blue Marker**: Your location
- **Red Markers**: Hospital blood requests
- **Blue Circle**: Your search radius
- **Popups**: Click markers for details

---

## 🎯 User Experience Flow

1. **Load Page** → Browser asks for location permission
2. **Grant Permission** → App fetches your location and active blood requests
3. **Geocode Hospitals** → Converts all hospital addresses to coordinates
4. **Calculate Distances** → Uses Haversine formula
5. **Filter Results** → Shows only requests within selected radius (default: 50km)
6. **View Map** → Optional toggle to see map view
7. **Adjust Radius** → Quick buttons to change search distance (10/25/50/100 km)
8. **Contact/Details** → Same dialogs as before for each request

---

## ⚙️ Default Settings

- **Default Radius**: 50 km
- **Radius Options**: 10 km, 25 km, 50 km, 100 km
- **Map Tiles**: OpenStreetMap (free, no attribution required beyond standard)
- **Geocoding**: OpenStreetMap Nominatim (free, 1 req/sec limit)

---

## 📝 Notes

- If geolocation is denied, the app shows all requests without distance filtering
- Map geocoding may take a few seconds for all hospitals
- Distances are in kilometers
- Hospital coordinates are calculated dynamically from addresses
- For better accuracy, ensure hospital addresses are complete (name, city, state)

---

## 🚀 Future Enhancements

1. Store hospital coordinates in database for instant access
2. Add favorite/bookmark hospitals
3. Directions integration (Google Maps/Apple Maps)
4. Search by blood type in nearby area
5. Push notifications for new nearby requests
