import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * העלאת תמונות אדמין ל-Supabase Storage (bucket ציבורי לקריאה בלבד).
 * R2 המתוכנן טרם חובר (אין credentials — ראה docs/SETUP.md §4); Supabase
 * Storage זמין כבר עכשיו עם אותם מפתחות. ה-service role key לעולם לא
 * עוזב את השרת — הקליינט מדבר רק עם /api/admin/upload.
 */
const BUCKET = "site-images";

/** MIME מותרים → סיומת קובץ. הסיומת נגזרת מה-MIME המאומת, לא משם הקובץ של המשתמש. */
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

/** בדיקת magic bytes — לא סומכים על ה-Content-Type שהדפדפן שולח. */
export function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  const ascii = (start: number, len: number) => String.fromCharCode(...bytes.slice(start, start + len));
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (ascii(4, 4) === "ftyp" && (ascii(8, 4) === "avif" || ascii(8, 4) === "avis")) return "image/avif";
  return null;
}

function storageClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

/**
 * מעלה תמונה מאומתת ומחזיר URL ציבורי. שם הקובץ אקראי לחלוטין (אין קלט
 * משתמש בנתיב). יוצר את ה-bucket בפעם הראשונה אם חסר (idempotent).
 */
export async function uploadAdminImage(bytes: Uint8Array, mimeType: string): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[mimeType];
  if (!ext) throw new Error("unsupported image type");

  const supabase = storageClient();
  const path = `admin/${randomBytes(16).toString("hex")}.${ext}`;

  let { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: mimeType });

  if (error && /bucket.*not.*found/i.test(error.message)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_IMAGE_BYTES,
      allowedMimeTypes: Object.keys(ALLOWED_IMAGE_TYPES),
    });
    // "already exists" במרוץ בין שתי העלאות ראשונות — לא שגיאה אמיתית.
    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`bucket creation failed: ${createError.message}`);
    }
    ({ error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: mimeType }));
  }

  if (error) throw new Error(`upload failed: ${error.message}`);

  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
