## Problem
Movie cards are showing the gradient fallback because `src/lib/poster-tmdb.functions.ts` returns `posterUrl: null`. The UI in `MovieCard.tsx` is already wired to show an `<img>` when a poster URL exists, so the issue is in poster retrieval, not the card layout.

## Plan
1. Update `getPoster` in `src/lib/poster-tmdb.functions.ts` to be more reliable:
   - Keep TMDB as the first source when `TMDB_API_KEY` exists.
   - Add a no-key iTunes movie search fallback.
   - Normalize titles before searching, including removing subtitle clutter and alternate-script fragments that can break poster search.
   - Try year-specific and non-year searches.

2. Make failures visible for debugging without breaking the app:
   - Log concise poster lookup misses/errors on the server.
   - Continue returning `{ posterUrl: null }` only after all sources fail.

3. Keep `MovieCard.tsx` mostly unchanged:
   - It already renders the poster correctly when a URL exists.
   - Only adjust if needed to reset the loading opacity when a new poster URL arrives.

## Expected result
Movie cards should display real posters for normal film titles, with the current cinematic fallback only used when both poster sources fail.