import { NextResponse } from "next/server";
import { getLiveSnapshot } from "@/lib/pipeline";
import { rivers } from "@/lib/demo-data/rivers";

export const dynamic = "force-dynamic";

function resolveRiverId(input: string): string | null {
  if (rivers.some((r) => r.id === input)) return input;
  const byName = rivers.find((r) => r.name.toLowerCase() === input.toLowerCase());
  return byName ? byName.id : null;
}

export async function GET(_req: Request, ctx: RouteContext<"/api/live/[riverId]">) {
  const { riverId: raw } = await ctx.params;
  const riverId = resolveRiverId(raw);
  if (!riverId) {
    return NextResponse.json({ error: "River not found" }, { status: 404 });
  }
  const snapshot = await getLiveSnapshot();
  const river = snapshot.rivers.find((r) => r.riverId === riverId);
  if (!river) {
    return NextResponse.json({ error: "River data unavailable" }, { status: 404 });
  }
  return NextResponse.json(
    {
      river,
      zones: snapshot.zones.filter((z) => z.riverId === riverId),
      sources: snapshot.sources,
      generatedAt: snapshot.generatedAt,
      mode: snapshot.mode,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}