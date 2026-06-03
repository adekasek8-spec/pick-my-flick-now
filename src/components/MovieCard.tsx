import { Star, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Movie } from "@/lib/movies";
import { posterDataUrl, slugify } from "@/lib/poster";
import { cacheMovie } from "@/lib/movie-cache";

function matchPercent(score?: number): number {
  if (!score || score <= 0) return 72;
  // score is 0-10
  return Math.min(99, Math.max(55, Math.round(score * 10)));
}

export function MovieCard({ movie }: { movie: Movie }) {
  const slug = slugify(movie.title);
  const poster = posterDataUrl(movie.title, movie.genre);
  const match = matchPercent(movie.score);

  return (
    <Link
      to="/movie/$slug"
      params={{ slug }}
      onClick={() => cacheMovie(movie)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60 shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_20px_60px_rgba(244,63,94,0.25)]"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={`${movie.title} poster`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur">
          <Star className="h-3 w-3 fill-current" />
          {movie.rating.toFixed(1)}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-rose-500/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
          {match}% match
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
            {movie.genre} · {movie.year}
          </p>
          <h3 className="mt-1 line-clamp-2 font-display text-xl leading-tight text-white">
            {movie.title}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-3 text-xs leading-relaxed text-zinc-300">
          {movie.description}
        </p>

        {movie.reason && (
          <div className="border-l-2 border-rose-400/70 bg-rose-400/5 px-3 py-2 text-[11px] leading-relaxed text-zinc-200">
            <span className="font-semibold uppercase tracking-wider text-rose-300">Why · </span>
            {movie.reason}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-1.5">
          {movie.moods.slice(0, 3).map((mood) => (
            <span
              key={mood}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
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
