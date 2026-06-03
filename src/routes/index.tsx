import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Film, LogOut, Sparkles, Bookmark, ArrowRight } from "lucide-react";
import { MOODS, type Mood } from "@/lib/movies";
import { PreferencesDialog } from "@/components/PreferencesDialog";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";
import { readWatchlist } from "@/lib/movie-cache";
import { useI18n } from "@/lib/i18n/I18nProvider";

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
  const { user, signOut } = useAuth();
  const { t, tMood } = useI18n();
  const [query, setQuery] = useState("");
  const [watchCount, setWatchCount] = useState(0);

  useEffect(() => {
    setWatchCount(readWatchlist().length);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate({ to: "/results", search: { q } });
  };

  const onMoodClick = (m: Mood) => {
    navigate({ to: "/results", search: { mood: m } });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-6 sm:pt-8">
        {/* Top bar */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link to="/" className="inline-flex items-center gap-2">
            <Film className="h-4 w-4 text-foreground" />
            <span className="font-display text-xl tracking-tight text-foreground">{t("brand")}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {user && watchCount > 0 && (
              <Link
                to="/results"
                search={{ q: "watchlist favorites" }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-foreground transition hover:bg-muted"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {watchCount} {t("saved")}
              </Link>
            )}
            <LanguageSelector variant="light" />
            {user ? (
              <>
                <PreferencesDialog />
                <button
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition hover:bg-secondary"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-foreground hover:text-foreground/70"
                >
                  {t("signIn")}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  {t("createOne")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Hero */}
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            {t("heroBadge")}
          </div>
          <h1 className="mt-8 font-display text-6xl leading-[0.95] text-foreground sm:text-7xl md:text-[88px]">
            {t("heroTitle1")}
            <br />
            <em className="not-italic text-accent">{t("heroTitle2")}</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("heroSubtitle")}
          </p>
        </header>

        {/* Search */}
        <form onSubmit={onSearch} className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            {t("findSimilar")}
          </button>
        </form>

        {/* Moods */}
        <section className="mt-16">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("orPickMood")}
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {MOODS.map((m) => (
              <button
                key={m.name}
                onClick={() => onMoodClick(m.name)}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[var(--shadow-card)]"
              >
                <span className="text-base">{m.emoji}</span>
                {tMood(m.name)}
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-24 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {t("footer")}
        </footer>
      </div>
    </main>
  );
}
