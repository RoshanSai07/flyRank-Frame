import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, Heart, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import type { Movie } from '../../models/Movie'
import { useMovieTrailerViewModel } from '../../viewmodels/useMovieTrailerViewModel'
import { MovieTrailerPlayer } from './MovieTrailerPlayer'

interface FeaturedFilmProps {
  movies: Movie[]
  error: string | null
  greeting: string
  isFavorite: (movie: Movie) => boolean
  onToggleFavorite: (movie: Movie) => void
}

export function FeaturedFilm({ movies, error, greeting, isFavorite, onToggleFavorite }: FeaturedFilmProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const movie = movies.length ? movies[activeIndex % movies.length] : null
  const { trailer, backdropUrl, loading: mediaLoading, error: trailerError } = useMovieTrailerViewModel(movie)

  const changeSlide = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + movies.length) % movies.length)
  }

  const goToSlide = (index: number) => {
    setActiveIndex(index)
  }

  return (
    <section
      aria-labelledby="featured-title"
      className={`featured-film streaming-hero ${movie ? 'has-feature' : 'hero-configure'}`}
    >
      {movie && (
        <>
          {backdropUrl && (
            <img alt="" className="streaming-hero-art" key={movie.imdbID} src={backdropUrl} />
          )}
          {trailer && (
            <MovieTrailerPlayer
              className="hero-trailer"
              key={trailer.videoId}
              label={movie.title}
              backdrop={backdropUrl}
              trailer={trailer}
            />
          )}
        </>
      )}
      <div className="featured-shade" />
      <div className="featured-content page-width">
        <div className="featured-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> FOR {greeting.toLocaleUpperCase()} / FRAME PRESENTS</span>
          {movie ? (
            <div className="featured-slide-copy" key={movie.imdbID}>
              <h1 id="featured-title">{movie.title}<span>.</span></h1>
              <p className="featured-description">{movie.plot ?? 'Explore this story from the FRAME movie collection.'}</p>
              <div className="featured-meta">
                <span>{movie.year}</span>
                {movie.genre && <><i /><span>{movie.genre}</span></>}
                {(movie.imdbRating && movie.imdbRating !== 'N/A' || movie.tmdbRating) && (
                  <><i /><span className="featured-rating"><b>{movie.imdbRating ? 'IMDb' : 'TMDB'}</b> {movie.imdbRating ?? movie.tmdbRating}</span></>
                )}
              </div>
              <div className="featured-actions">
                <Link className="button button-primary" to={`/movie/${movie.imdbID}`}>
                  More info <ArrowRight size={16} />
                </Link>
                <button
                  aria-label={isFavorite(movie) ? 'Remove featured movie from collection' : 'Add featured movie to collection'}
                  aria-pressed={isFavorite(movie)}
                  className={`button button-quiet ${isFavorite(movie) ? 'is-added' : ''}`}
                  onClick={() => onToggleFavorite(movie)}
                  type="button"
                >
                  {isFavorite(movie) ? <Heart fill="currentColor" size={16} /> : <Plus size={16} />}
                  {isFavorite(movie) ? 'In my collection' : 'Add to collection'}
                </button>
              </div>
              {trailer && <span className="trailer-available">Verified trailer available · muted playback</span>}
              {!trailer && !mediaLoading && trailerError && (
                <span className="trailer-available" role="status">TMDB media is unavailable; showing the dark fallback.</span>
              )}
            </div>
          ) : (
            <div className="hero-empty">
              <h1 id="featured-title">Your next favorite<br /><em>story starts here.</em></h1>
              <p>{error ?? 'A new story is being selected for you.'}</p>
              <a className="button button-primary" href="#search">Find a film <ArrowRight size={16} /></a>
            </div>
          )}
        </div>
        <div className="featured-side-note"><span>FRAME ORIGINALS</span></div>
        <a className="scroll-cue" href="#collections"><ArrowDown size={14} /> SCROLL TO DISCOVER</a>
        <span className="featured-bottom-label">YOUR NEXT FAVORITE STORY STARTS HERE</span>
        {movies.length > 1 && (
          <div aria-label="Featured movie controls" className="featured-slide-controls">
            <button aria-label="Previous featured movie" onClick={() => changeSlide(-1)} type="button">
              <ChevronLeft size={17} />
            </button>
            <div className="featured-slide-dots">
              {movies.map((m, idx) => (
                <button
                  key={m.imdbID || idx}
                  aria-label={`Go to movie ${idx + 1}`}
                  aria-current={idx === (activeIndex % movies.length) ? 'true' : undefined}
                  className={`featured-dot ${idx === (activeIndex % movies.length) ? 'is-active' : ''}`}
                  onClick={() => goToSlide(idx)}
                  type="button"
                />
              ))}
            </div>
            <span aria-live="polite">{(activeIndex % movies.length) + 1} / {movies.length}</span>
            <button aria-label="Next featured movie" onClick={() => changeSlide(1)} type="button">
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
