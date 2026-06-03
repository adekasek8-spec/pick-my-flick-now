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
      { name: "description", content: "AI-curated movie recommendations tailored to your mood or search." },
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
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mood, q]);

  const run = async (refresh: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const prefs = loadPreferences();
      const res = await fetchAI({
        data: {
          mood: (mood as Mood) ?? null,
          query: q ?? "",
          count: 8,
          preferences: prefs,
          seed: Math.floor(Math.random() * 1_000_000),
          excludeTitles: refresh ? shownTitles : [],
        },
      });
      const list = res.movies as unknown as Movie[];
      setMovies(list);
      const nextShown = Array.from(
        new Set(refresh ? [...shownTitles, ...list.map((m) => m.title)] : list.map((m) => m.title)),
      ).slice(-60);
      setShownTitles(nextShown);
      saveResults({
        key: cacheKey,
        label,
        kind: mood ? "mood" : "query",
        movies: list,
        shownTitles: nextShown,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(244,63,94,0.15),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(124,58,237,0.18),transparent_55%),#070709] text-zinc-100">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-8 sm:pt-12">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
          <LanguageSelector />
        </div>

        <header className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-300">
              {mood ? t("moodSelection") : t("similarTo")}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] text-white sm:text-6xl">
              {mood ? (
                <>
                  <em className="not-italic text-rose-400">{tMood(mood as Mood)}</em> {t("picks")}
                </>
              ) : (
                <>
                  {t("like")} <em className="not-italic text-rose-400">{q}</em>
                </>
              )}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-zinc-400">
              {t("resultsSubtitle")}
            </p>
          </div>
          {!isLoading && movies.length > 0 && (
            <button
              onClick={() => void run(true)}
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-rose-400/60 hover:bg-rose-500/15"
            >
              <RefreshCw className="h-4 w-4" />
              {t("refreshMovies")}
            </button>
          )}
        </header>

        {isLoading && (
          <div className="mt-24 flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin text-rose-400" />
            <p className="text-sm">{t("curating")}</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mx-auto mt-10 max-w-xl rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-center text-sm text-rose-200">
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
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
              {t("alreadySeen")}
            </p>
            <button
              onClick={() => void run(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-500 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_10px_40px_rgba(244,63,94,0.4)] transition hover:shadow-[0_15px_50px_rgba(244,63,94,0.55)]"
            >
              <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
              {t("showMoreMovies")}
            </button>
          </div>
        )}

        {!isLoading && !error && movies.length === 0 && (
          <p className="mt-24 text-center text-sm text-zinc-500">
            <Film className="mx-auto mb-3 h-6 w-6 opacity-50" />
            {t("noPicks")}
          </p>
        )}
      </div>
    </main>
  );
}
