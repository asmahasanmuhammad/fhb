import { NextResponse } from "next/server";

// Real-time data — never cache route handlers
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}