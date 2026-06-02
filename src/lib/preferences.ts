export type ContentType = "movie" | "series" | "anime" | "any";
export type AgeCategory = "kids" | "teens" | "adults" | "any";

export interface UserPreferences {
  favoriteGenres: string[];
  contentType: ContentType;
  favoriteMood: string;
  language: string;
  ageCategory: AgeCategory;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteGenres: [],
  contentType: "any",
  favoriteMood: "any",
  language: "any",
  ageCategory: "any",
};

export const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Drama",
  "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller",
  "Documentary", "Musical", "Superhero", "Historical",
];

export const LANGUAGE_OPTIONS = [
  "any", "English", "Japanese", "Korean", "Spanish", "French",
  "Hindi", "Mandarin", "Russian", "German",
];

const KEY = "mmp:preferences";

export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
