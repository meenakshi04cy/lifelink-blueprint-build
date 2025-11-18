// src/lib/hospital.ts
import { supabase } from "@/integrations/supabase/client";

export type UploadedDoc = {
  bucket: string;
  path: string;
  fileName: string;
  url?: string;
};

export async function uploadDocs(files: File[], appId: string): Promise<UploadedDoc[]> {
  if (!files || files.length === 0) return [];
  const uploaded: UploadedDoc[] = [];
  // Ensure bucket name matches what you have in Supabase Storage (e.g. "hospital-documents")
  const bucket = "hospital-documents";

  for (const f of files) {
    const safeName = `${appId}/${Date.now()}-${f.name.replace(/\s+/g, "_")}`;
    const { data, error } = await supabase.storage.from(bucket).upload(safeName, f, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      // bubble up, caller will catch and notify user
      throw error;
    }

    // optionally build public URL if you set bucket public or use signed URL
    let url: string | undefined;
    try {
      const { publicURL } = supabase.storage.from(bucket).getPublicUrl(data.path);
      url = publicURL ?? undefined;
    } catch (err) {
      // ignore if public URL can't be made
    }

    uploaded.push({
      bucket,
      path: data.path,
      fileName: f.name,
      url,
    });
  }

  return uploaded;
}

export async function createHospitalApplication(payload: any) {
  // NOTE: use `as any` to avoid TS overload mismatch if your generated types don't include table yet
  const { data, error } = await (supabase as any)
    .from("hospital_applications" as any)
    .insert([payload as any])
    .select("id, user_id, status")
    .single();

  if (error) throw error;
  return data;
}
