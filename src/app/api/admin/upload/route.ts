import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  sniffImageType,
  uploadAdminImage,
} from "@/lib/storage/upload-image";

/**
 * העלאת תמונה מהאדמין (גלריה/מוצרים) — multipart POST, מחזיר URL ציבורי.
 * בדיקת אדמין כמו requireAdmin אך עם תשובות 401/403 (JSON, לא redirect —
 * זה API route שנקרא מ-fetch, לא ניווט דפדפן). Fail-closed בכל מקרה עמום.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const user = await db.user.findUnique({ where: { id: data.user.id }, select: { role: true } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  let file: unknown;
  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch {
    return NextResponse.json({ ok: false, error: "קובץ לא תקין" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "לא נבחר קובץ" }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { ok: false, error: `גודל הקובץ חייב להיות עד ${MAX_IMAGE_BYTES / 1024 / 1024}MB` },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // מאמתים לפי magic bytes בפועל — לא לפי ה-Content-Type שהדפדפן הצהיר.
  const mimeType = sniffImageType(bytes);
  if (!mimeType || !ALLOWED_IMAGE_TYPES[mimeType]) {
    return NextResponse.json(
      { ok: false, error: "פורמט לא נתמך — מותר JPG / PNG / WebP / AVIF" },
      { status: 400 },
    );
  }

  try {
    const url = await uploadAdminImage(bytes, mimeType);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    console.error("[admin/upload] upload failed:", err);
    return NextResponse.json({ ok: false, error: "ההעלאה נכשלה — נסו שוב" }, { status: 500 });
  }
}
