import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, Loader2, Play, Star, Sparkles } from "lucide-react";
import { recommendMovies } from "@/lib/ai-recommend.functions";
import { getMovieDetails, type MovieDetails } from "@/lib/movie-details.functions";
import { getPoster } from "@/lib/poster-tmdb.functions";
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
    <main className="min-h-screen bg-[#070709] text-zinc-100">
      {/* Hero banner */}
      <div className="relative">
        <div
          className="absolute inset-0 h-[520px] bg-cover bg-center opacity-40 blur-2xl"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 h-[520px] bg-gradient-to-b from-black/40 via-[#070709]/85 to-[#070709]" />

        <div className="relative mx-auto max-w-6xl px-5 pt-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </Link>
            <LanguageSelector />
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-[260px_1fr] md:gap-10">
            <div className="mx-auto w-44 md:mx-0 md:w-full">
              <img
                src={poster}
                alt={`${title} poster`}
                className="aspect-[2/3] w-full rounded-2xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.6)]"
              />
            </div>

            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-300">
                {details?.genre ?? base?.genre ?? "Film"}
                {year ? ` · ${year}` : ""}
              </p>
              <h1 className="mt-3 font-display text-5xl leading-[0.95] text-white sm:text-6xl">
                {title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1 font-semibold text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {(details?.rating ?? base?.rating ?? 0).toFixed(1)}
                </span>
                {details?.runtime && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {details.runtime}
                  </span>
                )}
                {details?.language && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {details.language}
                  </span>
                )}
              </div>

              {base?.reason && (
                <div className="mt-5 max-w-2xl border-l-2 border-rose-400/70 bg-rose-400/5 px-4 py-3 text-sm text-zinc-200">
                  <span className="font-semibold uppercase tracking-wider text-rose-300">{t("why")} · </span>
                  {base.reason}
                </div>
              )}

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300">
                {details?.plot ?? base?.description ?? t("loadingDetails")}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    `${title} ${year ?? ""} trailer`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(244,63,94,0.4)] transition hover:shadow-[0_15px_40px_rgba(244,63,94,0.55)]"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {t("watchTrailer")}
                </a>
                <button
                  onClick={handleSave}
                  className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${
                    saved
                      ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-300"
                      : "border-white/15 bg-white/5 text-white hover:border-white/40"
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
          <div className="mt-12 flex items-center justify-center gap-2 text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t("loadingDetails")}</span>
          </div>
        )}

        {error && !loading && (
          <div className="mx-auto mt-10 max-w-xl rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-center text-sm text-rose-200">
            {error}
          </div>
        )}

        {details && !loading && (
          <>
            {/* Trailer embed */}
            <section className="mt-14">
              <h2 className="font-display text-2xl tracking-wide text-white">{t("trailer")}</h2>
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_15px_50px_rgba(0,0,0,0.6)]">
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
                <h2 className="font-display text-2xl tracking-wide text-white">{t("castCrew")}</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-24 text-zinc-500">{t("director")}</dt>
                    <dd className="text-zinc-200">{details.director}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 text-zinc-500">{t("starring")}</dt>
                    <dd className="text-zinc-200">{details.actors.join(", ")}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 text-zinc-500">{t("genre")}</dt>
                    <dd className="text-zinc-200">{details.genre}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="font-display text-2xl tracking-wide text-white">{t("moodTags")}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {details.moodTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-200"
                    >
                      <Sparkles className="h-3 w-3 text-rose-300" />
                      {tag}
                    </span>
                  ))}
                  {base?.moods?.map((tag) => (
                    <span
                      key={`m-${tag}`}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-200"
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
              <h2 className="font-display text-3xl tracking-wide text-white">{t("moreLikeThis")}</h2>
              <button
                onClick={() =>
                  navigate({ to: "/results", search: { q: title } })
                }
                className="text-xs uppercase tracking-[0.25em] text-rose-300 hover:text-rose-200"
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
