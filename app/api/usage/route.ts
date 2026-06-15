import {
  getOrCreateVisitorId,
  getUsage,
} from "@/lib/usage-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const visitorId = await getOrCreateVisitorId();
  const usage = await getUsage(visitorId);
  return NextResponse.json(usage);
}
