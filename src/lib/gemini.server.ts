type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
};

type GeminiRequest = {
  systemInstruction: string;
  prompt: string;
  schema?: unknown;
  temperature?: number;
};

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  return {
    apiKey,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  };
}

function extractJsonText(payload: GeminiResponse) {
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) throw new Error("Gemini returned no content.");

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced?.[1]?.trim() ?? text;
}

export async function generateGeminiJson<T>({
  systemInstruction,
  prompt,
  schema,
  temperature = 0.4,
}: GeminiRequest): Promise<T> {
  const { apiKey, model } = getGeminiConfig();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
        ...(schema ? { responseSchema: schema } : {}),
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Gemini API error:", response.status, text);
    throw new Error("AI request failed. Please try again.");
  }

  const payload = (await response.json()) as GeminiResponse;
  return JSON.parse(extractJsonText(payload)) as T;
}
