# Hospital Location Display - Complete Guide

## What You Should See

### 1. **Your Location (Blue Marker)**
- Your current device location
- Shows as blue marker pin on the map
- Center of the search radius circle

### 2. **Hospital/Blood Bank Locations (Red Markers)**
- Each hospital/blood bank that needs blood
- Shows as **RED marker with "H" symbol**
- Appears as hospitals are geocoded
- Click any hospital marker to see details:
  - Hospital name
  - Blood type needed
  - Urgency level
  - Units needed
  - Distance from your location

### 3. **Search Radius Circle (Blue Dotted)**
- Shows your search area
- Adjustable: 10km, 25km, 50km, 100km
- Only hospitals within this radius are filtered

---

## Step-by-Step Usage

### **Step 1: Visit the Page**
```
/nearby-requests
```

### **Step 2: Allow Location Permission**
- Browser will ask for geolocation permission
- **Allow** to enable map features
- If denied, all requests still show but no map

### **Step 3: Click "Show Map View"**
- Map appears with:
  - ✓ Your location (blue marker)
  - ⏳ "Loading hospital locations..." message
  - Hospitals start appearing as they're geocoded

### **Step 4: Watch Hospital Markers Appear**
- Red hospital markers appear one by one
- Each takes ~1.2 seconds to geocode
- Number of found hospitals increases
- Distance shows once geocoded

### **Step 5: Interact with Map**
- **Click any marker** to see popup with details
- **Adjust radius** buttons to filter hospitals
- **Click hospital name in popup** to view full request details

---

## Console Logs (for Debugging)

Check browser console (F12 → Console tab) to see:

```
✓ User location: {lat: 28.5355, lng: 77.3910}
Updated: 1/5 hospitals geocoded
✓ [1/5] Geocoded Apollo Hospital: 2.3 km
Updated: 2/5 hospitals geocoded
✓ [2/5] Geocoded Max Healthcare: 3.1 km
Updated: 3/5 hospitals geocoded
...
```

---

## Troubleshooting

### **Problem: Only see your location, no hospital markers**

**Cause**: Hospitals haven't been geocoded yet
**Solution**: Wait 1-2 seconds per hospital, watch console

### **Problem: "Waiting for hospital locations..."**

**Cause**: Geocoding is slow or addresses are hard to match
**Solution**: 
- Wait longer
- Check browser console for errors
- Try different search radius

### **Problem: No blue circle around my location**

**Cause**: Map is rendering but radius line isn't visible
**Solution**: 
- Zoom out (scroll wheel)
- Pan the map to center
- Check if circle is too faint

### **Problem: Marker click does nothing**

**Cause**: onClick handler not set
**Solution**: 
- Refresh page
- Check browser console for errors

---

## Technical Details

### **How Geocoding Works**

1. Hospital name + address → OpenStreetMap Nominatim API
2. Returns latitude + longitude coordinates
3. Distance calculated using Haversine formula
4. Marker placed on map at those coordinates
5. Takes ~1.2 seconds per hospital (API rate limit)

### **Marker Information**

| Element | Meaning |
|---------|---------|
| Blue marker (your location) | Your device location |
| Red marker with "H" | Hospital/blood bank |
| Blue dotted circle | Search radius area |
| Distance in km | Calculated from your location |

### **Data Flow**

```
User visits page
    ↓
Browser asks for location
    ↓
App fetches blood requests from database
    ↓
Shows request list immediately
    ↓
Geocodes each hospital address (1.2s each)
    ↓
Calculates distances using Haversine formula
    ↓
Adds markers to map one by one
    ↓
User sees map building up in real-time
```

---

## Expected Timeline

| Time | What Happens |
|------|--------------|
| 0s | Page loads, requests appear |
| 0.5s | Map appears with your location |
| 1.2s | First hospital geocoded, 1st marker added |
| 2.4s | Second hospital geocoded, 2nd marker added |
| 3.6s | Third hospital geocoded, 3rd marker added |
| ... | Pattern continues for each hospital |

---

## Map Features

### **Default View**
- Centered on your location
- Zoom level 13 (city level)

### **Interactions**
- **Scroll** to zoom
- **Drag** to pan
- **Click markers** for popup
- **Buttons** to adjust radius

### **Appearance**
- **OpenStreetMap tiles** (free map data)
- **Light/Dark mode** (matches system)
- **Popups** on marker click

---

## If Still Not Working

1. **Check browser console** (F12)
   - Look for error messages
   - Post errors for debugging

2. **Check network tab** (F12 → Network)
   - See if Nominatim API calls succeed
   - Look for 429 errors (rate limited)

3. **Verify location permission**
   - Settings → Site permissions → Location
   - Should be "Allow"

4. **Try different browser**
   - Firefox, Chrome, Safari
   - Rule out browser issues

---

**Hospital markers WILL appear as they're geocoded! Watch the map build up in real-time.** 🗺️🏥
