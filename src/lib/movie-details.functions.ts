import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateGeminiJson } from "./gemini.server";

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
    const userPrompt = `Give me the real, factual details about the film/series/anime titled "${data.title}"${
      data.year ? ` (${data.year})` : ""
    }. Use only verified information — do not invent. If multiple titles match, pick the most famous one.`;

    const parsed = await generateGeminiJson<MovieDetails>({
      systemInstruction:
        "You are a film database expert. Return only real, verifiable info for the requested title.",
      prompt: userPrompt,
      temperature: 0.2,
      schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          year: { type: "number" },
          genre: { type: "string" },
          rating: { type: "number" },
          plot: { type: "string" },
          actors: {
            type: "array",
            items: { type: "string" },
          },
          director: { type: "string" },
          moodTags: {
            type: "array",
            items: { type: "string" },
          },
          runtime: { type: "string" },
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
      },
    });

    return {
      details: {
        ...parsed,
        youtubeQuery: `${parsed.title} ${parsed.year ?? ""} trailer`.trim(),
      },
    };
  });
