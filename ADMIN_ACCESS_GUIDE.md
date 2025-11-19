# Admin Hospital Verification Dashboard - Access Guide

## Quick Start

### URL
```
http://localhost:5173/admin/hospitals/pending
```

### Access Requirements
- **Must be logged in** to your admin account
- Access requires Supabase authentication
- Link appears in navigation header when logged in

---

## How to Access the Admin Dashboard

### Method 1: Direct URL
1. Go to `http://localhost:5173/admin/hospitals/pending`
2. If not logged in, you'll be redirected to login
3. Log in with your admin credentials
4. You'll be redirected back to the admin dashboard

### Method 2: Navigation Link
1. Log in to the application
2. Look for the **🔐 Admin** link in the header (desktop) or menu (mobile)
3. Click it to go directly to the admin dashboard

### Method 3: From Hospital Register Page
1. After a hospital submits their application
2. Access the admin dashboard via the navigation
3. Filter to see "Pending" applications

---

## What You Can Do in the Admin Dashboard

### View Applications
- **Search** by hospital name, city, or phone number
- **Filter** by status:
  - 📋 Pending - Applications awaiting review
  - ✅ Approved - Already verified hospitals
  - ❌ Rejected - Declined applications

### Review Details
1. Click on any hospital application
2. See full hospital information:
   - Hospital name and type
   - Contact information
   - Emergency contact details
   - Submission date
   - Current status

### Review Submitted Documents
- Click document names to preview
- Documents have secure 1-hour access links
- Supported formats: PDF, images, documents

### Make Decisions
You have three action options for each pending application:

#### ✅ Approve Hospital
- Creates hospital record in database
- Generates secure login credentials
- Sends hospital account details
- Updates application status to "approved"
- Hospital can now log in

#### ❌ Reject Hospital
- Application marked as rejected
- **No account created**
- Hospital receives rejection notice
- Rejection reason recorded
- Hospital can reapply if needed

#### ℹ️ Request More Information
- Asks hospital to submit additional documents
- Application status becomes "info_requested"
- You can add notes about what's needed
- Hospital receives notification to resubmit

### Track History
- View audit trail for each application
- See all decisions made by admins
- Track timestamps and notes
- Complete compliance record

---

## Features

### Document Management
- 📁 Secure cloud storage in Supabase
- 🔗 Time-limited access links (1 hour)
- 🔐 Privacy: Only hospital and admins can see their documents
- 📋 Full file list with download option

### Security
- ✅ Only logged-in users can access
- ✅ Row-level security (RLS) policies enforced
- ✅ Audit trail for all admin actions
- ✅ User metadata tracking

### Performance
- ⚡ Real-time status updates
- 📊 Filtered list views
- 🔍 Fast search across all applications

---

## Troubleshooting

### "Access Denied" Message
- **Solution:** Log in first
- Go to `/login` and enter your credentials
- Then navigate to admin dashboard

### Can't See Applications
- **Check Status Filter:** Make sure filter is set to "pending" or "all"
- **Check Search:** Clear search box if filtering
- **Refresh Page:** Press F5 or Ctrl+R to reload

### Document Won't Preview
- **Check Link Expiry:** Links expire after 1 hour
- **Try Again:** Click document name again to get fresh link
- **Check Format:** Ensure file is valid PDF or image

### Password Generation Failed
- **On Approval:** If account creation fails, hospital record still created
- **Manual Setup:** Admin can manually set password in Supabase dashboard
- **Try Again:** Approve hospital again to retry account creation

---

## Admin User Setup

To create an admin account in Supabase:

1. Go to Supabase console
2. Navigate to Authentication → Users
3. Create a new user with email and password
4. The account will automatically have admin access
5. Log in with these credentials

---

## Next Steps

**After approving a hospital:**
- ✅ Hospital receives automated account notification
- ✅ Hospital can log in with provided credentials
- ✅ Hospital can update their profile
- ✅ Hospital can use platform features

**If rejecting an application:**
- Hospital can reapply with corrections
- All documents need resubmission
- Follow same process as new application

---

## Support

For issues or questions:
- Check the Hospital Verification Setup Guide: `HOSPITAL_VERIFICATION_SETUP.md`
- Review Implementation Steps: `IMPLEMENTATION_STEPS_HOSPITAL_VERIFICATION.md`
- Check Test Cases: `HOSPITAL_VERIFICATION_CHECKLIST.md`
