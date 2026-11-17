import type { Movie, MovieTrailer } from '../models/Movie'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'
const CACHE_DURATION = 24 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 250
const responseCache = new Map<string, { expiresAt: number; value: unknown }>()
const pendingRequests = new Map<string, Promise<unknown>>()

interface TmdbPerson {
  id: number
  name: string
  order?: number
  character?: string
  profile_path?: string | null
}

interface TmdbMovieRecord {
  id: number
  title?: string
  release_date?: string
  poster_path?: string | null
  backdrop_path?: string | null
  genre_ids?: number[]
  genres?: Array<{ id: number; name: string }>
  vote_average?: number
  overview?: string
  original_language?: string
  imdb_id?: string | null
  runtime?: number | null
  popularity?: number
  credits?: {
    cast?: TmdbPerson[]
    crew?: Array<TmdbPerson & { job: string }>
  }
}

interface TmdbMovieListResponse {
  results?: TmdbMovieRecord[]
}

interface TmdbPersonCreditsResponse {
  cast?: TmdbMovieRecord[]
  crew?: Array<TmdbMovieRecord & { job: string }>
}

interface TmdbFindResponse {
  movie_results?: TmdbMovieRecord[]
}

interface TmdbVideosResponse {
  results?: Array<{
    key: string
    site: string
    type: string
    official: boolean
    published_at?: string
  }>
}

export interface MoviePerson {
  id: number
  name: string
  character?: string
  profilePath?: string | null
  photoUrl?: string | null
}

export interface MovieIntelligence {
  tmdbID: number | null
  similar: Movie[]
  castMembers: MoviePerson[]
  directors: MoviePerson[]
  error: string | null
}

export interface MovieMedia {
  tmdbID: number | null
  backdropUrl: string | null
  posterUrl: string | null
  trailer: MovieTrailer | null
}

export const TMDB_GENRES: Record<string, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  'Sci-Fi': 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
}

export const TMDB_LANGUAGES: Record<string, string> = {
  English: 'en',
  French: 'fr',
  German: 'de',
  Hindi: 'hi',
  Italian: 'it',
  Japanese: 'ja',
  Korean: 'ko',
  Mandarin: 'zh',
  Spanish: 'es',
  Telugu: 'te',
}

const GENRES: Record<number, string> = {
  12: 'Adventure',
  14: 'Fantasy',
  16: 'Animation',
  18: 'Drama',
  27: 'Horror',
  28: 'Action',
  35: 'Comedy',
  36: 'History',
  37: 'Western',
  53: 'Thriller',
  80: 'Crime',
  99: 'Documentary',
  878: 'Sci-Fi',
  9648: 'Mystery',
  10402: 'Music',
  10749: 'Romance',
  10751: 'Family',
  10752: 'War',
  10770: 'TV Movie',
}

function imageUrl(path: string | null | undefined, size: 'original' | 'w500') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null
}

function languageName(code: string | undefined) {
  const names: Record<string, string> = {
    en: 'English',
    fr: 'French',
    de: 'German',
    hi: 'Hindi',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Mandarin',
    es: 'Spanish',
    te: 'Telugu',
  }
  return code ? names[code] ?? code.toLocaleUpperCase() : undefined
}

function mapTmdbMovie(record: TmdbMovieRecord, imdbID = `tmdb-${record.id}`): Movie {
  const genreNames = record.genres?.map((genre) => genre.name)
    ?? record.genre_ids?.map((id) => GENRES[id]).filter((genre): genre is string => Boolean(genre))
    ?? []
  const directors = record.credits?.crew
    ?.filter((person) => person.job === 'Director')
    .map((person) => person.name) ?? []
  const actors = record.credits?.cast
    ?.slice()
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
    .slice(0, 5)
    .map((person) => person.name) ?? []
  const tmdbRating = Number.isFinite(record.vote_average)
    ? record.vote_average?.toFixed(1)
    : undefined

  return {
    imdbID,
    tmdbID: record.id,
    title: record.title ?? 'Untitled movie',
    year: record.release_date?.slice(0, 4) ?? '',
    type: 'movie',
    poster: imageUrl(record.poster_path, 'w500') ?? 'N/A',
    ...(imageUrl(record.backdrop_path, 'original')
      ? { backdrop: imageUrl(record.backdrop_path, 'original') ?? undefined }
      : {}),
    ...(tmdbRating ? { tmdbRating } : {}),
    ...(genreNames.length ? { genre: genreNames.join(', ') } : {}),
    ...(directors.length ? { director: directors.join(', ') } : {}),
    ...(actors.length ? { actors: actors.join(', ') } : {}),
    ...(record.overview ? { plot: record.overview } : {}),
    ...(languageName(record.original_language)
      ? { language: languageName(record.original_language) }
      : {}),
    ...(record.runtime ? { runtime: `${record.runtime} min` } : {}),
  }
}

async function requestTmdb<T>(path: string): Promise<T> {
  const token = import.meta.env.VITE_TMDB_API_READ_ACCESS_TOKEN
  if (!token) {
    throw new Error('TMDB lookup needs VITE_TMDB_API_READ_ACCESS_TOKEN in your local .env file.')
  }

  const url = `${API_BASE_URL}${path}`
  const cached = responseCache.get(url)
  if (cached && cached.expiresAt > Date.now()) return cached.value as T
  if (cached) responseCache.delete(url)

  const pending = pendingRequests.get(url)
  if (pending) return pending as Promise<T>

  const request = fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .catch(() => {
      throw new Error('Could not reach TMDB. Check your connection and try again.')
    })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`TMDB returned an HTTP ${response.status} response.`)
      }

      try {
        const data = await response.json() as T
        if (responseCache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = responseCache.keys().next().value
          if (oldestKey) responseCache.delete(oldestKey)
        }
        responseCache.set(url, { expiresAt: Date.now() + CACHE_DURATION, value: data })
        return data
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('TMDB returned')) throw error
        throw new Error('TMDB returned a response that could not be read.')
      }
    })
    .finally(() => pendingRequests.delete(url))

  pendingRequests.set(url, request)
  return request as Promise<T>
}

export function getTmdbIDFromRouteId(id: string) {
  const match = /^tmdb-(\d+)$/.exec(id)
  return match ? Number(match[1]) : null
}

async function findTmdbIDByImdbID(imdbID: string): Promise<number | null> {
  const params = new URLSearchParams({ external_source: 'imdb_id' })
  const response = await requestTmdb<TmdbFindResponse>(
    `/find/${encodeURIComponent(imdbID)}?${params.toString()}`,
  )
  return response.movie_results?.[0]?.id ?? null
}

export async function getMovieMedia(
  movie: Pick<Movie, 'imdbID' | 'tmdbID'>,
): Promise<MovieMedia> {
  const tmdbID = movie.tmdbID
    ?? (getTmdbIDFromRouteId(movie.imdbID) || await findTmdbIDByImdbID(movie.imdbID))
  if (!tmdbID) {
    return { tmdbID: null, backdropUrl: null, posterUrl: null, trailer: null }
  }

  const params = new URLSearchParams({ append_to_response: 'credits' })
  const videosParams = new URLSearchParams({ language: 'en-US' })
  const [details, videos] = await Promise.all([
    requestTmdb<TmdbMovieRecord>(`/movie/${tmdbID}?${params.toString()}`),
    requestTmdb<TmdbVideosResponse>(`/movie/${tmdbID}/videos?${videosParams.toString()}`),
  ])
  const verifiedTrailer = videos.results
    ?.filter((video) =>
      video.site === 'YouTube' &&
      video.type === 'Trailer' &&
      video.official === true &&
      /^[\w-]{11}$/.test(video.key),
    )
    .sort((first, second) =>
      Date.parse(second.published_at ?? '') - Date.parse(first.published_at ?? ''),
    )[0]

  return {
    tmdbID,
    backdropUrl: imageUrl(details.backdrop_path, 'original'),
    posterUrl: imageUrl(details.poster_path, 'w500'),
    trailer: verifiedTrailer
      ? {
          provider: 'YouTube',
          videoId: verifiedTrailer.key,
          embedUrl: `https://www.youtube-nocookie.com/embed/${verifiedTrailer.key}`,
          watchUrl: `https://www.youtube.com/watch?v=${verifiedTrailer.key}`,
        }
      : null,
  }
}

export async function getMovieDetailsByTmdbID(tmdbID: number): Promise<Movie> {
  const params = new URLSearchParams({ append_to_response: 'credits' })
  const details = await requestTmdb<TmdbMovieRecord>(`/movie/${tmdbID}?${params.toString()}`)
  return mapTmdbMovie(details)
}

export async function getMovieIntelligence(movie: Movie): Promise<MovieIntelligence> {
  const tmdbID = movie.tmdbID
    ?? (getTmdbIDFromRouteId(movie.imdbID) || await findTmdbIDByImdbID(movie.imdbID))
  if (!tmdbID) {
    return {
      tmdbID: null,
      similar: [],
      castMembers: [],
      directors: [],
      error: 'TMDB could not match this IMDb title, so cast and director discovery is unavailable.',
    }
  }

  const params = new URLSearchParams({ language: 'en-US', page: '1' })
  const detailsParams = new URLSearchParams({ append_to_response: 'credits' })
  const [details, similar, recommended] = await Promise.all([
    requestTmdb<TmdbMovieRecord>(`/movie/${tmdbID}?${detailsParams.toString()}`),
    requestTmdb<TmdbMovieListResponse>(`/movie/${tmdbID}/similar?${params.toString()}`),
    requestTmdb<TmdbMovieListResponse>(`/movie/${tmdbID}/recommendations?${params.toString()}`),
  ])
  const credits = details.credits
  const castMembers: MoviePerson[] = credits?.cast
    ?.slice()
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0))
    .slice(0, 20)
    .map((person) => ({
      id: person.id,
      name: person.name,
      character: person.character?.trim() || undefined,
      profilePath: person.profile_path ?? null,
      photoUrl: person.profile_path ? imageUrl(person.profile_path, 'w500') : null,
    })) ?? []
  const directors = credits?.crew
    ?.filter((person) => person.job === 'Director')
    .map(({ id, name }) => ({ id, name })) ?? []
  const genreIDs = new Set(details.genres?.map((genre) => genre.id) ?? [])
  const movies = new Map<number, { movie: Movie; score: number }>()

  ;[...(similar.results ?? []), ...(recommended.results ?? [])].forEach((candidate) => {
    if (candidate.id === tmdbID || !candidate.title) return
    const sharedGenres = (candidate.genre_ids ?? []).filter((id) => genreIDs.has(id)).length
    const score = sharedGenres * 10 + (candidate.popularity ?? 0) / 100
    const previous = movies.get(candidate.id)
    if (!previous || score > previous.score) {
      movies.set(candidate.id, { movie: mapTmdbMovie(candidate), score })
    }
  })

  return {
    tmdbID,
    similar: [...movies.values()]
      .sort((first, second) => second.score - first.score)
      .slice(0, 10)
      .map(({ movie: candidate }) => candidate),
    castMembers,
    directors,
    error: null,
  }
}

async function getPersonCredits(
  personID: number,
  role: 'cast' | 'director',
  excludedTmdbID: number,
): Promise<Movie[]> {
  const credits = await requestTmdb<TmdbPersonCreditsResponse>(
    `/person/${personID}/movie_credits?language=en-US`,
  )
  const records = role === 'cast'
    ? credits.cast ?? []
    : (credits.crew ?? []).filter((credit) => credit.job === 'Director')
  const movies = new Map<number, TmdbMovieRecord>()

  records.forEach((credit) => {
    if (credit.id !== excludedTmdbID && credit.title) movies.set(credit.id, credit)
  })

  return [...movies.values()]
    .sort((first, second) => (second.popularity ?? 0) - (first.popularity ?? 0))
    .slice(0, 30)
    .map((credit) => mapTmdbMovie(credit))
}

export function getMoviesByCastMember(personID: number, excludedTmdbID: number) {
  return getPersonCredits(personID, 'cast', excludedTmdbID)
}

export async function getMoviesByDirectorIDs(personIDs: number[], excludedTmdbID: number) {
  const results = await Promise.all(
    personIDs.map((personID) => getPersonCredits(personID, 'director', excludedTmdbID)),
  )
  const uniqueMovies = new Map<number, Movie>()
  results.flat().forEach((movie) => {
    if (movie.tmdbID) uniqueMovies.set(movie.tmdbID, movie)
  })
  return [...uniqueMovies.values()].slice(0, 24)
}

interface TmdbSearchPersonResponse {
  results?: Array<{
    id: number
    name: string
    popularity?: number
    known_for?: TmdbMovieRecord[]
  }>
}

interface TmdbPaginatedResponse {
  page?: number
  results?: TmdbMovieRecord[]
  total_results?: number
  total_pages?: number
}

export async function searchTmdbMovies(
  query: string,
  page = 1,
): Promise<{ movies: Movie[]; total: number; totalPages: number }> {
  const trimmed = query.trim()
  if (!trimmed) return { movies: [], total: 0, totalPages: 0 }

  const params = new URLSearchParams({
    query: trimmed,
    page: String(page),
    include_adult: 'false',
    language: 'en-US',
  })

  try {
    const data = await requestTmdb<TmdbPaginatedResponse>(`/search/movie?${params.toString()}`)
    const movies = (data.results ?? [])
      .filter((record) => Boolean(record.title))
      .map((record) => mapTmdbMovie(record))
    return {
      movies,
      total: data.total_results ?? movies.length,
      totalPages: data.total_pages ?? 1,
    }
  } catch {
    return { movies: [], total: 0, totalPages: 0 }
  }
}

export async function searchTmdbPerson(query: string): Promise<Movie[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const params = new URLSearchParams({
    query: trimmed,
    include_adult: 'false',
    language: 'en-US',
  })

  try {
    const data = await requestTmdb<TmdbSearchPersonResponse>(`/search/person?${params.toString()}`)
    const topPerson = data.results?.[0]
    if (!topPerson) return []

    return getPersonCredits(topPerson.id, 'cast', 0)
  } catch {
    return []
  }
}

export interface DiscoverOptions {
  genre?: string
  language?: string
  yearMin?: number
  yearMax?: number
  minVote?: number
  sortBy?: 'popularity' | 'rating' | 'newest'
  page?: number
}

export async function discoverTmdbMovies(
  options: DiscoverOptions = {},
): Promise<{ movies: Movie[]; total: number; totalPages: number }> {
  const params = new URLSearchParams({
    include_adult: 'false',
    'vote_count.gte': '50',
    page: String(options.page ?? 1),
    language: 'en-US',
  })

  if (options.genre && TMDB_GENRES[options.genre]) {
    params.set('with_genres', String(TMDB_GENRES[options.genre]))
  }

  if (options.language && TMDB_LANGUAGES[options.language]) {
    params.set('with_original_language', TMDB_LANGUAGES[options.language])
  }

  if (options.yearMin) {
    params.set('primary_release_date.gte', `${options.yearMin}-01-01`)
  }
  if (options.yearMax) {
    params.set('primary_release_date.lte', `${options.yearMax}-12-31`)
  }

  if (options.minVote) {
    params.set('vote_average.gte', String(options.minVote))
  }

  if (options.sortBy === 'rating') {
    params.set('sort_by', 'vote_average.desc')
    params.set('vote_count.gte', '200')
  } else if (options.sortBy === 'newest') {
    params.set('sort_by', 'primary_release_date.desc')
  } else {
    params.set('sort_by', 'popularity.desc')
  }

  try {
    const data = await requestTmdb<TmdbPaginatedResponse>(`/discover/movie?${params.toString()}`)
    const movies = (data.results ?? [])
      .filter((record) => Boolean(record.title))
      .map((record) => mapTmdbMovie(record))
    return {
      movies,
      total: data.total_results ?? movies.length,
      totalPages: data.total_pages ?? 1,
    }
  } catch {
    return { movies: [], total: 0, totalPages: 0 }
  }
}
