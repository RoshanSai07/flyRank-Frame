import type { Movie } from '../../models/Movie'
import { MovieCard } from './MovieCard'

interface MovieGridProps {
  movies: Movie[]
  favorites: (imdbID: string) => boolean
  onToggleFavorite: (movie: Movie) => void
}

export function MovieGrid({ movies, favorites, onToggleFavorite }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-index">NO MATCHES FOUND</span>
        <h3>A different frame?</h3>
        <p>Try another title or spelling.</p>
      </div>
    )
  }

  return (
    <div className="movie-grid">
      {movies.map((movie, index) => (
        <MovieCard
          index={index}
          isFavorite={favorites(movie.imdbID)}
          key={movie.imdbID}
          movie={movie}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
