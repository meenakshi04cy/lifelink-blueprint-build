/**
 * Mock Hospital Registration & Verification API
 * For production, replace with real Supabase calls
 */

export interface HospitalRegistration {
  id?: string;
  userId: string;
  name: string;
  type: 'government' | 'private' | 'blood-bank' | 'ngo';
  officialPhone: string;
  emergencyNumber: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  licenseNumber?: string;
  registrationNumber?: string;
  licenseDocumentUrl?: string;
  hospitalProofDocumentUrl?: string;
}

export interface HospitalVerificationStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  verifiedAt?: string;
  rejectionReason?: string;
  rejectionDate?: string;
}

export interface AdminVerificationAction {
  hospitalId: string;
  adminId: string;
  action: 'approved' | 'rejected' | 'info_requested';
  notes: string;
  previousStatus: string;
  newStatus: string;
}

export interface OTPVerification {
  phoneNumber: string;
  otpCode: string;
  isVerified: boolean;
  expiresAt: string;
}

/**
 * Mock storage for hospitals (in production, use Supabase)
 */
const mockHospitalsDb: Record<string, any> = {};
const mockAuditDb: any[] = [];
const mockOtpDb: Record<string, OTPVerification> = {};

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to phone (mock: log to console)
 */
export async function sendOTP(phoneNumber: string): Promise<{ otpCode: string; expiresIn: number }> {
  const otpCode = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  mockOtpDb[phoneNumber] = {
    phoneNumber,
    otpCode,
    isVerified: false,
    expiresAt: expiresAt.toISOString(),
  };

  // Mock: Log to console (in production, use Twilio/SMS service)
  console.log(`[MOCK] OTP sent to ${phoneNumber}: ${otpCode}`);

  return { otpCode, expiresIn: 600 };
}

/**
 * Verify OTP
 */
export async function verifyOTP(phoneNumber: string, otpCode: string): Promise<boolean> {
  const record = mockOtpDb[phoneNumber];

  if (!record) {
    throw new Error('No OTP request found for this phone number');
  }

  if (new Date() > new Date(record.expiresAt)) {
    delete mockOtpDb[phoneNumber];
    throw new Error('OTP has expired');
  }

  if (record.otpCode !== otpCode) {
    throw new Error('Invalid OTP');
  }

  record.isVerified = true;
  return true;
}

/**
 * Register hospital
 * POST /api/hospitals
 */
export async function registerHospital(data: HospitalRegistration & { userId: string }): Promise<string> {
  const hospitalId = `hospital_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  mockHospitalsDb[hospitalId] = {
    id: hospitalId,
    ...data,
    verificationStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Log to audit
  mockAuditDb.push({
    id: `audit_${Date.now()}`,
    hospitalId,
    adminId: 'system',
    action: 'submitted',
    notes: 'Hospital registration submitted',
    previousStatus: null,
    newStatus: 'pending',
    createdAt: new Date().toISOString(),
  });

  console.log(`[MOCK] Hospital registered: ${hospitalId}`);
  return hospitalId;
}

/**
 * Get hospital by ID
 */
export async function getHospital(hospitalId: string): Promise<any> {
  const hospital = mockHospitalsDb[hospitalId];
  if (!hospital) {
    throw new Error('Hospital not found');
  }
  return hospital;
}

/**
 * Upload file (mock)
 * In production, use signed URLs to S3/Supabase Storage
 */
export async function uploadFile(file: File, type: 'license' | 'proof'): Promise<string> {
  // Mock: Convert to base64 and store
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const base64 = reader.result as string;
      const url = `data:${file.type};base64,${base64.split(',')[1]}`;
      console.log(`[MOCK] File uploaded: ${file.name}`);
      resolve(url);
    };
    reader.onerror = () => reject(new Error('File upload failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get pending hospitals (admin endpoint)
 * GET /api/admin/hospitals?status=pending
 */
export async function getPendingHospitals(filters?: { status?: string; search?: string }): Promise<any[]> {
  let hospitals = Object.values(mockHospitalsDb);

  if (filters?.status) {
    hospitals = hospitals.filter((h) => h.verificationStatus === filters.status);
  }

  if (filters?.search) {
    const search = filters.search.toLowerCase();
    hospitals = hospitals.filter(
      (h) =>
        h.name.toLowerCase().includes(search) ||
        h.city.toLowerCase().includes(search) ||
        h.officialPhone.includes(search)
    );
  }

  return hospitals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Approve hospital registration (admin)
 * POST /api/admin/hospitals/:id/verify
 */
export async function approveHospital(hospitalId: string, adminId: string, notes: string): Promise<void> {
  const hospital = mockHospitalsDb[hospitalId];
  if (!hospital) {
    throw new Error('Hospital not found');
  }

  const previousStatus = hospital.verificationStatus;
  hospital.verificationStatus = 'approved';
  hospital.verifiedAt = new Date().toISOString();
  hospital.verifiedBy = adminId;
  hospital.updatedAt = new Date().toISOString();

  // Log to audit
  mockAuditDb.push({
    id: `audit_${Date.now()}`,
    hospitalId,
    adminId,
    action: 'approved',
    notes,
    previousStatus,
    newStatus: 'approved',
    createdAt: new Date().toISOString(),
  });

  // Mock: Send approval email
  console.log(`[MOCK] Approval email sent to hospital ${hospitalId}`);
}

/**
 * Reject hospital registration (admin)
 * POST /api/admin/hospitals/:id/reject
 */
export async function rejectHospital(hospitalId: string, adminId: string, reason: string): Promise<void> {
  const hospital = mockHospitalsDb[hospitalId];
  if (!hospital) {
    throw new Error('Hospital not found');
  }

  const previousStatus = hospital.verificationStatus;
  hospital.verificationStatus = 'rejected';
  hospital.rejectionReason = reason;
  hospital.rejectionDate = new Date().toISOString();
  hospital.updatedAt = new Date().toISOString();

  // Log to audit
  mockAuditDb.push({
    id: `audit_${Date.now()}`,
    hospitalId,
    adminId,
    action: 'rejected',
    notes: reason,
    previousStatus,
    newStatus: 'rejected',
    createdAt: new Date().toISOString(),
  });

  // Mock: Send rejection email
  console.log(`[MOCK] Rejection email sent to hospital ${hospitalId}: ${reason}`);
}

/**
 * Get audit logs for a hospital
 * GET /api/admin/audit?hospitalId=
 */
export async function getHospitalAuditLogs(hospitalId?: string): Promise<any[]> {
  if (!hospitalId) {
    return mockAuditDb;
  }

  return mockAuditDb
    .filter((log) => log.hospitalId === hospitalId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Send notification (mock email)
 * POST /api/notifications
 */
export async function sendNotification(params: {
  to: string;
  subject: string;
  templateType: 'approval' | 'rejection' | 'info_request';
  hospitalName: string;
  recipientName?: string;
  rejectionReason?: string;
  requestedInfo?: string;
}): Promise<void> {
  const emailContent = {
    approval: `Dear ${params.recipientName}, your hospital "${params.hospitalName}" has been verified by Life-Link. You can now access verification features.`,
    rejection: `Dear ${params.recipientName}, your hospital registration was not approved. Reason: ${params.rejectionReason}. You can resubmit documents.`,
    info_request: `Dear ${params.recipientName}, we need additional information for your hospital: ${params.requestedInfo}. Please resubmit your application with the requested details.`,
  };

  const message = emailContent[params.templateType];
  console.log(`[MOCK] Email sent to ${params.to}: Subject: ${params.subject}\nContent: ${message}`);
}

/**
 * Request additional info (admin action)
 */
export async function requestAdditionalInfo(hospitalId: string, adminId: string, infoNeeded: string): Promise<void> {
  const hospital = mockHospitalsDb[hospitalId];
  if (!hospital) {
    throw new Error('Hospital not found');
  }

  // Log to audit
  mockAuditDb.push({
    id: `audit_${Date.now()}`,
    hospitalId,
    adminId,
    action: 'info_requested',
    notes: infoNeeded,
    previousStatus: hospital.verificationStatus,
    newStatus: hospital.verificationStatus, // Status doesn't change
    createdAt: new Date().toISOString(),
  });

  // Send notification
  await sendNotification({
    to: hospital.officialPhone,
    subject: 'Additional Information Needed',
    templateType: 'info_request',
    hospitalName: hospital.name,
    requestedInfo: infoNeeded,
  });
}

/**
 * Check if hospital is verified
 */
export async function isHospitalVerified(hospitalId: string): Promise<boolean> {
  const hospital = mockHospitalsDb[hospitalId];
  if (!hospital) {
    return false;
  }
  return hospital.verificationStatus === 'approved';
}

/**
 * Get all mock data (for debugging)
 */
export function getMockData() {
  return {
    hospitals: mockHospitalsDb,
    auditLogs: mockAuditDb,
    otpData: mockOtpDb,
  };
}

/**
 * Clear all mock data (for testing)
 */
export function clearMockData() {
  Object.keys(mockHospitalsDb).forEach((key) => delete mockHospitalsDb[key]);
  mockAuditDb.length = 0;
  Object.keys(mockOtpDb).forEach((key) => delete mockOtpDb[key]);
}
