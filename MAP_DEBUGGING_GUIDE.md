# 🐛 Map Debugging Guide

## Quick Fixes to Try

### 1. **Open Browser Console** (F12)
Look for these console logs when you click "Show Map":

```
✅ Should See:
- "Initializing Leaflet map..."
- "Map initialized successfully"
- "Fitting bounds to show all locations..."
- "Adding markers... Map instance: ..."
- "User location: {latitude: X.XXX, longitude: X.XXX}"
- "Requests: N" (number of requests)
- "Cleared markers: X"
- "User marker added successfully"
- "Markers added: 1 user + N hospitals"
```

### 2. **Check Network Tab**
Map tiles should be loading:
- Look for requests to `https://tile.openstreetmap.org`
- Should see many `.png` files loading
- If NO tile requests, map can't load

### 3. **Check for Errors in Console**
Any red errors? Note them and share.

---

## Troubleshooting Checklist

| Issue | Check |
|-------|-------|
| Map shows gray/blank | Tiles not loading - check network tab |
| No markers showing | Check console for marker errors |
| Map doesn't exist | Check "mapInstance.current" in console logs |
| No location available | Check if location permission was granted |
| Map won't fit bounds | Check if hospitals have coordinates |

---

## What Each Console Log Means

### "Initializing Leaflet map..."
- Map component rendered
- Trying to create Leaflet instance

### "Map initialized successfully"
- Map created and tile layer added
- Map should show tiles on screen

### "Fitting bounds to show all locations..."
- Calculating bounds for all hospitals + you
- Map should zoom/pan to fit everything

### "Adding markers..."
- Creating user + hospital markers
- Markers should appear on map

### "User marker added successfully"
- Blue marker at your location placed

### "Markers added: 1 user + N hospitals"
- ALL markers added successfully
- Should see them on map

---

## If Nothing Shows

Try these steps in order:

1. **Check Network Tab (F12 → Network)**
   - Do you see OpenStreetMap tile requests?
   - If NO: Tiles not loading - internet issue
   - If YES: Go to step 2

2. **Refresh Page**
   - Sometimes map needs fresh render
   - Clear browser cache if stuck

3. **Check Console Logs**
   - Copy any errors and note them
   - Look for pattern in what's failing

4. **Check Browser Support**
   - Chrome/Edge/Firefox: ✅ Should work
   - Safari: ✅ Should work  
   - Mobile: May need HTTPS or localhost

5. **Verify Location**
   - Does it say "Getting your location..."?
   - If stuck there: location permission issue
   - Check browser location permissions

---

## Common Issues & Fixes

### Issue: "Map shows but no markers"
**Solution:**
- Markers might be loading with generic icons
- Check console for marker errors
- Try refreshing the page
- Check if requests have valid coordinates

### Issue: "Map shows only my location"
**Solution:**
- Hospitals may not have valid coordinates
- Check database - hospital_address may not be set
- Try changing radius to see more requests
- Geocoding may have failed - check server logs

### Issue: "Map is cut off"
**Solution:**
- Container height issue
- Refresh page
- Clear browser cache

### Issue: "Map stays blank"
**Solution:**
- Tiles not loading
- Check internet connection
- Check console for errors
- Try incognito/private window

---

## Advanced Debugging

### Check Map Object
Open console and type:
```javascript
// Check if map exists
mapInstance.current

// Check map bounds
mapContainer.getBounds()

// Check zoom level
map.getZoom()

// List all markers
map.eachLayer(l => console.log(l))
```

### Check Requests
```javascript
// See what hospitals have locations
requests.map(r => ({
  hospital: r.hospital_name,
  hasLocation: !!r.location,
  location: r.location
}))
```

---

## Still Not Working?

**Share these details:**
1. What console logs appear? (Copy them)
2. Any red errors? (Screenshot)
3. Do tiles load? (Check network tab)
4. Does location permission work? (Check status message)
5. How many requests show in list? (Should match count in logs)

This information will help debug exactly what's failing.

---

## Force Refresh Map

If stuck, try:
1. Press `Ctrl+Shift+R` (hard refresh)
2. Close and reopen browser
3. Clear site data → Settings → Storage → Clear Data
4. Try in incognito/private window

---

## Map Should Show:
✅ OpenStreetMap background  
✅ Blue marker at your location  
✅ Red markers at hospitals  
✅ Can zoom/pan with mouse  
✅ Click markers for info popups  

If missing any of these, check console logs above.
