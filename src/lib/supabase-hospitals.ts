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
    // Hospital can submit WITHOUT authentication
    // Account will be created ONLY after admin approval
    const insertPayload = {
      user_id: data.user_id || null, // NULL until admin creates account
      representative_first_name: data.firstName,
      representative_last_name: data.lastName || null,
      representative_role: data.role,
      representative_phone: data.phone,
      representative_email: data.email,
      hospital_name: data.hospitalName,
      type: data.hospitalType,
      official_phone: data.officialPhone,
      emergency_number: data.emergencyNumber,
      address: data.address,
      city: data.city,
      state: data.state || null,
      zip_code: data.zipCode || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      auth_method: data.authMethod || "password",
      license_document_url: data.licenseDocUrl || null,
      license_document_path: data.licenseDocPath || null,
      proof_document_url: data.proofDocUrl || null,
      proof_document_path: data.proofDocPath || null,
      documents: data.documents || [],
      status: "pending",
      submitted_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await sb
      .from("hospital_applications")
      .insert([insertPayload])
      .select()
      .single();

    if (insertError) throw insertError;

    // Insert audit record (best-effort, non-fatal)
    try {
      const auditRow = {
        application_id: inserted.id,
        action: "submitted",
        notes: "Application submitted by hospital representative",
        actor_id: data.user_id || null,
        new_status: "pending",
      };

      const auditInsert = await sb.from("hospital_application_audit").insert([auditRow]);
      if (auditInsert?.error) {
        console.warn("Audit insert warning:", auditInsert.error);
      }
    } catch (e) {
      console.warn("Audit insert failed (ignored)", e);
    }

    return inserted;
  } catch (err) {
    console.error("Submit hospital application error:", err);
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

    // Step 1: Create auth user account
    let userId: string | null = null;
    try {
      const { data: authData, error: authError } = await sb.auth.admin.createUser({
        email: app.representative_email,
        password: generateSecurePassword(), // Generate random password
        user_metadata: {
          user_type: "hospital",
          hospital_name: app.hospital_name,
          full_name: `${app.representative_first_name} ${app.representative_last_name || ''}`.trim(),
        },
      });

      if (authError) throw authError;
      userId = authData?.user?.id ?? null;

      console.log("Created auth user:", userId);
    } catch (authErr: any) {
      console.error("Failed to create auth user:", authErr);
      // Continue anyway - admin can create account manually
      // but we still create the hospital record
    }

    // Step 2: Create hospital record
    const hospitalPayload = {
      user_id: userId || app.id, // Use app ID as fallback if auth fails
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

    // Step 3: Link the application to the hospital
    const linkError = await sb
      .from("hospital_applications")
      .update({ 
        hospital_id: hospital.id,
        user_id: userId || null // Update with created user_id
      })
      .eq("id", applicationId);

    if (linkError?.error) {
      console.warn("Failed to link hospital to application", linkError.error);
    }

    return {
      hospital,
      userId,
      message: userId 
        ? "Hospital approved and account created successfully"
        : "Hospital approved but account creation failed. Please create manually or contact support.",
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
