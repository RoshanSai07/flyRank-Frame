import { Filter, RotateCcw, Search, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import type { Movie } from '../../models/Movie'
import { useSearchViewModel } from '../../viewmodels/useSearchViewModel'
import { MovieGrid } from './MovieGrid'
import { MovieSkeletons } from './MovieSkeletons'

const GENRE_OPTIONS = [
  'All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance',
  'Sci-Fi', 'Thriller',
]

const LANGUAGE_OPTIONS = [
  'All', 'English', 'French', 'German', 'Hindi', 'Italian',
  'Japanese', 'Korean', 'Spanish', 'Telugu',
]

const ERA_OPTIONS: Array<{ label: string; value: 'all' | '2020s' | '2010s' | '2000s' | '90s' | 'classic' }> = [
  { label: 'All Eras', value: 'all' },
  { label: '2020s', value: '2020s' },
  { label: '2010s', value: '2010s' },
  { label: '2000s', value: '2000s' },
  { label: '90s', value: '90s' },
  { label: 'Classics', value: 'classic' },
]

const RATING_OPTIONS: Array<{ label: string; value: number }> = [
  { label: 'Any Rating', value: 0 },
  { label: '★ 7.0+', value: 7 },
  { label: '★ 8.0+', value: 8 },
  { label: '★ 8.5+', value: 8.5 },
]

const SORT_OPTIONS: Array<{ label: string; value: 'popularity' | 'rating' | 'newest' }> = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
]

interface CatalogExplorerProps {
  isFavorite: (movie: Movie) => boolean
  onToggleFavorite: (movie: Movie) => void
}

export function CatalogExplorer({ isFavorite, onToggleFavorite }: CatalogExplorerProps) {
  const search = useSearchViewModel()
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const activeFilterCount = (
    (search.filters.genre !== 'All' ? 1 : 0) +
    (search.filters.language !== 'All' ? 1 : 0) +
    (search.filters.yearRange !== 'all' ? 1 : 0) +
    (search.filters.minRating > 0 ? 1 : 0) +
    (search.filters.sortBy !== 'popularity' ? 1 : 0)
  )

  return (
    <section aria-labelledby="catalog-explorer-title" className="catalog-explorer" id="search">
      <div className="catalog-explorer-header">
        <div>
          <span className="eyebrow section-eyebrow">
            <Sparkles size={13} /> DISCOVER & EXPLORE
          </span>
          <h2 id="catalog-explorer-title">
            Search & <em>Filter Movies.</em>
          </h2>
          <p className="catalog-explorer-intro">
            Fast, comprehensive search across titles, cast members, genres, and languages.
          </p>
        </div>
      </div>

      <div className="catalog-search-bar-wrap">
        <div className="catalog-search-input-box">
          <Search aria-hidden="true" className="catalog-search-icon" size={19} />
          <input
            aria-label="Search movies, actors, directors, or genres"
            className="catalog-search-input"
            onChange={(event) => search.setQuery(event.target.value)}
            placeholder="Search by title, cast member, director, or genre (e.g. Nolan, Inception, Sci-Fi)..."
            type="search"
            value={search.query}
          />
          {search.query && (
            <button
              aria-label="Clear search query"
              className="catalog-clear-btn"
              onClick={() => search.setQuery('')}
              type="button"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          aria-expanded={filterPanelOpen}
          className={`catalog-filter-toggle ${filterPanelOpen || activeFilterCount > 0 ? 'is-active' : ''}`}
          onClick={() => setFilterPanelOpen((open) => !open)}
          type="button"
        >
          <Filter size={16} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="catalog-filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Quick genre filter pills */}
      <div aria-label="Genre filters" className="catalog-quick-genres" role="region">
        {GENRE_OPTIONS.slice(0, 10).map((genre) => (
          <button
            aria-pressed={search.filters.genre === genre}
            className={`catalog-genre-pill ${search.filters.genre === genre ? 'is-selected' : ''}`}
            key={genre}
            onClick={() => search.setFilter('genre', genre)}
            type="button"
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Expanded Filter Panel */}
      {filterPanelOpen && (
        <div className="catalog-filter-panel" role="region" aria-label="Detailed movie filters">
          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-genre">Genre</label>
            <select
              className="filter-select"
              id="filter-genre"
              onChange={(e) => search.setFilter('genre', e.target.value)}
              value={search.filters.genre}
            >
              {GENRE_OPTIONS.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-lang">Language</label>
            <select
              className="filter-select"
              id="filter-lang"
              onChange={(e) => search.setFilter('language', e.target.value)}
              value={search.filters.language}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-era">Release Era</label>
            <select
              className="filter-select"
              id="filter-era"
              onChange={(e) => search.setFilter('yearRange', e.target.value as any)}
              value={search.filters.yearRange}
            >
              {ERA_OPTIONS.map((era) => (
                <option key={era.value} value={era.value}>{era.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-rating">Min Rating</label>
            <select
              className="filter-select"
              id="filter-rating"
              onChange={(e) => search.setFilter('minRating', Number(e.target.value))}
              value={search.filters.minRating}
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label" htmlFor="filter-sort">Sort By</label>
            <select
              className="filter-select"
              id="filter-sort"
              onChange={(e) => search.setFilter('sortBy', e.target.value as any)}
              value={search.filters.sortBy}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {search.hasActiveFilters && (
            <button
              className="catalog-reset-filters-btn"
              onClick={search.resetFilters}
              type="button"
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Results Header */}
      {search.hasSearched && (
        <div className="catalog-results-info">
          <span className="results-count">
            {search.loading
              ? 'Finding related movies…'
              : `${search.total} related ${search.total === 1 ? 'movie' : 'movies'} found`}
          </span>
          {(search.query || search.hasActiveFilters) && (
            <div className="active-filter-tags">
              {search.query && (
                <span className="active-tag">
                  Query: &ldquo;{search.query}&rdquo;
                  <button aria-label="Clear query" onClick={() => search.setQuery('')} type="button">
                    <X size={12} />
                  </button>
                </span>
              )}
              {search.filters.genre !== 'All' && (
                <span className="active-tag">
                  Genre: {search.filters.genre}
                  <button aria-label="Clear genre" onClick={() => search.setFilter('genre', 'All')} type="button">
                    <X size={12} />
                  </button>
                </span>
              )}
              {search.filters.language !== 'All' && (
                <span className="active-tag">
                  Lang: {search.filters.language}
                  <button aria-label="Clear language" onClick={() => search.setFilter('language', 'All')} type="button">
                    <X size={12} />
                  </button>
                </span>
              )}
              {search.filters.yearRange !== 'all' && (
                <span className="active-tag">
                  Era: {search.filters.yearRange}
                  <button aria-label="Clear era" onClick={() => search.setFilter('yearRange', 'all')} type="button">
                    <X size={12} />
                  </button>
                </span>
              )}
              {search.filters.minRating > 0 && (
                <span className="active-tag">
                  Rating: ★ {search.filters.minRating}+
                  <button aria-label="Clear rating" onClick={() => search.setFilter('minRating', 0)} type="button">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button className="clear-all-tags-btn" onClick={() => { search.setQuery(''); search.resetFilters(); }} type="button">
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid or Skeletons or Empty */}
      {search.hasSearched ? (
        <>
          {search.loading && search.movies.length === 0 ? (
            <div className="catalog-loading-skeletons">
              <MovieSkeletons count={6} />
            </div>
          ) : search.error ? (
            <div className="catalog-error-state" role="alert">
              <p>{search.error}</p>
            </div>
          ) : search.movies.length > 0 ? (
            <>
              <MovieGrid
                favorites={(id) => isFavorite({ imdbID: id } as Movie)}
                movies={search.movies}
                onToggleFavorite={onToggleFavorite}
              />
              {search.hasMore && (
                <div className="catalog-load-more-wrap">
                  <button
                    className="button button-quiet catalog-load-more-btn"
                    disabled={search.loading}
                    onClick={() => void search.loadMore()}
                    type="button"
                  >
                    {search.loading ? 'Loading more movies…' : `Load more related movies (${search.movies.length} of ${search.total})`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="catalog-empty-state">
              <h3>No matching movies found</h3>
              <p>Try searching for a different actor, title, or clearing some filters.</p>
              <button
                className="button button-primary"
                onClick={() => { search.setQuery(''); search.resetFilters(); }}
                type="button"
              >
                Reset search & filters
              </button>
            </div>
          )}
        </>
      ) : null}
    </section>
  )
}
