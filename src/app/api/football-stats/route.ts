import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

// Sevilla FC team ID
const SEVILLA_ID = 559;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "team";

  if (!API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const headers = {
    "X-Auth-Token": API_KEY,
  };

  try {
    if (type === "team") {
      // Get team info and squad
      const [teamRes, matchesRes] = await Promise.all([
        fetch(`${BASE_URL}/teams/${SEVILLA_ID}`, { headers }),
        fetch(`${BASE_URL}/teams/${SEVILLA_ID}/matches?status=FINISHED&limit=10`, { headers }),
      ]);

      const team = await teamRes.json();
      const matches = await matchesRes.json();

      return NextResponse.json({
        team: {
          name: team.name,
          crest: team.crest,
          venue: team.venue,
          coach: team.coach?.name,
          squad: team.squad?.map((p: any) => ({
            id: p.id,
            name: p.name,
            position: p.position,
            nationality: p.nationality,
            dateOfBirth: p.dateOfBirth,
            shirtNumber: p.shirtNumber,
          })),
        },
        recentMatches: matches.matches?.map((m: any) => ({
          date: m.utcDate,
          competition: m.competition?.name,
          homeTeam: m.homeTeam?.name,
          awayTeam: m.awayTeam?.name,
          score: m.score?.fullTime,
          winner: m.score?.winner,
        })),
      });
    }

    if (type === "standings") {
      // Get La Liga standings
      const res = await fetch(`${BASE_URL}/competitions/PD/standings`, { headers });
      const data = await res.json();

      const laLigaTable = data.standings?.find((s: any) => s.type === "TOTAL");
      const sevillaPosition = laLigaTable?.table?.find((t: any) => t.team.id === SEVILLA_ID);

      return NextResponse.json({
        position: sevillaPosition?.position,
        played: sevillaPosition?.playedGames,
        won: sevillaPosition?.won,
        draw: sevillaPosition?.draw,
        lost: sevillaPosition?.lost,
        points: sevillaPosition?.points,
        goalsFor: sevillaPosition?.goalsFor,
        goalsAgainst: sevillaPosition?.goalsAgainst,
        form: sevillaPosition?.form,
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Football API error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
