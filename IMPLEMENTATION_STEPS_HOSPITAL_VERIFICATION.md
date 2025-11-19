# Hospital Verification System - Step-by-Step Implementation

## Prerequisites
- ✅ Node.js and npm installed
- ✅ Supabase project set up
- ✅ Local development environment ready
- ✅ Git repository configured

---

## Implementation Steps

### Step 1: Apply Database Migration

**Time: 5 minutes**

```bash
# Navigate to project directory
cd c:\blood_donation\lifelink-blueprint-build

# Push migration to Supabase
supabase db push

# Verify tables were created
supabase db list-tables
```

**Expected Output:**
```
- hospital_applications (new table)
- hospital_application_audit (new table)
- hospitals (existing table, unchanged)
- ...other tables
```

**Troubleshooting:**
- If migration fails, check Supabase connection
- Verify database credentials in .env file
- Check migration SQL syntax in supabase/migrations/

---

### Step 2: Verify Storage Bucket

**Time: 2 minutes**

**Option A: Using Supabase Dashboard**
1. Go to Supabase Dashboard
2. Click "Storage" in left sidebar
3. Look for "hospital-documents" bucket
4. If not present, click "New bucket"
5. Create bucket named "hospital-documents"
6. Set visibility to "Private"

**Option B: Using CLI (if available)**
```bash
supabase storage create hospital-documents
```

**Verify:**
- Bucket exists
- Set to private (not public)
- CORS configured if needed

---

### Step 3: Create Admin User

**Time: 5 minutes**

**Steps:**
1. Open Supabase Dashboard
2. Go to Authentication → Users
3. Click "Add User"
4. Enter:
   - Email: `admin@lifelink.com` (or your choice)
   - Password: (generate secure password)
5. Click "Create user"
6. Wait for email confirmation
7. Once confirmed, click the user
8. Scroll to "Raw App Metadata"
9. Edit and add:
   ```json
   { "user_type": "admin" }
   ```
10. Save

**Verify:**
- User created successfully
- Email verified
- Metadata contains `"user_type": "admin"`

---

### Step 4: Verify Code Changes

**Time: 2 minutes**

Check that all files are in place:

```bash
# Check modified files
ls -la src/lib/supabase-hospitals.ts
ls -la src/pages/HospitalRegister.tsx
ls -la src/pages/HospitalRegisterSuccess.tsx
ls -la src/pages/AdminHospitalsPending.tsx

# Check migration
ls -la supabase/migrations/20251120_hospital_applications.sql
```

**All files should exist!**

---

### Step 5: Install/Update Dependencies

**Time: 2 minutes**

```bash
# Check package.json has required packages
npm list | grep -E "supabase|react-router|lucide"

# If any are missing, install
npm install

# Verify no errors
npm run lint

# Check for TypeScript errors
npm run build
```

**Expected:**
- No compilation errors
- All packages installed
- Build succeeds

---

### Step 6: Test Development Environment

**Time: 5 minutes**

```bash
# Start development server
npm run dev

# Expected output:
# ✓ Built in XXXms
# ➜  Local:   http://localhost:5173/
```

**Test navigation:**
1. Go to http://localhost:5173/hospital/register
   - Should see 4-step form
   - Progress bar visible

2. Go to http://localhost:5173/admin/hospitals/pending
   - Should see admin dashboard (may need to login)

---

### Step 7: Manual Test - Hospital Registration

**Time: 15 minutes**

**Step 1: Open Registration Form**
```
1. Go to http://localhost:5173/hospital/register
2. See 4-step form with progress bar
3. Verify all form fields are visible
```

**Step 2: Fill Representative Information**
```
- First Name: Test
- Last Name: Hospital
- Position/Role: Blood Bank Manager
- Phone: +919876543210 (enter your test number)
  - Click "Send OTP"
  - Enter OTP if SMS/Twilio is configured
  - Or mock OTP in development
- Email: test@hospital.com
- Auth Method: Select "Password-based account"
- Password: Test@1234567 (8+ chars)
- Confirm: Test@1234567
- Click "Continue to Hospital Details"
```

**Step 3: Fill Hospital Details**
```
- Hospital Name: Test Medical Center
- Hospital Type: Private Hospital
- Official Phone: +919876543210
- Emergency Number: +919876543211
- Address: 123 Medical Road
- City: Delhi
- State: Delhi
- ZIP: 110001
- Click "Continue to Documents"
```

**Step 4: Upload Documents**
```
- License Document:
  - Click upload area
  - Select a PDF or JPG (< 10MB)
  - Should upload successfully
  - Show "✓ Filename.pdf"

- Proof Document (Optional):
  - Click upload area
  - Select a file (optional)
  - Should upload successfully

- Click "Review & Submit"
```

**Step 5: Review and Submit**
```
- See summary of all information
- Confirm checkboxes:
  - Terms and conditions
  - Privacy policy
- Click "Submit Application"
- Should see success page with:
  - ✓ Success message
  - Application ID
  - Timeline
  - "Check Status" button
```

**Save the Application ID** - you'll need it for next test

---

### Step 8: Manual Test - Admin Review

**Time: 15 minutes**

**Step 1: Login as Admin**
```
1. Logout if logged in
2. Navigate to login page
3. Enter admin credentials:
   - Email: admin@lifelink.com
   - Password: (the one you set)
4. Login successfully
```

**Step 2: Access Admin Dashboard**
```
1. Navigate to http://localhost:5173/admin/hospitals/pending
2. Should see:
   - Search box
   - Status filter dropdown
   - List of applications (should include your test app)
3. Your test application should appear with:
   - Hospital name: Test Medical Center
   - City: Delhi
   - Status badge: Pending (amber)
```

**Step 3: Review Application**
```
1. Click on your test application
2. Should see detail view with:
   - Hospital Information section
     - Name: Test Medical Center
     - Type: Private Hospital
     - City: Delhi
     - Phone: +919876543210
   
   - Documents section
     - License document
     - Proof document (if uploaded)
     - Both have "View" buttons
   
   - Audit History section
     - Shows "Application submitted"
     - Date/time stamp
   
   - Review & Action panel on right
     - "Approve Hospital" button
     - "Request Info" button
     - "Reject" button
     - Current status: Pending
```

**Step 4: Preview Document**
```
1. Click "View" next to license document
2. Should open document in new window
3. Verify document is readable
4. Close window
```

**Step 5: Approve Application**
```
1. Click "Approve Hospital" button
2. Modal appears asking for notes:
   - Show action: "Approve"
   - Blue info box
   - Notes textarea (required)

3. Enter notes: "Documents verified. Hospital appears legitimate."

4. Click "Confirm" button

5. Should see:
   - Toast: "Hospital Approved"
   - Application status changed to "Approved"
   - New audit entry created
   - Hospital record created in hospitals table
```

**Step 6: Verify Hospital Creation**
```
1. Go to Supabase Dashboard
2. Click "hospitals" table
3. Should see new entry with:
   - name: Test Medical Center
   - type: private
   - verification_status: approved
   - verified_at: current timestamp
   - verified_by: admin user ID
```

---

### Step 9: Manual Test - Status Checking

**Time: 5 minutes**

**From the success page:**
```
1. Navigate back to success page
   - URL should have applicationId parameter
   - Or go to /hospital/register/success?applicationId={ID}

2. Click "Check Status" button

3. Should see:
   - Status updated to "approved"
   - Green success message
   - "Congratulations! Your hospital has been verified..."
   - Timeline updated

4. Try refreshing page - status should persist
```

---

### Step 10: Test Rejection Workflow

**Time: 10 minutes**

**Create another test application:**
```
1. Go back to registration form
2. Fill with different hospital name: "Test Hospital 2"
3. Upload only the license document (not proof)
4. Submit application
5. Note the new application ID
```

**As admin, reject this one:**
```
1. Go to admin dashboard
2. Find "Test Hospital 2" application
3. Click to open details
4. Click "Reject" button
5. Enter rejection reason:
   "Missing proof of address document. Please provide utility bill or lease agreement."
6. Click "Confirm"
7. Should see:
   - Status changed to "Rejected"
   - Reason stored
   - Audit entry created
```

**Check status as hospital:**
```
1. Navigate to success page with rejected application ID
2. Click "Check Status"
3. Should see:
   - Status: rejected
   - Red warning box
   - Rejection reason displayed
```

---

### Step 11: Test Search and Filter

**Time: 5 minutes**

**Test search:**
```
1. Go to admin dashboard
2. Type "Test" in search box
3. Should see only applications matching "Test"
4. Try searching by city: "Delhi"
5. Should filter results
```

**Test filter:**
```
1. Click status filter dropdown
2. Select "Approved"
3. Should see only approved applications
4. Try "Pending", "Rejected", "All"
5. Filters should work correctly
```

---

### Step 12: Verify Audit Trail

**Time: 3 minutes**

**Check audit entries:**
```
1. Open approved hospital detail
2. Scroll to "Audit History" section
3. Should see entries:
   - "Application submitted" (when user created)
   - "Application approved" (when admin approved)
   - Each with date/time

4. Click admin dashboard
5. Select rejected hospital
6. Check audit history
7. Should show:
   - "Application submitted"
   - "Application rejected"
   - With rejection reason in notes
```

---

## Troubleshooting

### Issue: "Permission Denied" uploading documents

**Solution:**
```bash
# Verify bucket exists and is private
supabase storage list-buckets

# If bucket doesn't exist, create it
supabase storage create hospital-documents

# If permissions issue, check RLS policies
# Go to Supabase Dashboard → Storage → hospital-documents
# Verify bucket is set to private
```

### Issue: Admin can't see applications

**Solution:**
1. Verify admin user has `"user_type": "admin"` in metadata
2. Check RLS policies are enabled
3. Clear browser cache and login again
4. Check user is actually logged in

### Issue: Documents won't upload

**Solution:**
1. Check file size < 10MB
2. Check file type is PDF, JPG, or PNG
3. Check hospital-documents bucket exists
4. Check bucket is private
5. Check storage permissions

### Issue: "Application not found" when checking status

**Solution:**
1. Verify application was submitted (check hospital_applications table)
2. Verify application ID is correct
3. Try refreshing page
4. Check browser console for errors

### Issue: TypeScript/Build errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# Check for errors
npm run lint
```

---

## Verification Checklist

After completing all steps, verify:

- [ ] Database migration applied successfully
- [ ] `hospital_applications` table exists
- [ ] `hospital_application_audit` table exists
- [ ] Storage bucket `hospital-documents` exists and is private
- [ ] Admin user created with `user_type='admin'`
- [ ] Registration form works (all 4 steps)
- [ ] Documents upload successfully
- [ ] Submission successful with application ID
- [ ] Success page displays application ID
- [ ] Admin can login and access dashboard
- [ ] Admin can see pending applications
- [ ] Admin can view application details
- [ ] Admin can preview documents
- [ ] Admin can approve applications
- [ ] Hospital record created after approval
- [ ] Status checking works
- [ ] Audit trail shows all actions
- [ ] Rejection workflow works
- [ ] Search and filter work
- [ ] No console errors
- [ ] No TypeScript errors

---

## Next Steps

If all tests pass:

1. **Setup Email Notifications** (Optional but recommended)
   - Approval email
   - Rejection email
   - Info request email

2. **Deploy to Production**
   - Apply migration to production database
   - Deploy frontend code
   - Test again in production
   - Monitor for errors

3. **Configure Additional Features**
   - Hospital dashboard
   - Document resubmission
   - Analytics

4. **Monitor & Maintain**
   - Track application submission rates
   - Monitor admin review times
   - Check storage usage
   - Monitor for errors

---

## Helpful Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Apply database migration
supabase db push

# List database tables
supabase db list-tables

# View database
supabase studio

# Check Supabase status
supabase projects list
```

---

## Support

If you encounter issues:

1. Check troubleshooting section above
2. Review documentation files
3. Check browser console for errors
4. Check Supabase logs
5. Verify all prerequisites are met

---

**Estimated Total Time: 1-2 hours**

All steps are complete and the system is ready to use! 🎉
