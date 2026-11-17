import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MovieCollection } from '../../viewmodels/useDiscoverViewModel'
import { useFavorites } from '../context/useFavorites'
import { MovieCard } from './MovieCard'
import { MovieSkeletons } from './MovieSkeletons'

export function MovieCarousel({ collection }: { collection: MovieCollection }) {
  const track = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const { isFavorite, toggleFavorite } = useFavorites()

  const updateScrollButtons = useCallback(() => {
    const element = track.current
    if (!element) return
    setCanScrollLeft(element.scrollLeft > 2)
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateScrollButtons)
    window.addEventListener('resize', updateScrollButtons)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [collection.movies.length, updateScrollButtons])

  const scroll = (direction: -1 | 1) => {
    track.current?.scrollBy({ left: direction * (track.current.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <section aria-labelledby={`carousel-${collection.id}`} className="carousel-section">
      <div className="carousel-heading">
        <div>
          <h2 id={`carousel-${collection.id}`}>{collection.title}</h2>
          <p>Curated from the FRAME index</p>
        </div>
        <div className="carousel-arrows">
          <button aria-label={`Scroll ${collection.title} left`} disabled={!canScrollLeft} onClick={() => scroll(-1)} type="button">
            <ChevronLeft size={18} />
          </button>
          <button aria-label={`Scroll ${collection.title} right`} disabled={!canScrollRight || collection.movies.length === 0} onClick={() => scroll(1)} type="button">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      {collection.error ? (
        <div className="inline-error" role="status">{collection.error}</div>
      ) : collection.loading ? (
        <MovieSkeletons count={5} />
      ) : collection.movies.length ? (
        <div className="carousel-track" onScroll={updateScrollButtons} ref={track}>
          {collection.movies.map((movie, index) => (
            <div className="carousel-item" key={movie.imdbID}>
              <MovieCard index={index} isFavorite={isFavorite(movie.imdbID)} movie={movie} onToggleFavorite={toggleFavorite} />
            </div>
          ))}
        </div>
      ) : (
        <div className="inline-empty">
          {collection.emptyMessage ?? 'No titles were returned for this collection.'}
        </div>
      )}
    </section>
  )
}
