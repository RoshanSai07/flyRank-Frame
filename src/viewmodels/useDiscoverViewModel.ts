import { useEffect, useState } from 'react'
import type { Movie, UserPreferences } from '../models/Movie'
import { getErrorMessage, getMovieByTitle, getMovieDetails, hasOmdbApiKey, searchMovies } from '../services/movieService'

export interface MovieCollection {
  id: string
  title: string
  query: string
  movies: Movie[]
  loading: boolean
  error: string | null
  emptyMessage?: string
}

const GENRE_COLLECTION_CONFIG: Record<string, { title: string; query: string; featured: string[] }> = {
  Action: { title: 'High-Octane Action', query: 'John Wick', featured: ['The Dark Knight', 'The Matrix', 'Mad Max: Fury Road', 'John Wick'] },
  Adventure: { title: 'Epic Adventures', query: 'The Lord of the Rings', featured: ['The Lord of the Rings: The Fellowship of the Ring', 'The Martian', 'Dune'] },
  Animation: { title: 'Animation Masterpieces', query: 'Spirited Away', featured: ['Spirited Away', 'Spider-Man: Into the Spider-Verse', 'WALL-E', 'Coco'] },
  Comedy: { title: 'Comedy & Feel-Good', query: 'The Grand Budapest Hotel', featured: ['The Grand Budapest Hotel', 'Groundhog Day', 'Little Miss Sunshine'] },
  Crime: { title: 'Crime & Masterminds', query: 'The Godfather', featured: ['The Godfather', 'Pulp Fiction', 'The Departed'] },
  Documentary: { title: 'Eye-Opening Documentaries', query: 'Planet Earth', featured: ['Free Solo', "Won't You Be My Neighbor?", 'The Last Dance'] },
  Drama: { title: 'Compelling Dramas', query: 'The Shawshank Redemption', featured: ['The Shawshank Redemption', 'Fight Club', 'Forrest Gump', 'The Prestige'] },
  Fantasy: { title: 'Fantasy & Beyond', query: 'Harry Potter', featured: ['Harry Potter and the Sorcerer\'s Stone', 'The Lord of the Rings', 'Pan\'s Labyrinth'] },
  Horror: { title: 'Chills & Suspense', query: 'Get Out', featured: ['Get Out', 'A Quiet Place', 'The Shining', 'Hereditary'] },
  Mystery: { title: 'Mind-Bending Mysteries', query: 'Knives Out', featured: ['Knives Out', 'The Prestige', 'Gone Girl', 'Memento'] },
  Romance: { title: 'Romantic Stories', query: 'Pride and Prejudice', featured: ['Pride & Prejudice', 'Before Sunrise', 'La La Land', 'The Notebook'] },
  'Sci-Fi': { title: 'Sci-Fi Horizons', query: 'Interstellar', featured: ['Interstellar', 'Arrival', 'The Matrix', 'Inception', 'Blade Runner 2049'] },
  Thriller: { title: 'Tense & Gripping Thrillers', query: 'The Dark Knight', featured: ['The Dark Knight', 'The Silence of the Lambs', 'Prisoners', 'Se7en'] },
}

const LANGUAGE_COLLECTION_CONFIG: Record<string, { title: string; query: string; featured: string[] }> = {
  English: { title: 'English Cinema Highlights', query: 'Inception', featured: ['Inception', 'Interstellar', 'The Dark Knight'] },
  French: { title: 'French Cinema Showcase', query: 'Amelie', featured: ['Amélie', 'The Intouchables', 'Portrait of a Lady on Fire'] },
  German: { title: 'German Cinema Picks', query: 'Run Lola Run', featured: ['Run Lola Run', 'The Lives of Others', 'All Quiet on the Western Front'] },
  Hindi: { title: 'Hindi & Bollywood Hits', query: '3 Idiots', featured: ['3 Idiots', 'Dangal', 'The Lunchbox'] },
  Italian: { title: 'Italian Film Gems', query: 'Cinema Paradiso', featured: ['Cinema Paradiso', 'Life Is Beautiful', 'Bicycle Thieves'] },
  Japanese: { title: 'Japanese Cinema Showcase', query: 'Spirited Away', featured: ['Spirited Away', 'Your Name.', 'Seven Samurai'] },
  Korean: { title: 'Korean Cinema Spotlight', query: 'Parasite', featured: ['Parasite', 'Train to Busan', 'The Handmaiden'] },
  Mandarin: { title: 'Mandarin Cinema Highlights', query: 'Crouching Tiger', featured: ['Crouching Tiger, Hidden Dragon', 'Hero', 'In the Mood for Love'] },
  Spanish: { title: 'Spanish Language Cinema', query: "Pan's Labyrinth", featured: ["Pan's Labyrinth", 'Roma', 'The Secret in Their Eyes'] },
  Telugu: { title: 'Telugu & Tollywood Blockbusters', query: 'RRR', featured: ['RRR', 'Baahubali: The Beginning', 'Eega'] },
}

export const curatedCollections = [
  { id: 'trending', title: 'Trending Now', query: 'Dune' },
  { id: 'popular', title: 'Popular Movies', query: 'Batman' },
  { id: 'top-rated', title: 'Top Rated', query: 'The Godfather' },
  { id: 'action', title: 'Action & Adventure', query: 'Mission Impossible' },
] as const

function resolveTargetCollections(preferences?: UserPreferences) {
  const dynamic: Array<{ id: string; title: string; query: string }> = []
  const hasGenres = preferences?.genres && preferences.genres.length > 0
  const hasLangs = preferences?.languages && preferences.languages.length > 0

  if (hasGenres) {
    preferences.genres.forEach((genre) => {
      const config = GENRE_COLLECTION_CONFIG[genre]
      if (config) {
        dynamic.push({
          id: `genre-${genre.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          title: config.title,
          query: config.query,
        })
      }
    })
  }

  if (hasLangs) {
    preferences.languages.forEach((lang) => {
      const config = LANGUAGE_COLLECTION_CONFIG[lang]
      if (config) {
        dynamic.push({
          id: `lang-${lang.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          title: config.title,
          query: config.query,
        })
      }
    })
  }

  if (dynamic.length < 3) {
    curatedCollections.forEach((col) => {
      if (!dynamic.some((d) => d.id === col.id)) {
        dynamic.push(col)
      }
    })
  }

  return dynamic
}

function resolveHeroSeedTitles(preferences?: UserPreferences) {
  const seeds: string[] = []
  if (preferences?.genres?.length) {
    preferences.genres.forEach((genre) => {
      const config = GENRE_COLLECTION_CONFIG[genre]
      if (config) seeds.push(...config.featured)
    })
  }
  if (preferences?.languages?.length) {
    preferences.languages.forEach((lang) => {
      const config = LANGUAGE_COLLECTION_CONFIG[lang]
      if (config) seeds.push(...config.featured)
    })
  }

  if (!seeds.length) {
    seeds.push('Interstellar', 'Dune', 'The Dark Knight', 'Inception', 'The Matrix', 'The Godfather')
  }

  // Deduplicate preserving order
  return [...new Set(seeds)].slice(0, 6)
}

export function useDiscoverViewModel(preferences?: UserPreferences) {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([])
  const [featuredError, setFeaturedError] = useState<string | null>(null)
  const hasApiKey = hasOmdbApiKey()

  const targetCollections = resolveTargetCollections(preferences)
  const [collections, setCollections] = useState<MovieCollection[]>(() =>
    targetCollections.map((collection) => ({
      ...collection,
      movies: [],
      loading: hasApiKey,
      error: null,
    })),
  )

  const prefKey = JSON.stringify({
    genres: preferences?.genres ?? [],
    languages: preferences?.languages ?? [],
  })

  useEffect(() => {
    let active = true
    if (!hasApiKey) return () => { active = false }

    const activeCollections = resolveTargetCollections(preferences)
    const seedTitles = resolveHeroSeedTitles(preferences)

    // Set initial loading state for current collections
    setCollections(
      activeCollections.map((col) => ({
        ...col,
        movies: [],
        loading: true,
        error: null,
      })),
    )

    Promise.all([
      // Fetch hero candidate titles
      Promise.all(
        seedTitles.map((title) =>
          getMovieByTitle(title).catch(() => null),
        ),
      ),
      // Fetch collections
      Promise.all(
        activeCollections.map(async (collection) => {
          try {
            const result = await searchMovies(collection.query)
            return { ...collection, movies: result.movies, loading: false, error: null }
          } catch (error) {
            return {
              ...collection,
              movies: [] as Movie[],
              loading: false,
              error: getErrorMessage(error),
            }
          }
        }),
      ),
    ]).then(async ([seedMovies, results]) => {
      if (!active) return
      setCollections(results)

      const validSeeds = seedMovies.filter((m): m is Movie => m !== null)
      const candidates = new Map<string, Movie>()
      validSeeds.forEach((movie) => candidates.set(movie.imdbID, movie))

      // Also supplement from collection movies if needed
      results.forEach((collection) => {
        collection.movies.slice(0, 2).forEach((movie) => {
          if (!candidates.has(movie.imdbID)) candidates.set(movie.imdbID, movie)
        })
      })

      const detailedMovies = await Promise.all(
        [...candidates.values()].slice(0, 6).map(async (movie) => {
          try {
            return await getMovieDetails(movie.imdbID)
          } catch (error) {
            if (active) setFeaturedError(getErrorMessage(error))
            return movie
          }
        }),
      )

      if (active) {
        setFeaturedMovies(detailedMovies)
        if (detailedMovies.length) setFeaturedError(null)
      }
    })

    return () => { active = false }
  }, [hasApiKey, prefKey, preferences])

  const configurationError = 'Add VITE_OMDB_API_KEY to your local .env file to connect the movie catalog.'
  return {
    collections,
    featuredError: featuredError ?? (hasApiKey ? null : configurationError),
    featuredMovie: featuredMovies[0] ?? null,
    featuredMovies,
    hasApiKey,
  }
}
