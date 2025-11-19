# Hospital Registration Verification System - Complete Setup

## Overview

This document outlines the complete hospital registration and verification workflow for the LifeLink application. The system is designed to allow hospitals to apply for registration with proper documentation, and admins to review and approve/reject applications.

## Architecture

### Database Tables

#### 1. **hospital_applications** (New Applications)
Stores initial hospital registration applications with all details:
- **representative_info**: First name, last name, role, phone, email
- **hospital_info**: Name, type, phone, emergency number, address, city, state, zip, coordinates
- **documents**: License and proof documents with URLs and paths
- **status**: `pending` → `approved` → `info_requested` | `rejected`
- **audit_trail**: Tracking of submitted and verified dates with admin info

**Status Flow:**
```
pending → approved → Hospital record created in hospitals table
       → rejected → Rejection reason stored
       → info_requested → Hospital can resubmit
```

#### 2. **hospitals** (Verified Hospitals)
Main registry table for verified hospitals:
- Contains only APPROVED hospitals
- Links to auth.users for ownership
- Stores verification status and timestamps
- Document URLs for license and proof

#### 3. **hospital_verification_audit**
Tracks all verification actions:
- Admin who made decision
- Action taken (approved/rejected/info_requested)
- Notes/reasons
- Status changes
- Timestamps

#### 4. **hospital_application_audit**
Tracks application submission history:
- Application ID
- Action (submitted, approved, rejected, resubmitted, etc.)
- Notes
- Admin information

### RLS (Row Level Security) Policies

**hospital_applications:**
- Users can view their own applications
- Admins (user_type='admin') can view all applications
- Users can insert and update their own pending applications
- Admins can update any application

**hospital_verification_audit:**
- Admins can view all audit logs
- Hospital staff can view their own hospital's audit
- Admins can insert audit logs

## Workflow Steps

### Step 1: Hospital Registration (HospitalRegister.tsx)

**4-Step Process:**

1. **Representative Information**
   - First name, last name, role
   - Phone number (OTP verification required)
   - Email address
   - Authentication method (password or OTP-only)

2. **Hospital Details**
   - Hospital name
   - Hospital type (government, private, blood-bank, NGO)
   - Official phone and emergency number
   - Complete address with city, state, ZIP
   - Optional: Location coordinates via map picker

3. **Document Upload**
   - Hospital license/registration certificate (required)
   - Proof document like utility bill (optional)
   - All files stored in 'hospital-documents' bucket with signed URLs

4. **Review & Submit**
   - Final confirmation of all details
   - Terms and conditions agreement
   - Application submitted to hospital_applications table

**Data Saved:**
```
hospital_applications {
  id: UUID (auto-generated)
  user_id: From auth.users
  representative_* fields
  hospital_* fields
  documents: JSONB array
  status: 'pending'
  submitted_at: NOW()
}
```

### Step 2: Success Page (HospitalRegisterSuccess.tsx)

**After submission:**
- Display application ID (for user reference)
- Show current verification status
- Timeline of what happens next
- Option to check status with refresh button
- Load actual status from hospital_applications table

**Statuses Displayed:**
- ✅ Pending: Application under review
- ✅ Approved: Hospital registered successfully
- ❌ Rejected: Reason provided
- ⚠️ Info Requested: Need more documents

### Step 3: Admin Review (AdminHospitalsPending.tsx)

**Admin Dashboard Features:**

1. **Application Queue**
   - List all pending applications
   - Search by hospital name, city, or phone
   - Filter by status (pending, approved, rejected, all)
   - Quick view of submitted date and hospital type

2. **Application Review**
   - Hospital information display
   - Document preview (license and proof)
   - Audit history of application
   - Admin actions panel

3. **Admin Actions** (3 options):
   - **Approve**: Creates hospital record in hospitals table
   - **Reject**: Sets rejection_reason and rejects application
   - **Request Info**: Asks hospital to provide more information

4. **Audit Trail**
   - All actions logged with timestamp
   - Admin who made decision
   - Notes/reasons for decision
   - Status changes tracked

**Approval Process:**
```
Admin clicks "Approve Hospital"
↓
Creates hospital record in hospitals table with:
  - user_id (from application)
  - hospital info (name, type, address, etc.)
  - verification_status: 'approved'
  - verified_at: NOW()
  - verified_by: admin_id
↓
Links application to hospital record (hospital_id)
↓
Creates audit entry
↓
Hospital can now access platform features
```

### Step 4: Hospital Activation

Once approved:
- Hospital record exists in hospitals table
- Status is 'approved'
- Hospital can login and access features:
  - View blood requests
  - Manage hospital profile
  - Add blood availability
  - Contact donors

## Key Functions

### In `src/lib/supabase-hospitals.ts`

**1. `uploadHospitalDoc(file, appId)`**
- Uploads file to hospital-documents bucket
- Creates signed URL for admin preview
- Returns bucket, path, and signed URL

**2. `submitHospitalApplication(data)`**
- Validates and inserts application into hospital_applications
- Creates initial audit entry
- Returns inserted application record with ID

**3. `adminSetApplicationStatus(appId, adminId, action, notes)`**
- Updates application status (approved/rejected/info_requested)
- Creates audit log entry
- Handles rejection reasons and verification timestamps

**4. `createHospitalFromApplication(applicationId, adminId)`**
- Called during approval
- Creates hospital record from application data
- Links hospital_id to application
- Sets verification_status to 'approved'

**5. `getApplicationById(applicationId)`**
- Fetches application details by ID
- Used for status checking on success page

## Email Notifications (Future Enhancement)

Should implement using Supabase Edge Functions:

**When Hospital is Approved:**
```
Subject: Your Hospital Registration is Approved - LifeLink
Body:
- Hospital name approved
- When they can start using the platform
- Login credentials reminder
- Support contact information
```

**When Hospital is Rejected:**
```
Subject: Hospital Registration - Additional Information Needed
Body:
- Specific reason for rejection
- Documents needed
- Steps to resubmit
- Support contact information
```

**When Info is Requested:**
```
Subject: Action Required - Hospital Registration Documents
Body:
- What information is needed
- Upload instructions
- Deadline for resubmission
- Support contact information
```

## Security Considerations

1. **Document Storage**
   - Files stored in hospital-documents bucket
   - Signed URLs expire after 1 hour
   - Only admins can view during review
   - Original files retained for audit

2. **RLS Policies**
   - Users can only see their own applications
   - Admins have special access to all applications
   - Audit logs properly restricted

3. **Authentication**
   - Phone OTP verification required
   - Password storage (if chosen)
   - User sessions tied to auth.users

4. **Data Validation**
   - Phone numbers validated
   - Email format checked
   - File size limits (10MB per document)
   - File type restrictions (PDF, JPG, PNG)

## Status Codes Reference

| Status | Meaning | Can Resubmit | In hospitals table |
|--------|---------|--------------|-------------------|
| pending | Under review | No | No |
| approved | Verified, active hospital | N/A | Yes |
| rejected | Not approved | Yes | No |
| info_requested | Needs more docs | Yes | No |
| expired | Too old, reapply | Yes | No |

## Testing the System

### Test Scenario 1: New Hospital Registration
1. Go to `/hospital/register`
2. Fill in all 4 steps
3. Submit application
4. See success page with application ID
5. Check status refreshes correctly

### Test Scenario 2: Admin Approval
1. Navigate to `/admin/hospitals/pending`
2. Select a pending hospital
3. Review documents
4. Click "Approve Hospital"
5. Verify hospital appears in hospitals table
6. Hospital can now login and access features

### Test Scenario 3: Admin Rejection
1. Follow scenario 2 but click "Reject"
2. Enter rejection reason
3. Confirm rejection
4. Application status shows rejected
5. Hospital can resubmit with updated documents

## File Structure

```
src/
├── pages/
│   ├── HospitalRegister.tsx          # 4-step registration form
│   ├── HospitalRegisterSuccess.tsx   # Post-submission page
│   └── AdminHospitalsPending.tsx     # Admin review dashboard
├── lib/
│   └── supabase-hospitals.ts         # Database functions
└── integrations/
    └── supabase/client.ts             # Supabase client

supabase/
└── migrations/
    └── 20251120_hospital_applications.sql  # Database schema
```

## Migration Guide

If implementing on existing database:

1. **Create new tables:**
   ```bash
   supabase migration new hospital_applications
   # Copy contents from 20251120_hospital_applications.sql
   supabase db push
   ```

2. **Update existing components:**
   - Update HospitalRegister.tsx import paths if needed
   - Ensure Supabase client is properly configured
   - Test RLS policies are working

3. **Verify setup:**
   - Check hospital-documents bucket exists in Supabase storage
   - Verify RLS policies are enabled
   - Test document upload functionality
   - Confirm admin access to review dashboard

## Next Steps

1. **Email Integration**: Set up Supabase Edge Functions for notifications
2. **Payment/Verification Fee**: If required, add payment processing
3. **Document Expiry**: Implement automatic rejection of old applications
4. **Resubmission**: Allow rejected applications to resubmit
5. **Hospital Dashboard**: Create dashboard for verified hospitals to manage profile
6. **Analytics**: Track application completion rates and approval times
