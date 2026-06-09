import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateGeminiJson } from "./gemini.server";

const MOODS = [
  "Happy",
  "Sad",
  "Calm",
  "Motivated",
  "Action",
  "Romantic",
  "Scary",
  "Anime",
] as const;

const PreferencesSchema = z.object({
  favoriteGenres: z.array(z.string()).max(20).default([]),
  contentType: z.enum(["movie", "series", "anime", "any"]).default("any"),
  favoriteMood: z.string().max(40).default("any"),
  language: z.string().max(40).default("any"),
  ageCategory: z.enum(["kids", "teens", "adults", "any"]).default("any"),
});

const InputSchema = z.object({
  mood: z.enum(MOODS).nullable().optional(),
  query: z.string().max(200).optional(),
  count: z.number().min(1).max(12).default(8),
  preferences: PreferencesSchema.optional(),
  seed: z.number().optional(),
  excludeTitles: z.array(z.string()).max(50).optional(),
});

const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(700),
});

const ChatInputSchema = z.object({
  message: z.string().trim().min(2).max(700),
  history: z.array(ChatMessageSchema).max(10).default([]),
  count: z.number().min(1).max(8).default(6),
  preferences: PreferencesSchema.optional(),
});

export interface AIMovie {
  id: string;
  title: string;
  genre: string;
  description: string;
  moods: string[];
  rating: number;
  year: number;
  trailerUrl: string;
  keywords: string[];
  reason: string;
  score: number;
}

type MovieCandidate = Omit<AIMovie, "id" | "trailerUrl">;

function normalizeTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "");
}

function seededIndex(seed: number | undefined, length: number): number {
  if (!length) return 0;
  const value = Math.abs(Math.sin(seed ?? Date.now()) * 10000);
  return Math.floor(value) % length;
}

function rotateCandidates(
  candidates: MovieCandidate[],
  seed: number | undefined,
): MovieCandidate[] {
  if (candidates.length < 2) return candidates;
  const start = seededIndex(seed, candidates.length);
  return [...candidates.slice(start), ...candidates.slice(0, start)];
}

function fallbackRecommendations(
  mood: string | null | undefined,
  count: number,
  excludeTitles: string[] = [],
  seed?: number,
): MovieCandidate[] {
  const byMood: Record<string, MovieCandidate[]> = {
    Sad: [
      {
        title: "Manchester by the Sea",
        genre: "Drama",
        description:
          "A guarded janitor returns home to face grief, family, and impossible responsibility.",
        moods: ["Sad"],
        rating: 7.8,
        year: 2016,
        keywords: ["grief", "family", "drama", "loss", "quiet"],
        reason: "Recommended because it is a deeply emotional character drama.",
        score: 9.4,
      },
      {
        title: "My Life Without Me",
        genre: "Drama",
        description: "A young woman quietly reshapes her life after receiving devastating news.",
        moods: ["Sad", "Calm"],
        rating: 7.4,
        year: 2003,
        keywords: ["tearjerker", "illness", "family", "intimate", "bittersweet"],
        reason: "Recommended for a tender, sad, reflective mood.",
        score: 8.8,
      },
      {
        title: "Tokyo Story",
        genre: "Drama",
        description:
          "An elderly couple visits their grown children in a quietly heartbreaking family portrait.",
        moods: ["Sad", "Calm"],
        rating: 8.1,
        year: 1953,
        keywords: ["family", "aging", "classic", "melancholy", "Japanese"],
        reason: "Recommended because it is one of cinema’s most moving family dramas.",
        score: 8.7,
      },
      {
        title: "Life as a House",
        genre: "Drama",
        description: "A father and son rebuild a home while confronting old wounds.",
        moods: ["Sad", "Motivated"],
        rating: 7.4,
        year: 2001,
        keywords: ["family", "healing", "father-son", "emotional", "redemption"],
        reason: "Recommended for emotional drama with a hopeful edge.",
        score: 8.3,
      },
      {
        title: "Aftersun",
        genre: "Drama",
        description:
          "A woman remembers a tender holiday with her father through fragments and feeling.",
        moods: ["Sad", "Calm"],
        rating: 7.6,
        year: 2022,
        keywords: ["memory", "father", "melancholy", "indie"],
        reason: "Recommended for a quiet, aching story that stays with you.",
        score: 8.6,
      },
      {
        title: "A Monster Calls",
        genre: "Fantasy / Drama",
        description:
          "A grieving boy meets a tree-like creature that helps him face painful truths.",
        moods: ["Sad"],
        rating: 7.4,
        year: 2016,
        keywords: ["grief", "fantasy", "family", "healing"],
        reason: "Recommended for emotional fantasy with a cathartic heart.",
        score: 8.4,
      },
    ],
    Happy: [
      {
        title: "Paddington 2",
        genre: "Comedy / Family",
        description: "A kind bear turns a prison and a city brighter while clearing his name.",
        moods: ["Happy", "Calm"],
        rating: 8.2,
        year: 2017,
        keywords: ["feelgood", "family", "comedy", "kindness"],
        reason: "Recommended for pure warmth, humor, and comfort.",
        score: 9.1,
      },
      {
        title: "Sing Street",
        genre: "Comedy / Music",
        description: "A Dublin teen starts a band to impress a girl and escape a hard home life.",
        moods: ["Happy", "Motivated"],
        rating: 7.9,
        year: 2016,
        keywords: ["music", "coming-of-age", "fun", "hope"],
        reason: "Recommended for an upbeat burst of music and confidence.",
        score: 8.8,
      },
      {
        title: "Chef",
        genre: "Comedy / Drama",
        description: "A chef rebuilds his life and family bond through a food truck road trip.",
        moods: ["Happy", "Calm"],
        rating: 7.3,
        year: 2014,
        keywords: ["food", "family", "road trip", "feelgood"],
        reason: "Recommended when you want something easy, sunny, and satisfying.",
        score: 8.5,
      },
      {
        title: "The Grand Budapest Hotel",
        genre: "Comedy / Adventure",
        description: "A legendary concierge races through a stylish caper full of charm and chaos.",
        moods: ["Happy", "Calm"],
        rating: 8.1,
        year: 2014,
        keywords: ["comedy", "stylish", "adventure", "witty", "colorful"],
        reason: "Recommended for a smart, visually rich mood lift.",
        score: 8.2,
      },
    ],
    Calm: [
      {
        title: "Paterson",
        genre: "Drama",
        description: "A bus driver poet finds meaning in the small rhythms of ordinary days.",
        moods: ["Calm"],
        rating: 7.3,
        year: 2016,
        keywords: ["poetry", "quiet", "routine", "slice-of-life"],
        reason: "Recommended for a peaceful, observant watch.",
        score: 8.8,
      },
      {
        title: "Columbus",
        genre: "Drama",
        description:
          "Two strangers connect through architecture, silence, and decisions they avoid.",
        moods: ["Calm"],
        rating: 7.2,
        year: 2017,
        keywords: ["architecture", "quiet", "reflective", "indie"],
        reason: "Recommended for calm visuals and gentle emotional depth.",
        score: 8.6,
      },
      {
        title: "My Neighbor Totoro",
        genre: "Anime / Family",
        description: "Two sisters discover magical forest spirits in the Japanese countryside.",
        moods: ["Calm", "Anime", "Happy"],
        rating: 8.2,
        year: 1988,
        keywords: ["ghibli", "anime", "calm", "magical"],
        reason: "Recommended for soft wonder and cozy fantasy.",
        score: 8.5,
      },
      {
        title: "Little Forest",
        genre: "Drama",
        description:
          "A woman returns to the countryside and rebuilds herself through food and seasons.",
        moods: ["Calm"],
        rating: 7.2,
        year: 2018,
        keywords: ["food", "countryside", "healing", "quiet"],
        reason: "Recommended for a restorative, slow-life mood.",
        score: 8.3,
      },
    ],
    Motivated: [
      {
        title: "Whiplash",
        genre: "Drama / Music",
        description: "A young drummer is pushed to his limits by a ruthless music instructor.",
        moods: ["Motivated"],
        rating: 8.5,
        year: 2014,
        keywords: ["music", "intense", "drive"],
        reason: "Recommended for raw ambition and relentless energy.",
        score: 9.1,
      },
      {
        title: "The Pursuit of Happyness",
        genre: "Drama",
        description: "A struggling father fights homelessness to build a future for his son.",
        moods: ["Motivated", "Sad"],
        rating: 8.0,
        year: 2006,
        keywords: ["inspiring", "father", "survival", "success"],
        reason: "Recommended for a direct hit of perseverance.",
        score: 8.9,
      },
      {
        title: "Moneyball",
        genre: "Sports / Drama",
        description: "A baseball manager challenges tradition with data and nerve.",
        moods: ["Motivated"],
        rating: 7.6,
        year: 2011,
        keywords: ["sports", "strategy", "underdog", "career"],
        reason: "Recommended for smart underdog momentum.",
        score: 8.5,
      },
      {
        title: "Rocky",
        genre: "Sports / Drama",
        description: "A small-time boxer gets the chance of a lifetime to fight the champion.",
        moods: ["Motivated"],
        rating: 8.1,
        year: 1976,
        keywords: ["boxing", "inspiring", "sports"],
        reason: "Recommended for classic grit and heart.",
        score: 8.4,
      },
    ],
    Action: [
      {
        title: "Mad Max: Fury Road",
        genre: "Action / Sci-Fi",
        description: "A relentless chase across a post-apocalyptic wasteland.",
        moods: ["Action"],
        rating: 8.1,
        year: 2015,
        keywords: ["action", "chase", "post-apocalyptic"],
        reason: "Recommended for nonstop practical action and momentum.",
        score: 9.0,
      },
      {
        title: "John Wick",
        genre: "Action / Thriller",
        description: "A retired hitman returns for one last mission of revenge.",
        moods: ["Action"],
        rating: 7.4,
        year: 2014,
        keywords: ["action", "revenge", "thriller"],
        reason: "Recommended for clean, stylish action choreography.",
        score: 8.7,
      },
      {
        title: "The Raid: Redemption",
        genre: "Action / Thriller",
        description: "A police squad fights floor by floor through a crime lord's tower.",
        moods: ["Action"],
        rating: 7.6,
        year: 2011,
        keywords: ["martial arts", "survival", "crime", "intense"],
        reason: "Recommended for tight, brutal action with no wasted time.",
        score: 8.6,
      },
      {
        title: "Spider-Man: Into the Spider-Verse",
        genre: "Animation / Action",
        description: "A teen hero finds courage across a dazzling multiverse adventure.",
        moods: ["Happy", "Action"],
        rating: 8.4,
        year: 2018,
        keywords: ["superhero", "animation", "coming-of-age", "fun", "action"],
        reason: "Recommended as an energetic, crowd-pleasing pick.",
        score: 8.6,
      },
    ],
    Romantic: [
      {
        title: "Before Sunrise",
        genre: "Romance / Drama",
        description: "Two strangers spend one unforgettable night walking through Vienna.",
        moods: ["Romantic", "Calm"],
        rating: 8.1,
        year: 1995,
        keywords: ["romance", "conversation", "walking", "intimate"],
        reason: "Recommended for natural chemistry and a soft romantic mood.",
        score: 9.0,
      },
      {
        title: "Pride & Prejudice",
        genre: "Romance / Drama",
        description: "Elizabeth Bennet matches wits and hearts with the brooding Mr. Darcy.",
        moods: ["Romantic"],
        rating: 7.8,
        year: 2005,
        keywords: ["romance", "classic", "period"],
        reason: "Recommended for classic longing and elegant romance.",
        score: 8.7,
      },
      {
        title: "In the Mood for Love",
        genre: "Romance / Drama",
        description: "Two neighbors in 1960s Hong Kong circle around desire and restraint.",
        moods: ["Romantic", "Calm"],
        rating: 8.1,
        year: 2000,
        keywords: ["romance", "melancholy", "hong kong", "beautiful"],
        reason: "Recommended for a gorgeous, restrained love story.",
        score: 8.6,
      },
      {
        title: "Your Name",
        genre: "Anime / Romance",
        description: "Two teenagers mysteriously connected across distance search for each other.",
        moods: ["Romantic", "Anime"],
        rating: 8.4,
        year: 2016,
        keywords: ["anime", "romance", "fantasy", "emotional", "beautiful"],
        reason: "Recommended for romance, wonder, and emotion.",
        score: 8.4,
      },
    ],
    Scary: [
      {
        title: "Get Out",
        genre: "Horror / Thriller",
        description: "A weekend meeting the girlfriend's family turns into a waking nightmare.",
        moods: ["Scary"],
        rating: 7.7,
        year: 2017,
        keywords: ["horror", "thriller", "twist"],
        reason: "Recommended for sharp social horror and suspense.",
        score: 8.9,
      },
      {
        title: "Hereditary",
        genre: "Horror",
        description: "A family's dark inheritance unravels in nightmarish ways.",
        moods: ["Scary"],
        rating: 7.3,
        year: 2018,
        keywords: ["horror", "dark", "family", "dread"],
        reason: "Recommended for heavy dread and disturbing atmosphere.",
        score: 8.7,
      },
      {
        title: "The Wailing",
        genre: "Horror / Mystery",
        description: "A village is consumed by paranoia after a string of violent events.",
        moods: ["Scary"],
        rating: 7.4,
        year: 2016,
        keywords: ["korean", "horror", "mystery", "possession"],
        reason: "Recommended for a long, unnerving mystery-horror spiral.",
        score: 8.5,
      },
      {
        title: "The Conjuring",
        genre: "Horror",
        description: "Paranormal investigators face a malevolent presence haunting a family.",
        moods: ["Scary"],
        rating: 7.5,
        year: 2013,
        keywords: ["horror", "ghost", "supernatural"],
        reason: "Recommended for polished supernatural scares.",
        score: 8.2,
      },
    ],
    Anime: [
      {
        title: "Spirited Away",
        genre: "Anime / Fantasy",
        description: "A girl enters a magical spirit world to save her parents.",
        moods: ["Anime", "Calm"],
        rating: 8.6,
        year: 2001,
        keywords: ["ghibli", "anime", "fantasy"],
        reason: "Recommended for magical world-building and emotional charm.",
        score: 9.0,
      },
      {
        title: "A Silent Voice",
        genre: "Anime / Drama",
        description: "A former bully seeks redemption with the deaf classmate he hurt.",
        moods: ["Anime", "Sad"],
        rating: 8.1,
        year: 2016,
        keywords: ["anime", "emotional", "drama"],
        reason: "Recommended for heartfelt anime drama.",
        score: 8.8,
      },
      {
        title: "Redline",
        genre: "Anime / Action",
        description: "A daredevil racer enters the galaxy's most dangerous race.",
        moods: ["Anime", "Action"],
        rating: 7.5,
        year: 2009,
        keywords: ["anime", "racing", "action", "stylish"],
        reason: "Recommended for wild animation and pure speed.",
        score: 8.5,
      },
      {
        title: "Your Name",
        genre: "Anime / Romance",
        description: "Two teenagers mysteriously connected across distance search for each other.",
        moods: ["Anime", "Romantic"],
        rating: 8.4,
        year: 2016,
        keywords: ["anime", "romance", "fantasy"],
        reason: "Recommended for anime romance with a big emotional sweep.",
        score: 8.4,
      },
    ],
  };
  const general: MovieCandidate[] = [
    {
      title: "Spider-Man: Into the Spider-Verse",
      genre: "Animation / Action",
      description: "A teen hero finds courage across a dazzling multiverse adventure.",
      moods: ["Happy", "Action"],
      rating: 8.4,
      year: 2018,
      keywords: ["superhero", "animation", "coming-of-age", "fun", "action"],
      reason: "Recommended as an energetic, crowd-pleasing pick.",
      score: 8.6,
    },
    {
      title: "Interstellar",
      genre: "Sci-Fi / Drama",
      description: "Explorers cross space and time in a grand story about survival and love.",
      moods: ["Motivated", "Sad"],
      rating: 8.7,
      year: 2014,
      keywords: ["space", "epic", "family", "sci-fi", "emotional"],
      reason: "Recommended for a big emotional adventure.",
      score: 8.5,
    },
    {
      title: "Your Name",
      genre: "Anime / Romance",
      description: "Two teenagers mysteriously connected across distance search for each other.",
      moods: ["Romantic", "Anime"],
      rating: 8.4,
      year: 2016,
      keywords: ["anime", "romance", "fantasy", "emotional", "beautiful"],
      reason: "Recommended for romance, wonder, and emotion.",
      score: 8.4,
    },
    {
      title: "The Grand Budapest Hotel",
      genre: "Comedy / Adventure",
      description: "A legendary concierge races through a stylish caper full of charm and chaos.",
      moods: ["Happy", "Calm"],
      rating: 8.1,
      year: 2014,
      keywords: ["comedy", "stylish", "adventure", "witty", "colorful"],
      reason: "Recommended for a smart, visually rich mood lift.",
      score: 8.2,
    },
  ];
  const excluded = new Set(excludeTitles.map(normalizeTitle));
  const pool = [...(mood && byMood[mood] ? byMood[mood] : general), ...general]
    .filter(
      (movie, index, all) =>
        all.findIndex((item) => normalizeTitle(item.title) === normalizeTitle(movie.title)) ===
        index,
    )
    .filter((movie) => !excluded.has(normalizeTitle(movie.title)));
  const freshPool = pool.length ? pool : mood && byMood[mood] ? byMood[mood] : general;
  return rotateCandidates(freshPool, seed).slice(0, count);
}

export const recommendMovies = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ movies: AIMovie[] }> => {
    const { mood, query, count, preferences, seed, excludeTitles } = data;
    const prefs = preferences ?? {
      favoriteGenres: [],
      contentType: "any" as const,
      favoriteMood: "any",
      language: "any",
      ageCategory: "any" as const,
    };

    // Build a varying instruction so the model doesn't repeat itself
    const variationHints = [
      "Mix well-known classics with hidden gems.",
      "Lean toward modern releases (last 10 years).",
      "Include at least one international / non-English title.",
      "Include at least one critically-acclaimed older film.",
      "Mix mainstream hits with cult favorites.",
      "Favor titles from different decades and countries.",
    ];
    const variation = variationHints[seededIndex(seed, variationHints.length)];

    const prefsLines: string[] = [];
    if (prefs.favoriteGenres.length)
      prefsLines.push(`Favorite genres: ${prefs.favoriteGenres.join(", ")}`);
    if (prefs.contentType !== "any") prefsLines.push(`Prefers: ${prefs.contentType}`);
    if (prefs.favoriteMood !== "any") prefsLines.push(`Default mood: ${prefs.favoriteMood}`);
    if (prefs.language !== "any") prefsLines.push(`Preferred language: ${prefs.language}`);
    if (prefs.ageCategory !== "any") prefsLines.push(`Age category: ${prefs.ageCategory}`);
    const prefsBlock = prefsLines.length
      ? `\n\nUser preferences:\n- ${prefsLines.join("\n- ")}`
      : "";

    const excludeBlock = excludeTitles?.length
      ? `\n\nDo NOT suggest these titles because they were already shown: ${excludeTitles.slice(0, 45).join(", ")}.`
      : "";
    const seedBlock = `\n\nRequest variant seed: ${seed ?? Date.now()}. Use this to choose a different valid set than previous requests.`;

    let userPrompt: string;
    if (query?.trim()) {
      userPrompt = `The user typed: "${query.trim()}".

First, internally identify this title and analyze its tags:
- Genre, mood, atmosphere
- Story theme & main style
- Target audience

Then recommend ${count} movies/series/anime that genuinely match those tags. For example:
- "Spider-Man" → superhero, action, adventure, Marvel-style
- "Hachiko" → emotional, sad, family drama, animal bond
- "Interstellar" → sci-fi, space, mystery, emotional adventure
- "The Conjuring" → horror, supernatural, dark
- "Your Name" → romantic, emotional, anime, fantasy

Rule: results MUST share genre/mood/theme with the typed title — not generic top movies.${prefsBlock}${excludeBlock}${seedBlock}

Variation hint for this request: ${variation}`;
    } else if (mood) {
      const moodGuide: Record<string, string> = {
        Happy: "comedy, adventure, light feel-good movies",
        Sad: "emotional dramas, tearjerkers, character stories",
        Calm: "peaceful, slow, beautifully shot films",
        Motivated: "inspirational, sports, success and underdog stories",
        Action: "superhero, fights, chases, adventure",
        Romantic: "romance, love stories, romantic dramas, anime romance",
        Scary: "horror, supernatural, psychological thrillers",
        Anime: "anime movies and series across genres",
      };
      userPrompt = `Recommend ${count} titles for someone in a "${mood}" mood.
Focus on: ${moodGuide[mood] ?? mood}.${prefsBlock}${excludeBlock}${seedBlock}

Variation hint: ${variation}`;
    } else {
      userPrompt = `Recommend ${count} diverse, highly-rated titles.${prefsBlock}${excludeBlock}${seedBlock}\n\nVariation hint: ${variation}`;
    }

    const systemPrompt = `You are a world-class film & anime curator with encyclopedic knowledge.

For every recommendation you MUST:
1. Pick REAL existing titles only — never invent.
2. Match the user's request on genre + mood + theme + style.
3. Respect their preferences (genres, content type, language, age) — they boost the score.
4. Vary your picks: different decades, countries, and tones.
5. Provide an honest, specific "reason" sentence explaining WHY this fits the user.
6. Score each recommendation 0-10 based on how strong the match is.
7. Never return a title from the user's "Do NOT suggest" list.

Scoring guidance (internal):
- Same genre as input: +3
- Same mood as input: +3
- Same theme/atmosphere: +2
- Matches user's contentType: +1
- Matches user's favorite genres or language: +2
Higher score = appears first.`;

    let parsed: { movies: Omit<AIMovie, "id" | "trailerUrl">[] };
    try {
      parsed = await generateGeminiJson({
        systemInstruction: systemPrompt,
        prompt: userPrompt,
        temperature: 0.95,
        schema: {
          type: "object",
          properties: {
            movies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  genre: { type: "string" },
                  description: { type: "string" },
                  moods: {
                    type: "array",
                    items: { type: "string", enum: MOODS as unknown as string[] },
                  },
                  rating: { type: "number" },
                  year: { type: "number" },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                  },
                  reason: { type: "string" },
                  score: { type: "number" },
                },
                required: [
                  "title",
                  "genre",
                  "description",
                  "moods",
                  "rating",
                  "year",
                  "keywords",
                  "reason",
                  "score",
                ],
              },
            },
          },
          required: ["movies"],
        },
      });
    } catch {
      console.warn("AI returned invalid recommendation JSON; using curated fallback.");
      parsed = { movies: fallbackRecommendations(mood, count, excludeTitles, seed) };
    }

    if (!parsed.movies?.length) {
      parsed = { movies: fallbackRecommendations(mood, count, excludeTitles, seed) };
    }

    const excluded = new Set((excludeTitles ?? []).map(normalizeTitle));
    const unique = new Set<string>();
    const movies: AIMovie[] = (parsed.movies ?? [])
      .filter((m) => {
        const title = normalizeTitle(m.title);
        if (!title || excluded.has(title) || unique.has(title)) return false;
        unique.add(title);
        return true;
      })
      .concat(
        fallbackRecommendations(
          mood,
          count,
          [...(excludeTitles ?? []), ...Array.from(unique)],
          seed,
        ),
      )
      .filter(
        (m, i, all) =>
          all.findIndex((item) => normalizeTitle(item.title) === normalizeTitle(m.title)) === i,
      )
      .slice(0, count)
      .map((m, i) => ({
        id: `ai-${Date.now()}-${i}`,
        title: m.title,
        genre: m.genre,
        description: m.description,
        moods: Array.isArray(m.moods) ? m.moods : [],
        rating: Number(m.rating) || 0,
        year: Number(m.year) || 0,
        keywords: Array.isArray(m.keywords) ? m.keywords : [],
        reason: m.reason || "",
        score: Number(m.score) || 0,
        trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${m.title} ${m.year ?? ""} trailer`)}`,
      }))
      .sort((a, b) => b.score - a.score);

    return { movies };
  });

export const chatMovieRecommendations = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChatInputSchema.parse(data))
  .handler(async ({ data }): Promise<{ reply: string; movies: AIMovie[] }> => {
    const { message, history, count, preferences } = data;
    const prefs = preferences ?? {
      favoriteGenres: [],
      contentType: "any" as const,
      favoriteMood: "any",
      language: "any",
      ageCategory: "any" as const,
    };

    const prefsLines: string[] = [];
    if (prefs.favoriteGenres.length)
      prefsLines.push(`Favorite genres: ${prefs.favoriteGenres.join(", ")}`);
    if (prefs.contentType !== "any") prefsLines.push(`Prefers: ${prefs.contentType}`);
    if (prefs.favoriteMood !== "any") prefsLines.push(`Default mood: ${prefs.favoriteMood}`);
    if (prefs.language !== "any") prefsLines.push(`Preferred language: ${prefs.language}`);
    if (prefs.ageCategory !== "any") prefsLines.push(`Age category: ${prefs.ageCategory}`);

    const conversation = history
      .slice(-8)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `Conversation so far:
${conversation || "(none)"}

Latest user plot or preference message:
"${message}"

Saved app preferences:
${prefsLines.length ? prefsLines.map((line) => `- ${line}`).join("\n") : "- none"}

Recommend ${count} real movies, series, or anime with plots similar to the latest message and conversation context.`;

    const systemPrompt = `You are a concise AI movie-chat assistant.

Your job:
1. Treat the user's message primarily as a plot/story request. Extract the premise, protagonist, conflict, setting, mood, genre hints, and any exclusions.
2. Find real existing titles with similar story DNA, not just the same broad genre.
3. Reply in 1-2 friendly sentences explaining what kind of similar stories you found, then provide recommendations.
3. Recommend only REAL existing titles.
4. Make the recommendations diverse but tightly matched to the user's described plot.
5. If the user asks in Russian, Kazakh, Spanish, Turkish, or French, write the reply in that language.
6. In each movie reason, explain the plot similarity in one concise sentence.
7. Return JSON only.`;

    let parsed: {
      reply: string;
      movies: Omit<AIMovie, "id" | "trailerUrl">[];
    };

    try {
      parsed = await generateGeminiJson({
        systemInstruction: systemPrompt,
        prompt,
        temperature: 0.8,
        schema: {
          type: "object",
          properties: {
            reply: { type: "string" },
            movies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  genre: { type: "string" },
                  description: { type: "string" },
                  moods: {
                    type: "array",
                    items: { type: "string", enum: MOODS as unknown as string[] },
                  },
                  rating: { type: "number" },
                  year: { type: "number" },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                  },
                  reason: { type: "string" },
                  score: { type: "number" },
                },
                required: [
                  "title",
                  "genre",
                  "description",
                  "moods",
                  "rating",
                  "year",
                  "keywords",
                  "reason",
                  "score",
                ],
              },
            },
          },
          required: ["reply", "movies"],
        },
      });
    } catch {
      console.warn("AI returned invalid chat JSON; using curated fallback.");
      parsed = {
        reply:
          "I found a few dependable picks based on your message. Try one of these and tell me what you want more or less of.",
        movies: fallbackRecommendations(null, count),
      };
    }

    if (!parsed.movies?.length) {
      parsed.movies = fallbackRecommendations(null, count);
    }

    const movies: AIMovie[] = parsed.movies
      .slice(0, count)
      .map((m, i) => ({
        id: `chat-ai-${Date.now()}-${i}`,
        title: m.title,
        genre: m.genre,
        description: m.description,
        moods: Array.isArray(m.moods) ? m.moods : [],
        rating: Number(m.rating) || 0,
        year: Number(m.year) || 0,
        keywords: Array.isArray(m.keywords) ? m.keywords : [],
        reason: m.reason || "",
        score: Number(m.score) || 0,
        trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${m.title} ${m.year ?? ""} trailer`)}`,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      reply: parsed.reply || "Here are some picks that match your taste.",
      movies,
    };
  });
