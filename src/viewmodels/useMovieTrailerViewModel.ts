import { useEffect, useState } from 'react'
import type { Movie, MovieTrailer } from '../models/Movie'
import { getMovieMedia } from '../services/trailerService'

interface TrailerState {
  key: string
  backdropUrl: string | null
  posterUrl: string | null
  trailer: MovieTrailer | null
  error: string | null
}

export function useMovieTrailerViewModel(movie: Movie | null | undefined) {
  const [state, setState] = useState<TrailerState | null>(null)
  const key = movie
    ? movie.tmdbID ? `tmdb-${movie.tmdbID}` : movie.imdbID
    : ''

  useEffect(() => {
    if (!movie || !key) return
    let active = true

    getMovieMedia(movie)
      .then((media) => {
        if (active) {
          setState({
            key,
            backdropUrl: media.backdropUrl,
            posterUrl: media.posterUrl,
            trailer: media.trailer,
            error: null,
          })
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            key,
            backdropUrl: null,
            posterUrl: null,
            trailer: null,
            error: error instanceof Error ? error.message : 'Trailer lookup failed.',
          })
        }
      })

    return () => { active = false }
  }, [key, movie])

  if (!movie) return { backdropUrl: null, posterUrl: null, trailer: null, loading: false, error: null }
  if (state?.key !== key) {
    return { backdropUrl: null, posterUrl: null, trailer: null, loading: true, error: null }
  }
  return { ...state, loading: false }
}
