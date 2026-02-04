import { NextRequest, NextResponse } from "next/server";

// Proxy de imagen para evitar restricciones de hotlinking
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id") || "823631";

  try {
    const imageRes = await fetch(`https://img.sofascore.com/api/v1/player/${id}/image`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!imageRes.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = await imageRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse("Error fetching image", { status: 500 });
  }
}
