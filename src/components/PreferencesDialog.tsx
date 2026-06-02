import { useState } from "react";
import { Settings2, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PREFERENCES, GENRE_OPTIONS, LANGUAGE_OPTIONS,
  loadPreferences, savePreferences, type UserPreferences,
} from "@/lib/preferences";
import { MOODS } from "@/lib/movies";

interface Props {
  onSaved?: (prefs: UserPreferences) => void;
}

export function PreferencesDialog({ onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const openDialog = () => {
    setPrefs(loadPreferences());
    setOpen(true);
  };

  const toggleGenre = (g: string) => {
    setPrefs((p) => ({
      ...p,
      favoriteGenres: p.favoriteGenres.includes(g)
        ? p.favoriteGenres.filter((x) => x !== g)
        : [...p.favoriteGenres, g],
    }));
  };

  const save = () => {
    savePreferences(prefs);
    onSaved?.(prefs);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={openDialog}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Preferences
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">Your preferences</DialogTitle>
          <p className="text-xs text-muted-foreground">
            These tune every AI recommendation just for you.
          </p>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Favorite genres
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => {
                const active = prefs.favoriteGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card/50 text-foreground hover:border-primary/40"
                    }`}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Content type
              </label>
              <Select
                value={prefs.contentType}
                onValueChange={(v) => setPrefs((p) => ({ ...p, contentType: v as UserPreferences["contentType"] }))}
              >
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="series">Series</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Favorite mood
              </label>
              <Select
                value={prefs.favoriteMood}
                onValueChange={(v) => setPrefs((p) => ({ ...p, favoriteMood: v }))}
              >
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {MOODS.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.emoji} {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Language
              </label>
              <Select
                value={prefs.language}
                onValueChange={(v) => setPrefs((p) => ({ ...p, language: v }))}
              >
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((l) => (
                    <SelectItem key={l} value={l}>{l === "any" ? "Any" : l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Age category
              </label>
              <Select
                value={prefs.ageCategory}
                onValueChange={(v) => setPrefs((p) => ({ ...p, ageCategory: v as UserPreferences["ageCategory"] }))}
              >
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="kids">Kids</SelectItem>
                  <SelectItem value="teens">Teens</SelectItem>
                  <SelectItem value="adults">Adults</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <button
            onClick={save}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Save preferences
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
