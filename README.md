# FRAME

FRAME is a frontend-only movie discovery and collection experience built with React, TypeScript, Vite, Tailwind CSS 4, React Router, and Lucide.

## Run locally

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Add an OMDb API key to `VITE_OMDB_API_KEY` and a TMDB Read Access Token to `VITE_TMDB_API_READ_ACCESS_TOKEN` in `.env`.
4. Start the app with `npm run dev`.

Both Vite client credentials are visible to browser users and in network requests. They are only appropriate for this local/demo frontend; use a server-side proxy rather than putting private credentials in a production build. Movie metadata and search results use OMDb. TMDB is only used to find official YouTube trailer metadata, with artwork fallback when no verified source is available. The app requires TMDB's attribution notice, included in the footer.

## Project structure

- `src/models` — movie, search-response, demo-session, and preference types.
- `src/services` — OMDb API, TMDB-backed official trailer lookup, verified-metadata recommendations, and local-storage adapters.
- `src/viewmodels` — discovery, inline search, movie intelligence, and preference-personalized recommendation state.
- `src/views/components` — auth-aware navigation, inline search, profile menu, hero, carousels, cards, and loading/error states.
- `src/views/context` — shared favorites, demo session, and profile-preference state.
- `src/views/pages` — public landing, signed-in dashboard, details, collection, demo-auth, and profile-settings pages.
- `src/hooks` — reusable keyboard interaction.
- `src/routes` — client-side route declarations.

## Available routes

- `/` — public landing while signed out; curated personalized dashboard after demo sign-in.
- `/movie/:id` — OMDb movie details, metadata-verified recommendations, and TMDB-verified official YouTube trailers when available.
- `/collection` — locally saved favorites.
- `/login` and `/register` — optional frontend-only demo session.
- `/settings` — local display-name, language, and genre preferences.

Curated shelves and recommendation candidates use OMDb title lookups; OMDb does not provide live trending or popularity rankings, nor a people/genre filmography search. Recommendation candidates are checked against full OMDb genre, director, actor, and language metadata before display, so related sections may be small or empty. Ratings are shown when OMDb returns them and are not fabricated for search results. Trailer lookup matches an OMDb IMDb ID to TMDB's movie record and only embeds YouTube trailers marked official by TMDB; no URL is inferred from an OMDb poster. The demo sign-in does not verify credentials and is not secure authentication.

## Validation

- `npm run build` — TypeScript project build and Vite production bundle.
- `npm run lint` — Oxlint.

The app also includes a mobile layout, missing-poster fallback, debounced inline search, pagination, accessible search keyboard controls, profile preferences, and API error states. Live movie data requires a valid OMDb key; trailer lookup additionally requires a TMDB Read Access Token.
