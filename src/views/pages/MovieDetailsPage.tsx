import { ArrowLeft, Heart } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useMovieTrailerViewModel } from '../../viewmodels/useMovieTrailerViewModel'
import { useMovieDetailsViewModel } from '../../viewmodels/useMovieDetailsViewModel'
import { MovieCarousel } from '../components/MovieCarousel'
import { MovieSkeletons } from '../components/MovieSkeletons'
import { MovieTrailerPlayer } from '../components/MovieTrailerPlayer'
import { useFavorites } from '../context/useFavorites'

export function MovieDetailsPage() {
  const { id } = useParams()
  const {
    movie,
    loading,
    error,
    similar,
    featuringCast,
    director,
    castMembers,
    selectedActor,
    selectedActorID,
    setSelectedActor,
    intelligenceLoading,
  } = useMovieDetailsViewModel(id)
  const { isFavorite, toggleFavorite } = useFavorites()
  const trailerState = useMovieTrailerViewModel(movie)

  if (loading) {
    return (
      <main className="page-width detail-loading">
        <span className="eyebrow section-eyebrow">FRAME / MOVIE DETAILS</span>
        <MovieSkeletons count={3} />
      </main>
    )
  }

  if (error || !movie) {
    return (
      <main className="page-width detail-error">
        <span className="eyebrow section-eyebrow">OUT OF FRAME / MOVIE UNAVAILABLE</span>
        <h1>We couldn’t find<br /><em>that film.</em></h1>
        <p>{error ?? 'This movie could not be found.'}</p>
        <Link className="button button-primary" to="/"><ArrowLeft size={15} /> Back to discover</Link>
      </main>
    )
  }

  const poster = trailerState.posterUrl
    ?? (movie.poster && movie.poster !== 'N/A' ? movie.poster : '/poster-placeholder.svg')
  const { trailer, backdropUrl, loading: trailerLoading, error: trailerError } = trailerState
  const facts = [
    ['Director', movie.director],
    ['Cast', movie.actors],
    ['Language', movie.language],
    ['Country', movie.country],
  ].filter((fact): fact is [string, string] => Boolean(fact[1] && fact[1] !== 'N/A'))

  return (
    <main className="movie-detail-page">
      <section className="detail-hero">
        {backdropUrl && <img alt="" className="detail-hero-art" src={backdropUrl} />}
        {trailer && (
          <MovieTrailerPlayer
            className="detail-hero-trailer"
            key={trailer.videoId}
            label={movie.title}
            backdrop={backdropUrl}
            trailer={trailer}
          />
        )}
        <div className="detail-hero-shade" />
        <div className="page-width detail-hero-content">
          <Link className="back-link" to="/"><ArrowLeft size={15} /> Back to discover</Link>
          <div className="detail-hero-layout">
            <img alt={`${movie.title} poster`} className="detail-poster" src={poster} />
            <div className="detail-title-block">
              <span className="eyebrow"><span className="eyebrow-dot" /> FRAME / FEATURE</span>
              <h1>{movie.title}</h1>
              <div className="detail-meta">
                <span>{movie.year}</span>
                {movie.rated && movie.rated !== 'N/A' && <span>{movie.rated}</span>}
                {movie.runtime && movie.runtime !== 'N/A' && <span>{movie.runtime}</span>}
                {movie.imdbRating && movie.imdbRating !== 'N/A' && <span className="detail-rating"><b>IMDb</b> {movie.imdbRating}</span>}
                {!movie.imdbRating && movie.tmdbRating && <span className="detail-rating"><b>TMDB</b> {movie.tmdbRating}</span>}
              </div>
              {movie.genre && movie.genre !== 'N/A' && <p className="detail-genres">{movie.genre}</p>}
              <p className="detail-hero-plot">
                {movie.plot && movie.plot !== 'N/A' ? movie.plot : 'A story waiting to be discovered.'}
              </p>
              <div className="featured-actions">
                <button
                  aria-pressed={isFavorite(movie.imdbID)}
                  className={`button button-primary ${isFavorite(movie.imdbID) ? 'button-saved' : ''}`}
                  onClick={() => toggleFavorite(movie)}
                  type="button"
                >
                  <Heart fill={isFavorite(movie.imdbID) ? 'currentColor' : 'none'} size={16} />
                  {isFavorite(movie.imdbID) ? 'In my collection' : 'Add to collection'}
                </button>
              </div>
              <p className="detail-trailer-status" role="status">
                {trailer
                  ? 'Official trailer · muted playback'
                  : trailerLoading
                    ? 'Checking TMDB for a verified trailer…'
                    : trailerError ?? 'No verified trailer available; showing the TMDB cinematic backdrop.'}
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="page-width detail-body">
        <section className="detail-plot">
          <span className="eyebrow section-eyebrow">THE STORY</span>
          <h2>One to <em>remember.</em></h2>
          <p>{movie.plot && movie.plot !== 'N/A' ? movie.plot : 'A story waiting to be discovered.'}</p>
        </section>
        <dl className="detail-facts">
          {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          <div><dt>{movie.imdbID.startsWith('tt') ? 'IMDb ID' : 'TMDB ID'}</dt><dd>{movie.imdbID}</dd></div>
        </dl>
        {similar && <MovieCarousel collection={similar} />}
        <section aria-labelledby="cast-discovery-title" className="cast-discovery">
          <div className="cast-discovery-heading">
            <div>
              <span className="eyebrow section-eyebrow">TOP CAST & PERFORMANCES</span>
              <h2 id="cast-discovery-title">Starring <em>Cast.</em></h2>
            </div>
            {selectedActor && (
              <span className="cast-selected-badge">
                Selected: <strong>{selectedActor}</strong>
              </span>
            )}
          </div>
          {castMembers.length > 0 ? (
            <div aria-label="Cast member list" className="cast-photos-scroller" role="region">
              <div className="cast-photos-list">
                {castMembers.map((actor) => {
                  const isSelected = actor.id.toString() === selectedActorID
                  const initials = actor.name
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()

                  return (
                    <button
                      aria-label={`View movies featuring ${actor.name}${actor.character ? ` as ${actor.character}` : ''}`}
                      aria-pressed={isSelected}
                      className={`cast-card ${isSelected ? 'is-selected' : ''}`}
                      key={actor.id}
                      onClick={() => {
                        setSelectedActor(actor.id.toString())
                        document.getElementById('featuring-cast-movies')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                        })
                      }}
                      type="button"
                    >
                      <div className="cast-photo-frame">
                        {actor.photoUrl ? (
                          <img
                            alt={actor.name}
                            className="cast-photo"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                              const fallback = event.currentTarget.nextElementSibling
                              if (fallback) fallback.classList.remove('is-hidden')
                            }}
                            src={actor.photoUrl}
                          />
                        ) : null}
                        <div className={`cast-avatar-fallback ${actor.photoUrl ? 'is-hidden' : ''}`}>
                          {initials}
                        </div>
                      </div>
                      <div className="cast-meta">
                        <strong className="cast-name">{actor.name}</strong>
                        {actor.character && <span className="cast-character">{actor.character}</span>}
                      </div>
                      {isSelected && <span className="cast-active-pill">Viewing movies</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            !intelligenceLoading && (
              <p className="inline-empty">TMDB did not provide cast credits for this title.</p>
            )
          )}
          <div className="featuring-cast-shelf" id="featuring-cast-movies">
            {featuringCast && <MovieCarousel collection={featuringCast} />}
          </div>
        </section>
        {director && <MovieCarousel collection={director} />}
      </div>
    </main>
  )
}
