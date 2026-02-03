const RUNWARE_API_KEY = "zsQisLBratFbenq86pSQEq2tco44X8YG";
const RUNWARE_API_URL = "https://api.runware.ai/v1";

interface RunwareImageRequest {
  positivePrompt: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  outputFormat?: string;
}

interface RunwareImageResponse {
  data: {
    imageURL: string;
    taskUUID: string;
  }[];
}

export async function generateImage(prompt: string, options?: {
  width?: number;
  height?: number;
}): Promise<string | null> {
  try {
    const response = await fetch(`${RUNWARE_API_URL}/image/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RUNWARE_API_KEY}`,
      },
      body: JSON.stringify({
        positivePrompt: prompt,
        model: "runware:101@1", // Flux Dev
        width: options?.width || 1024,
        height: options?.height || 576,
        numberResults: 1,
        outputFormat: "WEBP",
      } as RunwareImageRequest),
    });

    if (!response.ok) {
      console.error("Runware API error:", response.status);
      return null;
    }

    const data: RunwareImageResponse = await response.json();
    return data.data?.[0]?.imageURL || null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}

// Prompts predefinidos para diferentes usos
export const IMAGE_PROMPTS = {
  heroBackground: "Professional football stadium at night, dramatic lighting, green pitch, empty seats, cinematic atmosphere, 4k, photorealistic",
  newsPlaceholder: "Abstract football theme, soccer ball, dynamic motion blur, blue and white colors, modern minimalist design",
  playerAction: (playerName: string) =>
    `Professional football player in action, dynamic pose, stadium background, dramatic lighting, sports photography style`,
  matchHighlight: "Football match action shot, players competing for ball, stadium crowd background, dramatic sports photography",
  trainingSession: "Professional football training session, practice field, cones and equipment, morning light, documentary style",
};

// Cache de imágenes generadas
const imageCache = new Map<string, string>();

export async function getCachedImage(key: string, prompt: string, options?: {
  width?: number;
  height?: number;
}): Promise<string | null> {
  if (imageCache.has(key)) {
    return imageCache.get(key) || null;
  }

  const imageUrl = await generateImage(prompt, options);
  if (imageUrl) {
    imageCache.set(key, imageUrl);
  }
  return imageUrl;
}
