import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Film, LogOut, Sparkles, Bookmark } from "lucide-react";
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
  const { user, loading, signOut } = useAuth();
  const { t, tMood } = useI18n();
  const [query, setQuery] = useState("");
  const [watchCount, setWatchCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

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
    <main className="relative min-h-screen overflow-hidden bg-[#070709] text-zinc-100">
      {/* Cinematic backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-rose-500/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[600px] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute left-0 top-1/3 h-[400px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-8 sm:pt-12">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="inline-flex items-center gap-2 text-zinc-400">
            <Film className="h-4 w-4 text-rose-400" />
            <span className="font-display text-lg tracking-wider text-white">{t("brand")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user && (
              <span className="hidden sm:inline text-zinc-400">
                <span className="font-medium text-white">{user.user_metadata?.full_name || user.email}</span>
              </span>
            )}
            {user && watchCount > 0 && (
              <Link
                to="/results"
                search={{ q: "watchlist favorites" }}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {watchCount} {t("saved")}
              </Link>
            )}
            <LanguageSelector />
            {user && <PreferencesDialog />}
            {user && (
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/40 hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("signOut")}
              </button>
            )}
          </div>
        </div>

        {/* Hero */}
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            {t("heroBadge")}
          </div>
          <h1 className="mt-8 font-display text-6xl leading-[0.95] text-white sm:text-7xl md:text-[88px]">
            {t("heroTitle1")}
            <br />
            <em className="not-italic bg-gradient-to-r from-rose-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              {t("heroTitle2")}
            </em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            {t("heroSubtitle")}
          </p>
        </header>

        {/* Search */}
        <form onSubmit={onSearch} className="mx-auto mt-12 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 backdrop-blur focus:border-rose-400/60 focus:outline-none focus:ring-2 focus:ring-rose-400/30"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-violet-500 px-6 text-sm font-bold text-white shadow-[0_10px_30px_rgba(244,63,94,0.4)] transition hover:shadow-[0_15px_40px_rgba(244,63,94,0.55)] disabled:opacity-40 disabled:shadow-none"
          >
            <Sparkles className="h-4 w-4" />
            {t("findSimilar")}
          </button>
        </form>

        {/* Moods */}
        <section className="mt-16">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-zinc-500">
            {t("orPickMood")}
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {MOODS.map((m) => (
              <button
                key={m.name}
                onClick={() => onMoodClick(m.name)}
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400/60 hover:bg-rose-500/10 hover:text-white hover:shadow-[0_10px_30px_rgba(244,63,94,0.25)]"
              >
                <span className="text-base">{m.emoji}</span>
                {tMood(m.name)}
              </button>
            ))}
          </div>
        </section>

        <footer className="mt-24 border-t border-white/10 pt-6 text-center text-xs text-zinc-500">
          {t("footer")}
        </footer>
      </div>
    </main>
  );
}
