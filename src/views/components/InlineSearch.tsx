import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSearchViewModel } from '../../viewmodels/useSearchViewModel'

export function InlineSearch({ onNavigate }: { onNavigate?: () => void }) {
  const search = useSearchViewModel()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [visibleCount, setVisibleCount] = useState(6)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const clearSearch = () => {
    search.setQuery('')
    setActiveIndex(-1)
    setVisibleCount(6)
    inputRef.current?.focus()
  }

  const openMovie = (imdbID: string) => {
    navigate(`/movie/${imdbID}`)
    search.setQuery('')
    setVisibleCount(6)
    setOpen(false)
    onNavigate?.()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActiveIndex(-1)
    } else if (event.key === 'ArrowDown' && search.movies.length) {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, Math.min(search.movies.length, visibleCount) - 1))
    } else if (event.key === 'ArrowUp' && search.movies.length) {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && search.movies.length) {
      event.preventDefault()
      const movie = search.movies[activeIndex >= 0 ? activeIndex : 0]
      if (movie) openMovie(movie.imdbID)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOpen(true)
    inputRef.current?.focus()
  }

  const loadMore = async () => {
    await search.loadMore()
    setVisibleCount((current) => current + 6)
  }

  return (
    <div className={`inline-search ${open ? 'is-open' : ''}`}>
      {!open ? (
        <button
          aria-expanded={false}
          aria-label="Open movie search"
          className="inline-search-trigger"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Search aria-hidden="true" size={17} />
          <span>Search</span>
        </button>
      ) : (
        <form autoComplete="off" className="inline-search-form" onSubmit={handleSubmit} role="search">
          <Search aria-hidden="true" size={16} />
          <input
            aria-activedescendant={activeIndex >= 0 ? `inline-search-result-${activeIndex}` : undefined}
            aria-autocomplete="list"
            aria-controls="inline-search-results"
            aria-expanded={Boolean(search.query.trim())}
            autoComplete="off"
            onChange={(event) => {
              search.setQuery(event.target.value)
              setActiveIndex(-1)
              setVisibleCount(6)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search movies"
            ref={inputRef}
            role="combobox"
            type="search"
            value={search.query}
          />
          {search.query ? (
            <button aria-label="Clear search" className="inline-search-clear" onClick={clearSearch} type="button">
              <X size={15} />
            </button>
          ) : (
            <button
              aria-label="Close movie search"
              className="inline-search-clear"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X size={15} />
            </button>
          )}
        </form>
      )}
      {open && search.query.trim() && (
        <div className="inline-search-dropdown" id="inline-search-results">
          {search.loading && <p className="inline-search-message" role="status">Searching catalog…</p>}
          {search.error && <p className="inline-search-message is-error" role="alert">{search.error}</p>}
          {search.hasSearched && !search.loading && !search.error && search.movies.length === 0 && (
            <p className="inline-search-message">No movies found. Try another title.</p>
          )}
          {search.movies.length > 0 && (
            <>
              <ul aria-label="Movie search results" className="inline-search-results" role="listbox">
                {search.movies.slice(0, visibleCount).map((movie, index) => (
                  <li key={movie.imdbID} role="presentation">
                    <button
                      aria-selected={activeIndex === index}
                      className={`inline-search-result ${activeIndex === index ? 'is-active' : ''}`}
                      id={`inline-search-result-${index}`}
                      onClick={() => openMovie(movie.imdbID)}
                      onMouseEnter={() => setActiveIndex(index)}
                      role="option"
                      type="button"
                    >
                      <img
                        alt=""
                        onError={(event) => { event.currentTarget.src = '/poster-placeholder.svg' }}
                        src={movie.poster && movie.poster !== 'N/A' ? movie.poster : '/poster-placeholder.svg'}
                      />
                      <span>
                        <strong>{movie.title}</strong>
                        <small>{movie.year}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {search.hasMore && (
                <button
                  className="inline-search-more"
                  disabled={search.loading}
                  onClick={() => void loadMore()}
                  type="button"
                >
                  {search.loading ? 'Loading more…' : 'Load more results'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
