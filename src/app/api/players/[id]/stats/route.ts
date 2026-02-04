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

// GET /api/players/[id]/stats - Estadísticas, valor de mercado, lesiones, contrato
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
    const section = searchParams.get("section") || "all";

    // Market Value
    const marketValue = {
      current: data.marketValue?.current,
      peak: data.marketValue?.peak,
      peakDate: data.marketValue?.peakDate,
      history: data.marketValue?.history?.map((h: any) => ({
        date: h.date,
        value: h.value,
        valueFormatted: `${h.value}M €`,
      })) || [],
      transferHistory: data.marketValue?.transferHistory || [],
    };

    // Injuries
    const injuryList = data.injuries?.list || data.injuries || [];
    const injuries = {
      current: injuryList.find((i: any) => i.status !== "Recuperado") || null,
      history: injuryList,
      stats: data.injuries?.stats || {
        totalInjuries: injuryList.length,
        totalDaysOut: injuryList.reduce((sum: number, i: any) => sum + (i.days || 0), 0),
        totalGamesMissed: injuryList.reduce((sum: number, i: any) => sum + (i.missedGames || 0), 0),
      },
    };

    // Contract
    const contract = {
      expiryDate: data.contract?.endDate || data.contract?.expiryDate,
      yearsRemaining: data.contract?.yearsRemaining,
      estimatedSalary: data.contract?.salaryGross || data.contract?.estimatedSalary,
      releaseClause: data.contract?.releaseClause,
      agent: data.contract?.agent,
    };

    // Performance
    const performance = {
      currentSeason: {
        season: data.performance?.season,
        appearances: data.performance?.appearances,
        goals: data.performance?.goals,
        assists: data.performance?.assists,
        minutesPlayed: data.performance?.minutesPlayed,
        yellowCards: data.performance?.yellowCards,
        redCards: data.performance?.redCards,
        rating: data.performance?.rating,
        passAccuracy: data.performance?.passAccuracy,
        shotsPerGame: data.performance?.shotsPerGame,
        keyPasses: data.performance?.keyPasses,
        dribblesPerGame: data.performance?.dribblesPerGame,
        form: data.performance?.form,
      },
      seasonHistory: data.performance?.seasonHistory || [],
      international: data.performance?.international || null,
    };

    // Return based on section
    if (section === "marketValue") {
      return NextResponse.json({ success: true, marketValue }, { headers: corsHeaders });
    }
    if (section === "injuries") {
      return NextResponse.json({ success: true, injuries }, { headers: corsHeaders });
    }
    if (section === "contract") {
      return NextResponse.json({ success: true, contract }, { headers: corsHeaders });
    }
    if (section === "performance") {
      return NextResponse.json({ success: true, performance }, { headers: corsHeaders });
    }

    // All sections
    return NextResponse.json({
      success: true,
      marketValue,
      injuries,
      contract,
      performance,
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load stats" }, { status: 500, headers: corsHeaders });
  }
}
