# 🗺️ Nearby Requests - User Guide

## Quick Overview

The **Nearby Requests** page shows all active blood donation requests from hospitals around you. You can:
- ✅ View request details
- ✅ Call the hospital directly
- ✅ See hospital location on a map
- ✅ Get directions to the hospital

---

## 🎯 How to Use Each Feature

### 1. Browse Blood Requests

When you open the Nearby Requests page, you'll see a list of active blood requests with:
- **Patient Name** - Who needs blood
- **Hospital Name** - Which hospital
- **Blood Type** - Type of blood needed (O+, A-, etc.)
- **Units Needed** - How much blood is needed
- **Required By** - When blood is needed
- **Urgency** - Critical/Urgent/Normal

### 2. Contact Hospital (Call Option)

**Step 1:** Click the red "Contact Hospital" button on any request

**Step 2:** A dialog opens showing:
- Hospital name
- Patient name
- Blood type needed
- Hospital phone number
- Hospital email

**Step 3:** Click "Call Hospital" button

**Result:**
- **Desktop:** Opens your phone application or shows a dial menu
- **Mobile:** Initiates a direct call to the hospital
- **No Phone?** Shows an error message

### 3. View Hospital Location (Map Option)

**Step 1:** Click the gray "View Details" button on any request

**Step 2:** The Details dialog opens showing:
- **Hospital Location Map** with:
  - Interactive Google Map
  - Red marker at hospital location
  - Hospital name and address
  - GPS coordinates
  - "Get Directions" button

- **Request Information:**
  - Blood type needed
  - Units required
  - Urgency level
  - Request status

- **Hospital & Patient Info:**
  - Patient name
  - Hospital name
  - Full hospital address
  - Required by date

**Step 3:** To get directions:
- Click "Get Directions on Google Maps" button on the map
- **Desktop:** Opens Google Maps in new tab with directions
- **Mobile:** Opens Google Maps app with navigation to hospital

**Step 4:** To contact the hospital from details view:
- Click "Contact Hospital" button at bottom
- See phone details and call options

---

## 📱 Different Scenarios

### Scenario 1: I Want to Call the Hospital

```
1. Find the request
2. Click "Contact Hospital" button (red button)
3. See phone number in dialog
4. Click "Call Hospital" button
5. Call is initiated! 📞
```

### Scenario 2: I Want to Know Where the Hospital Is

```
1. Find the request
2. Click "View Details" button (gray button)
3. See map with hospital location 🗺️
4. Click "Get Directions" to navigate 🧭
```

### Scenario 3: I Want All Information About a Request

```
1. Find the request
2. Click "View Details" button
3. See:
   - Hospital location on map
   - Request details (blood type, units)
   - Hospital & patient information
   - Can call from this view too
```

### Scenario 4: No Phone Number Available

```
1. Click "Contact Hospital" button
2. Button shows "No Phone Available" (disabled)
3. Dialog still shows email if available
4. You cannot call, but can send email
```

---

## 🎨 Visual Indicators

### Button States

| Button | State | Meaning |
|--------|-------|---------|
| Contact Hospital | **Enabled (Red)** | Hospital phone available, clickable |
| Contact Hospital | **Disabled (Gray)** | No phone number available |
| View Details | **Enabled (Gray)** | Click to see full details & map |
| Call Hospital | **Enabled** | Phone available, ready to call |
| Get Directions | **Enabled** | Click to open maps |

### Urgency Badges

| Badge | Meaning |
|-------|---------|
| 🔴 **Destructive (Red)** | Critical - needed within 24 hours |
| ⚫ **Default (Black)** | Urgent - needed within 48 hours |
| ⚪ **Secondary (Gray)** | Normal - needed within a week |

---

## 💡 Tips & Tricks

### Mobile Users
- **Calling:** Tap "Contact Hospital" → "Call Hospital" → Direct call starts automatically
- **Navigation:** Tap "Get Directions" → Opens Maps app for turn-by-turn navigation
- **Offline:** Map may not load but phone number and details still show

### Desktop Users
- **Calling:** Click "Call Hospital" → Opens phone app or shows dial menu
- **Navigation:** Click "Get Directions" → Opens Google Maps in new tab
- **Copy:** Right-click phone number or address to copy

### For Doctors/Medical Staff
- Map shows exact hospital location with coordinates
- Call button connects directly to hospital contact number
- All request details shown for medical assessment
- Email contact available as backup

---

## ❓ Frequently Asked Questions

**Q: Can I call the hospital directly from the app?**
A: Yes! Click "Contact Hospital" then "Call Hospital" button. On mobile, it initiates a direct call. On desktop, it opens your phone app.

**Q: How do I get directions to the hospital?**
A: Click "View Details" to see the map. Then click "Get Directions" button. This opens Google Maps with the hospital location.

**Q: What if the phone number is not available?**
A: The "Contact Hospital" button will be disabled (grayed out). You can still see the hospital address and email in the dialog.

**Q: Can I see the hospital address?**
A: Yes! In the "View Details" dialog, scroll down to see the full hospital address under "Hospital & Patient Information".

**Q: Does the map work without internet?**
A: The interactive map needs internet, but you'll see the hospital details and coordinates even offline.

**Q: How do I know how urgent the request is?**
A: Look for the badge next to the patient name:
- Red badge = Critical (24 hours)
- Black badge = Urgent (48 hours)
- Gray badge = Normal (1 week)

**Q: Can I filter requests by urgency?**
A: Currently, all active requests are shown. You can scroll to find the most urgent ones (red badges).

**Q: What's the difference between "Contact" and "View Details"?**
A: 
- **Contact Hospital** = Quick phone call (go straight to calling)
- **View Details** = See complete information including map and directions

---

## 🔄 Workflow Examples

### Example 1: Donor Wants to Help with O+ Blood

1. Open Nearby Requests page
2. Look for a request needing O+ blood (red urgency badge)
3. Click "Contact Hospital" 
4. See hospital phone number
5. Click "Call Hospital"
6. Connected to hospital! Discuss donation details.

### Example 2: First-Time Donor Wants to Find Hospital

1. See an interesting blood request
2. Click "View Details"
3. See hospital location on map with red marker
4. Click "Get Directions"
5. Navigate to hospital using Google Maps
6. Find hospital location
7. Call from there using "Contact Hospital" button

### Example 3: Medical Professional Needs Full Details

1. Click "View Details" on a request
2. See map showing exact hospital location (coordinates visible)
3. See full hospital address
4. See patient requirements (blood type, units)
5. See urgency level
6. Click "Get Directions" to reach hospital
7. Click "Contact Hospital" for direct line

---

## ⚠️ Important Notes

- **Privacy:** Only contact information provided by hospitals is shown
- **Availability:** Requests shown are currently active
- **Real-time:** Page updates with new requests automatically
- **Call Quality:** Depends on your phone/internet connection
- **Navigation:** Google Maps required for directions feature
- **Emergency:** For life-threatening situations, call 911 or emergency services directly

---

## 🎯 Summary

The Nearby Requests page makes it easy to:
1. **See** what blood is needed and where
2. **Call** the hospital directly with one click
3. **Navigate** to the hospital using the map
4. **Help** save lives by responding quickly

**Ready to help?** Start by clicking on any blood request! 🩸❤️

---

**For Technical Details:** See NEARBY_REQUESTS_COMPLETE.md
**For System Overview:** See README_GEOCODING.md or GEOCODING_SYSTEM.md
