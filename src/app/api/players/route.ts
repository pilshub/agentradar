import { NextResponse } from "next/server";
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

// GET /api/players - Lista todos los jugadores disponibles
export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), "src", "data");
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith("-complete.json"));

    const players = files.map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
      return {
        id: data.player.id,
        name: data.player.name,
        fullName: data.player.fullName,
        team: data.player.team,
        position: data.player.position,
        nationality: data.player.nationality,
        photo: data.player.photo,
        number: data.player.number,
      };
    });

    return NextResponse.json({
      success: true,
      count: players.length,
      players,
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to load players" }, { status: 500, headers: corsHeaders });
  }
}
