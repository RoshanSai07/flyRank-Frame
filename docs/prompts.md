# FRAME — Complete Movie Discovery Application
Continue developing the existing FRAME application.

Act as a senior React engineer, frontend architect, and UI/UX designer.

Your task is to transform the existing project into a fully functional, visually polished movie discovery and collection application.

IMPORTANT:

- Inspect the existing project before making changes.
- Do not rebuild the application from scratch.
- Preserve existing working components and functionality.
- Maintain the established MVVM architecture.
- This is a FRONTEND-ONLY application.
- Do not integrate Firebase.
- Do not create a backend.
- Do not implement server-side authentication.
==================================================

1. TECHNOLOGY STACK
==================================================
Use the existing project stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- OMDb API
- React Context for shared state
- localStorage for persistence
Avoid introducing unnecessary dependencies.

Completely update the existing visual design to follow a premium cinematic streaming platform aesthetic.

Brand: FRAME.

Tagline: Your next favorite story starts here.

COLOR PALETTE:

- Primary background: #080A0F
- Secondary background: #101827
- Surface: #151D2B
- Primary accent: #168BFF
- Secondary accent: #55B4FF
- Primary text: #FFFFFF
- Secondary text: #A7B0C0
- Muted borders: rgba(255,255,255,0.08)
DESIGN PRINCIPLES:

- Deep black and dark navy backgrounds.
- Electric blue accents.
- Bold, modern typography.
- Large cinematic imagery.
- Strong visual hierarchy.
- Subtle gradients and shadows.
- Smooth transitions and micro-interactions.
- Premium streaming platform aesthetics.
Avoid:

- Purple, pink, orange and gold accents.
- Generic SaaS dashboard layouts.
- Excessive glassmorphism.
- Excessive rounded cards.
- Unnecessary visual clutter.
- Large empty sections.
The movie artwork should be the visual focus of the application.

Create an immersive streaming-style homepage.

NAVIGATION:

Build a sleek responsive navigation bar containing:

- FRAME wordmark.
- Discover.
- My Collection.
- Search access.
- Account / Login action.
The navigation should have a transparent appearance over the hero section and transition into a dark solid background when appropriate.

HERO SECTION:

Create a full-width cinematic hero banner.

Include:

- Large movie backdrop.
- Dark gradient overlays for text readability.
- Featured movie title.
- Release year.
- Genre.
- IMDb rating.
- Short movie description.
- Watch Trailer button (only if a real trailer URL is available).
- More Info button.
- Add to Collection button.
Use real movie data and available artwork from OMDb.

Do not invent movie metadata.

DISCOVERY CAROUSELS:

Create reusable horizontal movie carousel components.

Include these sections:

1. Trending Now
2. Popular Movies
3. Top Rated
4. Action & Adventure
5. Recommended for You
OMDb does not provide a trending endpoint. Populate these sections through curated movie search queries and clearly treat them as curated collections rather than actual live trending rankings.

Each carousel should have:

- Section title.
- Horizontal scrolling.
- Navigation arrows on desktop.
- Smooth scrolling.
- Responsive behavior.
- Consistent movie poster dimensions.
MOVIE CARDS:

Each movie card should display:

- Poster artwork.
- Movie title.
- Release year.
- IMDb rating.
- Favorite action.
Interactions:

- Subtle scale-up on hover.
- Smooth transitions.
- Blue-accented favorite button.
- Elegant hover overlay.
- Clear focus states.
On mobile, ensure the cards remain easy to browse without requiring hover.

Integrate the OMDb API using a dedicated service.

CONFIGURATION:

- Store the API key in VITE_OMDB_API_KEY.
- Read it through import.meta.env.
- Create an .env.example file.
- Ensure .env is included in .gitignore.
- Never hardcode API credentials.
API FUNCTIONALITY:

Implement:

1. Search movies by title.
2. Retrieve movie details using IMDb ID.
3. Handle pagination using OMDb search results.
4. Handle invalid searches.
5. Handle network failures.
6. Handle API error responses.
7. Handle missing poster images.
8. Prevent unnecessary duplicate requests where practical.
SEARCH EXPERIENCE:

Create a polished search interface.

Requirements:

- Debounced input.
- Search results displayed in a responsive poster grid.
- Loading skeletons.
- Empty state.
- Error state.
- Clear search action.
- Search results should update smoothly.
The user should be able to click any search result and navigate to its movie details page.

Implement the /movie/:id route.

Create an immersive movie details experience.

Include:

- Large cinematic backdrop or poster.
- Movie title.
- IMDb rating.
- Release year.
- Runtime.
- Genre.
- Plot summary.
- Director.
- Cast.
- Language.
- Country.
- IMDb ID.
Add:

- Add to Collection button.
- Back to Discover navigation.
- Related movie suggestions using curated OMDb searches.
Use a layered gradient over the backdrop to maintain text readability.

Make this page feel like a premium streaming service movie information screen.

Implement a complete frontend-only favorites management system.

Use React Context or an equivalent centralized state solution.

Persist favorites in localStorage.

FUNCTIONALITY:

- Add movies to favorites.
- Remove movies from favorites.
- Prevent duplicate entries.
- Retrieve favorites after refreshing the page.
- Synchronize favorite state across components.
- Display the total collection count.
COLLECTION PAGE:

Implement /collection.

Include:

- Page title: My Collection.
- Total saved movies.
- Responsive poster grid.
- Movie title and release year.
- IMDb rating.
- Remove-from-collection interaction.
- Empty collection state with a link to Discover.
Ensure that favorites remain synchronized between the homepage, movie details and collection page.

Implement an optional frontend-only demo authentication experience.

Routes:

- /login
- /register
Use localStorage to simulate session persistence.

Include:

- Email input.
- Password input.
- Password visibility toggle.
- Form validation.
- Loading feedback.
- Error messages.
- Navigation between login and registration.
- Logout action.
IMPORTANT:

This is only a demonstration of frontend authentication UX.

Do not claim it provides secure authentication.

Users must be able to browse movies and use the application without registering.

Favorites should remain available independently of the demo login.

Ensure these routes work correctly:

- / — Discover.
- /movie/:id — Movie details.
- /collection — My Collection.
- /login — Login.
- /register — Registration.
Ensure navigation works without full-page reloads.

Handle invalid movie IDs and unknown routes gracefully.

The application must work properly on:

- Desktop.
- Laptop.
- Tablet.
- Mobile.
Pay particular attention to:

- Hero section scaling.
- Poster dimensions.
- Horizontal carousel scrolling.
- Navigation collapse.
- Search experience.
- Movie details layout.
- Collection grid.
Do not simply shrink the desktop layout. Make deliberate responsive design decisions.

Preserve and extend the existing architecture.

MODELS:

- Movie interfaces.
- Search response interfaces.
- Favorites data structures.
- Demo user types.
SERVICES:

- OMDb API service.
- Local storage service.
VIEWMODELS:

- Movie discovery.
- Search.
- Movie details.
- Favorites.
- Demo authentication.
VIEWS:

- Discover page.
- Movie details page.
- Collection page.
- Login page.
- Registration page.
- Reusable components.
Use React Context and hooks for shared state where appropriate.

Do not place API requests or business logic directly inside presentation components.

Avoid unnecessary useEffect hooks and duplicated state.

Ensure:

- Every visible button has a meaningful action.
- Loading states are visually polished.
- Empty states are intentional.
- Error messages are understandable.
- Images have fallback handling.
- Buttons have hover and focus states.
- Forms provide validation feedback.
- Navigation remains consistent.
- No broken routes.
- No placeholder controls pretending to work.
Use skeleton loaders instead of generic spinners wherever appropriate.

Update the documentation directory.

docs/prompts.md:
Append this complete prompt.

docs/ai-workflow.md:
Document significant implementation decisions and how AI assisted.

Do not fabricate manual improvements. Those will be documented separately after reviewing the generated code.

Run the production build.

Verify:

- Homepage renders correctly.
- OMDb API integration works with valid credentials.
- Search returns real movie results.
- Movie details load correctly.
- Favorites can be added.
- Duplicate favorites are prevented.
- Favorites can be removed.
- Favorites persist after refresh.
- Collection page works.
- Demo login and registration work if implemented.
- All routes work.
- Responsive layouts work.
- No TypeScript errors.
- No critical console errors.
Do not claim functionality has been tested if it has not actually been tested.

If API credentials are unavailable, clearly identify the features requiring manual verification.

Prioritize a visually impressive, polished streaming platform experience while maintaining clean React architecture.

Do not overcomplicate the implementation.

Do not introduce a backend.

Do not redesign unrelated elements unnecessarily.

Finish the complete frontend implementation and provide a concise report explaining:

1. Features implemented.
2. Files and architectural changes.
3. API integration details.
4. How favorites persistence works.
5. Tests performed.
6. Remaining limitations.
Do not start another development phase.

---

# FRAME — Experience Redesign, Personalization & Movie Intelligence

Continue working on the existing FRAME application. Inspect the current implementation before changing anything.

This is an enhancement to the existing project, NOT a complete rewrite.

Preserve:

- React + TypeScript + Vite.
- Existing MVVM architecture.
- OMDb integration.
- Existing favorites and localStorage functionality.
- Black and electric-blue visual identity.
Do not introduce a backend or Firebase.

==================================================

1. HOMEPAGE / HERO REDESIGN
==================================================
The current homepage hero is overcrowded. Redesign it to feel like a premium streaming platform.

HERO LAYOUT:

- Position the featured movie artwork towards the top/right portion of the hero.
- Avoid centering the poster or artwork.
- Use a large cinematic background image.
- Keep the movie information in a dedicated left-side content area.
- Add dark gradients where necessary for text readability.
- Give the hero sufficient vertical breathing room.
- Keep navigation compact and unobtrusive.
TEXT CONSTRAINTS:

- Movie descriptions must be limited to 3–4 lines.
- Use line clamping and sensible text widths.
- Never allow long descriptions to push buttons or metadata off-screen.
- Keep movie titles prominent but prevent overflow.
- Keep metadata compact.
The hero should feel cinematic, spacious and balanced.

Create a separate public landing experience for users who are not signed in.

The landing page should introduce FRAME as a movie discovery and personal collection platform.

Include:

1. A cinematic hero introducing FRAME.
2. A concise product description.
3. A prominent Explore Movies / Get Started action.
4. A curated selection of popular movies.
5. A few movie discovery categories.
6. A short explanation of FRAME's features.
7. A clear sign-in and registration entry point.
8. A polished footer.
Showcase actual movie data obtained from OMDb.

The landing page should be visually impressive without becoming a long marketing website.

Unauthenticated visitors should be able to explore the public landing page and selected movies.

After demo sign-in, show the existing movie discovery dashboard instead of the public landing page.

The dashboard should include:

- Personalized greeting.
- Featured movie hero.
- Trending / curated movie sections.
- Popular Movies.
- Top Rated.
- Recommended for You.
- My Collection shortcut.
- Accessible search.
- User profile menu.
Keep the experience consistent with the existing black-and-blue design.

Do not introduce a separate dashboard administration interface.

Redesign search so it is accessible directly from the navigation bar.

IMPORTANT:

- Search must NOT require a separate page.
- Search must NOT open a modal.
- Do not make users navigate away from the current page to search.
Implement an expandable inline search field in the navigation bar.

Requirements:

- Search input remains accessible.
- Debounced OMDb search.
- Display results in a compact dropdown or expandable results area beneath the search field.
- Show movie posters, titles and release years.
- Clicking a result opens its movie details page.
- Include clear-search functionality.
- Handle loading, empty and error states.
- Support keyboard navigation where practical.
Ensure the search experience works on desktop and mobile.

The current related movies section is not genuinely related to the selected movie. Fix this.

Use the movie details returned by OMDb.

Build a recommendation mechanism using:

- Shared genres.
- Shared actors.
- Shared directors.
- Similar movie categories.
Prioritize movies with meaningful metadata overlap.

For example:

- If a user opens Interstellar, recommendations should consider science fiction, adventure, Christopher Nolan and its cast.
- Movies featuring selected cast members should also be discoverable.
Do not simply display unrelated results from arbitrary searches.

Create separate sections:

A. Similar Movies

- Prioritize shared genres and directors.
B. Featuring the Cast

- Allow users to select an actor from the movie's cast.
- Display movies featuring that actor.
- Use OMDb searches and verify actual cast information when necessary.
C. More from This Director

- Discover movies by the same director.
Avoid duplicate recommendations and exclude the currently selected movie.

If insufficient matching data is available, display a smaller relevant collection rather than inventing relationships.

Add cinematic trailer playback for movies.

Requirements:

- Support trailer playback in the featured hero background where an actual trailer source is available.
- Use a muted, autoplaying, looping background video where browser policies permit.
- Provide a clear play/pause or trailer viewing control.
- Provide a poster/backdrop fallback.
- Stop playback when the movie is no longer active.
- Respect reduced-motion preferences.
- Do not autoplay sound.
IMPORTANT TECHNICAL CONSTRAINT:

OMDb does not provide trailer video URLs.

Do not fabricate trailer URLs or assume poster images are videos.

Use a legitimate, available trailer source or a configurable trailer mapping. If no verified trailer is available, display cinematic artwork and offer a graceful fallback.

Do not add a paid API dependency merely to implement this feature.

Implement a user profile and preferences section accessible from the dashboard navigation.

Create a polished profile settings page.

Include:

A. Profile

- Display name.
- Email.
- Profile avatar or initials.
- Demo account information.
B. Language Preferences

- Allow users to select preferred movie languages.
- Support multiple selections.
C. Genre Preferences

- Allow users to select multiple preferred genres.
- Include common genres such as Action, Adventure, Comedy, Drama, Horror, Sci-Fi, Thriller, Romance, Animation and Documentary.
D. Save Preferences

- Persist preferences in localStorage.
- Restore them after refresh.
- Allow users to edit and update preferences.
E. Personalized Discovery

- Use selected languages and genres to influence the Recommended for You section.
- Prefer movies matching the user's preferences.
- Do not fabricate recommendation data.
Keep this a frontend-only preference system.

Update the navigation based on authentication state.

PUBLIC NAVIGATION:

- FRAME logo.
- Discover.
- Search.
- Sign in.
- Get Started.
SIGNED-IN NAVIGATION:

- FRAME logo.
- Discover.
- My Collection.
- Inline Search.
- Profile menu.
- Settings.
- Sign out.
Maintain responsive navigation and consistent styling.

Ensure sign-out returns the user to the public landing experience.

Maintain the Netflix-inspired black-and-blue identity.

Improve:

- Spacing.
- Typography hierarchy.
- Hero proportions.
- Poster sizing.
- Carousel layouts.
- Search dropdown.
- Profile settings.
- Movie detail page.
- Responsive layouts.
Use consistent spacing and component dimensions.

Avoid:

- Overcrowded hero sections.
- Excessive text.
- Arbitrary animations.
- Excessive rounded containers.
- Inconsistent button styles.
- Broken or decorative interactions.
Keep the existing architecture clean.

Update existing components where appropriate instead of creating duplicate implementations.

Maintain strong TypeScript typing.

Test:

- Public landing page.
- Demo sign-in.
- Dashboard after sign-in.
- Sign-out.
- Inline search.
- Movie details.
- Related movie relevance.
- Actor-based discovery.
- Director-based discovery.
- Trailer fallback.
- Profile settings.
- Language preferences.
- Genre preferences.
- Recommendation personalization.
- Favorites persistence.
- Mobile responsiveness.
Update docs/prompts.md with this prompt.

Document important AI decisions in docs/ai-workflow.md.

Do not fabricate successful tests.

At completion, report:

1. Features implemented.
2. Components changed.
3. Data sources used.
4. Features requiring manual verification.
5. Remaining limitations.
Do not begin the final code review yet.