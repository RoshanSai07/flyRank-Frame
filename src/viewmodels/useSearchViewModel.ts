import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Movie } from '../models/Movie'
import {
  getErrorMessage,
  searchFilteredCatalog,
  type CatalogFilters,
} from '../services/movieService'

export interface SearchFilterValues {
  genre: string
  language: string
  yearRange: 'all' | '2020s' | '2010s' | '2000s' | '90s' | 'classic'
  minRating: number
  sortBy: 'popularity' | 'rating' | 'newest'
}

export const DEFAULT_FILTERS: SearchFilterValues = {
  genre: 'All',
  language: 'All',
  yearRange: 'all',
  minRating: 0,
  sortBy: 'popularity',
}

interface SearchState {
  key: string
  movies: Movie[]
  page: number
  total: number
  loading: boolean
  error: string | null
}

const emptyState: SearchState = {
  key: '',
  movies: [],
  page: 1,
  total: 0,
  loading: false,
  error: null,
}

export function useSearchViewModel() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilterValues>(DEFAULT_FILTERS)
  const [state, setState] = useState(emptyState)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 180)
    return () => window.clearTimeout(timer)
  }, [query])

  const currentKey = useMemo(() => {
    return JSON.stringify({
      q: debouncedQuery,
      g: filters.genre,
      l: filters.language,
      y: filters.yearRange,
      r: filters.minRating,
      s: filters.sortBy,
    })
  }, [debouncedQuery, filters])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.genre !== 'All' ||
      filters.language !== 'All' ||
      filters.yearRange !== 'all' ||
      filters.minRating > 0 ||
      filters.sortBy !== 'popularity'
    )
  }, [filters])

  const hasCriteria = Boolean(debouncedQuery) || hasActiveFilters

  useEffect(() => {
    let active = true
    if (!hasCriteria) {
      setState(emptyState)
      return () => { active = false }
    }

    const catalogFilters: CatalogFilters = {
      query: debouncedQuery,
      genre: filters.genre !== 'All' ? filters.genre : undefined,
      language: filters.language !== 'All' ? filters.language : undefined,
      yearRange: filters.yearRange,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      sortBy: filters.sortBy,
      page: 1,
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    searchFilteredCatalog(catalogFilters)
      .then((result) => {
        if (active) {
          setState({
            key: currentKey,
            movies: result.movies,
            page: 1,
            total: result.total,
            loading: false,
            error: null,
          })
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setState({
            key: currentKey,
            movies: [],
            page: 1,
            total: 0,
            loading: false,
            error: getErrorMessage(reason),
          })
        }
      })

    return () => { active = false }
  }, [currentKey, debouncedQuery, filters, hasCriteria])

  const queryPending = query.trim() !== debouncedQuery
  const stateMatchesKey = state.key === currentKey
  const movies = !queryPending && stateMatchesKey ? state.movies : []
  const total = !queryPending && stateMatchesKey ? state.total : 0
  const error = !queryPending && stateMatchesKey ? state.error : null
  const loading = queryPending || (hasCriteria && (!stateMatchesKey || state.loading))

  const setFilter = useCallback(<K extends keyof SearchFilterValues>(
    key: K,
    value: SearchFilterValues[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const loadMore = async () => {
    if (!hasCriteria || loading || movies.length >= total || state.page >= 100) return
    const nextPage = state.page + 1
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const catalogFilters: CatalogFilters = {
        query: debouncedQuery,
        genre: filters.genre !== 'All' ? filters.genre : undefined,
        language: filters.language !== 'All' ? filters.language : undefined,
        yearRange: filters.yearRange,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        sortBy: filters.sortBy,
        page: nextPage,
      }
      const result = await searchFilteredCatalog(catalogFilters)
      setState((current) => {
        if (current.key !== currentKey) return current
        const knownIDs = new Set(current.movies.map((movie) => movie.imdbID || (movie.tmdbID ? `tmdb-${movie.tmdbID}` : '')))
        return {
          ...current,
          movies: [...current.movies, ...result.movies.filter((movie) => !knownIDs.has(movie.imdbID || (movie.tmdbID ? `tmdb-${movie.tmdbID}` : '')))],
          page: nextPage,
          total: result.total,
          loading: false,
        }
      })
    } catch (reason) {
      setState((current) => current.key === currentKey
        ? { ...current, loading: false, error: getErrorMessage(reason) }
        : current)
    }
  }

  const hasMore = useMemo(() => movies.length < total && state.page < 100, [movies.length, state.page, total])

  return {
    query,
    setQuery,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    hasSearched: hasCriteria,
    movies,
    total,
    loading,
    error,
    loadMore,
    hasMore,
  }
}
