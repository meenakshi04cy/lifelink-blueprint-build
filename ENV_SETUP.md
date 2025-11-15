# Environment Configuration for Geocoding

## Google Maps API Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API (if doing server-side geocoding)

### 2. Generate API Key
1. Go to **Credentials** in Google Cloud Console
2. Click **Create Credentials** → **API Key**
3. Restrict the key to:
   - **Application restrictions:** HTTP referrers
   - **API restrictions:** 
     - Maps JavaScript API
     - Geocoding API

### 3. Configure Environment
Add to `.env.local`:
```
VITE_GOOGLE_MAPS_API_KEY=your_generated_api_key_here
```

### 4. Verify Setup
- Open browser DevTools
- Check Network tab for `maps.googleapis.com` requests
- Check Console for any API errors

## Database Migration

### Apply Geocoding Migration
The migration adds location columns to the blood_requests table.

**For Local Development:**
```bash
# Using Supabase CLI
supabase migration list
supabase db pull  # Sync latest schema
```

**For Production:**
```bash
# The migration file is at:
# supabase/migrations/20251112_add_hospital_location.sql

# This will be auto-applied by Supabase when pushed
supabase push
```

### Verify Migration
Check that these columns exist in `blood_requests` table:
- `hospital_latitude` (DECIMAL(10, 8))
- `hospital_longitude` (DECIMAL(11, 8))

## Testing Configuration

### 1. Local Testing with Mock Data
No API key needed! The system will use mock hospital data:
- Test hospitals: Apollo, Max Healthcare, Fortis, Manipal, Global
- Test cities: Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata

### 2. Testing with Real API
Requires Google Maps API key configured:
```bash
# Add to .env.local
VITE_GOOGLE_MAPS_API_KEY=your_key

# Start dev server
bun run dev
```

### 3. Test Cases
```typescript
// Test 1: Known hospital (uses mock data)
- Enter hospital: "Apollo Hospital"
- Enter address: "Any Address"
- Enter city: "Chennai"
- Expected: Shows Chennai coordinates (13.0029, 80.2435)

// Test 2: Known city (uses city center)
- Enter hospital: "Unknown Hospital"
- Enter city: "Mumbai"
- Expected: Shows Mumbai center (19.076, 72.8777)

// Test 3: Real geocoding (requires API key)
- Enter hospital: "AIIMS Hospital"
- Enter address: "Ansari Nagar"
- Enter city: "New Delhi"
- Expected: Real geocoded coordinates from Google Maps
```

## Production Considerations

### Cost Management
- **Google Maps API:** Pay-as-you-go, ~$7 per 1000 requests
- **Recommended:** Set API quota limits in Google Cloud Console

### Performance
- Add caching layer for repeated addresses
- Use Redis or browser LocalStorage for recent geocodes

### Security
1. Restrict API key to domain only
2. Never commit `.env` files with real keys
3. Use environment variables in CI/CD

### Monitoring
- Monitor Google Cloud Console quota usage
- Set up alerts for unusual API usage
- Log geocoding errors for debugging

## Troubleshooting

### Issue: "Maps API not loaded"
**Solution:** 
- Verify API key in `.env.local`
- Check browser console for CORS errors
- Ensure Maps JavaScript API is enabled in Google Cloud

### Issue: "Coordinates not saving"
**Solution:**
- Run migration: `supabase db push`
- Check Supabase RLS policies
- Verify coordinates are passed to `insert()` call

### Issue: Using fallback instead of real geocoding
**Solution:**
- This is expected if Google Maps API is not available
- Fallback provides acceptable UX with mock/city center data

## Development Workflow

```bash
# 1. Clone repository
git clone ...
cd lifelink-blueprint-build

# 2. Install dependencies
bun install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local and add your Google Maps API key

# 4. Apply database migrations
supabase migration list

# 5. Start development server
bun run dev

# 6. Test at http://localhost:5173/request-blood
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy

on: [push]

env:
  VITE_GOOGLE_MAPS_API_KEY: ${{ secrets.GOOGLE_MAPS_API_KEY }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run deploy
```

## Support Resources

- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [Supabase Documentation](https://supabase.com/docs)
- [LifeLink GitHub Issues](https://github.com/your-repo/issues)
