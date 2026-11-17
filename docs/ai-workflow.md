# FRAME implementation decisions

## Implementation scope

This implementation extends the existing Vite/React application in place. It keeps the existing dependency stack and Tailwind 4 Vite plugin, and does not add a backend or additional runtime packages.

## Architecture

- `models/Movie.ts` defines normalized movie and OMDb response types.
- `services/movieService.ts` owns OMDb request construction, response mapping, error normalization, and a short-lived in-memory cache that deduplicates concurrent identical requests.
- `services/localStorageService.ts` owns browser persistence for saved movies and the demo session.
- Viewmodels own search debounce/pagination, curated discovery requests, and movie-detail loading.
- React contexts share favorites and demo-session state across routes. Favorites persist in localStorage and respond to cross-tab storage events.
- Pages and components render data and state supplied by those layers.

## Data and safety decisions

Movie search and detailed OMDb metadata remain sourced from OMDb; TMDB supplies high-resolution backdrops, posters where needed, movie similarity, and person credits. The starter's fictional titles and ratings were removed. The featured title and shelf queries are curated searches, not claims about live rankings. Search responses do not include IMDb ratings, so cards show a dash until details provide an actual rating rather than inventing one.

The API key is read from `VITE_OMDB_API_KEY`, with `.env.example` documenting setup and `.env` ignored by Git. Vite client variables are public in the generated bundle; this integration is appropriate for a local/demo frontend and must not be treated as secret credential storage.

The optional authentication UX stores only a demo email session, never a password. It accepts form-valid input without verifying credentials and is clearly labeled as insecure demonstration behavior.

## AI assistance

AI assistance was used to inspect and extend the existing project, implement the requested frontend layers and UI, and run build/lint/browser checks. The prompt that guided this implementation is preserved in `docs/prompts.md`. The configured OMDb API was exercised with live search and movie-detail requests; this does not verify API quota behavior or real account authentication.

## Verification limits

The production build, lint checks, and browser flows were run locally. Live OMDb search and detail responses were verified, but API quota behavior was not exhaustively tested. Frontend-only demo authentication is not security testing.

## 2026-11-17 — Experience redesign, preferences, and movie intelligence

- The existing `/` route now selects a public editorial landing when there is no local demo session and the personalized discovery dashboard after demo sign-in. Both experiences reuse the current OMDb, favorites, and carousel layers.
- Search remains on the current page: the header expands an inline input, uses the existing debounced search viewmodel, and shows accessible keyboard-navigable OMDb movie results. It does not open a modal or a search route.
- Profile display name, language selections, and genre selections use a dedicated preference context and localStorage key. They remain separate from favorites and the demo session.
- OMDb title search cannot query a person's filmography, so `tmdbService.ts` resolves the selected movie to TMDB and uses TMDB's similar/recommended movie data plus cast and director credit endpoints. The selected cast member is identified by TMDB person ID; director and cast shelves contain movies from that person's actual credits, exclude the current title, and deduplicate across shelves. Similar movies are ranked by shared TMDB genres. TMDB-backed recommendations use stable `tmdb-{id}` detail routes; OMDb search and details remain unchanged.
- Preference recommendations fetch title details and rank/filter against OMDb's returned genre and language fields. Telugu uses real Telugu film title seeds and the same returned-language verification; selecting preferences does not invent movie metadata.
- OMDb does not include trailer URLs. The user supplied a TMDB Read Access Token, so `tmdbService.ts` matches OMDb IMDb IDs through TMDB's `find` endpoint, uses TMDB's original-size backdrop images, and only accepts a YouTube video marked by TMDB as an official trailer. The token is stored in the ignored local `.env`, sent only in the authorization header, and is still visible to browser users because Vite embeds client variables.
- The trailer player fills the hero section, remains muted, and keeps the TMDB backdrop visible until YouTube reports playback; it also exposes play/pause and a YouTube link, pauses when its movie changes, and respects reduced-motion preferences. Movie details place the poster beside the movie metadata. The footer includes TMDB's approved logo and attribution notice.
- The dashboard removes the tall welcome block and rotates through up to six OMDb-detailed featured titles, with manual controls, a pause control, and reduced-motion support. The greeting is retained in the compact hero eyebrow.
- Curated rails use OMDb title searches and are not represented as live trending or ranking data. Search results are restricted to movies.
- The frontend API key remains a Vite client variable and is public in browser traffic. The demo profile stores only an email, not a password; neither feature is production authentication or secret storage.
- TMDB and YouTube remain external dependencies. Browser checks verified loaded TMDB backdrops and cast/director credit results, but this test browser reported YouTube codec errors; actual trailer playback still needs manual verification in a supported browser. Autoplay policy, TMDB rate limits, and network availability also apply.
