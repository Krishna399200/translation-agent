/**
 * Tracks how many translations each visitor has used (max 3).
 * Uses Netlify Blobs in production; in-memory fallback for local `next dev`.
 */
import { getStore } from "@netlify/blobs";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const TRANSLATION_LIMIT = 3;

const STORE_NAME = "translation-usage";
const memoryUsage = new Map<string, number>();

type UsageRecord = { count: number };

function blobKey(visitorId: string): string {
  return `usage:${visitorId}`;
}

async function readCount(visitorId: string): Promise<number> {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const record = await store.get(blobKey(visitorId), { type: "json" });
    if (record && typeof record === "object" && "count" in record) {
      return (record as UsageRecord).count;
    }
    return 0;
  } catch {
    return memoryUsage.get(visitorId) ?? 0;
  }
}

async function writeCount(visitorId: string, count: number): Promise<void> {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    await store.setJSON(blobKey(visitorId), { count });
  } catch {
    memoryUsage.set(visitorId, count);
  }
}

export async function getOrCreateVisitorId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("visitor_id")?.value;
  if (existing) return existing;

  const id = randomUUID();
  cookieStore.set("visitor_id", id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}

export async function getUsage(visitorId: string): Promise<{
  used: number;
  limit: number;
  remaining: number;
}> {
  const used = await readCount(visitorId);
  return {
    used,
    limit: TRANSLATION_LIMIT,
    remaining: Math.max(0, TRANSLATION_LIMIT - used),
  };
}

export async function isLimitExceeded(visitorId: string): Promise<boolean> {
  const used = await readCount(visitorId);
  return used >= TRANSLATION_LIMIT;
}

export async function recordTranslation(visitorId: string): Promise<{
  used: number;
  remaining: number;
}> {
  const used = (await readCount(visitorId)) + 1;
  await writeCount(visitorId, used);
  return {
    used,
    remaining: Math.max(0, TRANSLATION_LIMIT - used),
  };
}

export const LIMIT_EXCEEDED_MESSAGE =
  "Limit exceeded. You have used all 3 free translations.";
