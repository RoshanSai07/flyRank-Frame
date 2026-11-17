import type { Movie, UserPreferences } from '../models/Movie'
import { getErrorMessage, getMovieByTitle, OmdbError } from './movieService'

export {
  getMovieIntelligence,
  getMoviesByCastMember,
  getMoviesByDirectorIDs,
} from './tmdbService'
export type { MovieIntelligence, MoviePerson } from './tmdbService'

const GENERAL_TITLE_SEEDS = [
  'Inception',
  'The Martian',
  'Arrival',
  'The Dark Knight',
  'The Godfather',
  'The Matrix',
  'The Shawshank Redemption',
  'Dune',
] as const

const GENRE_TITLE_SEEDS: Record<string, readonly string[]> = {
  action: ['The Dark Knight', 'John Wick', 'The Matrix'],
  adventure: ['The Martian', 'Dune', 'The Lord of the Rings: The Fellowship of the Ring'],
  animation: ['Spirited Away', 'WALL-E', 'Coco'],
  comedy: ['The Grand Budapest Hotel', 'Groundhog Day', 'Little Miss Sunshine'],
  crime: ['The Godfather', 'The Departed', 'Pulp Fiction'],
  documentary: ['Free Solo', "Won't You Be My Neighbor?", 'The Last Dance'],
  drama: ['The Shawshank Redemption', 'The Godfather', 'The Martian'],
  fantasy: ['The Lord of the Rings: The Fellowship of the Ring', "Harry Potter and the Sorcerer's Stone", 'Dune'],
  horror: ['Get Out', 'The Shining', 'A Quiet Place'],
  mystery: ['Knives Out', 'The Prestige', 'Gone Girl'],
  romance: ['Pride & Prejudice', 'Before Sunrise', 'The Notebook'],
  'sci-fi': ['Arrival', 'Inception', 'The Matrix'],
  thriller: ['The Dark Knight', 'The Prestige', 'Gone Girl'],
}

const LANGUAGE_TITLE_SEEDS: Record<string, readonly string[]> = {
  English: ['Inception', 'The Martian', 'The Grand Budapest Hotel'],
  French: ['Amélie', 'The Intouchables', 'Portrait of a Lady on Fire'],
  German: ['Run Lola Run', 'The Lives of Others', 'All Quiet on the Western Front'],
  Hindi: ['3 Idiots', 'Dangal', 'The Lunchbox'],
  Italian: ['Cinema Paradiso', 'Life Is Beautiful', 'Bicycle Thieves'],
  Japanese: ['Spirited Away', 'Your Name.', 'Seven Samurai'],
  Korean: ['Parasite', 'Train to Busan', 'The Handmaiden'],
  Mandarin: ['Crouching Tiger, Hidden Dragon', 'Hero', 'In the Mood for Love'],
  Spanish: ["Pan's Labyrinth", 'Roma', 'The Secret in Their Eyes'],
  Telugu: ['RRR', 'Baahubali: The Beginning', 'Eega'],
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase().replace(/[.’']/g, '')
}

function splitMetadata(value: string | undefined) {
  if (!value || value === 'N/A') return []
  return value.split(/\s*,\s*/).filter(Boolean)
}

async function loadTitleDetails(titles: string[]) {
  const failures: unknown[] = []
  const results = await Promise.all(
    titles.map(async (title) => {
      try {
        const movie = await getMovieByTitle(title)
        return movie.type === 'movie' ? movie : null
      } catch (error) {
        if (!(error instanceof OmdbError && error.kind === 'not-found')) failures.push(error)
        return null
      }
    }),
  )

  const uniqueMovies = new Map<string, Movie>()
  results.forEach((movie) => {
    if (movie) uniqueMovies.set(movie.imdbID, movie)
  })

  return {
    movies: [...uniqueMovies.values()],
    error: results.every((movie) => movie === null) && failures.length
      ? getErrorMessage(failures[0])
      : null,
  }
}

function getPreferenceTitleSeeds(preferences: UserPreferences) {
  const seeds = new Set<string>()
  preferences.genres.forEach((genre) => {
    GENRE_TITLE_SEEDS[normalize(genre)]?.forEach((title) => seeds.add(title))
  })
  preferences.languages.forEach((language) => {
    LANGUAGE_TITLE_SEEDS[language]?.forEach((title) => seeds.add(title))
  })
  if (seeds.size === 0) GENERAL_TITLE_SEEDS.forEach((title) => seeds.add(title))
  return [...seeds].slice(0, 18)
}

export async function getPersonalizedMovies(preferences: UserPreferences) {
  const { movies, error } = await loadTitleDetails(getPreferenceTitleSeeds(preferences))
  const preferredGenres = new Set(preferences.genres.map(normalize))
  const preferredLanguages = new Set(preferences.languages.map(normalize))

  const ranked = movies
    .map((movie) => {
      const movieGenres = splitMetadata(movie.genre)
      const movieLanguages = splitMetadata(movie.language)
      const matchingGenres = movieGenres.filter((genre) => preferredGenres.has(normalize(genre)))
      const matchingLanguages = movieLanguages.filter((language) => preferredLanguages.has(normalize(language)))
      const rating = Number.parseFloat(movie.imdbRating ?? '')
      return {
        movie,
        score: matchingGenres.length * 4 + matchingLanguages.length * 5 + (Number.isFinite(rating) ? rating / 10 : 0),
        matchesPreference: matchingGenres.length > 0 || matchingLanguages.length > 0,
      }
    })
    .filter((item) => (preferredGenres.size || preferredLanguages.size ? item.matchesPreference : true))
    .sort((first, second) => second.score - first.score)

  return {
    movies: ranked.slice(0, 12).map((item) => item.movie),
    error: ranked.length === 0 ? error : null,
  }
}
