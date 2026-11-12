import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await context.params;
    if (!segments || segments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const safeFilename = path.normalize(segments.join("/")).replace(/^(\.\.[\/\\])+/, "");
    const filePath = path.join(process.cwd(), "public", "uploads", safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = safeFilename.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
      svg: "image/svg+xml",
      mp4: "video/mp4",
      webm: "video/webm",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return new NextResponse("Server Error", { status: 500 });
  }
}
