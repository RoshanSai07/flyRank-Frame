import { useEffect, useState } from 'react'
import type { UserPreferences } from '../models/Movie'
import { getPersonalizedMovies } from '../services/movieIntelligenceService'
import { getErrorMessage } from '../services/movieService'
import type { MovieCollection } from './useDiscoverViewModel'

interface RecommendationState {
  key: string
  movies: MovieCollection['movies']
  loading: boolean
  error: string | null
}

export function usePersonalizedRecommendationsViewModel(preferences: UserPreferences) {
  const key = JSON.stringify(preferences)
  const [state, setState] = useState<RecommendationState>({
    key,
    movies: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true
    getPersonalizedMovies(preferences)
      .then((result) => {
        if (active) setState({ key, movies: result.movies, loading: false, error: result.error })
      })
      .catch((reason: unknown) => {
        if (active) setState({ key, movies: [], loading: false, error: getErrorMessage(reason) })
      })
    return () => { active = false }
  }, [key, preferences])

  const current = state.key === key ? state : { key, movies: [], loading: true, error: null }
  const selectedPreferences = [
    ...preferences.genres,
    ...preferences.languages,
  ]

  return {
    collection: {
      id: 'recommended',
      title: 'Recommended for You',
      query: '',
      movies: current.movies,
      loading: current.loading,
      error: current.error,
      emptyMessage: selectedPreferences.length
        ? 'No matching titles were verified for these preferences yet.'
        : 'No recommendations are available right now.',
    } satisfies MovieCollection,
  }
}
