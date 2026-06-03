import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Film, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Mood Movie Picker" },
      { name: "description", content: "Sign in to your Mood Movie Picker account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("welcomeBack") + "!");
    navigate({ to: "/" });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <div className="absolute right-5 top-5">
        <LanguageSelector variant="light" />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground backdrop-blur">
            <Film className="h-3.5 w-3.5 text-primary" />
            {t("brand")}
          </div>
          <h1 className="mt-6 font-display text-5xl tracking-wide">{t("welcomeBack")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("signInSubtitle")}</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card/40 p-8 shadow-[var(--shadow-card)] backdrop-blur-xl"
        >
          <div className="space-y-4">
            <Field icon={<Mail className="h-4 w-4" />} label={t("email")}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-border bg-background/40 pl-10 pr-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label={t("password")}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-border bg-background/40 pl-10 pr-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground transition hover:shadow-[var(--shadow-glow)] disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("signIn")}
          </button>

          <SocialAuthButtons />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              {t("createOne")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}
