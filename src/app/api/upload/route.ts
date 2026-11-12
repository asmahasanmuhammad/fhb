import { NextRequest } from "next/server";
import { ok, fail, handleError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return fail("No file uploaded", 400);
    }

    // Validate type
    const mime = file.type;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (!allowed.includes(mime)) {
      return fail("Only JPG, PNG, WEBP and GIF images are allowed", 400);
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return fail("Image size must be under 10MB", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `post_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    return ok({ url: `/uploads/${filename}` });
  } catch (e) {
    return handleError(e);
  }
}
