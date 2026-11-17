import type {
  Movie,
  OmdbMovieResponse,
  OmdbSearchResponse,
  OmdbSearchResult,
} from "../models/Movie";
import {
  discoverTmdbMovies,
  searchTmdbMovies,
  searchTmdbPerson,
  type DiscoverOptions,
} from "./tmdbService";

const API_URL = "https://www.omdbapi.com/";
const CACHE_DURATION = 5 * 60 * 1000;
const responseCache = new Map<string, { expiresAt: number; value: unknown }>();
const pendingRequests = new Map<string, Promise<unknown>>();
const MAX_CACHE_ENTRIES = 250;

function mapOmdbMovie(data: OmdbMovieResponse | OmdbSearchResult): Movie {
  return {
    imdbID: data.imdbID,
    title: data.Title,
    year: data.Year,
    type: data.Type,
    poster: data.Poster,
    ...("imdbRating" in data && data.imdbRating
      ? { imdbRating: data.imdbRating }
      : {}),
    ...("Rated" in data ? { rated: data.Rated } : {}),
    ...("Released" in data ? { released: data.Released } : {}),
    ...("Runtime" in data ? { runtime: data.Runtime } : {}),
    ...("Genre" in data ? { genre: data.Genre } : {}),
    ...("Director" in data ? { director: data.Director } : {}),
    ...("Writer" in data ? { writer: data.Writer } : {}),
    ...("Actors" in data ? { actors: data.Actors } : {}),
    ...("Plot" in data ? { plot: data.Plot } : {}),
    ...("Language" in data ? { language: data.Language } : {}),
    ...("Country" in data ? { country: data.Country } : {}),
    ...("Awards" in data ? { awards: data.Awards } : {}),
    ...("Metascore" in data ? { metascore: data.Metascore } : {}),
    ...("imdbVotes" in data ? { imdbVotes: data.imdbVotes } : {}),
    ...("BoxOffice" in data ? { boxOffice: data.BoxOffice } : {}),
    ...("Production" in data ? { production: data.Production } : {}),
  };
}

export class OmdbError extends Error {
  readonly kind: "configuration" | "not-found" | "api" | "network";

  constructor(
    message: string,
    kind: "configuration" | "not-found" | "api" | "network",
  ) {
    super(message);
    this.name = "OmdbError";
    this.kind = kind;
  }
}

export function hasOmdbApiKey() {
  return Boolean(import.meta.env.VITE_OMDB_API_KEY);
}

async function request<T>(parameters: Record<string, string>): Promise<T> {
  const apiKey = import.meta.env.VITE_OMDB_API_KEY;
  if (!apiKey) {
    throw new OmdbError(
      "Add VITE_OMDB_API_KEY to your local .env file to connect the movie catalog.",
      "configuration",
    );
  }

  const url = new URL(API_URL);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("r", "json");
  Object.entries(parameters).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  const cacheKey = url.toString();
  const cached = responseCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  if (cached) responseCache.delete(cacheKey);

  const existingRequest = pendingRequests.get(cacheKey);
  if (existingRequest) return existingRequest as Promise<T>;

  const pendingRequest = fetch(cacheKey)
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === "AbortError") throw error;
      throw new OmdbError(
        "Could not reach OMDb. Check your connection and try again.",
        "network",
      );
    })
    .then(async (response) => {
      if (!response.ok) {
        throw new OmdbError(
          `OMDb returned an HTTP ${response.status} response.`,
          "api",
        );
      }

      let data: T & { Response?: string; Error?: string };
      try {
        data = (await response.json()) as T & {
          Response?: string;
          Error?: string;
        };
      } catch {
        throw new OmdbError(
          "OMDb returned a response that could not be read.",
          "api",
        );
      }
      if (data.Response === "False") {
        const message = data.Error ?? "OMDb could not find a matching result.";
        throw new OmdbError(
          message,
          /not found/i.test(message) ? "not-found" : "api",
        );
      }

      if (responseCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = responseCache.keys().next().value;
        if (oldestKey) responseCache.delete(oldestKey);
      }
      responseCache.set(cacheKey, {
        expiresAt: Date.now() + CACHE_DURATION,
        value: data,
      });
      return data;
    })
    .finally(() => pendingRequests.delete(cacheKey));

  pendingRequests.set(cacheKey, pendingRequest);
  return pendingRequest as Promise<T>;
}

export interface CatalogFilters {
  query?: string
  genre?: string
  language?: string
  yearRange?: 'all' | '2020s' | '2010s' | '2000s' | '90s' | 'classic'
  minRating?: number
  sortBy?: 'popularity' | 'rating' | 'newest'
  page?: number
}

function deduplicateMovies(movies: Movie[]): Movie[] {
  const seenIds = new Set<string>()
  const seenTitles = new Set<string>()
  const result: Movie[] = []

  for (const movie of movies) {
    const idKey = movie.imdbID || (movie.tmdbID ? `tmdb-${movie.tmdbID}` : '')
    const titleKey = `${movie.title.toLowerCase().trim()}_${movie.year?.slice(0, 4)}`

    if (idKey && seenIds.has(idKey)) continue
    if (seenTitles.has(titleKey)) continue

    if (idKey) seenIds.add(idKey)
    seenTitles.add(titleKey)
    result.push(movie)
  }

  return result
}

export async function searchMovies(
  query: string,
  page = 1,
): Promise<{ movies: Movie[]; total: number }> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return { movies: [], total: 0 };

  const [omdbResult, tmdbResult] = await Promise.allSettled([
    request<OmdbSearchResponse>({
      s: trimmedQuery,
      page: String(page),
      type: 'movie',
    }).then((res) => ({
      movies: (res.Search ?? []).map(mapOmdbMovie),
      total: Number(res.totalResults ?? 0),
    })),
    searchTmdbMovies(trimmedQuery, page),
  ]);

  const omdbMovies = omdbResult.status === 'fulfilled' ? omdbResult.value.movies : [];
  const tmdbMovies = tmdbResult.status === 'fulfilled' ? tmdbResult.value.movies : [];

  let combined = [...tmdbMovies, ...omdbMovies];

  // If no movies found from title search, check if query matches an actor or director
  if (combined.length === 0) {
    try {
      const personMovies = await searchTmdbPerson(trimmedQuery);
      if (personMovies.length) {
        combined = personMovies;
      }
    } catch {
      // ignore person search errors
    }
  }

  const deduped = deduplicateMovies(combined);
  const total = Math.max(
    omdbResult.status === 'fulfilled' ? omdbResult.value.total : 0,
    tmdbResult.status === 'fulfilled' ? tmdbResult.value.total : 0,
    deduped.length,
  );

  return {
    movies: deduped,
    total,
  };
}

export async function searchFilteredCatalog(
  filters: CatalogFilters,
): Promise<{ movies: Movie[]; total: number }> {
  const query = filters.query?.trim() || '';
  const page = filters.page ?? 1;

  let yearMin: number | undefined
  let yearMax: number | undefined

  if (filters.yearRange === '2020s') {
    yearMin = 2020
  } else if (filters.yearRange === '2010s') {
    yearMin = 2010
    yearMax = 2019
  } else if (filters.yearRange === '2000s') {
    yearMin = 2000
    yearMax = 2009
  } else if (filters.yearRange === '90s') {
    yearMin = 1990
    yearMax = 1999
  } else if (filters.yearRange === 'classic') {
    yearMax = 1989
  }

  // If there's no query, use TMDB discover API directly
  if (!query) {
    const discoverOpts: DiscoverOptions = {
      genre: filters.genre && filters.genre !== 'All' ? filters.genre : undefined,
      language: filters.language && filters.language !== 'All' ? filters.language : undefined,
      yearMin,
      yearMax,
      minVote: filters.minRating,
      sortBy: filters.sortBy,
      page,
    }

    const result = await discoverTmdbMovies(discoverOpts);
    if (result.movies.length > 0) {
      return {
        movies: deduplicateMovies(result.movies),
        total: result.total,
      };
    }

    // Fallback if TMDB discover returned nothing: try a fallback search
    const fallbackQuery = filters.genre && filters.genre !== 'All'
      ? filters.genre
      : (filters.language && filters.language !== 'All' ? filters.language : 'Star');
    return searchMovies(fallbackQuery, page);
  }

  // When query is present: search and apply client filters
  const searchResult = await searchMovies(query, page);
  let filtered = searchResult.movies;

  if (filters.genre && filters.genre !== 'All') {
    const targetGenre = filters.genre.toLowerCase();
    filtered = filtered.filter((m) =>
      m.genre ? m.genre.toLowerCase().includes(targetGenre) : true,
    );
  }

  if (filters.language && filters.language !== 'All') {
    const targetLang = filters.language.toLowerCase();
    filtered = filtered.filter((m) =>
      m.language ? m.language.toLowerCase().includes(targetLang) : true,
    );
  }

  if (yearMin !== undefined || yearMax !== undefined) {
    filtered = filtered.filter((m) => {
      const yearNum = parseInt(m.year?.slice(0, 4) || '0', 10);
      if (!yearNum) return true;
      if (yearMin !== undefined && yearNum < yearMin) return false;
      if (yearMax !== undefined && yearNum > yearMax) return false;
      return true;
    });
  }

  if (filters.minRating) {
    const min = filters.minRating;
    filtered = filtered.filter((m) => {
      const rating = parseFloat(m.imdbRating || m.tmdbRating || '0');
      return !rating || rating >= min;
    });
  }

  if (filters.sortBy === 'rating') {
    filtered.sort((a, b) => {
      const ratingA = parseFloat(a.imdbRating || a.tmdbRating || '0');
      const ratingB = parseFloat(b.imdbRating || b.tmdbRating || '0');
      return ratingB - ratingA;
    });
  } else if (filters.sortBy === 'newest') {
    filtered.sort((a, b) => {
      const yearA = parseInt(a.year?.slice(0, 4) || '0', 10);
      const yearB = parseInt(b.year?.slice(0, 4) || '0', 10);
      return yearB - yearA;
    });
  }

  return {
    movies: filtered,
    total: Math.max(filtered.length, searchResult.total),
  };
}

export async function getMovieDetails(imdbID: string): Promise<Movie> {
  const response = await request<OmdbMovieResponse>({
    i: imdbID,
    plot: "full",
  });
  return mapOmdbMovie(response);
}

export async function getMovieByTitle(title: string): Promise<Movie> {
  const response = await request<OmdbMovieResponse>({ t: title, plot: "full" });
  return mapOmdbMovie(response);
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something unexpected happened. Please try again.";
}
