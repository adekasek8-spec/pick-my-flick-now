import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bot, Loader2, Send, Sparkles } from "lucide-react";
import { chatMovieRecommendations } from "@/lib/ai-recommend.functions";
import { MovieCard } from "@/components/MovieCard";
import { LanguageSelector } from "@/components/LanguageSelector";
import { loadPreferences } from "@/lib/preferences";
import { useAuth } from "@/hooks/useAuth";
import type { Movie } from "@/lib/movies";

type ChatRole = "user" | "assistant";

type ChatTurn = {
  id: string;
  role: ChatRole;
  content: string;
  movies?: Movie[];
};

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI movie chat — Mood Movie Picker" },
      { name: "description", content: "Chat with AI about your taste and get tailored movie recommendations." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const askAI = useServerFn(chatMovieRecommendations);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Describe the plot you want: who the story is about, what happens, the setting, mood, or ending vibe. I will find similar movies.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  const history = useMemo(
    () =>
      turns
        .filter((turn) => turn.id !== "welcome")
        .map((turn) => ({ role: turn.role, content: turn.content })),
    [turns],
  );

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setInput("");
    setError(null);
    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
    };
    setTurns((current) => [...current, userTurn]);
    setIsLoading(true);

    try {
      const result = await askAI({
        data: {
          message,
          history,
          count: 6,
          preferences: loadPreferences(),
        },
      });

      setTurns((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.reply,
          movies: result.movies as unknown as Movie[],
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI chat could not answer right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:pt-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <LanguageSelector variant="light" />
        </div>

        <header className="mt-10 max-w-3xl">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-accent">
            <Bot className="h-4 w-4" />
            AI chat
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] text-foreground sm:text-6xl">
            Describe a plot.
            <br />
            <em className="not-italic text-accent">Find similar movies.</em>
          </h1>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border bg-card/50 p-4 shadow-[var(--shadow-card)] backdrop-blur">
              <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
                {turns.map((turn) => (
                  <div
                    key={turn.id}
                    className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      turn.role === "user"
                        ? "ml-8 bg-primary text-primary-foreground"
                        : "mr-8 border border-border bg-background/70 text-foreground"
                    }`}
                  >
                    {turn.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="mr-8 inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Thinking
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Example: a lonely astronaut gets stuck in space and tries to return home"
                  className="h-12 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
                  aria-label="Send message"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Recommendations
            </div>
            {turns.some((turn) => turn.movies?.length) ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {turns
                  .flatMap((turn) => turn.movies ?? [])
                  .slice(-6)
                  .map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
              </div>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-6 text-center text-sm text-muted-foreground">
                Your recommendations will appear here after your first message.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
