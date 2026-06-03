// Lightweight client-side caches that let us pass AI-generated movies between
// routes (results → details) without round-tripping the server again.

import type { Movie } from "@/lib/movies";
import { slugify } from "@/lib/poster";

const RESULTS_KEY = "mm:results";
const MOVIES_KEY = "mm:movies";
const WATCH_KEY = "mm:watchlist";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function localSafe(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export interface CachedResults {
  key: string; // e.g. "mood:Action" or "query:spider-man"
  label: string;
  kind: "mood" | "query";
  movies: Movie[];
  shownTitles: string[];
}

export function saveResults(data: CachedResults) {
  const s = safeStorage();
  if (!s) return;
  s.setItem(RESULTS_KEY, JSON.stringify(data));
  // Also index movies by slug for the details page
  const map = readMovieMap();
  for (const m of data.movies) map[slugify(m.title)] = m;
  s.setItem(MOVIES_KEY, JSON.stringify(map));
}

export function readResults(): CachedResults | null {
  const s = safeStorage();
  if (!s) return null;
  const raw = s.getItem(RESULTS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedResults;
  } catch {
    return null;
  }
}

function readMovieMap(): Record<string, Movie> {
  const s = safeStorage();
  if (!s) return {};
  const raw = s.getItem(MOVIES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, Movie>;
  } catch {
    return {};
  }
}

export function readMovieBySlug(slug: string): Movie | null {
  return readMovieMap()[slug] ?? null;
}

export function cacheMovie(movie: Movie) {
  const s = safeStorage();
  if (!s) return;
  const map = readMovieMap();
  map[slugify(movie.title)] = movie;
  s.setItem(MOVIES_KEY, JSON.stringify(map));
}

// -------- Watchlist (localStorage) --------

export function readWatchlist(): Movie[] {
  const s = localSafe();
  if (!s) return [];
  const raw = s.getItem(WATCH_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Movie[];
  } catch {
    return [];
  }
}

export function isInWatchlist(title: string): boolean {
  return readWatchlist().some((m) => m.title === title);
}

export function toggleWatchlist(movie: Movie): boolean {
  const s = localSafe();
  if (!s) return false;
  const list = readWatchlist();
  const idx = list.findIndex((m) => m.title === movie.title);
  let added: boolean;
  if (idx >= 0) {
    list.splice(idx, 1);
    added = false;
  } else {
    list.unshift(movie);
    added = true;
  }
  s.setItem(WATCH_KEY, JSON.stringify(list.slice(0, 100)));
  return added;
}
