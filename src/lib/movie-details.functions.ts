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

type TmdbSearchHit = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
};

type TmdbDetails = {
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  genres?: Array<{ name: string }>;
  vote_average?: number;
  overview?: string;
  runtime?: number;
  episode_run_time?: number[];
  original_language?: string;
  created_by?: Array<{ name: string }>;
  credits?: {
    cast?: Array<{ name: string }>;
    crew?: Array<{ name: string; job?: string }>;
  };
};

function tmdbAuth(apiKey: string): { headers?: HeadersInit; apiKeyParam?: string } {
  const key = apiKey.replace(/^Bearer\s+/i, "").trim();
  if (/^[a-f0-9]{32}$/i.test(key)) return { apiKeyParam: key };
  return { headers: { Authorization: `Bearer ${key}`, accept: "application/json" } };
}

async function fetchTmdb(path: string, apiKey: string, params: URLSearchParams) {
  const auth = tmdbAuth(apiKey);
  if (auth.apiKeyParam) params.set("api_key", auth.apiKeyParam);
  return fetch(`https://api.themoviedb.org/3/${path}?${params.toString()}`, {
    headers: auth.headers,
  });
}

function getYear(date?: string) {
  const year = Number(date?.slice(0, 4));
  return Number.isFinite(year) ? year : 0;
}

function getLanguageName(code?: string) {
  if (!code) return "";
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

async function fetchTmdbDetails(
  title: string,
  year: number | undefined,
): Promise<MovieDetails | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  for (const endpoint of ["movie", "tv"] as const) {
    const searchParams = new URLSearchParams({
      query: title,
      include_adult: "false",
      language: "en-US",
    });
    if (year && endpoint === "movie") searchParams.set("year", String(year));
    if (year && endpoint === "tv") searchParams.set("first_air_date_year", String(year));

    const searchRes = await fetchTmdb(`search/${endpoint}`, apiKey, searchParams);
    if (!searchRes.ok) continue;

    const searchJson = (await searchRes.json()) as { results?: TmdbSearchHit[] };
    const hit = searchJson.results?.[0];
    if (!hit) continue;

    const detailRes = await fetchTmdb(
      `${endpoint}/${hit.id}`,
      apiKey,
      new URLSearchParams({ append_to_response: "credits", language: "en-US" }),
    );
    if (!detailRes.ok) continue;

    const detail = (await detailRes.json()) as TmdbDetails;
    const releaseDate = detail.release_date ?? detail.first_air_date;
    const runtime =
      typeof detail.runtime === "number"
        ? `${detail.runtime} min`
        : detail.episode_run_time?.[0]
          ? `${detail.episode_run_time[0]} min`
          : "";
    const director =
      detail.credits?.crew?.find((person) => person.job === "Director")?.name ??
      detail.created_by?.map((person) => person.name).join(", ") ??
      "";

    return {
      title: detail.title ?? detail.name ?? hit.title ?? hit.name ?? title,
      year: getYear(releaseDate) || year || 0,
      genre: detail.genres?.map((genre) => genre.name).join(" / ") || "Film",
      rating: Number((detail.vote_average ?? 0).toFixed(1)),
      plot: detail.overview || "Details are temporarily unavailable.",
      actors: detail.credits?.cast?.slice(0, 5).map((person) => person.name) ?? [],
      director,
      moodTags: detail.genres?.slice(0, 4).map((genre) => genre.name) ?? [],
      runtime,
      language: getLanguageName(detail.original_language),
      youtubeQuery: `${detail.title ?? detail.name ?? title} ${getYear(releaseDate) || year || ""} trailer`.trim(),
    };
  }

  return null;
}

export const getMovieDetails = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ details: MovieDetails }> => {
    const userPrompt = `Give me the real, factual details about the film/series/anime titled "${data.title}"${
      data.year ? ` (${data.year})` : ""
    }. Use only verified information — do not invent. If multiple titles match, pick the most famous one.`;

    let parsed: MovieDetails | null = null;

    try {
      parsed = await generateGeminiJson<MovieDetails>({
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
    } catch (err) {
      console.warn("[details] Gemini lookup failed; using TMDB fallback.", err);
      parsed = await fetchTmdbDetails(data.title, data.year);
    }

    if (!parsed) {
      parsed = {
        title: data.title,
        year: data.year ?? 0,
        genre: "Film",
        rating: 0,
        plot: "Details are temporarily unavailable.",
        actors: [],
        director: "",
        moodTags: [],
        runtime: "",
        language: "",
        youtubeQuery: `${data.title} ${data.year ?? ""} trailer`.trim(),
      };
    }

    return {
      details: {
        ...parsed,
        youtubeQuery: `${parsed.title} ${parsed.year ?? ""} trailer`.trim(),
      },
    };
  });
