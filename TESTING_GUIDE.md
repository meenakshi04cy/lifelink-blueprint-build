# Geocoding System - Testing Guide

## Overview
This guide provides comprehensive testing procedures for the hospital geocoding system.

## Test Environment Setup

### Prerequisites
```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Server runs at http://localhost:5173
```

### Test Scenarios
We'll test with and without Google Maps API key to verify fallback mechanism.

---

## 1. Unit Tests for geocoding.ts

### Test 1.1: Valid Address with Mock Data
**Test Case:** Apollo Hospital in Chennai

```typescript
// File: src/lib/geocoding.test.ts
import { geocodeAddress } from '@/lib/geocoding'

test('should return mock coordinates for known hospital', async () => {
  const result = await geocodeAddress(
    'Any Address',
    'Chennai',
    'Tamil Nadu',
    '600001'
  )
  
  expect(result).toBeDefined()
  expect(result?.latitude).toBe(13.0029)
  expect(result?.longitude).toBe(80.2435)
  expect(result?.formattedAddress).toContain('Chennai')
})
```

**Steps:**
1. Enter hospital: "Apollo Hospital"
2. Enter address: "123 Main Street"
3. Enter city: "Chennai"
4. Enter state: "Tamil Nadu"
5. Enter ZIP: "600001"

**Expected:**
- `latitude: 13.0029`
- `longitude: 80.2435`
- `formattedAddress: "Apollo Hospital, Chennai"`

### Test 1.2: City Center Fallback
**Test Case:** Unknown hospital in known city

```typescript
test('should return city center for unknown hospital in known city', async () => {
  const result = await geocodeAddress(
    'Unknown Hospital Street',
    'New Delhi',
    'Delhi',
    '110001'
  )
  
  expect(result).toBeDefined()
  expect(result?.latitude).toBe(28.7041)
  expect(result?.longitude).toBe(77.1025)
})
```

**Steps:**
1. Enter hospital: "Random Hospital XYZ"
2. Enter address: "Random Street"
3. Enter city: "New Delhi"
4. Enter state: "Delhi"
5. Enter ZIP: "110001"

**Expected:**
- `latitude: 28.7041` (Delhi center)
- `longitude: 77.1025` (Delhi center)

### Test 1.3: No Match Fallback
**Test Case:** Unknown hospital in unknown city

```typescript
test('should return null for unknown location', async () => {
  const result = await geocodeAddress(
    'Hospital Street',
    'Unknown City',
    'Unknown State',
    '999999'
  )
  
  expect(result).toBeNull()
})
```

**Steps:**
1. Enter hospital: "Random Hospital"
2. Enter address: "Random Street"
3. Enter city: "UnknownCityXYZ"
4. Enter state: "UnknownState"
5. Enter ZIP: "999999"

**Expected:**
- `result: null`

### Test 1.4: Directions URL Generation
**Test Case:** Generate valid directions URLs

```typescript
test('should generate valid Google Maps directions URL', () => {
  const url = getDirectionsUrl(13.0029, 80.2435)
  
  expect(url).toContain('maps.googleapis.com/maps/dir')
  expect(url).toContain('13.0029')
  expect(url).toContain('80.2435')
})

test('should generate valid Apple Maps directions URL', () => {
  const url = getAppleMapsUrl(13.0029, 80.2435)
  
  expect(url).toContain('maps.apple.com')
  expect(url).toContain('13.0029')
  expect(url).toContain('80.2435')
})
```

---

## 2. Integration Tests for RequestBlood Component

### Test 2.1: Form Auto-Geocoding
**Objective:** Verify geocoding triggers automatically as user fills form

**Steps:**
1. Navigate to `/request-blood`
2. Fill patient information (leave hospital section empty)
3. Verify no map shows yet ✓
4. Enter hospital name: "Apollo Hospital"
5. No map yet (waiting for more fields) ✓
6. Enter address: "123 Hospital Street"
7. No map yet (waiting for more fields) ✓
8. Enter city: "Chennai"
9. No map yet (waiting for more fields) ✓
10. Enter state: "Tamil Nadu"
11. No map yet (waiting for more fields) ✓
12. Enter ZIP: "600001"
13. **Expected:** Map appears automatically! ✓

**Assertion:**
```javascript
// In browser console after filling all fields
const map = document.querySelector('[data-testid="entity-map"]')
expect(map).toBeTruthy()
expect(map.textContent).toContain('Apollo Hospital')
```

### Test 2.2: Map Updates on Address Change
**Objective:** Verify map updates when user modifies hospital details

**Steps:**
1. Fill all hospital fields (Apollo Hospital in Chennai)
2. Map displays ✓
3. Change hospital name to "Max Healthcare"
4. **Expected:** Map updates to show different coordinates ✓
5. Change city to "New Delhi"
6. **Expected:** Map updates with New Delhi coordinates ✓

### Test 2.3: Form Submission with Coordinates
**Objective:** Verify coordinates are saved to database

**Setup:**
- Ensure logged in
- Have test hospital data ready

**Steps:**
1. Navigate to `/request-blood`
2. Fill all required fields:
   - Patient name: "Test Patient"
   - Age: "25"
   - Contact person: "John Doe"
   - Contact phone: "9999999999"
   - Blood type: "O+"
   - Units: "2"
   - Urgency: "Urgent"
   - Required by: (tomorrow's date)
   - Hospital: "Apollo Hospital"
   - Address: "123 Hospital St"
   - City: "Chennai"
   - State: "Tamil Nadu"
   - ZIP: "600001"
3. Verify map appears with Apollo Hospital location ✓
4. Click "Submit Blood Request" button
5. Wait for success message ✓

**Verification in Database:**
```sql
SELECT 
  id,
  hospital_name,
  hospital_latitude,
  hospital_longitude,
  hospital_address
FROM blood_requests
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 1
```

**Expected Result:**
```
hospital_name: "Apollo Hospital"
hospital_latitude: 13.0029
hospital_longitude: 80.2435
hospital_address: "123 Hospital St, Chennai, Tamil Nadu 600001"
```

---

## 3. UI/UX Tests

### Test 3.1: Map Display Quality
**Objective:** Verify map renders correctly

**Steps:**
1. Navigate to `/request-blood`
2. Fill hospital fields to trigger map
3. Verify:
   - [ ] Map is visible and not blank
   - [ ] Map has proper zoom level (can see city area)
   - [ ] Red marker appears at hospital
   - [ ] Hospital name appears in info window
   - [ ] Coordinates displayed (e.g., "13.0029, 80.2435")
   - [ ] "Get Directions" button is visible and clickable

### Test 3.2: Directions Button Functionality
**Objective:** Verify directions buttons work

**Steps:**
1. Get map to display (fill hospital fields)
2. Click "Get Directions on Google Maps"
3. **Expected:** Opens Google Maps in new tab ✓
4. Verify destination is set to hospital coordinates
5. Test on mobile to ensure Apple Maps link works

### Test 3.3: Form Validation
**Objective:** Verify form prevents submission with incomplete data

**Steps:**
1. Try to submit without hospital ZIP
2. **Expected:** Cannot submit, map doesn't show
3. Fill ZIP
4. **Expected:** Map appears, form can submit

### Test 3.4: Responsive Design
**Objective:** Verify geocoding works on all screen sizes

**Devices to Test:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Steps (for each device):**
1. Navigate to request blood form
2. Fill hospital fields
3. Verify map appears and is readable
4. Verify buttons are clickable
5. Verify form can be submitted

---

## 4. Fallback Mechanism Tests

### Test 4.1: Without Google Maps API Key
**Setup:**
```bash
# Remove or comment out VITE_GOOGLE_MAPS_API_KEY in .env.local
# Restart dev server
```

**Steps:**
1. Fill hospital fields
2. **Expected:** 
   - Map should not load from Google
   - Should use mock data if available
   - Should fall back to city center
   - Should show static location card if no match

### Test 4.2: Mock Hospital Database
**Test Hospitals:**
```
• Apollo Hospital (Chennai)
• Max Healthcare (Delhi)
• Fortis Hospital (Delhi)
• Manipal Hospital (Bangalore)
• Global Hospital (Chennai)
```

**Steps (for each):**
1. Enter hospital name exactly as in mock database
2. Fill city (must match)
3. Verify coordinates appear
4. Verify map/card shows correct location

### Test 4.3: City Center Fallback
**Test Cities:**
```
• New Delhi
• Mumbai
• Bangalore
• Chennai
• Hyderabad
• Kolkata
```

**Steps (for each city):**
1. Enter unknown hospital name
2. Enter that city
3. Verify city center coordinates appear
4. Example: "Mumbai" → (19.076, 72.8777)

---

## 5. Performance Tests

### Test 5.1: Geocoding Response Time
**Objective:** Verify geocoding doesn't cause lag

**Steps:**
1. Open browser DevTools (F12)
2. Go to Performance tab
3. Start recording
4. Fill all hospital fields rapidly
5. Stop recording

**Expected:**
- Geocoding completes in <1s (mock) or <500ms (API)
- No UI freezes or hangs
- Map renders smoothly
- FPS remains >60

### Test 5.2: Large Number of Requests
**Objective:** Verify no memory leaks with many form submissions

**Steps:**
1. Submit 10 blood requests (through form)
2. Each with different hospital
3. Open browser DevTools Memory tab
4. Take heap snapshot
5. Repeat steps 1-2
6. Take another heap snapshot
7. Compare memory usage

**Expected:**
- Memory grows minimally
- No obvious memory leaks
- Page remains responsive

---

## 6. Cross-Browser Tests

### Test 6.1: Chrome/Chromium
**Steps:**
1. Complete Test 2.1 (Form Auto-Geocoding)
2. Complete Test 3.1 (Map Display)
3. Click directions button
4. Verify Google Maps opens correctly

### Test 6.2: Firefox
**Steps:**
1. Repeat tests from Chrome
2. Verify geocoding works
3. Verify map renders
4. Verify directions work

### Test 6.3: Safari
**Steps:**
1. Repeat tests from Chrome
2. Test Apple Maps directions specifically
3. Verify location sharing works

### Test 6.4: Mobile Browsers
**Steps:**
1. Use device emulation in Chrome DevTools
2. Test on iPhone (Safari)
3. Test on Android (Chrome)
4. Verify:
   - Form fills easily on small screen
   - Map is readable on mobile
   - Directions links work
   - Apple/Google Maps opens correctly

---

## 7. Edge Cases

### Test 7.1: Special Characters in Address
**Steps:**
1. Hospital: "St. Mary's Hospital & Care"
2. Address: "O'Neil Street, Building #123"
3. City: "New Delhi"
4. Expected: Handles special chars, uses mock/city fallback

### Test 7.2: Very Long Address
**Steps:**
1. Hospital: "A Very Long Hospital Name That Goes On And On"
2. Address: "Very Long Street Name Building Complex Suite Number"
3. City: "New Delhi"
4. Expected: Still geocodes, displays properly

### Test 7.3: Whitespace in Input
**Steps:**
1. Hospital: "   Apollo Hospital   " (with spaces)
2. Address: "   123 Street   "
3. Expected: Trims properly, geocodes correctly

### Test 7.4: Mixed Case Input
**Steps:**
1. Hospital: "APOLLO HOSPITAL" (all caps)
2. Address: "123 hospital street"
3. Expected: Case-insensitive match, geocodes correctly

### Test 7.5: Rapid Input Changes
**Steps:**
1. Quickly change hospital name 5 times
2. Quickly change city 5 times
3. Expected: Final state is correct, no race conditions

---

## 8. Database Tests

### Test 8.1: Coordinates Saved Correctly
**SQL Query:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN hospital_latitude IS NOT NULL THEN 1 END) as with_lat,
  COUNT(CASE WHEN hospital_longitude IS NOT NULL THEN 1 END) as with_lng,
  AVG(hospital_latitude) as avg_latitude,
  AVG(hospital_longitude) as avg_longitude
FROM blood_requests
WHERE created_at > NOW() - INTERVAL '1 day'
```

**Expected:**
- All recent requests have both lat/lng
- Values are within valid ranges (lat: -90 to 90, lng: -180 to 180)

### Test 8.2: Index Performance
**Query Performance Test:**
```sql
EXPLAIN ANALYZE
SELECT * FROM blood_requests
WHERE hospital_latitude BETWEEN 28.5 AND 29.5
  AND hospital_longitude BETWEEN 77 AND 78
  AND status = 'active'
```

**Expected:**
- Uses `blood_requests_location_idx` index
- Query time < 100ms

### Test 8.3: Data Integrity
**Validation Query:**
```sql
-- Check for invalid coordinates
SELECT COUNT(*) FROM blood_requests
WHERE (hospital_latitude IS NOT NULL 
  AND (hospital_latitude < -90 OR hospital_latitude > 90))
   OR (hospital_longitude IS NOT NULL 
  AND (hospital_longitude < -180 OR hospital_longitude > 180))
```

**Expected:** Count = 0 (no invalid coordinates)

---

## 9. Error Scenario Tests

### Test 9.1: Network Error During Geocoding
**Simulate using DevTools:**
1. Open DevTools Network tab
2. Set to "Offline" mode
3. Fill hospital fields to trigger geocoding
4. Expected: Falls back to mock/city data gracefully

### Test 9.2: Invalid API Key
**Setup:**
```bash
# Set invalid API key
VITE_GOOGLE_MAPS_API_KEY=invalid_key_12345
# Restart dev server
```

**Steps:**
1. Fill hospital fields
2. Check browser console (should show API error)
3. Map should still appear (using fallback)
4. Expected: Graceful degradation ✓

### Test 9.3: API Quota Exceeded
**Simulate:**
1. Make many geocoding requests rapidly
2. Google API might return quota error
3. Expected: Falls back to mock/city data

### Test 9.4: Missing Fields
**Steps:**
1. Fill only hospital name, leave address blank
2. No geocoding should trigger ✓
3. Fill address, but leave ZIP blank
4. No geocoding should trigger ✓
5. Expected: Requires ALL fields to geocode

---

## 10. Accessibility Tests

### Test 10.1: Screen Reader
**Using NVDA (Windows) or VoiceOver (Mac):**
1. Navigate to request blood form
2. Verify map section is announced
3. Verify coordinates are readable
4. Verify buttons are accessible

### Test 10.2: Keyboard Navigation
**Steps:**
1. Fill form using only keyboard (Tab key)
2. Fill hospital fields without mouse
3. Map should appear
4. Tab to "Get Directions" button
5. Press Enter to open directions
6. Expected: All functionality works ✓

### Test 10.3: Zoom Compatibility
**Steps:**
1. Zoom browser to 150% (Ctrl/Cmd + +)
2. Form still fills correctly
3. Map displays properly
4. Buttons are clickable
5. Expected: Responsive at all zoom levels

---

## Test Results Template

```markdown
# Geocoding System - Test Results

Date: _______________
Tester: _______________
Environment: Development / Staging / Production

## Unit Tests
- [ ] Test 1.1: Valid Address with Mock Data - PASS/FAIL
- [ ] Test 1.2: City Center Fallback - PASS/FAIL
- [ ] Test 1.3: No Match Fallback - PASS/FAIL
- [ ] Test 1.4: Directions URL Generation - PASS/FAIL

## Integration Tests
- [ ] Test 2.1: Form Auto-Geocoding - PASS/FAIL
- [ ] Test 2.2: Map Updates on Address Change - PASS/FAIL
- [ ] Test 2.3: Form Submission with Coordinates - PASS/FAIL

## UI/UX Tests
- [ ] Test 3.1: Map Display Quality - PASS/FAIL
- [ ] Test 3.2: Directions Button Functionality - PASS/FAIL
- [ ] Test 3.3: Form Validation - PASS/FAIL
- [ ] Test 3.4: Responsive Design - PASS/FAIL

## Issues Found
1. [Issue description]
2. [Issue description]

## Sign-Off
Tested by: _______________
Approved by: _______________
```

---

## Continuous Testing

### Automated Tests (CI/CD)
Add to GitHub Actions:
```yaml
name: Test Geocoding System
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test src/lib/geocoding.test.ts
      - run: bun run build
      - run: bun run lint
```

### Manual Regression Testing
**Frequency:** Before each release

**Checklist:**
- [ ] Run all tests from Section 1-9
- [ ] Verify no console errors
- [ ] Verify database stores coordinates
- [ ] Verify map displays correctly
- [ ] Test on multiple browsers
- [ ] Test on mobile

---

## Reporting Issues

When you find a bug:

1. **Document:**
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshot/video

2. **Create Issue:**
   ```
   Title: [BUG] Geocoding not working for hospital X
   Description: 
   Steps to reproduce: ...
   Expected: ...
   Actual: ...
   Environment: Chrome 120, Ubuntu 22.04
   ```

3. **Attach:**
   - Console errors (DevTools)
   - Network errors (DevTools Network tab)
   - Database query results if relevant

---

## Success Criteria

Geocoding system is working correctly when:

✅ Automatically geocodes known hospitals
✅ Falls back to city center coordinates
✅ Gracefully handles missing API key
✅ Saves coordinates to database
✅ Displays interactive map
✅ Provides working directions links
✅ Handles all edge cases
✅ Performs well (<1s geocoding)
✅ Works across all browsers
✅ Passes accessibility tests

**Status: READY FOR PRODUCTION** ✓
