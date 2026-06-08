import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Film, Mail, Lock, User, AtSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import { getAuthRedirectUrl } from "@/lib/auth-redirect";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — Mood Movie Picker" },
      { name: "description", content: "Create your free Mood Movie Picker account." },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required").max(80),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be 20 characters or less")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores"),
    email: z.string().trim().email("Invalid email address").max(255),
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);

    const { data: taken, error: usernameError } = await supabase.rpc("username_exists", {
      _username: parsed.data.username,
    });
    if (usernameError) {
      console.warn("Username uniqueness check unavailable:", usernameError.message);
    }
    if (taken) {
      setErrors({ username: "Username is already taken" });
      setSubmitting(false);
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          full_name: parsed.data.fullName,
          username: parsed.data.username,
        },
      },
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (signUpData.session) {
      toast.success("Welcome to Mood Movie Picker! Your account has been created successfully.");
      navigate({ to: "/" });
      return;
    }

    toast.success("Account created. Please check your email to confirm your sign up.");
    navigate({ to: "/login" });
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
          <h1 className="mt-6 font-display text-5xl tracking-wide">{t("createAccount")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("registerSubtitle")}</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-border bg-card/40 p-8 shadow-[var(--shadow-card)] backdrop-blur-xl"
        >
          <div className="space-y-4">
            <Field icon={<User className="h-4 w-4" />} label={t("fullName")} error={errors.fullName}>
              <input value={form.fullName} onChange={set("fullName")} placeholder="Jane Doe" className={inputCls} />
            </Field>
            <Field icon={<AtSign className="h-4 w-4" />} label={t("username")} error={errors.username}>
              <input value={form.username} onChange={set("username")} placeholder="cinemafan" className={inputCls} />
            </Field>
            <Field icon={<Mail className="h-4 w-4" />} label={t("email")} error={errors.email}>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputCls} />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label={t("password")} error={errors.password}>
              <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" className={inputCls} />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label={t("confirmPassword")} error={errors.confirm}>
              <input type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" className={inputCls} />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent text-sm font-semibold text-primary-foreground transition hover:shadow-[var(--shadow-glow)] disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("createAccount")}
          </button>

          <SocialAuthButtons dividerLabel="or sign up with" />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {t("signIn")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-border bg-background/40 pl-10 pr-3 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30";

function Field({
  icon,
  label,
  error,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        {children}
      </div>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
