import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/players/[id]/calendar - Próximos partidos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataPath = path.join(process.cwd(), "src", "data", `${id}-complete.json`);

    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ success: false, error: "Player not found" }, { status: 404, headers: corsHeaders });
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "all";
    const limit = searchParams.get("limit");

    let matches = data.upcomingMatches || [];

    // Add match type if not present
    matches = matches.map((m: any) => ({
      ...m,
      type: m.type || "club",
      isHome: m.isHome ?? (m.homeTeam?.id === data.player.teamId || m.homeTeam?.includes?.(data.player.team?.split(" ")[0])),
    }));

    // Filter by type
    if (type !== "all") {
      matches = matches.filter((m: any) => m.type === type);
    }

    // Sort by date
    matches.sort((a: any, b: any) => new Date(a.date || a.utcDate).getTime() - new Date(b.date || b.utcDate).getTime());

    // Apply limit
    if (limit) {
      matches = matches.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      success: true,
      count: matches.length,
      team: {
        name: data.player.team,
        id: data.player.teamId,
      },
      nationalTeam: data.performance?.international ? {
        country: data.performance.international.country,
        caps: data.performance.international.caps,
        goals: data.performance.international.goals,
        lastCallUp: data.performance.international.lastCallUp,
      } : null,
      matches: matches.map((m: any) => ({
        id: m.id,
        date: m.date || m.utcDate,
        competition: m.competition?.name || m.competition,
        homeTeam: m.homeTeam?.name || m.homeTeam,
        awayTeam: m.awayTeam?.name || m.awayTeam,
        isHome: m.isHome,
        type: m.type,
        venue: m.venue,
        status: m.status,
      })),
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load calendar" }, { status: 500, headers: corsHeaders });
  }
}
