import { ArrowUpRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Movie } from '../../models/Movie'

interface MovieCardProps {
  movie: Movie
  isFavorite: boolean
  onToggleFavorite: (movie: Movie) => void
  index?: number
}

export function MovieCard({ movie, isFavorite, onToggleFavorite, index = 0 }: MovieCardProps) {
  const poster = movie.poster && movie.poster !== 'N/A' ? movie.poster : '/poster-placeholder.svg'
  const imdbRating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null
  const rating = imdbRating ?? movie.tmdbRating ?? '—'
  const ratingSource = imdbRating ? 'IMDb' : movie.tmdbRating ? 'TMDB' : 'Rating'

  return (
    <article className="movie-card" style={{ animationDelay: `${index * 35}ms` }}>
      <div className="poster-frame">
        <Link aria-label={`View ${movie.title}`} className="poster-link" to={`/movie/${movie.imdbID}`}>
          <img
            alt={`${movie.title} poster`}
            loading="lazy"
            onError={(event) => {
              if (!event.currentTarget.src.endsWith('/poster-placeholder.svg')) {
                event.currentTarget.src = '/poster-placeholder.svg'
              }
            }}
            src={poster}
          />
          <span className="poster-overlay"><span>More info <ArrowUpRight size={14} /></span></span>
        </Link>
        <button
          aria-label={`${isFavorite ? 'Remove' : 'Add'} ${movie.title} ${isFavorite ? 'from' : 'to'} collection`}
          aria-pressed={isFavorite}
          className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
          onClick={() => onToggleFavorite(movie)}
          type="button"
        >
          <Heart fill={isFavorite ? 'currentColor' : 'none'} size={17} strokeWidth={1.7} />
        </button>
      </div>
      <div className="movie-card-info">
        <div>
          <Link className="movie-title" to={`/movie/${movie.imdbID}`}>{movie.title}</Link>
          <p className="movie-meta">{movie.year}{movie.type && <span> · {movie.type}</span>}</p>
        </div>
        <span className="movie-rating" aria-label={`${ratingSource} rating ${rating}`}>
          <span>{ratingSource}</span> {rating}
        </span>
      </div>
    </article>
  )
}
