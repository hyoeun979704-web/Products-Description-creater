import "server-only";
import { getSupabaseAdmin } from "./server";

export const UPLOAD_BUCKET = "uploads";

export type UploadedPhoto = {
  path: string;
  bytes: number;
  contentType: string;
};

/**
 * Upload a single user photo to the private `uploads` bucket.
 * Caller supplies the path (e.g. `${sessionId}/${generationId}/${slot}.jpg`).
 */
export async function uploadPhoto(
  path: string,
  file: Blob | Buffer | ArrayBuffer,
  contentType: string
): Promise<UploadedPhoto> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(path, file as Blob, {
      contentType,
      upsert: true,
    });
  if (error) throw new Error(`upload failed: ${error.message}`);

  const bytes =
    file instanceof Blob
      ? file.size
      : file instanceof ArrayBuffer
        ? file.byteLength
        : file.length;
  return { path, bytes, contentType };
}

/**
 * Short-lived signed URL for a private upload. Default 1 hour.
 */
export async function getSignedUploadUrl(path: string, expiresInSec = 3600) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .createSignedUrl(path, expiresInSec);
  if (error || !data) throw new Error(`signed url failed: ${error?.message}`);
  return data.signedUrl;
}
