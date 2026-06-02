import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MOODS = [
  "Happy",
  "Sad",
  "Calm",
  "Motivated",
  "Action",
  "Romantic",
  "Scary",
  "Anime",
] as const;

const InputSchema = z.object({
  mood: z.enum(MOODS).nullable().optional(),
  query: z.string().max(200).optional(),
  count: z.number().min(1).max(12).default(8),
});

export interface AIMovie {
  id: string;
  title: string;
  genre: string;
  description: string;
  moods: string[];
  rating: number;
  year: number;
  trailerUrl: string;
  keywords: string[];
}

export const recommendMovies = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ movies: AIMovie[] }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const { mood, query, count } = data;

    const userPrompt = query?.trim()
      ? `The user loves the movie / show: "${query.trim()}". Suggest ${count} similar movies, series, or anime they would enjoy.`
      : mood
        ? `The user is in a "${mood}" mood. Suggest ${count} movies, series, or anime that fit this mood perfectly.`
        : `Suggest ${count} highly-rated, diverse movies, series, or anime.`;

    const systemPrompt = `You are a world-class movie & anime curator. Recommend a diverse mix (different decades, countries, genres). Use real titles only — never invent. Be accurate with year, genre, and IMDb-style rating.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_recommendations",
                description: "Return a list of movie recommendations.",
                parameters: {
                  type: "object",
                  properties: {
                    movies: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          genre: {
                            type: "string",
                            description: "e.g. 'Sci-Fi / Drama'",
                          },
                          description: {
                            type: "string",
                            description: "One sentence, vivid, max 140 chars.",
                          },
                          moods: {
                            type: "array",
                            items: { type: "string", enum: MOODS as unknown as string[] },
                            description: "1-3 moods that best match.",
                          },
                          rating: {
                            type: "number",
                            description: "IMDb-style rating 0-10",
                          },
                          year: { type: "number" },
                          keywords: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                        required: [
                          "title",
                          "genre",
                          "description",
                          "moods",
                          "rating",
                          "year",
                          "keywords",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["movies"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_recommendations" },
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Too many requests right now. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI usage limit reached. Please add credits to your Lovable workspace.");
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI recommendation failed. Please try again.");
    }

    const payload = await response.json();
    const toolCall = payload?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;
    if (!argsRaw) throw new Error("AI returned no recommendations.");

    let parsed: { movies: Omit<AIMovie, "id" | "trailerUrl">[] };
    try {
      parsed = JSON.parse(argsRaw);
    } catch {
      throw new Error("AI returned invalid data.");
    }

    const movies: AIMovie[] = (parsed.movies ?? []).map((m, i) => ({
      id: `ai-${Date.now()}-${i}`,
      title: m.title,
      genre: m.genre,
      description: m.description,
      moods: Array.isArray(m.moods) ? m.moods : [],
      rating: Number(m.rating) || 0,
      year: Number(m.year) || 0,
      keywords: Array.isArray(m.keywords) ? m.keywords : [],
      trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${m.title} ${m.year ?? ""} trailer`,
      )}`,
    }));

    return { movies };
  });
