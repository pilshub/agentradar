import { NextRequest, NextResponse } from "next/server";

const RUNWARE_API_KEY = "zsQisLBratFbenq86pSQEq2tco44X8YG";
const RUNWARE_API_URL = "https://api.runware.ai/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, width = 1024, height = 576 } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${RUNWARE_API_URL}/image/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RUNWARE_API_KEY}`,
      },
      body: JSON.stringify({
        positivePrompt: prompt,
        model: "runware:101@1", // Flux Dev
        width,
        height,
        numberResults: 1,
        outputFormat: "WEBP",
      }),
    });

    if (!response.ok) {
      console.error("Runware API error:", response.status);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.imageURL || null;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
