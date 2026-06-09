import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, Film } from "lucide-react";
import { z } from "zod";
import { recommendMovies } from "@/lib/ai-recommend.functions";
import { MovieCard } from "@/components/MovieCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import type { Mood, Movie } from "@/lib/movies";
import { loadPreferences } from "@/lib/preferences";
import { readResults, saveResults } from "@/lib/movie-cache";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n/I18nProvider";

const SearchSchema = z.object({
  mood: z.string().optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/results")({
  validateSearch: (s) => SearchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Your picks — Mood Movie Picker" },
      {
        name: "description",
        content: "AI-curated movie recommendations tailored to your mood or search.",
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t, tMood } = useI18n();
  const { mood, q } = Route.useSearch();
  const fetchAI = useServerFn(recommendMovies);

  const cacheKey = mood ? `mood:${mood}` : q ? `query:${q.toLowerCase()}` : "";
  const label = mood ? `${mood} mood picks` : q ? `Similar to "${q}"` : "Picks";

  const [movies, setMovies] = useState<Movie[]>([]);
  const [shownTitles, setShownTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  // Initial load — hydrate from cache if same key, else fetch fresh
  useEffect(() => {
    if (!user) return;
    if (!mood && !q) return;
    const cached = readResults();
    if (cached && cached.key === cacheKey && cached.movies.length) {
      setMovies(cached.movies);
      setShownTitles(cached.shownTitles);
      return;
    }
    void run("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mood, q]);

  const titleKey = (title: string) => title.trim().toLowerCase();

  const mergeUniqueMovies = (current: Movie[], incoming: Movie[]) => {
    const seen = new Set(current.map((movie) => titleKey(movie.title)));
    return [
      ...current,
      ...incoming.filter((movie) => {
        const title = titleKey(movie.title);
        if (!title || seen.has(title)) return false;
        seen.add(title);
        return true;
      }),
    ];
  };

  const run = async (mode: "initial" | "refresh" | "append") => {
    if (mode === "append") {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const prefs = loadPreferences();
      const currentTitles = movies.map((movie) => movie.title);
      const baseExcludeTitles =
        mode === "initial" ? [] : Array.from(new Set([...shownTitles, ...currentTitles]));
      let excludeTitles = baseExcludeTitles;
      let list: Movie[] = [];

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const res = await fetchAI({
          data: {
            mood: (mood as Mood) ?? null,
            query: q ?? "",
            count: 8,
            preferences: prefs,
            seed: Math.floor(Math.random() * 1_000_000),
            excludeTitles,
          },
        });
        list = res.movies as unknown as Movie[];
        const currentSet = new Set(currentTitles.map(titleKey));
        const hasFreshMovie = list.some((movie) => !currentSet.has(titleKey(movie.title)));
        if (mode === "initial" || hasFreshMovie) break;
        excludeTitles = Array.from(
          new Set([...excludeTitles, ...list.map((movie) => movie.title)]),
        );
      }

      const nextMovies = mode === "append" ? mergeUniqueMovies(movies, list) : list;
      setMovies(nextMovies);
      const nextShown = Array.from(
        new Set([...shownTitles, ...nextMovies.map((m) => m.title)]),
      ).slice(-60);
      setShownTitles(nextShown);
      saveResults({
        key: cacheKey,
        label,
        kind: mood ? "mood" : "query",
        movies: nextMovies,
        shownTitles: nextShown,
      });
      if (mode !== "append") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:pt-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
          <LanguageSelector variant="light" />
        </div>

        <header className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">
              {mood ? t("moodSelection") : t("similarTo")}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
              {mood ? (
                <>
                  <em className="not-italic text-accent">{tMood(mood as Mood)}</em> {t("picks")}
                </>
              ) : (
                <>
                  {t("like")} <em className="not-italic text-accent">{q}</em>
                </>
              )}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t("resultsSubtitle")}</p>
          </div>
          {!isLoading && movies.length > 0 && (
            <button
              onClick={() => void run("refresh")}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              {t("refreshMovies")}
            </button>
          )}
        </header>

        {isLoading && (
          <div className="mt-24 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm">{t("curating")}</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mx-auto mt-10 max-w-xl rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {!isLoading && movies.length > 0 && (
          <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </section>
        )}

        {!isLoading && movies.length > 0 && (
          <div className="mt-14 flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t("alreadySeen")}
            </p>
            <button
              onClick={() => void run("append")}
              disabled={isLoadingMore}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
              )}
              {t("showMoreMovies")}
            </button>
          </div>
        )}

        {!isLoading && !error && movies.length === 0 && (
          <p className="mt-24 text-center text-sm text-muted-foreground">
            <Film className="mx-auto mb-3 h-6 w-6 opacity-50" />
            {t("noPicks")}
          </p>
        )}
      </div>
    </main>
  );
}
