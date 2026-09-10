import { NextResponse } from "next/server";
import { getLiveSnapshot } from "@/lib/pipeline";
import { cacheSize } from "@/lib/pipeline/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getLiveSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "X-Data-Mode": snapshot.mode,
      "X-Cache-Size": String(cacheSize()),
    },
  });
}