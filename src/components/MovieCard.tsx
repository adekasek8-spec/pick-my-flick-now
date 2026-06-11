import { useEffect, useState } from "react";
import { Star, Sparkles, Film } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import type { Movie } from "@/lib/movies";
import { posterGradient, slugify } from "@/lib/poster";
import { cacheMovie } from "@/lib/movie-cache";
import { getPoster } from "@/lib/poster-tmdb.functions";
import { useI18n } from "@/lib/i18n/I18nProvider";

function matchPercent(score?: number): number {
  if (!score || score <= 0) return 72;
  return Math.min(99, Math.max(55, Math.round(score * 10)));
}

// Module-level cache so we don't refetch the same title within a session
const posterCache = new Map<string, string | null>();

export function MovieCard({ movie }: { movie: Movie }) {
  const slug = slugify(movie.title);
  const match = matchPercent(movie.score);
  const fetchPoster = useServerFn(getPoster);
  const { t } = useI18n();

  const cacheKey = `${movie.title}|${movie.year}`;
  const initialPoster = movie.posterUrl ?? posterCache.get(cacheKey) ?? null;
  const [poster, setPoster] = useState<string | null>(initialPoster);
  const [loaded, setLoaded] = useState(Boolean(initialPoster));

  useEffect(() => {
    if (movie.posterUrl) {
      posterCache.set(cacheKey, movie.posterUrl);
      setPoster(movie.posterUrl);
      setLoaded(true);
      return;
    }

    setLoaded(false);
    if (posterCache.has(cacheKey)) {
      setPoster(posterCache.get(cacheKey) ?? null);
      setLoaded(Boolean(posterCache.get(cacheKey)));
      return;
    }
    let cancelled = false;
    fetchPoster({ data: { title: movie.title, year: movie.year } })
      .then((res) => {
        if (cancelled) return;
        if (res.posterUrl) posterCache.set(cacheKey, res.posterUrl);
        setPoster(res.posterUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setPoster(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, movie.posterUrl, movie.title, movie.year, fetchPoster]);

  const gradient = posterGradient(movie.title);
  const fallbackStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.via} 55%, ${gradient.to} 100%)`,
  };

  return (
    <Link
      to="/movie/$slug"
      params={{ slug }}
      onClick={() => cacheMovie(movie)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {/* Cinematic fallback always behind the image */}
        <div className="absolute inset-0 flex items-center justify-center" style={fallbackStyle}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.25),transparent_55%)]" />
          <Film className="relative h-14 w-14 text-white/40" strokeWidth={1.2} />
        </div>

        {poster && (
          <img
            src={poster}
            alt={`${movie.title} poster`}
            loading="eager"
            fetchPriority="high"
            onLoad={() => setLoaded(true)}
            className={`relative h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur">
          <Star className="h-3 w-3 fill-current" />
          {movie.rating.toFixed(1)}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg">
          {match}%
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
            {movie.genre} · {movie.year}
          </p>
          <h3 className="mt-1 line-clamp-2 font-display text-xl leading-tight text-white">
            {movie.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {movie.description}
        </p>

        {movie.reason && (
          <div className="border-l-2 border-accent bg-accent/5 px-3 py-2 text-[11px] leading-relaxed text-foreground">
            <span className="font-semibold uppercase tracking-wider text-accent">
              {t("why")} ·{" "}
            </span>
            {movie.reason}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-1.5">
          {movie.moods.slice(0, 3).map((mood) => (
            <span
              key={mood}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground"
            >
              <Sparkles className="h-2.5 w-2.5" />
              {mood}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
