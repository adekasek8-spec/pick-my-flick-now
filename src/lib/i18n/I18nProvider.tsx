import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LANGUAGES, TRANSLATIONS, type Language, type TranslationKey } from "./translations";
import type { Mood } from "@/lib/movies";

const KEY = "mmp:lang";

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
  tMood: (mood: Mood) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitial(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(KEY) as Language | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  } catch {}
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    setLangState(detectInitial());
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = l;
  };

  const t = (key: TranslationKey) => TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key];

  const tMood = (mood: Mood) => {
    const key = `mood${mood}` as TranslationKey;
    return TRANSLATIONS[lang][key] ?? mood;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, tMood }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
