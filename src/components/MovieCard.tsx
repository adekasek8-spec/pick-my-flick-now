import { Star, Play, Sparkles } from "lucide-react";
import type { Movie } from "@/lib/movies";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-[var(--gradient-card)] p-6 shadow-[var(--shadow-card)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl tracking-wide text-foreground">
            {movie.title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {movie.genre} · {movie.year}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-[var(--color-gold)]/30 bg-[var(--color-gold)]/10 px-2.5 py-1 text-sm font-semibold text-[var(--color-gold)]">
          <Star className="h-3.5 w-3.5 fill-current" />
          {movie.rating.toFixed(1)}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {movie.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {movie.moods.map((mood) => (
          <span
            key={mood}
            className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20"
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
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[var(--shadow-glow)]"
      >
        <Play className="h-4 w-4 fill-current" />
        Watch trailer
      </a>
    </div>
  );
}
