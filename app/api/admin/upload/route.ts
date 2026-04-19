import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED_PREFIXES = ["image/", "audio/", "video/"];

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/x-m4a": ".m4a",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "빈 파일입니다." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `파일이 너무 큽니다 (최대 ${MAX_BYTES / 1024 / 1024}MB).` },
      { status: 400 },
    );
  }
  if (!ALLOWED_PREFIXES.some((p) => file.type.startsWith(p))) {
    return NextResponse.json(
      { error: `지원하지 않는 형식: ${file.type || "알 수 없음"}` },
      { status: 400 },
    );
  }

  const fromName = path.extname(file.name).toLowerCase();
  const ext = fromName || EXT_MAP[file.type] || ".bin";
  const safeBase = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
  const name = `${safeBase}${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`uploads/${name}`, file, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type,
      });
      return NextResponse.json({ url: blob.url, type: file.type });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "업로드 실패";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // 로컬 fs 폴백
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const dest = path.join(UPLOAD_DIR, name);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(dest, buf);
  return NextResponse.json({ url: `/uploads/${name}`, type: file.type });
}
