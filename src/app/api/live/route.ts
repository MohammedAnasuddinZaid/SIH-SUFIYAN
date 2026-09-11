import { NextResponse } from "next/server";
import { getLiveSnapshot } from "@/lib/pipeline";
import { cacheSize } from "@/lib/pipeline/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await getLiveSnapshot();
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
        "X-Data-Mode": snapshot.mode,
        "X-Cache-Size": String(cacheSize()),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to load live data", detail: msg }, { status: 500 });
  }
}
