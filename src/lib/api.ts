import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

export function handleError(e: unknown) {
  if (e instanceof AuthError) return fail(e.message, e.status);
  console.error("[API Error]", e);
  return fail("সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন", 500);
}

// Basic in-memory rate limiter (per-process)
const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}
