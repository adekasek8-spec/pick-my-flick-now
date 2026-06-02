import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Shuffle, Film, LogOut, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { MOODS, type Mood, type Movie } from "@/lib/movies";
import { MovieCard } from "@/components/MovieCard";
import { PreferencesDialog } from "@/components/PreferencesDialog";
import { useAuth } from "@/hooks/useAuth";
import { recommendMovies } from "@/lib/ai-recommend.functions";
import { loadPreferences, type UserPreferences } from "@/lib/preferences";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mood Movie Picker — AI-powered film recommendations" },
      { name: "description", content: "Personalized AI movie, series and anime recommendations based on your mood, taste, and a film you already love." },
      { property: "og:title", content: "Mood Movie Picker" },
      { property: "og:description", content: "Personalized AI movie, series and anime recommendations based on your mood, taste, and a film you already love." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const fetchAI = useServerFn(recommendMovies);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const [mood, setMood] = useState<Mood | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [picked, setPicked] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPreferences());
  const [shownTitles, setShownTitles] = useState<string[]>([]);
  const resultsRef = useRef<HTMLElement | null>(null);

  const runRecommend = async (
    opts: { mood?: Mood | null; query?: string; refresh?: boolean },
  ) => {
    setIsLoading(true);
    setError(null);
    setPicked(null);
    try {
      const res = await fetchAI({
        data: {
          mood: opts.mood ?? null,
          query: opts.query ?? "",
          count: 8,
          preferences: prefs,
          seed: Math.floor(Math.random() * 1_000_000),
          excludeTitles: opts.refresh ? shownTitles : [],
        },
      });
      const movies = res.movies as unknown as Movie[];
      setRecommendations(movies);
      setShownTitles((prev) => {
        const next = opts.refresh ? [...prev, ...movies.map((m) => m.title)] : movies.map((m) => m.title);
        return Array.from(new Set(next)).slice(-40);
      });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      if (!opts.refresh) setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;
    setSubmittedQuery(nextQuery);
    setMood(null);
    setShownTitles([]);
    runRecommend({ query: nextQuery });
  };

  const onMoodClick = (m: Mood) => {
    const active = mood === m;
    const next = active ? null : m;
    setMood(next);
    setSubmittedQuery("");
    setQuery("");
    setShownTitles([]);
    if (next) runRecommend({ mood: next });
    else setRecommendations([]);
  };

  const refresh = () => {
    runRecommend({
      mood: mood ?? undefined,
      query: submittedQuery || undefined,
      refresh: true,
    });
  };

  const pickRandom = () => {
    if (!recommendations.length) return;
    const choice = recommendations[Math.floor(Math.random() * recommendations.length)];
    setPicked(choice);
    setTimeout(() => {
      document.getElementById("pick")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:pt-12">
      {/* User bar */}
      {user && (
        <div className="mb-6 flex flex-wrap items-center justify-end gap-3 text-sm">
          <span className="text-muted-foreground">
            Hi, <span className="font-medium text-foreground">{user.user_metadata?.full_name || user.email}</span>
          </span>
          <PreferencesDialog onSaved={setPrefs} />
          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      )}

      {/* Hero */}
      <header className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered · Mood Movie Picker
        </div>
        <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-wide sm:text-7xl">
          What should you
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-[var(--color-gold)] bg-clip-text text-transparent">
            watch tonight?
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Type a movie you love or pick a mood — AI analyzes its genre, theme, and atmosphere to give you fresh, personal picks every time.
        </p>
      </header>

      {/* Search */}
      <form onSubmit={onSearch} className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a movie you love… e.g. Interstellar"
            className="h-12 w-full rounded-xl border border-border bg-card/60 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 backdrop-blur focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Find similar
        </button>
      </form>

      {submittedQuery && !isLoading && (
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
          AI picks similar to <span className="font-medium text-foreground">{submittedQuery}</span>.
        </p>
      )}

      {/* Moods */}
      <section className="mt-14">
        <h2 className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Or pick a mood
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {MOODS.map((m) => {
            const active = mood === m.name;
            return (
              <button
                key={m.name}
                disabled={isLoading}
                onClick={() => onMoodClick(m.name)}
                className={`group relative inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-50 ${
                  active
                    ? "border-primary/60 bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card/50 text-foreground hover:border-primary/40 hover:bg-card"
                }`}
              >
                <span className="text-base">{m.emoji}</span>
                {m.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Loading */}
      {isLoading && (
        <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">AI is curating your picks…</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="mx-auto mt-10 max-w-xl rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      {!isLoading && recommendations.length > 0 && (
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={pickRandom}
            className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-[var(--shadow-glow)]"
          >
            <Shuffle className="h-4 w-4 transition-transform group-hover:rotate-180" />
            Pick for me
          </button>
          <button
            onClick={refresh}
            className="group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-[var(--shadow-glow)]"
          >
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
            More like this
          </button>
        </div>
      )}

      {/* Picked highlight */}
      {picked && (
        <section id="pick" className="mx-auto mt-12 max-w-xl">
          <p className="text-center text-xs uppercase tracking-[0.3em] text-accent">
            Tonight's pick
          </p>
          <div className="mt-4">
            <MovieCard movie={picked} />
          </div>
        </section>
      )}

      {/* Results */}
      <section ref={resultsRef} className="scroll-mt-8 mt-16">
        {!isLoading && recommendations.length > 0 ? (
          <>
            <div className="mb-6 flex items-end justify-between">
              <h2 className="font-display text-3xl tracking-wide">
                {submittedQuery
                  ? `Similar to "${submittedQuery}"`
                  : `${mood} picks`}
              </h2>
              <span className="text-sm text-muted-foreground">
                {recommendations.length} {recommendations.length === 1 ? "result" : "results"}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </>
        ) : !isLoading && !error ? (
          <p className="text-center text-sm text-muted-foreground">
            <Film className="mx-auto mb-3 h-6 w-6 opacity-50" />
            Choose a mood or search a movie to get AI-powered picks.
          </p>
        ) : null}
      </section>

      <footer className="mt-24 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        Made with 🎬 for movie nights · Powered by AI
      </footer>
    </main>
  );
}
