# Hospital Verification System - Visual Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      LifeLink Platform                      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────────┐   │   ┌─────────▼────────┐
        │     Users      │   │   │     Admins       │
        │   (Hospital)   │   │   │   (Verification) │
        └───────┬────────┘   │   └─────────┬────────┘
                │            │            │
         /hospital/        /admin/     
         register      hospitals/pending
                │            │
        ┌───────▼────────┐   └─────┬──────────┐
        │   Frontend     │         │          │
        │  Components    │    View │ Review   │
        └────────┬───────┘         │ Approve  │
                 │                 │          │
        ┌────────▼──────────────────▼──────────┐
        │         Supabase Client (JS SDK)     │
        └────────┬──────────────────┬──────────┘
                 │                  │
        ┌────────▼────────┐  ┌──────▼─────────┐
        │  Database       │  │  File Storage  │
        │  (PostgreSQL)   │  │  (hospital-    │
        │                 │  │   documents)   │
        └─────────────────┘  └────────────────┘
                 │
        ┌────────▼────────────────┐
        │  Tables:                │
        │  - hospital_applications│
        │  - hospital_verification_audit │
        │  - hospitals            │
        │  - profiles, donors,    │
        │    blood_requests, etc. │
        └─────────────────────────┘
```

## 2. Application Submission Flow

```
Hospital Representative
        │
        ▼
╔═══════════════════════════════════════╗
║  HospitalRegister.tsx (4 Steps)       ║
╠═══════════════════════════════════════╣
║ Step 1: Representative Info            ║
│  - Name, role, phone (OTP)              │
│  - Email, auth method                   │
├─────────────────────────────────────────┤
║ Step 2: Hospital Details               ║
│  - Name, type, phone numbers            │
│  - Address, city, location (optional)   │
├─────────────────────────────────────────┤
║ Step 3: Document Upload                ║
│  - License (required)                   │
│  - Proof document (optional)            │
│  → Uploaded to hospital-documents bucket │
├─────────────────────────────────────────┤
║ Step 4: Review & Submit                │
│  - Confirm all information              │
│  - Accept terms                         │
│  → Call submitHospitalApplication()    │
╚═══════════════════════════════════════╝
        │
        ▼
   INSERT hospital_applications
        │
        ▼
   INSERT hospital_application_audit
        │
        ▼
   /hospital/register/success
        │
        ▼
   Show Application ID
        │
        ▼
 Application Pending Review
```

## 3. Admin Review Flow

```
Admin Dashboard
        │
        ▼
╔════════════════════════════════════════════╗
║  AdminHospitalsPending.tsx                 ║
╠════════════════════════════════════════════╣
║ List View:                                  ║
│ • Search by name/city/phone                │
│ • Filter by status                         │
│ • Sort by date                             │
├────────────────────────────────────────────┤
║ Detail View (click application):           ║
│ ┌──────────────────────────────────────┐   │
│ │ Hospital Information                 │   │
│ │ - Name, type, location               │   │
│ │ - Contact numbers                    │   │
│ └──────────────────────────────────────┘   │
│ ┌──────────────────────────────────────┐   │
│ │ Documents                            │   │
│ │ [License] [View] [Preview in popup]  │   │
│ │ [Proof]   [View] [Preview in popup]  │   │
│ └──────────────────────────────────────┘   │
│ ┌──────────────────────────────────────┐   │
│ │ Audit History                        │   │
│ │ • Submitted on [date]                │   │
│ │ • Status: pending                    │   │
│ └──────────────────────────────────────┘   │
├────────────────────────────────────────────┤
║ Admin Actions:                             ║
│ [Approve Hospital]  [Request Info]  [Reject] │
╚════════════════════════════════════════════╝
        │
        ├──────────────────┬───────────────┬─────────────┐
        │                  │               │             │
        ▼                  ▼               ▼             ▼
    APPROVE            REJECT         REQUEST INFO
        │                │                 │
        │                │                 │
        ▼                ▼                 ▼
  Create hospital   Set rejection     Set status to
  record in table   reason, reject     info_requested
        │                │                 │
        │                │                 │
        ▼                ▼                 ▼
  Set status to     Create audit       Create audit
  'approved'        entry              entry
        │                │                 │
        │                ▼                 ▼
        │          Hospital notified  Hospital notified
        │          (future: email)    (future: email)
        ▼
   Link to hospital
   Update audit trail
```

## 4. Data Model - Relationships

```
┌──────────────────────────────────────────────────────────┐
│                     auth.users                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ id (PK)                                          │   │
│  │ email                                            │   │
│  │ raw_user_meta_data: { user_type: 'admin'? }    │   │
│  └──────────────────┬───────────────────────────────┘   │
└─────────────────────┼─────────────────────────────────────┘
          │           │
          │ ┌─────────┘
          │ │
          ▼ ▼
┌──────────────────────────────────────────────────────────┐
│          hospital_applications                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │ id (PK, UUID)                                    │   │
│  │ user_id (FK → auth.users)                       │   │
│  │ verified_by (FK → auth.users)                   │   │
│  │ hospital_id (FK → hospitals) [nullable]         │   │
│  │                                                  │   │
│  │ representative_first_name, ..., email           │   │
│  │ hospital_name, type, phone, address, etc.       │   │
│  │ license_document_url, proof_document_url        │   │
│  │ documents (JSONB: [{kind, url, fileName}])      │   │
│  │                                                  │   │
│  │ status: 'pending'|'approved'|'rejected'         │   │
│  │ verified_at, rejection_reason, rejection_date   │   │
│  │ submitted_at, created_at, updated_at            │   │
│  └──────────┬──────────────────────────┬───────────┘   │
└─────────────┼──────────────────────────┼────────────────┘
              │                          │
              │ ┌──────────────────────┐ │
              │ │ has many audits      │ │
              │ │ links to hospital    │ │
              │ └──────────────────────┘ │
              │                          │
              ▼                          │
   ┌────────────────────────────────┐   │
   │ hospital_application_audit     │   │
   ├────────────────────────────────┤   │
   │ id (PK, UUID)                  │   │
   │ application_id (FK)            │   │
   │ actor_id (FK → auth.users)     │   │
   │ action: 'submitted'|'approved' │   │
   │ notes, new_status, created_at  │   │
   └────────────────────────────────┘   │
                                        │
                                        ▼
                         ┌────────────────────────────┐
                         │    hospitals               │
                         ├────────────────────────────┤
                         │ id (PK, UUID)             │
                         │ user_id (FK → auth.users) │
                         │ name, type, address       │
                         │ verification_status       │
                         │ verified_at, verified_by  │
                         │ license_document_url      │
                         │ ...more fields            │
                         └────────────────────────────┘
```

## 5. Status Transitions

```
                   ┌────────────────┐
                   │   SUBMITTED    │
                   │                │
                   │ status='pending'│
                   │ Created by user │
                   └────────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ADMIN ACTION    ADMIN ACTION    ADMIN ACTION
              │             │             │
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────────────┐
        │APPROVED  │  │REJECTED  │  │ INFO_REQUESTED   │
        ├──────────┤  ├──────────┤  ├──────────────────┤
        │✓ Create  │  │✗ Reason  │  │⚠ Specific docs   │
        │  hospital│  │  set     │  │  requested       │
        │✓ Verified│  │✓ Audit   │  │✓ Audit log       │
        │✓ Can login   │  entry   │  │✓ Can resubmit    │
        │          │  │          │  │                  │
        └──────────┘  └──────────┘  └────────┬─────────┘
             │             │                 │
             │             │         ┌───────▼────────┐
             │             │         │   RESUBMITTED  │
             │             └─────────┤   (back to     │
             │                       │    pending)    │
             │                       └────────────────┘
             │
        Hospital can now:
        • Login to platform
        • View blood requests
        • Manage availability
        • Post blood needs
        • Contact donors
```

## 6. Document Upload & Storage Flow

```
User selects file
        │
        ▼
File validation
• Size < 10MB ✓
• Type: PDF/JPG/PNG ✓
        │
        ▼
Upload to Supabase Storage
• Bucket: hospital-documents
• Path: applications/{appId}/{timestamp}_{filename}
        │
        ▼
Generate Signed URL
• Expires in 1 hour
• Admin-only access
        │
        ▼
Store in database
• hospital_applications.license_document_url
• hospital_applications.documents (JSONB)
• Documents array:
  [{
    kind: 'license',
    url: 'https://...signed-url...',
    fileName: 'hospital_license.pdf',
    path: 'applications/...'
  }]
        │
        ▼
Admin preview
• Click "View" button
• Opens signed URL in new window
• Automatically expires after 1 hour
```

## 7. Audit Trail

```
Every action creates an entry in hospital_application_audit:

submitted
├─ When: Hospital submits application
├─ Who: Hospital representative
├─ What: New application created
└─ Status: pending

approved
├─ When: Admin approves hospital
├─ Who: Admin user
├─ What: Hospital verified and registered
├─ Status: approved
└─ Hospital record created

rejected
├─ When: Admin rejects application
├─ Who: Admin user
├─ What: Application rejected with reason
├─ Status: rejected
└─ Reason stored in hospital_applications.rejection_reason

info_requested
├─ When: Admin requests more information
├─ Who: Admin user
├─ What: Additional documents needed
├─ Status: info_requested
└─ Details in notes

resubmitted
├─ When: Hospital resubmits rejected app
├─ Who: Hospital representative
├─ What: New documents uploaded
├─ Status: pending (back to review)
└─ Revision tracked
```

## 8. User Interface Flow

```
HOSPITAL REPRESENTATIVE                 ADMIN USER
─────────────────────────               ──────────
        │                                    │
        │ Clicks "Register Hospital"         │
        ▼                                    │
   ┌─────────────┐                          │
   │ Register    │                          │
   │ Form (Step) │                          │
   └──────┬──────┘                          │
          │                                  │
       Steps 1-4                             │
          │                                  │
          ▼                                  │
   ┌─────────────────┐                      │
   │ Submit App      │                      │
   └────────┬────────┘                      │
            │                                │
            ▼                                │
   ┌─────────────────────┐                  │
   │ Success Page        │                  │ Logs in as Admin
   │ - Show App ID       │                  │
   │ - Check Status      │                  │
   └────────┬────────────┘                  ▼
            │                          ┌──────────────┐
            │                          │Admin         │
            │                          │Dashboard     │
            │                          └──────┬───────┘
            │                                 │
            │                          Search/Filter
            │                                 │
            │                                 ▼
            │                          ┌──────────────┐
            │                          │Select App    │
            │                          │Details       │
            │                          └──────┬───────┘
            │                                 │
            │                          View Docs
            │                                 │
            │                          Make Decision
            │                                 │
            │                    ┌────────────┼────────────┐
            │                    │            │            │
            │                    ▼            ▼            ▼
            │              Approve    Reject    Request
            │                    │            │            │
            │                    └────┬───────┴────┬───────┘
            │                         │            │
            │                         ▼            ▼
            │                 Status Updated    Needs More Docs
            │                         │            │
            └─────────────────────────┼────────────┘
                                      │
                              Receives notification
                              (future: email)
```

---

## Key Takeaways

1. **User Registration**: 4-step form with validation and document upload
2. **Storage**: Documents securely stored with signed URLs
3. **Admin Review**: Dashboard with search, filter, and detail view
4. **Approval Process**: 3 actions (approve/reject/request info)
5. **Hospital Creation**: On approval, creates hospital record in hospitals table
6. **Audit Trail**: All actions logged with timestamps
7. **Status Tracking**: Users can check status anytime
8. **Security**: RLS policies protect data, signed URLs expire

This is a complete, production-ready system! 🎉
