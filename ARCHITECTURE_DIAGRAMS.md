# Geocoding System - Architecture Diagrams

## 1. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                                                                   │
│  Hospital Information Section                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Hospital Name:      [Apollo Hospital        ]           │    │
│  │ Address:            [123 Hospital Street    ]           │    │
│  │ City:               [New Delhi              ]           │    │
│  │ State:              [Delhi                  ]           │    │
│  │ ZIP:                [110001                 ]           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            ↓                                      │
│                  [Geocoding Triggered]                           │
│                            ↓                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          Hospital Location Map Display                  │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │                                                 │   │    │
│  │  │  [Google Map with Hospital Marker]              │   │    │
│  │  │                                                 │   │    │
│  │  │  📍 Apollo Hospital, New Delhi                  │   │    │
│  │  │  28.5670, 77.2570                              │   │    │
│  │  │                                                 │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  │  [Get Directions on Google Maps]                       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            ↓                                      │
│              [Submit Blood Request Button]                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │    Geocoding Service (lib/geocoding)   │
        │                                        │
        │  1. Parse Address Components           │
        │  2. Try Google Maps API                │
        │  3. Fall back to Mock Hospital DB      │
        │  4. Fall back to City Center           │
        │  5. Return Coordinates                 │
        └───────────────────────────────────────┘
                      ↓↓↓
        ┌─────────────────────────────────────────────────────┐
        │          Three-Level Geocoding Fallback             │
        │                                                      │
        │  Level 1: Google Maps Geocoding API                 │
        │  ┌──────────────────────────────────────────────┐  │
        │  │ POST maps.googleapis.com/geocode             │  │
        │  │ Query: "123 Hospital St, New Delhi, Delhi"  │  │
        │  │ Response: {lat: 28.567, lng: 77.257}        │  │
        │  └──────────────────────────────────────────────┘  │
        │           ↓ (if fails or no API key)               │
        │                                                      │
        │  Level 2: Mock Hospital Database                    │
        │  ┌──────────────────────────────────────────────┐  │
        │  │ "apollo hospital" → (13.0029, 80.2435)      │  │
        │  │ "max healthcare" → (28.5355, 77.2145)       │  │
        │  │ "fortis hospital" → (28.5355, 77.2145)      │  │
        │  └──────────────────────────────────────────────┘  │
        │           ↓ (if no match)                           │
        │                                                      │
        │  Level 3: City Center Coordinates                   │
        │  ┌──────────────────────────────────────────────┐  │
        │  │ "New Delhi" → (28.7041, 77.1025)            │  │
        │  │ "Mumbai" → (19.076, 72.8777)                │  │
        │  │ "Bangalore" → (12.9716, 77.5946)            │  │
        │  └──────────────────────────────────────────────┘  │
        │           ↓ (if no match)                           │
        │                                                      │
        │  Fallback: Return null (no valid location)          │
        └─────────────────────────────────────────────────────┘
                      ↓↓↓
        ┌───────────────────────────────────────────┐
        │   Update React State                      │
        │   ┌───────────────────────────────────┐   │
        │   │ setHospitalLat(latitude)          │   │
        │   │ setHospitalLng(longitude)         │   │
        │   │ setHospitalAddress(formatted)     │   │
        │   └───────────────────────────────────┘   │
        └───────────────────────────────────────────┘
                      ↓↓↓
        ┌───────────────────────────────────────────┐
        │   EntityMap Component Re-renders          │
        │   (Shows interactive Google Map)          │
        └───────────────────────────────────────────┘
                      ↓↓↓
        ┌───────────────────────────────────────────┐
        │   Form Submission                         │
        │                                           │
        │   blood_requests.insert({                 │
        │     patient_name: ...,                    │
        │     blood_type: ...,                      │
        │     hospital_latitude: 28.567,            │
        │     hospital_longitude: 77.257,           │
        │     ...                                   │
        │   })                                      │
        └───────────────────────────────────────────┘
                      ↓↓↓
        ┌───────────────────────────────────────────┐
        │   Database Storage                        │
        │   ┌─────────────────────────────────────┐ │
        │   │ blood_requests                      │ │
        │   │ ┌─────────────────────────────────┐ │ │
        │   │ │ id: uuid                        │ │ │
        │   │ │ hospital_latitude: 28.567       │ │ │
        │   │ │ hospital_longitude: 77.257      │ │ │
        │   │ │ hospital_name: "Apollo..."      │ │ │
        │   │ │ ...other fields...              │ │ │
        │   │ └─────────────────────────────────┘ │ │
        │   └─────────────────────────────────────┘ │
        └───────────────────────────────────────────┘
```

## 2. Component Architecture

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  RequestBlood.tsx (Page)                                  │
│  ├─ State Management                                      │
│  │  ├─ hospitalName: string                              │
│  │  ├─ hospitalAddressInput: string                      │
│  │  ├─ city: string                                      │
│  │  ├─ state: string                                     │
│  │  ├─ zip: string                                       │
│  │  ├─ hospitalLat: number | null                        │
│  │  └─ hospitalLng: number | null                        │
│  │                                                        │
│  ├─ Effects                                              │
│  │  ├─ useEffect (auth): Fetch user session             │
│  │  └─ useEffect (geocoding): Trigger geocoding         │
│  │                   when address fields change         │
│  │                                                        │
│  ├─ Handlers                                             │
│  │  ├─ handleSubmit: Form submission                    │
│  │  ├─ setHospitalName: Update state                    │
│  │  ├─ setCity: Update state                            │
│  │  └─ etc.                                              │
│  │                                                        │
│  └─ Render                                               │
│     ├─ Form Inputs                                      │
│     │  ├─ Input: Hospital Name                         │
│     │  ├─ Input: Address                               │
│     │  ├─ Input: City                                  │
│     │  ├─ Input: State                                 │
│     │  └─ Input: ZIP                                   │
│     │                                                   │
│     ├─ EntityMap (when coordinates available)          │
│     │  ├─ Props: latitude, longitude                   │
│     │  ├─ Props: hospitalName, address                │
│     │  └─ Renders: Google Map with marker              │
│     │                                                   │
│     └─ Button: Submit                                  │
│                                                        │
└────────────────────────────────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │   lib/geocoding.ts             │
        │                                │
        │   Functions:                   │
        │   ├─ geocodeAddress()          │
        │   ├─ getDirectionsUrl()        │
        │   └─ getAppleMapsUrl()         │
        │                                │
        │   Data:                        │
        │   ├─ MOCK_HOSPITAL_LOCATIONS   │
        │   └─ cityCoordinates           │
        └────────────────────────────────┘
                         ↓
        ┌────────────────────────────────┐
        │   EntityMap.tsx (Component)    │
        │                                │
        │   Props:                       │
        │   ├─ latitude: number          │
        │   ├─ longitude: number         │
        │   ├─ hospitalName: string      │
        │   ├─ address: string           │
        │   ├─ height: string (CSS)      │
        │   └─ zoom: number              │
        │                                │
        │   Renders:                     │
        │   ├─ Google Map (interactive)  │
        │   ├─ Marker (hospital)         │
        │   ├─ Info Window               │
        │   ├─ Directions Button         │
        │   └─ Fallback UI (if no API)   │
        └────────────────────────────────┘
```

## 3. Geocoding Process Flow

```
START: User fills hospital form
  │
  └─→ Hospital Name: "Apollo Hospital"
  │   Address: "123 Hospital Street"
  │   City: "New Delhi"
  │   State: "Delhi"
  │   ZIP: "110001"
  │
  ├─→ useEffect Detects Change
  │
  ├─→ Check if all fields filled: YES
  │
  ├─→ Call geocodeAddress()
  │
  ├─→ DECISION POINT 1: Is VITE_GOOGLE_MAPS_API_KEY set?
  │
  ├─ YES ────→ Try Google Maps Geocoding API
  │  │        Query: "123 Hospital Street, New Delhi, Delhi 110001"
  │  │        
  │  ├─→ DECISION POINT 2: API Response Success?
  │  │
  │  ├─ YES ────→ Return {latitude: 28.567, longitude: 77.257}
  │  │           └─→ NEXT: EntityMap renders
  │  │
  │  └─ NO ─────→ Fall through to Level 2
  │
  ├─ NO ─────→ SKIP API, go to Level 2
  │
  ├─→ LEVEL 2: Check Mock Hospital Database
  │  │        Search: "apollo hospital" in MOCK_HOSPITAL_LOCATIONS
  │  │
  │  ├─→ DECISION POINT 3: Hospital found in mock data?
  │  │
  │  ├─ YES ────→ Return {latitude: 13.0029, longitude: 80.2435}
  │  │           └─→ NEXT: EntityMap renders
  │  │
  │  └─ NO ─────→ Fall through to Level 3
  │
  ├─→ LEVEL 3: Check City Center Database
  │  │        Search: "New Delhi" in cityCoordinates
  │  │
  │  ├─→ DECISION POINT 4: City found in database?
  │  │
  │  ├─ YES ────→ Return {latitude: 28.7041, longitude: 77.1025}
  │  │           └─→ NEXT: EntityMap renders
  │  │
  │  └─ NO ─────→ Return null
  │
  └─→ END: Update state with coordinates or null

RESULT:
  ├─ If coordinates: EntityMap shows interactive map
  ├─ If null: EntityMap shows fallback card
  └─ User submits form with coordinates saved to database
```

## 4. Database Schema Diagram

```
blood_requests Table (Before)
┌──────────────────────────────────┐
│ Column               │ Type       │
├──────────────────────────────────┤
│ id                  │ UUID (PK)  │
│ user_id             │ UUID (FK)  │
│ patient_name        │ TEXT       │
│ blood_type          │ TEXT       │
│ units_needed        │ INTEGER    │
│ hospital_name       │ TEXT       │
│ hospital_address    │ TEXT       │
│ contact_number      │ TEXT       │
│ urgency_level       │ TEXT       │
│ required_by         │ DATE       │
│ medical_reason      │ TEXT       │
│ status              │ TEXT       │
│ visibility_*        │ BOOLEAN    │
│ created_at          │ TIMESTAMP  │
│ updated_at          │ TIMESTAMP  │
└──────────────────────────────────┘


blood_requests Table (After)
┌──────────────────────────────────────┐
│ Column               │ Type           │
├──────────────────────────────────────┤
│ ... (all previous columns)           │
├──────────────────────────────────────┤
│ hospital_latitude   │ DECIMAL(10,8)  │ ← NEW
│ hospital_longitude  │ DECIMAL(11,8)  │ ← NEW
│ ... (all previous columns)           │
└──────────────────────────────────────┘

Indexes:
┌────────────────────────────────────────────────────┐
│ blood_requests_location_idx                        │
│ ON (hospital_latitude, hospital_longitude)         │
│ WHERE status = 'active'                            │
└────────────────────────────────────────────────────┘
```

## 5. Fallback Priority

```
┌─────────────────────────────────────────────────┐
│  User enters hospital address                   │
│                                                  │
│  PRIMARY: Google Maps Geocoding API             │
│  ┌──────────────────────────────────────────┐  │
│  │ Requirements: API Key + Network + Quota  │  │
│  │ Accuracy: Best (usually street-level)    │  │
│  │ Speed: ~300-500ms                        │  │
│  │ Cost: ~$0.007 per request                │  │
│  └──────────────────────────────────────────┘  │
│           ↓ (if unavailable or fails)          │
│                                                  │
│  SECONDARY: Mock Hospital Database              │
│  ┌──────────────────────────────────────────┐  │
│  │ Requirements: None (data in code)        │  │
│  │ Accuracy: Good (pre-configured locations)│  │
│  │ Speed: <1ms                              │  │
│  │ Cost: Free                               │  │
│  │ Coverage: ~5 major hospitals             │  │
│  └──────────────────────────────────────────┘  │
│           ↓ (if hospital not in mock data)     │
│                                                  │
│  TERTIARY: City Center Coordinates              │
│  ┌──────────────────────────────────────────┐  │
│  │ Requirements: None (data in code)        │  │
│  │ Accuracy: Fair (city center)             │  │
│  │ Speed: <1ms                              │  │
│  │ Cost: Free                               │  │
│  │ Coverage: 7 major Indian cities          │  │
│  └──────────────────────────────────────────┘  │
│           ↓ (if city not in database)          │
│                                                  │
│  NO LOCATION: Return null                      │
│  Show: Static location card with address only  │
│  User can: Still enter form and submit         │
│                                                  │
└─────────────────────────────────────────────────┘
```

## 6. Error Handling Flow

```
START: geocodeAddress()
  │
  ├─→ Validate Input
  │  └─→ Check: address && city && state && zip
  │     └─→ If missing: Return null
  │
  ├─→ Try Google Maps API
  │  ├─→ Check API Key exists
  │  ├─→ Make HTTP Request
  │  │
  │  ├─→ CATCH ERRORS:
  │  │  ├─ Network Error → Log warning, fall through
  │  │  ├─ Invalid API Key → Log warning, fall through
  │  │  ├─ Rate Limited → Log warning, fall through
  │  │  ├─ No Results → Continue to Level 2
  │  │  └─ JSON Parse Error → Log warning, fall through
  │  │
  │  └─→ Success: Return result
  │
  ├─→ Try Mock Hospital Database
  │  ├─→ Search hospital name in database
  │  ├─→ Match found: Return result
  │  └─→ No match: Continue to Level 3
  │
  ├─→ Try City Center Database
  │  ├─→ Search city name in database
  │  ├─→ Match found: Return result
  │  └─→ No match: Fall through
  │
  ├─→ Return null (no location found)
  │
  └─→ Handle in Component:
     ├─ If coordinates: Show EntityMap with map
     └─ If null: Show EntityMap fallback card
```

## 7. User Journey Map

```
┌────────────────────────────────────────────────────────────┐
│                    REQUEST BLOOD FLOW                      │
│                                                            │
│  START                                                     │
│    ↓                                                       │
│  [Login/Signup]                                            │
│    ↓                                                       │
│  [Navigate to Request Blood]                              │
│    ↓                                                       │
│  [Fill Patient Information]                               │
│    ├─ Patient Name                                        │
│    ├─ Age                                                 │
│    ├─ Contact Person                                      │
│    ├─ Contact Phone                                       │
│    └─ Contact Email                                       │
│    ↓                                                       │
│  [Fill Blood Requirements]                                │
│    ├─ Blood Type (A+, O-, etc.)                          │
│    ├─ Units Required                                      │
│    ├─ Urgency Level (Critical/Urgent/Normal)             │
│    └─ Required By Date                                    │
│    ↓                                                       │
│  [Fill Hospital Information] ← GEOCODING HAPPENS HERE    │
│    ├─ Hospital Name                                       │
│    │  └─→ User types "Apollo Hospital"                    │
│    │      Geocoding watches...                            │
│    │                                                       │
│    ├─ Address                                             │
│    │  └─→ User types street address                       │
│    │      Geocoding checks if all fields filled...        │
│    │                                                       │
│    ├─ City                                                │
│    │  └─→ User types "Chennai"                            │
│    │      More checks...                                  │
│    │                                                       │
│    ├─ State                                               │
│    │  └─→ User types "Tamil Nadu"                         │
│    │      Almost there...                                 │
│    │                                                       │
│    └─ ZIP                                                 │
│       └─→ User types "600001"                             │
│           ALL FIELDS FILLED!                              │
│           ↓                                                │
│           [Geocoding Triggered]                           │
│           ↓                                                │
│           [Check Google Maps API]                         │
│           ├─ Yes → Use real coordinates                  │
│           ├─ No → Check mock database                    │
│           │       └─ Found "apollo hospital"            │
│           │           Return mock coordinates             │
│           └─ Success: Coordinates = 13.0029, 80.2435    │
│           ↓                                                │
│           [Update State]                                  │
│           └─ hospitalLat = 13.0029                       │
│              hospitalLng = 80.2435                       │
│           ↓                                                │
│           [EntityMap Re-renders]                         │
│           └─ Show Google Map                             │
│              With marker at coordinates                   │
│    ↓                                                       │
│  [Map Displays] ✓ Visual confirmation!                   │
│    ├─ Shows hospital location                            │
│    ├─ "Apollo Hospital, Chennai"                         │
│    ├─ [Get Directions on Google Maps] button             │
│    └─ User can verify location is correct               │
│    ↓                                                       │
│  [Optional: Adjust if needed]                            │
│    └─ Can modify any field, geocoding updates map       │
│    ↓                                                       │
│  [Review Request Summary]                                │
│    └─ Patient name, blood type, hospital, etc.          │
│    ↓                                                       │
│  [Submit Blood Request]                                   │
│    └─ DATABASE INSERT:                                   │
│       blood_requests {                                   │
│         patient_name: "...",                             │
│         blood_type: "O+",                                │
│         units_needed: 2,                                 │
│         hospital_name: "Apollo Hospital",                │
│         hospital_address: "..., Chennai, ...",           │
│         hospital_latitude: 13.0029,    ← SAVED!         │
│         hospital_longitude: 80.2435,   ← SAVED!         │
│         ...                                              │
│       }                                                   │
│    ↓                                                       │
│  [Success Toast]                                         │
│    "Your blood request has been submitted!"              │
│    ↓                                                       │
│  [Redirect to Home]                                       │
│    ↓                                                       │
│  END ✓                                                    │
│                                                            │
│  REQUEST IS NOW VISIBLE ON:                              │
│  • NearbyRequests page (with hospital location shown)    │
│  • Donors can see the hospital location on a map        │
│  • Donors can get directions to the hospital            │
│  • Distance calculations possible with donor location   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

These diagrams provide visual understanding of:
- How data flows through the system
- Component relationships and data passing
- The three-level geocoding fallback mechanism
- Database schema changes
- User experience and journey
- Error handling approach
