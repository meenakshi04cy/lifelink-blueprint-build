# Hospital Verification System - Setup Checklist

## Phase 1: Database Setup ✅

- [x] Create `hospital_applications` table
- [x] Create `hospital_application_audit` table
- [x] Add RLS policies for both tables
- [x] Create indexes for performance
- [x] Create triggers for `updated_at` columns
- [x] Ensure `hospitals` table exists with verification fields
- [x] Ensure `hospital_verification_audit` table exists

**Migration File:** `supabase/migrations/20251120_hospital_applications.sql`

**Action Items:**
```bash
# Apply migration to Supabase
supabase migration up 20251120_hospital_applications

# Verify tables exist
supabase db list-tables

# Test RLS policies
# (Create test users and verify access)
```

## Phase 2: Backend Utilities ✅

- [x] Create/update `src/lib/supabase-hospitals.ts` with:
  - `uploadHospitalDoc()` - Upload documents to storage
  - `submitHospitalApplication()` - Submit new applications
  - `adminSetApplicationStatus()` - Handle admin decisions
  - `createHospitalFromApplication()` - Create hospital record on approval
  - `getApplicationById()` - Fetch application status

**File:** `src/lib/supabase-hospitals.ts`

**Verification:**
```typescript
// Test function imports
import { 
  uploadHospitalDoc,
  submitHospitalApplication,
  createHospitalFromApplication 
} from '@/lib/supabase-hospitals';
```

## Phase 3: Frontend Components ✅

### Hospital Registration (HospitalRegister.tsx)
- [x] 4-step registration form
- [x] Document upload functionality
- [x] Form validation for all steps
- [x] Error handling and user feedback
- [x] Submit to hospital_applications table using `submitHospitalApplication()`

**Updated Features:**
- Uses `submitHospitalApplication()` instead of raw Supabase inserts
- Passes `applicationId` in redirect query parameter
- Proper error handling and user feedback

### Success Page (HospitalRegisterSuccess.tsx)
- [x] Display application ID
- [x] Load and display current status
- [x] Show status-specific messages
- [x] Refresh button to check status updates
- [x] Timeline of verification process
- [x] Display representative email

**Updated Features:**
- Fetches application data on load
- Shows real-time status updates
- Status-specific styling and icons
- Refresh button to check for updates

### Admin Dashboard (AdminHospitalsPending.tsx)
- [x] List pending applications
- [x] Search and filter functionality
- [x] Application detail view
- [x] Document preview
- [x] Audit history display
- [x] Approve/Reject/Request Info actions
- [x] Create hospital record on approval

**Updated Features:**
- Calls `createHospitalFromApplication()` when approving
- Proper error handling if hospital creation fails
- Shows warning if hospital creation fails but application approved
- Links application to created hospital

## Phase 4: Storage Configuration

- [ ] Verify 'hospital-documents' bucket exists in Supabase Storage
- [ ] Set bucket to private (admin-only access)
- [ ] Configure CORS if needed for document preview
- [ ] Test document upload and signed URL generation

**Commands:**
```bash
# Create bucket (if not exists)
supabase storage create hospital-documents

# Set bucket to private
supabase storage update hospital-documents --public=false

# Test with sample file
# Use AdminHospitalsPending.tsx to test document preview
```

## Phase 5: Environment Configuration

- [x] Ensure Supabase client is properly configured
- [x] Verify auth is working
- [x] Test database connectivity

**Check:**
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

**Environment Variables (.env or .env.local):**
```
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Phase 6: Admin User Setup

- [ ] Create admin user in Supabase Auth
- [ ] Set `user_type='admin'` in raw_user_meta_data
- [ ] Test admin access to AdminHospitalsPending.tsx

**Supabase Dashboard Steps:**
1. Go to Authentication > Users
2. Create new user with admin email
3. After creation, click user and edit
4. Add to raw_user_meta_data: `{ "user_type": "admin" }`
5. Login with admin account to verify access

## Phase 7: Testing

### Unit Tests
- [ ] Test `submitHospitalApplication()` function
- [ ] Test `createHospitalFromApplication()` function
- [ ] Test document upload function
- [ ] Test status checking

### Integration Tests
- [ ] Hospital registration flow (all 4 steps)
- [ ] Success page status loading
- [ ] Admin approval workflow
- [ ] Admin rejection workflow
- [ ] Admin info request workflow

### Manual Testing

**Test Case 1: Complete Registration**
```
1. Go to /hospital/register
2. Fill Step 1: Representative Info
   - First name: Test
   - Last name: Hospital
   - Role: Administrator
   - Phone: +919876543210 (with OTP verification)
   - Email: test@hospital.com
   - Auth method: Password or OTP-only
3. Fill Step 2: Hospital Details
   - Name: Test Hospital
   - Type: Private Hospital
   - Official Phone: +919876543210
   - Emergency: +919876543211
   - Address: 123 Medical Road
   - City: Delhi
4. Upload Documents
   - License file (required)
5. Review & Submit
6. Verify success page shows application ID
```

**Test Case 2: Admin Review & Approval**
```
1. Login as admin
2. Go to /admin/hospitals/pending
3. Select pending application
4. Review hospital details
5. View documents (click View button)
6. Click "Approve Hospital"
7. Enter approval notes
8. Confirm action
9. Verify:
   - Status changed to 'approved'
   - Hospital appears in hospitals table
   - Audit entry created
   - Application linked to hospital
```

**Test Case 3: Check Status After Approval**
```
1. Go back to success page with application ID
2. Click "Check Status" button
3. Verify status shows as 'approved'
4. Verify hospital can login and see dashboard
```

**Test Case 4: Admin Rejection**
```
1. Login as admin
2. Select pending application
3. Click "Reject"
4. Enter rejection reason
5. Confirm
6. Go to success page
7. Verify status shows 'rejected' with reason
```

## Phase 8: Email Notifications (Future)

- [ ] Set up Supabase Edge Function for approval email
- [ ] Set up Supabase Edge Function for rejection email
- [ ] Set up Supabase Edge Function for info request email
- [ ] Configure SendGrid or similar email service
- [ ] Test email delivery

**Templates Needed:**
- Approval email
- Rejection email
- Info request email

## Phase 9: Deployment

- [ ] Run `npm run build` - verify no errors
- [ ] Run linting: `npm run lint`
- [ ] Push migration to production
- [ ] Deploy frontend changes
- [ ] Test in production environment
- [ ] Monitor for errors

```bash
# Local testing
npm run dev

# Build
npm run build

# Deploy (varies by platform)
```

## Phase 10: Monitoring & Maintenance

- [ ] Set up error tracking (Sentry, Datadog, etc.)
- [ ] Monitor application submission rates
- [ ] Track admin review times
- [ ] Monitor document storage usage
- [ ] Set up automated backups
- [ ] Plan for application expiry (optional)

## Rollback Plan

If issues occur:

1. **Database:** Run migration rollback (if needed)
   ```bash
   supabase migration down
   ```

2. **Frontend:** Revert to previous version
   ```bash
   git revert <commit-hash>
   npm run build
   ```

3. **Storage:** Clear test documents if needed

## Documentation Files

- [x] `HOSPITAL_VERIFICATION_SETUP.md` - Complete workflow documentation
- [x] `HOSPITAL_VERIFICATION_CHECKLIST.md` - This file
- [ ] `ADMIN_GUIDE.md` - Admin user guide for verification
- [ ] `HOSPITAL_USER_GUIDE.md` - User guide for hospital registration
- [ ] `API_REFERENCE.md` - Function reference for developers

## Quick Links

- **Registration Form:** `/hospital/register`
- **Success Page:** `/hospital/register/success`
- **Admin Dashboard:** `/admin/hospitals/pending`
- **Database Docs:** See `HOSPITAL_VERIFICATION_SETUP.md`
- **Code:** `src/pages/HospitalRegister.tsx`, `src/pages/AdminHospitalsPending.tsx`

## Support Contacts

- **Development Issues:** Team Slack
- **Database Questions:** Supabase Support
- **Deployment Issues:** DevOps Team
- **User Support:** Support Team Email

---

**Last Updated:** November 20, 2025
**Status:** ✅ Implementation Complete - Ready for Testing
**Next Phase:** Phase 7 - Testing & Phase 8 - Email Notifications
