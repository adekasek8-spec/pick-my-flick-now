import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Shuffle, Film, LogOut } from "lucide-react";
import { MOODS, MOVIES, byMood, findSimilar, type Mood, type Movie } from "@/lib/movies";
import { MovieCard } from "@/components/MovieCard";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mood Movie Picker — Find your next film by mood" },
      { name: "description", content: "Discover movies, series, and anime based on your mood or a film you already love." },
      { property: "og:title", content: "Mood Movie Picker" },
      { property: "og:description", content: "Discover movies, series, and anime based on your mood or a film you already love." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const [mood, setMood] = useState<Mood | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [picked, setPicked] = useState<Movie | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);

  const recommendations = useMemo<Movie[]>(() => {
    if (submittedQuery.trim()) {
      const sim = findSimilar(submittedQuery, 8);
      if (sim.length) return sim;
    }
    if (mood) return byMood(mood);
    return [];
  }, [mood, submittedQuery]);

  const pickRandom = () => {
    const pool = recommendations.length ? recommendations : MOVIES;
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setPicked(choice);
    setTimeout(() => {
      document.getElementById("pick")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const nextQuery = query.trim();
    setSubmittedQuery(nextQuery);
    if (nextQuery) setMood(null);
    setPicked(null);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:pt-12">
      {/* User bar */}
      {user && (
        <div className="mb-6 flex items-center justify-end gap-3 text-sm">
          <span className="text-muted-foreground">
            Hi, <span className="font-medium text-foreground">{user.user_metadata?.full_name || user.email}</span>
          </span>
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
          <Film className="h-3.5 w-3.5 text-primary" />
          Mood Movie Picker
        </div>
        <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-wide sm:text-7xl">
          What should you
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-[var(--color-gold)] bg-clip-text text-transparent">
            watch tonight?
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Don't know what to watch? Mood Movie Picker helps you find the perfect movie, series, or anime based on your mood. Choose your feeling or type a movie you already like, and we will suggest the best options for you.
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
          className="inline-flex h-12 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90"
        >
          Find similar
        </button>
      </form>

      {submittedQuery && (
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-muted-foreground">
          Showing movies similar to <span className="font-medium text-foreground">{submittedQuery}</span>.
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
                onClick={() => {
                  setMood(active ? null : m.name);
                  setSubmittedQuery("");
                  setQuery("");
                  setPicked(null);
                }}
                className={`group relative inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
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

      {/* Pick for me */}
      {recommendations.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={pickRandom}
            className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-[var(--shadow-glow)]"
          >
            <Shuffle className="h-4 w-4 transition-transform group-hover:rotate-180" />
            Pick for me
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
        {recommendations.length > 0 ? (
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
        ) : submittedQuery ? (
          <p className="text-center text-muted-foreground">
            No matches for "{submittedQuery}". Try another title or pick a mood.
          </p>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Choose a mood or search a movie to get started.
          </p>
        )}
      </section>

      <footer className="mt-24 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        Made with 🎬 for movie nights
      </footer>
    </main>
  );
}
