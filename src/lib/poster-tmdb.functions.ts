import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  title: z.string().min(1).max(200),
  year: z.number().int().optional(),
});

export interface PosterResult {
  posterUrl: string | null;
  backdropUrl: string | null;
  tmdbId: number | null;
}

// In-memory cache (per server instance) — avoids hammering TMDB for repeats
const cache = new Map<string, PosterResult>();

async function searchTmdb(
  endpoint: "movie" | "tv",
  title: string,
  year: number | undefined,
  apiKey: string,
): Promise<PosterResult | null> {
  const params = new URLSearchParams({
    api_key: apiKey,
    query: title,
    include_adult: "false",
    language: "en-US",
  });
  if (year && endpoint === "movie") params.set("year", String(year));
  if (year && endpoint === "tv") params.set("first_air_date_year", String(year));

  const url = `https://api.themoviedb.org/3/search/${endpoint}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    results?: Array<{ id: number; poster_path?: string | null; backdrop_path?: string | null }>;
  };
  const hit = data.results?.find((r) => r.poster_path) ?? data.results?.[0];
  if (!hit) return null;
  return {
    tmdbId: hit.id,
    posterUrl: hit.poster_path
      ? `https://image.tmdb.org/t/p/w500${hit.poster_path}`
      : null,
    backdropUrl: hit.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${hit.backdrop_path}`
      : null,
  };
}

export const getPoster = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<PosterResult> => {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return { posterUrl: null, backdropUrl: null, tmdbId: null };
    }
    const key = `${data.title.toLowerCase().trim()}|${data.year ?? ""}`;
    const cached = cache.get(key);
    if (cached) return cached;

    try {
      // Try movie first, then TV (for series/anime), then movie w/o year
      let result =
        (await searchTmdb("movie", data.title, data.year, apiKey)) ||
        (await searchTmdb("tv", data.title, data.year, apiKey)) ||
        (await searchTmdb("movie", data.title, undefined, apiKey)) ||
        (await searchTmdb("tv", data.title, undefined, apiKey));

      if (!result) result = { posterUrl: null, backdropUrl: null, tmdbId: null };
      cache.set(key, result);
      return result;
    } catch (err) {
      console.error("TMDB poster fetch failed:", err);
      return { posterUrl: null, backdropUrl: null, tmdbId: null };
    }
  });
