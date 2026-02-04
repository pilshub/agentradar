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

// GET /api/players/[id] - Datos completos del jugador
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

    return NextResponse.json({
      success: true,
      player: data.player,
      stats: data.stats,
      alerts: data.alerts,
      timestamp: data.timestamp,
      version: data.version,
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load player" }, { status: 500, headers: corsHeaders });
  }
}
