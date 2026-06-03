import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, Loader2, Play, Star, Sparkles } from "lucide-react";
import { recommendMovies } from "@/lib/ai-recommend.functions";
import { getMovieDetails, type MovieDetails } from "@/lib/movie-details.functions";
import { getPoster, getTrailer } from "@/lib/poster-tmdb.functions";
import { MovieCard } from "@/components/MovieCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { posterDataUrl, slugify } from "@/lib/poster";
import {
  isInWatchlist,
  readMovieBySlug,
  toggleWatchlist,
} from "@/lib/movie-cache";
import type { Movie } from "@/lib/movies";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { toast } from "sonner";

export const Route = createFileRoute("/movie/$slug")({
  head: () => ({
    meta: [
      { title: "Movie — Mood Movie Picker" },
      { name: "description", content: "Full details, trailer, cast and similar picks." },
    ],
  }),
  component: MoviePage,
});

function MoviePage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const fetchDetails = useServerFn(getMovieDetails);
  const fetchAI = useServerFn(recommendMovies);
  const fetchPoster = useServerFn(getPoster);
  const fetchTrailer = useServerFn(getTrailer);
  const { t } = useI18n();

  const [base, setBase] = useState<Movie | null>(null);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cached = readMovieBySlug(slug);
    setBase(cached);
    setSaved(cached ? isInWatchlist(cached.title) : false);

    const titleGuess = cached?.title ?? slug.replace(/-/g, " ");
    setLoading(true);
    setError(null);
    setPosterUrl(null);
    setBackdropUrl(null);

    // Fetch TMDB poster early (independent of AI details)
    fetchPoster({ data: { title: titleGuess, year: cached?.year } })
      .then((p) => {
        setPosterUrl(p.posterUrl);
        setBackdropUrl(p.backdropUrl);
      })
      .catch(() => {});

    Promise.all([
      fetchDetails({ data: { title: titleGuess, year: cached?.year } }),
      fetchAI({
        data: {
          mood: null,
          query: titleGuess,
          count: 6,
          excludeTitles: [titleGuess],
          seed: Math.floor(Math.random() * 1_000_000),
        },
      }),
    ])
      .then(([d, r]) => {
        setDetails(d.details);
        setSimilar(r.movies as unknown as Movie[]);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not load this movie."),
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const title = details?.title ?? base?.title ?? slug.replace(/-/g, " ");
  const year = details?.year ?? base?.year;
  const fallbackPoster = posterDataUrl(title, details?.genre ?? base?.genre ?? "");
  const poster = posterUrl ?? fallbackPoster;
  const heroBg = backdropUrl ?? posterUrl ?? fallbackPoster;
  const youtubeEmbedSearch = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
    `${title} ${year ?? ""} official trailer`,
  )}`;

  const handleSave = () => {
    const movie: Movie =
      base ??
      ({
        id: `manual-${slug}`,
        title,
        genre: details?.genre ?? "",
        description: details?.plot ?? "",
        moods: [],
        rating: details?.rating ?? 0,
        year: year ?? 0,
        trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${title} trailer`,
        )}`,
        keywords: [],
      } as Movie);
    const added = toggleWatchlist(movie);
    setSaved(added);
    toast(added ? "Added to watchlist" : "Removed from watchlist");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero banner */}
      <div className="relative">
        <div
          className="absolute inset-0 h-[520px] bg-cover bg-center opacity-20 blur-2xl"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 h-[520px] bg-gradient-to-b from-background/40 via-background/85 to-background" />

        <div className="relative mx-auto max-w-6xl px-5 pt-6">
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

          <div className="mt-10 grid gap-8 md:grid-cols-[260px_1fr] md:gap-10">
            <div className="mx-auto w-44 md:mx-0 md:w-full">
              <img
                src={poster}
                alt={`${title} poster`}
                className="aspect-[2/3] w-full rounded-2xl border border-border shadow-[var(--shadow-card)]"
              />
            </div>

            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">
                {details?.genre ?? base?.genre ?? "Film"}
                {year ? ` · ${year}` : ""}
              </p>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
                {title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 font-semibold text-amber-700">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {(details?.rating ?? base?.rating ?? 0).toFixed(1)}
                </span>
                {details?.runtime && (
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
                    {details.runtime}
                  </span>
                )}
                {details?.language && (
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-muted-foreground">
                    {details.language}
                  </span>
                )}
              </div>

              {base?.reason && (
                <div className="mt-5 max-w-2xl border-l-2 border-accent bg-accent/5 px-4 py-3 text-sm text-foreground">
                  <span className="font-semibold uppercase tracking-wider text-accent">{t("why")} · </span>
                  {base.reason}
                </div>
              )}

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {details?.plot ?? base?.description ?? t("loadingDetails")}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${title} ${year ?? ""} trailer`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {t("watchTrailer")}
                </a>
                <button
                  onClick={handleSave}
                  className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${
                    saved
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-700"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  {saved ? t("inWatchlist") : t("saveToWatchlist")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-24">
        {loading && (
          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t("loadingDetails")}</span>
          </div>
        )}

        {error && !loading && (
          <div className="mx-auto mt-10 max-w-xl rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {details && !loading && (
          <>
            {/* Trailer embed */}
            <section className="mt-14">
              <h2 className="font-display text-2xl tracking-tight text-foreground">{t("trailer")}</h2>
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-[var(--shadow-card)]">
                <iframe
                  src={youtubeEmbedSearch}
                  title={`${title} trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </section>

            {/* Cast + meta */}
            <section className="mt-14 grid gap-10 md:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl tracking-tight text-foreground">{t("castCrew")}</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-24 text-muted-foreground">{t("director")}</dt>
                    <dd className="text-foreground">{details.director}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 text-muted-foreground">{t("starring")}</dt>
                    <dd className="text-foreground">{details.actors.join(", ")}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 text-muted-foreground">{t("genre")}</dt>
                    <dd className="text-foreground">{details.genre}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="font-display text-2xl tracking-tight text-foreground">{t("moodTags")}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {details.moodTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground"
                    >
                      <Sparkles className="h-3 w-3 text-accent" />
                      {tag}
                    </span>
                  ))}
                  {base?.moods?.map((tag) => (
                    <span
                      key={`m-${tag}`}
                      className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-16">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl tracking-tight text-foreground">{t("moreLikeThis")}</h2>
              <button
                onClick={() =>
                  navigate({ to: "/results", search: { q: title } })
                }
                className="text-xs uppercase tracking-[0.25em] text-accent hover:text-accent/80"
              >
                {t("seeAll")} →
              </button>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {similar.slice(0, 4).map((m) => (
                <MovieCard key={m.id ?? slugify(m.title)} movie={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
