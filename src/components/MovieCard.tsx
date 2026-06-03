import { Star, Play, Sparkles } from "lucide-react";
import type { Movie } from "@/lib/movies";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-[var(--shadow-glow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {movie.genre} · {movie.year}
          </p>
          <h3 className="mt-2 font-display text-3xl leading-[1.05] text-foreground">
            {movie.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-foreground/15 bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground">
          <Star className="h-3 w-3 fill-current" />
          {movie.rating.toFixed(1)}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[var(--color-graphite)]">
        {movie.description}
      </p>

      {movie.reason && (
        <div className="mt-4 border-l-2 border-accent/70 bg-accent/5 px-3 py-2 text-xs leading-relaxed text-[var(--color-ink-soft)]">
          <span className="font-semibold uppercase tracking-wider text-accent">Why · </span>
          {movie.reason}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {movie.moods.map((mood) => (
          <span
            key={mood}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-medium text-[var(--color-graphite)]"
          >
            <Sparkles className="h-3 w-3" />
            {mood}
          </span>
        ))}
      </div>

      <a
        href={movie.trailerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-foreground/85"
      >
        <Play className="h-4 w-4 fill-current" />
        Watch trailer
      </a>
    </article>
  );
}
