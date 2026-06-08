# Vercel Deployment

This project is a TanStack Start app. Vercel supports TanStack Start through Nitro and should use the existing build command:

```sh
npm run build
```

Use Node.js 20 or newer in Vercel.

## Environment Variables

Add these variables in Vercel Project Settings -> Environment Variables for Production, Preview, and Development as needed:

```sh
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
GEMINI_API_KEY
GEMINI_MODEL
TMDB_API_KEY
```

The `VITE_` variables are public and are bundled into the browser. Never create a `VITE_SUPABASE_SERVICE_ROLE_KEY` or `VITE_GEMINI_API_KEY`.

`SUPABASE_SERVICE_ROLE_KEY` is not currently required because the app uses Supabase anon/public clients with RLS and does not import the service-role client. Add it only if a backend admin action is introduced.

The local `.env` file contains local development values. It is intentionally ignored by Git and Vercel uploads.

## Database

Run the SQL in `supabase/migrations/20260602051434_a8793c3b-a388-4509-af5d-8dfdaf3066ae.sql` against the Supabase project referenced by `SUPABASE_URL`. With the Supabase CLI:

```sh
supabase link --project-ref PROJECT_REF
supabase db push
```

`PROJECT_REF` is the part of `https://PROJECT_REF.supabase.co` before `.supabase.co`.
