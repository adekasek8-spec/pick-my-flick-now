# Deployment Rules

This project is a TanStack Start / Nitro SSR app deployed on Vercel.

## Repository Checks

- Before editing, confirm the current folder is the project root and check `git remote -v` and `git branch --show-current`.
- Do not work in an old duplicate clone unless the student confirms it is the correct folder.

## Vercel Settings

- Root Directory: project root.
- Framework Preset: TanStack Start.
- Install Command: `npm install`.
- Build Command: `npm run build`.
- Output Directory: leave blank for TanStack Start so Vercel uses Nitro Build Output API from `.vercel/output`.
- Node.js: 20 or newer.
- This repo contains both `package-lock.json` and `bun.lock`; Vercel must use npm. Keep `vercel.json` explicit about `installCommand` and `buildCommand`.

## Environment Safety

- Never commit `.env`, `.env.local`, or any `.env.*` file except `.env.example`.
- Never print real API keys, tokens, database URLs, private keys, service-role keys, or secrets in chat.
- Keep `VERCEL_ENV_IMPORT.local.env` and `VERCEL_ENV_VALUES.local.md` local only and ignored by git.
- Public frontend variables such as `VITE_*` are visible in the browser. Never put private secrets in `VITE_*`.
- `.env.example` should contain variable names and placeholder values only.

## Supabase

- `SUPABASE_URL` is the base project URL, for example `https://PROJECT_REF.supabase.co`; do not include `/rest/v1`.
- The Supabase project ref is the part before `.supabase.co`.
- `SUPABASE_PUBLISHABLE_KEY` is the anon/public frontend-safe key.
- `VITE_SUPABASE_URL` is the same base project URL exposed to the browser.
- `VITE_SUPABASE_PUBLISHABLE_KEY` is the same anon/public key exposed to the browser.
- `VITE_SUPABASE_PROJECT_ID` is the project ref exposed to the browser.
- `SUPABASE_SERVICE_ROLE_KEY` is secret and server-only. Never create `VITE_SUPABASE_SERVICE_ROLE_KEY`.
- Do not require `SUPABASE_SERVICE_ROLE_KEY` unless backend admin actions must bypass RLS. Current app code uses RLS/public client paths and does not import the service-role client.
- After deploying to Vercel, Supabase Authentication URL Configuration must include the production Vercel URL as Site URL and allow the production, preview, and localhost redirect URLs.
- Social login should use Supabase OAuth directly on Vercel, not Lovable Cloud Auth.
- Keep social login buttons behind `VITE_ENABLE_GOOGLE_AUTH` and `VITE_ENABLE_APPLE_AUTH`; only set them to `true` when the matching Supabase provider is enabled.

## Database Migrations

- Migrations are SQL files that create or update database tables, functions, triggers, and policies.
- Supabase migrations live in `supabase/migrations`.
- If runtime errors say a table cannot be found in the schema cache, apply the SQL migration to the target Supabase project.
- If the Supabase CLI is available and authenticated, use:
  `supabase link --project-ref PROJECT_REF`
  `supabase db push`
- If CLI login or database password is unavailable, open Supabase SQL Editor and run the SQL from the migration file manually.

## Gemini

- `GEMINI_API_KEY` is a secret backend/server-only key. Never expose it as `VITE_GEMINI_API_KEY`.
- `GEMINI_MODEL` should default to `gemini-2.5-flash-lite` for student projects unless the user explicitly asks for a different model.

## Before Deploy

- Confirm `.env` is ignored and `.env.example` is safe to commit.
- Confirm Vercel has all required environment variables for Production, Preview, and Development.
- Confirm `npm run build` passes and produces TanStack/Nitro output for Vercel.
- Confirm Supabase migrations have been applied to the project referenced by `SUPABASE_URL`.
- Commit and push only safe files; never commit real local env files.
