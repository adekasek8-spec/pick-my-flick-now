import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateGeminiJson } from "./gemini.server";

const MOODS = [
  "Happy", "Sad", "Calm", "Motivated",
  "Action", "Romantic", "Scary", "Anime",
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

function fallbackRecommendations(mood: string | null | undefined, count: number): MovieCandidate[] {
  const sad: MovieCandidate[] = [
    { title: "Manchester by the Sea", genre: "Drama", description: "A guarded janitor returns home to face grief, family, and impossible responsibility.", moods: ["Sad"], rating: 7.8, year: 2016, keywords: ["grief", "family", "drama", "loss", "quiet"], reason: "Recommended because it is a deeply emotional character drama.", score: 9.4 },
    { title: "My Life Without Me", genre: "Drama", description: "A young woman quietly reshapes her life after receiving devastating news.", moods: ["Sad", "Calm"], rating: 7.4, year: 2003, keywords: ["tearjerker", "illness", "family", "intimate", "bittersweet"], reason: "Recommended for a tender, sad, reflective mood.", score: 8.8 },
    { title: "Tokyo Story", genre: "Drama", description: "An elderly couple visits their grown children in a quietly heartbreaking family portrait.", moods: ["Sad", "Calm"], rating: 8.1, year: 1953, keywords: ["family", "aging", "classic", "melancholy", "Japanese"], reason: "Recommended because it is one of cinema’s most moving family dramas.", score: 8.7 },
    { title: "Life as a House", genre: "Drama", description: "A father and son rebuild a home while confronting old wounds.", moods: ["Sad", "Motivated"], rating: 7.4, year: 2001, keywords: ["family", "healing", "father-son", "emotional", "redemption"], reason: "Recommended for emotional drama with a hopeful edge.", score: 8.3 },
  ];
  const general: MovieCandidate[] = [
    { title: "Spider-Man: Into the Spider-Verse", genre: "Animation / Action", description: "A teen hero finds courage across a dazzling multiverse adventure.", moods: ["Happy", "Action"], rating: 8.4, year: 2018, keywords: ["superhero", "animation", "coming-of-age", "fun", "action"], reason: "Recommended as an energetic, crowd-pleasing pick.", score: 8.6 },
    { title: "Interstellar", genre: "Sci-Fi / Drama", description: "Explorers cross space and time in a grand story about survival and love.", moods: ["Motivated", "Sad"], rating: 8.7, year: 2014, keywords: ["space", "epic", "family", "sci-fi", "emotional"], reason: "Recommended for a big emotional adventure.", score: 8.5 },
    { title: "Your Name", genre: "Anime / Romance", description: "Two teenagers mysteriously connected across distance search for each other.", moods: ["Romantic", "Anime"], rating: 8.4, year: 2016, keywords: ["anime", "romance", "fantasy", "emotional", "beautiful"], reason: "Recommended for romance, wonder, and emotion.", score: 8.4 },
    { title: "The Grand Budapest Hotel", genre: "Comedy / Adventure", description: "A legendary concierge races through a stylish caper full of charm and chaos.", moods: ["Happy", "Calm"], rating: 8.1, year: 2014, keywords: ["comedy", "stylish", "adventure", "witty", "colorful"], reason: "Recommended for a smart, visually rich mood lift.", score: 8.2 },
  ];
  return (mood === "Sad" ? sad : general).slice(0, count);
}

export const recommendMovies = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<{ movies: AIMovie[] }> => {
    const { mood, query, count, preferences, excludeTitles } = data;
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
    const variation = variationHints[Math.floor(Math.random() * variationHints.length)];

    const prefsLines: string[] = [];
    if (prefs.favoriteGenres.length) prefsLines.push(`Favorite genres: ${prefs.favoriteGenres.join(", ")}`);
    if (prefs.contentType !== "any") prefsLines.push(`Prefers: ${prefs.contentType}`);
    if (prefs.favoriteMood !== "any") prefsLines.push(`Default mood: ${prefs.favoriteMood}`);
    if (prefs.language !== "any") prefsLines.push(`Preferred language: ${prefs.language}`);
    if (prefs.ageCategory !== "any") prefsLines.push(`Age category: ${prefs.ageCategory}`);
    const prefsBlock = prefsLines.length ? `\n\nUser preferences:\n- ${prefsLines.join("\n- ")}` : "";

    const excludeBlock = excludeTitles?.length
      ? `\n\nDo NOT suggest these (already shown): ${excludeTitles.slice(0, 30).join(", ")}.`
      : "";

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

Rule: results MUST share genre/mood/theme with the typed title — not generic top movies.${prefsBlock}${excludeBlock}

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
Focus on: ${moodGuide[mood] ?? mood}.${prefsBlock}${excludeBlock}

Variation hint: ${variation}`;
    } else {
      userPrompt = `Recommend ${count} diverse, highly-rated titles.${prefsBlock}${excludeBlock}\n\nVariation hint: ${variation}`;
    }

    const systemPrompt = `You are a world-class film & anime curator with encyclopedic knowledge.

For every recommendation you MUST:
1. Pick REAL existing titles only — never invent.
2. Match the user's request on genre + mood + theme + style.
3. Respect their preferences (genres, content type, language, age) — they boost the score.
4. Vary your picks: different decades, countries, and tones.
5. Provide an honest, specific "reason" sentence explaining WHY this fits the user.
6. Score each recommendation 0-10 based on how strong the match is.

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
                required: ["title", "genre", "description", "moods", "rating", "year", "keywords", "reason", "score"],
              },
            },
          },
          required: ["movies"],
        },
      });
    } catch {
      console.warn("AI returned invalid recommendation JSON; using curated fallback.");
      parsed = { movies: fallbackRecommendations(mood, count) };
    }

    if (!parsed.movies?.length) {
      parsed = { movies: fallbackRecommendations(mood, count) };
    }

    const movies: AIMovie[] = (parsed.movies ?? [])
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
