import { useEffect, useState } from 'react'
import type { Movie } from '../models/Movie'
import {
  getErrorMessage,
  getMovieDetails,
} from '../services/movieService'
import {
  getMovieIntelligence,
  getMoviesByCastMember,
  getMoviesByDirectorIDs,
} from '../services/movieIntelligenceService'
import type { MovieIntelligence } from '../services/movieIntelligenceService'
import { getMovieDetailsByTmdbID, getTmdbIDFromRouteId } from '../services/tmdbService'
import type { MovieCollection } from './useDiscoverViewModel'

const IMDB_ID_PATTERN = /^tt\d{5,}$/

interface DetailsState {
  id: string
  movie: Movie | null
  loading: boolean
  error: string | null
  intelligence: MovieIntelligence | null
  intelligenceLoading: boolean
  intelligenceError: string | null
  selectedActorID: string
  castMovies: Movie[]
  directorMovies: Movie[]
  peopleLoading: boolean
  peopleError: string | null
}

function isSupportedRouteId(id: string) {
  return IMDB_ID_PATTERN.test(id) || getTmdbIDFromRouteId(id) !== null
}

function movieKey(movie: Movie) {
  return movie.tmdbID ? `tmdb-${movie.tmdbID}` : movie.imdbID
}

export function useMovieDetailsViewModel(id: string | undefined) {
  const [state, setState] = useState<DetailsState | null>(null)

  useEffect(() => {
    let active = true
    if (!id || !isSupportedRouteId(id)) return () => { active = false }

    const tmdbID = getTmdbIDFromRouteId(id)
    const movieRequest = tmdbID ? getMovieDetailsByTmdbID(tmdbID) : getMovieDetails(id)

    movieRequest
      .then((movie) => {
        if (!active) return
        setState({
          id,
          movie,
          loading: false,
          error: null,
          intelligence: null,
          intelligenceLoading: true,
          intelligenceError: null,
          selectedActorID: '',
          castMovies: [],
          directorMovies: [],
          peopleLoading: false,
          peopleError: null,
        })

        getMovieIntelligence(movie)
          .then((intelligence) => {
            if (!active) return
            setState((current) => current?.id === id
              ? {
                  ...current,
                  movie: {
                    ...movie,
                    ...(intelligence.tmdbID ? { tmdbID: intelligence.tmdbID } : {}),
                  },
                  intelligence,
                  intelligenceLoading: false,
                  intelligenceError: intelligence.error,
                  selectedActorID: intelligence.castMembers[0]?.id.toString() ?? '',
                  peopleLoading: Boolean(intelligence.tmdbID),
                }
              : current)
          })
          .catch((reason: unknown) => {
            if (!active) return
            setState((current) => current?.id === id
              ? {
                  ...current,
                  intelligenceLoading: false,
                  intelligenceError: getErrorMessage(reason),
                }
              : current)
          })
      })
      .catch((reason: unknown) => {
        if (active) {
          setState({
            id,
            movie: null,
            loading: false,
            error: getErrorMessage(reason),
            intelligence: null,
            intelligenceLoading: false,
            intelligenceError: null,
            selectedActorID: '',
            castMovies: [],
            directorMovies: [],
            peopleLoading: false,
            peopleError: null,
          })
        }
      })

    return () => { active = false }
  }, [id])

  const currentID = state?.id
  const tmdbID = state?.intelligence?.tmdbID
  const selectedActorID = state?.selectedActorID
  const directorIDs = state?.intelligence?.directors.map((director) => director.id).join(',') ?? ''

  useEffect(() => {
    if (!currentID || !tmdbID || !state?.intelligence) return
    let active = true

    const castRequest = selectedActorID
      ? getMoviesByCastMember(Number(selectedActorID), tmdbID)
      : Promise.resolve([])
    const directorRequest = getMoviesByDirectorIDs(
      directorIDs ? directorIDs.split(',').map(Number) : [],
      tmdbID,
    )

    Promise.all([castRequest, directorRequest])
      .then(([castMovies, directorMovies]) => {
        if (!active) return
        setState((current) => current?.id === currentID
          ? {
              ...current,
              castMovies,
              directorMovies,
              peopleLoading: false,
              peopleError: null,
            }
          : current)
      })
      .catch((reason: unknown) => {
        if (!active) return
        setState((current) => current?.id === currentID
          ? {
              ...current,
              peopleLoading: false,
              peopleError: getErrorMessage(reason),
            }
          : current)
      })

    return () => { active = false }
  }, [currentID, directorIDs, selectedActorID, state?.intelligence, tmdbID])

  if (!id || !isSupportedRouteId(id)) {
    return {
      movie: null,
      loading: false,
      error: 'That movie ID is not valid. Search for a title to find its details.',
      similar: null,
      featuringCast: null,
      director: null,
      castMembers: [],
      selectedActor: '',
      selectedActorID: '',
      setSelectedActor: () => undefined,
      intelligenceLoading: false,
    }
  }

  if (state?.id !== id) {
    return {
      movie: null,
      loading: true,
      error: null,
      similar: null,
      featuringCast: null,
      director: null,
      castMembers: [],
      selectedActor: '',
      selectedActorID: '',
      setSelectedActor: () => undefined,
      intelligenceLoading: false,
    }
  }

  const movie = state.movie
  const intelligence = state.intelligence
  const collection = (
    collectionID: string,
    title: string,
    movies: Movie[],
    emptyMessage: string,
    loading = state.intelligenceLoading,
    error = state.intelligenceError,
  ): MovieCollection => ({
    id: collectionID,
    title,
    query: '',
    movies,
    loading,
    error,
    emptyMessage,
  })

  const selectedActor = intelligence?.castMembers
    .find((person) => person.id.toString() === state.selectedActorID)?.name ?? ''
  const similarMovies = intelligence?.similar ?? []
  const similarIDs = new Set(similarMovies.map(movieKey))
  const directorMovies = state.directorMovies.filter((candidate) => !similarIDs.has(movieKey(candidate)))
  const displayedIDs = new Set([...similarIDs, ...directorMovies.map(movieKey)])
  const castMovies = state.castMovies.filter((candidate) => !displayedIDs.has(movieKey(candidate)))

  return {
    movie,
    loading: state.loading,
    error: state.error,
    similar: movie
      ? collection(
          'similar-movies',
          'Similar Movies',
          similarMovies,
          'No relevant similar titles were found.',
        )
      : null,
    featuringCast: collection(
      'featuring-cast',
      selectedActor ? `Featuring ${selectedActor}` : 'Featuring the Cast',
      castMovies,
      'No additional films featuring this cast member were found.',
      state.peopleLoading,
      state.peopleError ?? state.intelligenceError,
    ),
    director: movie
      ? collection(
          'more-from-director',
          'More from This Director',
          directorMovies,
          'No additional titles by this director were found.',
          state.peopleLoading,
          state.peopleError ?? state.intelligenceError,
        )
      : null,
    castMembers: intelligence?.castMembers ?? [],
    selectedActor,
    selectedActorID: state.selectedActorID,
    setSelectedActor: (actorID: string) => {
      setState((current) => current?.id === id
        ? {
            ...current,
            selectedActorID: actorID,
            castMovies: [],
            peopleLoading: true,
            peopleError: null,
          }
        : current)
    },
    intelligenceLoading: state.intelligenceLoading || state.peopleLoading,
  }
}
