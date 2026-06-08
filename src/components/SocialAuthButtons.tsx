import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAuthRedirectUrl } from "@/lib/auth-redirect";

const enabledProviders = {
  google: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true",
  apple: import.meta.env.VITE_ENABLE_APPLE_AUTH === "true",
};

export function SocialAuthButtons({ dividerLabel = "or continue with" }: { dividerLabel?: string }) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const showGoogle = enabledProviders.google;
  const showApple = enabledProviders.apple;

  if (!showGoogle && !showApple) return null;

  const onClick = async (provider: "google" | "apple") => {
    setLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getAuthRedirectUrl(),
      },
    });
    if (error) {
      setLoading(null);
      toast.error(error.message || "Sign in failed");
    }
    // If successful, Supabase redirects the browser to the provider.
  };

  return (
    <div className="mt-6">
      <div className="relative flex items-center justify-center">
        <span className="absolute inset-x-0 h-px bg-border" />
        <span className="relative bg-card px-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {dividerLabel}
        </span>
      </div>
      <div className={`mt-4 grid gap-3 ${showGoogle && showApple ? "grid-cols-2" : "grid-cols-1"}`}>
        {showGoogle && (
          <button
            type="button"
            onClick={() => onClick("google")}
            disabled={loading !== null}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-60"
          >
            {loading === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Google
          </button>
        )}
        {showApple && (
          <button
            type="button"
            onClick={() => onClick("apple")}
            disabled={loading !== null}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-foreground text-sm font-medium text-background transition hover:bg-foreground/90 disabled:opacity-60"
          >
            {loading === "apple" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AppleIcon />
            )}
            Apple
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.12A6.97 6.97 0 0 1 5.47 12c0-.74.13-1.45.36-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.96l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M16.36 1.43c0 1.14-.42 2.22-1.25 3.06-.83.86-1.94 1.51-3.03 1.43-.13-1.1.43-2.25 1.21-3.05.87-.9 2.13-1.55 3.07-1.44zM20.5 17.5c-.55 1.27-.82 1.83-1.52 2.95-.99 1.57-2.38 3.52-4.11 3.54-1.54.02-1.93-1-4.02-1-2.08 0-2.51.98-4.05 1.02-1.66.04-2.93-1.7-3.92-3.26C.95 17.5-.16 12.3 2.03 8.78c1.55-2.5 4-3.97 6.31-3.97 1.6 0 3.12 1.08 4.02 1.08.9 0 2.74-1.33 4.62-1.13.79.03 3 .32 4.42 2.4-3.83 2.09-3.22 7.55-.9 9.34z" />
    </svg>
  );
}
