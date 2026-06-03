import { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { LANGUAGES, type Language } from "@/lib/i18n/translations";

export function LanguageSelector({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  const baseBtn =
    variant === "dark"
      ? "border-white/15 bg-white/5 text-zinc-200 hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-white"
      : "border-border bg-card/60 text-foreground hover:border-primary/50";

  const baseMenu =
    variant === "dark"
      ? "border-white/10 bg-zinc-950/95 text-zinc-200 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      : "border-border bg-popover text-foreground shadow-lg";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${baseBtn}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className={`absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border backdrop-blur-xl ${baseMenu}`}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === lang}
              onClick={() => {
                setLang(l.code as Language);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition ${
                variant === "dark" ? "hover:bg-white/5" : "hover:bg-secondary"
              } ${l.code === lang ? (variant === "dark" ? "text-white" : "text-foreground font-medium") : ""}`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base leading-none">{l.flag}</span>
                <span>{l.label}</span>
              </span>
              {l.code === lang && (
                <Check className={`h-3.5 w-3.5 ${variant === "dark" ? "text-rose-400" : "text-accent"}`} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
