import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  title: z.string().min(1).max(200),
  year: z.number().optional(),
});

export interface MovieDetails {
  title: string;
  year: number;
  genre: string;
  rating: number;
  plot: string;
  actors: string[];
  director: string;
  moodTags: string[];
  runtime: string;
  language: string;
  youtubeQuery: string;
}

export const getMovieDetails = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ details: MovieDetails }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `Give me the real, factual details about the film/series/anime titled "${data.title}"${
      data.year ? ` (${data.year})` : ""
    }. Use only verified information — do not invent. If multiple titles match, pick the most famous one.`;

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
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are a film database expert. Return only real, verifiable info for the requested title.",
            },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_details",
                description: "Return verified movie details.",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    year: { type: "number" },
                    genre: { type: "string" },
                    rating: { type: "number", description: "IMDb-style 0-10" },
                    plot: { type: "string", description: "2-3 sentence plot summary." },
                    actors: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 main cast members.",
                    },
                    director: { type: "string" },
                    moodTags: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 vibe words: e.g. 'gritty', 'uplifting'.",
                    },
                    runtime: { type: "string", description: "e.g. '2h 28m'" },
                    language: { type: "string" },
                  },
                  required: [
                    "title",
                    "year",
                    "genre",
                    "rating",
                    "plot",
                    "actors",
                    "director",
                    "moodTags",
                    "runtime",
                    "language",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_details" } },
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("AI details error:", response.status, text);
      throw new Error("Could not load movie details.");
    }

    const payload = await response.json();
    const argsRaw = payload?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!argsRaw) throw new Error("No details returned.");
    const parsed = JSON.parse(argsRaw) as MovieDetails;

    return {
      details: {
        ...parsed,
        youtubeQuery: `${parsed.title} ${parsed.year ?? ""} trailer`.trim(),
      },
    };
  });
