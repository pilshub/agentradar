import { NextRequest, NextResponse } from "next/server";

// Mapeo de IDs de SofaScore verificados
const SOFASCORE_IDS: Record<string, string> = {
  // Real Betis
  "isco": "129522",
  "lo-celso": "796362",
  "chimy-avila": "858498",
  "abde": "1081636",
  "rui-silva": "344407",
  "marc-bartra": "114100",
  "william-carvalho": "162691",
  "johnny-cardoso": "977748",
  // Sevilla FC
  "lukebakio": "823631",
  "saul": "288923",
  "isaac-romero": "993636",
  "jesus-navas": "22574",
  "en-nesyri": "862069",
  "gudelj": "134953",
  "loic-bade": "934258",
  "djibril-sow": "812605",
};

// Nombres para fallback
const PLAYER_NAMES: Record<string, string> = {
  "129522": "Isco",
  "796362": "Lo Celso",
  "858498": "Chimy Avila",
  "1081636": "Abde",
  "344407": "Rui Silva",
  "114100": "Marc Bartra",
  "162691": "William Carvalho",
  "977748": "Johnny Cardoso",
  "823631": "Lukebakio",
  "288923": "Saul",
  "993636": "Isaac Romero",
  "22574": "Jesus Navas",
  "862069": "En-Nesyri",
  "134953": "Gudelj",
  "934258": "Loic Bade",
  "812605": "Djibril Sow",
};

async function fetchWithFallback(id: string): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  // Intentar SofaScore primero
  const sources = [
    `https://img.sofascore.com/api/v1/player/${id}/image`,
    `https://api.sofascore.com/api/v1/player/${id}/image`,
  ];

  for (const url of sources) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Referer": "https://www.sofascore.com/",
        },
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 1000) { // Imagen válida
          return { buffer, contentType: res.headers.get("content-type") || "image/png" };
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

// Proxy de imagen para evitar restricciones de hotlinking
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id") || "823631";
  const name = searchParams.get("name") || PLAYER_NAMES[id] || "Player";

  try {
    // Intentar obtener imagen de SofaScore
    const result = await fetchWithFallback(id);

    if (result) {
      return new NextResponse(result.buffer, {
        headers: {
          "Content-Type": result.contentType,
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Fallback: Redirigir a UI Avatars
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=200&bold=true&format=png`;
    return NextResponse.redirect(fallbackUrl);

  } catch {
    // Error: Redirigir a UI Avatars
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=fff&size=200&bold=true&format=png`;
    return NextResponse.redirect(fallbackUrl);
  }
}
