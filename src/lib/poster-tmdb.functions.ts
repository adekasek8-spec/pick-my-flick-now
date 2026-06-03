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

const cache = new Map<string, PosterResult>();

// Strip non-Latin chars, parenthetical/bracketed asides, and trailing junk
// the AI sometimes appends (e.g. "Paterson碎", "Sweet Bean (An)").
function cleanTitle(raw: string): string {
  let t = raw.normalize("NFKC");
  // remove CJK / Hangul / Hiragana / Katakana / Cyrillic etc.
  t = t.replace(/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF]/g, "");
  // remove (parens) and [brackets]
  t = t.replace(/\([^)]*\)/g, "").replace(/\[[^\]]*\]/g, "");
  // collapse whitespace + trim punctuation
  t = t.replace(/\s+/g, " ").replace(/[\s\-:·•|]+$/g, "").trim();
  return t || raw.trim();
}

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
  if (!res.ok) {
    console.error(`[poster] TMDB ${endpoint} ${res.status} for "${title}"`);
    return null;
  }
  const data = (await res.json()) as {
    results?: Array<{ id: number; poster_path?: string | null; backdrop_path?: string | null }>;
  };
  const hit = data.results?.find((r) => r.poster_path) ?? data.results?.[0];
  if (!hit) return null;
  return {
    tmdbId: hit.id,
    posterUrl: hit.poster_path ? `https://image.tmdb.org/t/p/w500${hit.poster_path}` : null,
    backdropUrl: hit.backdrop_path ? `https://image.tmdb.org/t/p/w1280${hit.backdrop_path}` : null,
  };
}

async function searchItunes(title: string, year: number | undefined): Promise<PosterResult | null> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=movie&limit=10`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[poster] iTunes ${res.status} for "${title}"`);
      return null;
    }
    const data = (await res.json()) as {
      results?: Array<{ artworkUrl100?: string; releaseDate?: string; trackName?: string }>;
    };
    if (!data.results?.length) return null;
    let hit = data.results[0];
    if (year) {
      const matched = data.results.find((r) => r.releaseDate?.startsWith(String(year)));
      if (matched) hit = matched;
    }
    if (!hit.artworkUrl100) return null;
    // upscale 100x100 -> 600x600
    const poster = hit.artworkUrl100.replace(/\/100x100bb\.(jpg|png)$/, "/600x600bb.$1");
    return { posterUrl: poster, backdropUrl: null, tmdbId: null };
  } catch (err) {
    console.error("[poster] iTunes fetch failed:", err);
    return null;
  }
}

export const getPoster = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<PosterResult> => {
    const cleaned = cleanTitle(data.title);
    const key = `${cleaned.toLowerCase()}|${data.year ?? ""}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const empty: PosterResult = { posterUrl: null, backdropUrl: null, tmdbId: null };
    const apiKey = process.env.TMDB_API_KEY;

    try {
      let result: PosterResult | null = null;

      if (apiKey) {
        result =
          (await searchTmdb("movie", cleaned, data.year, apiKey)) ||
          (await searchTmdb("tv", cleaned, data.year, apiKey)) ||
          (await searchTmdb("movie", cleaned, undefined, apiKey)) ||
          (await searchTmdb("tv", cleaned, undefined, apiKey));
      } else {
        console.warn("[poster] TMDB_API_KEY missing; using iTunes only");
      }

      // iTunes fallback (works without API key)
      if (!result || !result.posterUrl) {
        const itunes = await searchItunes(cleaned, data.year);
        if (itunes) result = itunes;
      }

      const final = result ?? empty;
      if (!final.posterUrl) {
        console.warn(`[poster] no poster for "${data.title}" (cleaned="${cleaned}", year=${data.year ?? "?"})`);
      }
      cache.set(key, final);
      return final;
    } catch (err) {
      console.error("[poster] lookup failed:", err);
      return empty;
    }
  });
