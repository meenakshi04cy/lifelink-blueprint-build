// lib/supabase-hospitals.ts
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export async function uploadHospitalDoc(file: File, appId: string) {
  const safeName = `${appId}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const bucket = "hospital-documents";

  // upload file
  const { data, error: uploadError } = await supabase.storage.from(bucket).upload(safeName, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) throw uploadError;

  // create signed url for admin preview (1 hour)
  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.path, 60 * 60);

  return {
    bucket,
    path: data.path,
    fileName: file.name,
    mimeType: file.type,
    signedUrl: signed?.signedUrl ?? null,
    signedError: signedError ?? null,
    uploaded_at: new Date().toISOString(),
  };
}

export async function getDocSignedUrl(bucket: string, path: string, ttlSeconds = 60 * 60) {
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, ttlSeconds);
    if (error) throw error;
    return data.signedUrl;
  } catch (err) {
    console.warn("getDocSignedUrl error", err);
    return null;
  }
}

export async function submitHospitalApplication(data: any) {
  try {
    console.log("🚀🚀🚀 START: submitHospitalApplication called");
    console.log("🚀 Data received:", data);
    
    // Validate required fields
    if (!data.firstName) throw new Error("First name is required");
    if (!data.hospitalName) throw new Error("Hospital name is required");
    if (!data.city) throw new Error("City is required");
    if (!data.email) throw new Error("Email is required");
    if (!data.password) throw new Error("Password is required");
    
    console.log("✅ All required fields present");
    
    // Create minimal payload
    const insertPayload = {
      representative_first_name: String(data.firstName || "Unknown"),
      representative_last_name: String(data.lastName || ""),
      representative_role: String(data.role || "Admin"),
      representative_phone: String(data.phone || ""),
      representative_email: String(data.email || ""),
      hospital_name: String(data.hospitalName || "Unknown"),
      type: String(data.hospitalType || "private"),
      official_phone: String(data.officialPhone || ""),
      emergency_number: String(data.emergencyNumber || ""),
      address: String(data.address || ""),
      city: String(data.city || ""),
      state: data.state ? String(data.state) : null,
      zip_code: data.zipCode ? String(data.zipCode) : null,
      status: "pending",
      // Store the password temporarily for account creation after approval
      temp_password: String(data.password),
      // Add document URLs if provided
      license_document_url: data.licenseDocUrl ? String(data.licenseDocUrl) : null,
      license_document_path: data.licensePath ? String(data.licensePath) : null,
      proof_document_url: data.proofDocUrl ? String(data.proofDocUrl) : null,
      proof_document_path: data.proofPath ? String(data.proofPath) : null,
      // Store array of documents in JSONB
      documents: data.documents || [],
    };

    console.log("📋 FINAL PAYLOAD TO INSERT:", insertPayload);
    console.log("📋 Hospital Name:", insertPayload.hospital_name);
    console.log("📋 City:", insertPayload.city);
    console.log("📋 Email:", insertPayload.representative_email);
    console.log("🔗 Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("🔗 Supabase Key available:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);

    console.log("🔗 Calling insert...");

    const { data: insertedData, error } = await sb
      .from("hospital_applications")
      .insert([insertPayload])
      .select();

    console.log("📤 Supabase response received");
    console.log("📤 Inserted Data:", insertedData);
    console.log("📤 Error:", error);

    if (error) {
      console.error("❌ ERROR CODE:", error.code);
      console.error("❌ ERROR MESSAGE:", error.message);
      console.error("❌ ERROR DETAILS:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!insertedData || insertedData.length === 0) {
      throw new Error("No data returned from insert - possible RLS issue");
    }

    console.log("✅ SUCCESS! Record created");
    console.log("✅ Record ID:", insertedData[0].id);
    console.log("✅ Hospital Name in DB:", insertedData[0].hospital_name);
    return insertedData[0];
  } catch (err: any) {
    console.error("❌ CAUGHT ERROR IN submitHospitalApplication:");
    console.error("❌ Error message:", err?.message);
    console.error("❌ Full error:", err);
    throw err;
  }
}

export async function adminSetApplicationStatus(
  appId: string,
  adminId: string | null,
  action: "approved" | "rejected" | "info_requested",
  notes?: string
) {
  const newStatus =
    action === "approved" ? "approved" : action === "rejected" ? "rejected" : "info_requested";
  
  const updatePayload: any = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };
  
  if (action === "approved") {
    updatePayload.verified_at = new Date().toISOString();
  }
  
  if (adminId) {
    updatePayload.verified_by = adminId;
  }
  
  if (action === "rejected") {
    updatePayload.rejection_reason = notes ?? null;
    updatePayload.rejection_date = new Date().toISOString();
    // IMPORTANT: No user_id assignment - account is NOT created
  }

  const upd = await sb.from("hospital_applications").update(updatePayload).eq("id", appId);

  if (upd?.error) throw upd.error;

  // Insert audit row
  try {
    const auditRow = {
      application_id: appId,
      actor_id: adminId,
      action: action,
      notes: notes ?? null,
      new_status: newStatus,
      created_at: new Date().toISOString(),
    };

    const insertAudit = await sb.from("hospital_application_audit").insert([auditRow]);
    if (insertAudit?.error) {
      console.warn("Audit insert warning:", insertAudit.error);
    }
  } catch (e) {
    console.warn("Audit insert failed (ignored)", e);
  }

  return upd.data;
}

/**
 * Create a hospital record from an approved application
 * This is called when an admin approves an application
 * ALSO creates the auth user account for the hospital
 */
export async function createHospitalFromApplication(applicationId: string, adminId?: string) {
  try {
    // Get the application
    const { data: app, error: appError } = await sb
      .from("hospital_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError) throw appError;
    if (!app) throw new Error("Application not found");
    if (app.status !== "approved") throw new Error("Application must be approved first");

    // Step 1: Create hospital record FIRST
    const hospitalPayload = {
      name: app.hospital_name,
      type: app.type,
      official_phone: app.official_phone,
      emergency_number: app.emergency_number,
      address: app.address,
      city: app.city,
      state: app.state,
      zip_code: app.zip_code,
      latitude: app.latitude,
      longitude: app.longitude,
      verification_status: "approved",
      verified_at: new Date().toISOString(),
      verified_by: adminId || null,
      license_document_url: app.license_document_url,
      hospital_proof_document_url: app.proof_document_url,
    };

    const { data: hospital, error: hospitalError } = await sb
      .from("hospitals")
      .insert([hospitalPayload])
      .select()
      .single();

    if (hospitalError) throw hospitalError;

    // Step 2: Create hospital staff auth user account
    let userId: string | null = null;
    let authEmail: string | null = null;
    try {
      authEmail = app.representative_email;
      // Use the password from registration instead of generating a new one
      const password = app.temp_password;
      
      if (!password) {
        throw new Error("No password found in application. User must register with a password.");
      }
      
      console.log("Creating hospital staff account for:", authEmail);

      const { data: authData, error: authError } = await sb.auth.admin.createUser({
        email: authEmail,
        password: password,
        user_metadata: {
          user_type: "hospital_staff",
          hospital_id: hospital.id,
          hospital_name: app.hospital_name,
          full_name: `${app.representative_first_name} ${app.representative_last_name || ''}`.trim(),
          role: app.representative_role,
        },
      });

      if (authError) throw authError;
      userId = authData?.user?.id ?? null;

      console.log("✅ Created hospital staff auth user:", userId);
      console.log("📧 Email:", authEmail);
      console.log("🔐 Account ready with registered credentials");
    } catch (authErr: any) {
      console.error("❌ Failed to create hospital staff auth user:", authErr);
      // Continue anyway - admin can create account manually
    }

    // Step 3: Link the application to the hospital
    const { error: linkError } = await sb
      .from("hospital_applications")
      .update({ 
        hospital_id: hospital.id,
        user_id: userId || null
      })
      .eq("id", applicationId);

    if (linkError) {
      console.warn("Failed to link hospital to application", linkError);
    }

    return {
      hospital,
      userId,
      email: authEmail,
      message: userId 
        ? `✅ Hospital approved! Staff account created for ${authEmail}. Credentials should be sent to the hospital representative.`
        : "⚠️ Hospital approved but staff account creation failed. Admin should create manually.",
    };
  } catch (err) {
    console.error("Create hospital from application error:", err);
    throw err;
  }
}

/**
 * Generate a secure random password
 */
function generateSecurePassword(): string {
  const length = 12;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function getApplicationById(applicationId: string) {
  try {
    const { data, error } = await sb
      .from("hospital_applications")
      .select("*")
      .eq("id", applicationId)
      .single();


    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Get application error:", err);
    throw err;
  }
}

/**
 * Create a donation connection when a donor expresses interest in a blood request
 */
export async function createDonationConnection(
  donorId: string,
  bloodRequestId: string,
  hospitalId: string
) {
  try {
    const { data, error } = await sb
      .from("donation_connections")
      .insert([
        {
          donor_id: donorId,
          blood_request_id: bloodRequestId,
          hospital_id: hospitalId,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error("Create donation connection error:", err);
    throw err;
  }
}

/**
 * Get pending donation connections for a hospital
 */
export async function getHospitalDonationConnections(hospitalId: string, status?: string) {
  try {
    let query = sb
      .from("donation_connections")
      .select(
        `
        id,
        donor_id,
        blood_request_id,
        hospital_id,
        status,
        verified_by_hospital_staff_id,
        verified_at,
        hospital_notes,
        created_at,
        donors:donor_id(id, blood_type),
        blood_requests:blood_request_id(id, patient_name, blood_type, units_needed, hospital_name, urgency_level, required_by)
      `
      )
      .eq("hospital_id", hospitalId);

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("Get hospital donation connections error:", err);
    throw err;
  }
}

/**
 * Verify and accept a donation connection (hospital action)
 */
export async function verifyDonationConnection(
  connectionId: string,
  accept: boolean,
  hospitalStaffId: string,
  notes?: string
) {
  try {
    const newStatus = accept ? "accepted" : "rejected";

    const { data, error } = await sb
      .from("donation_connections")
      .update({
        status: newStatus,
        verified_by_hospital_staff_id: hospitalStaffId,
        verified_at: new Date().toISOString(),
        hospital_notes: notes || null,
      })
      .eq("id", connectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error("Verify donation connection error:", err);
    throw err;
  }
}

/**
 * Get donor's pending connections
 */
export async function getDonorConnections(donorId: string) {
  try {
    const { data, error } = await sb
      .from("donation_connections")
      .select(
        `
        id,
        blood_request_id,
        hospital_id,
        status,
        hospital_notes,
        verified_at,
        created_at,
        blood_requests(id, patient_name, blood_type, units_needed, hospital_name, urgency_level),
        hospitals(id, name)
      `
      )
      .eq("donor_id", donorId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("Get donor connections error:", err);
    throw err;
  }
}

