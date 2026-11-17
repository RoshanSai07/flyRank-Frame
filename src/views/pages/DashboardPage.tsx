import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDiscoverViewModel } from '../../viewmodels/useDiscoverViewModel'
import { usePersonalizedRecommendationsViewModel } from '../../viewmodels/usePersonalizedRecommendationsViewModel'
import { useDemoAuth } from '../context/useDemoAuth'
import { useFavorites } from '../context/useFavorites'
import { usePreferences } from '../context/usePreferences'
import { CatalogExplorer } from '../components/CatalogExplorer'
import { FeaturedFilm } from '../components/FeaturedFilm'
import { MovieCarousel } from '../components/MovieCarousel'

export function DashboardPage() {
  const { user } = useDemoAuth()
  const { preferences } = usePreferences()
  const discovery = useDiscoverViewModel(preferences)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { collection: recommended } = usePersonalizedRecommendationsViewModel(preferences)
  const displayName = preferences.displayName.trim() || user?.email.split('@')[0] || 'Film fan'

  return (
    <main className="dashboard-page">
      <FeaturedFilm
        error={discovery.featuredError}
        greeting={displayName}
        isFavorite={(movie) => isFavorite(movie.imdbID)}
        movies={discovery.featuredMovies}
        onToggleFavorite={toggleFavorite}
      />
      <section className="page-width dashboard-discovery" id="collections">
        <div className="dashboard-discovery-heading">
          <div>
            <span className="eyebrow section-eyebrow">CURATED FOR YOUR NEXT MOVIE NIGHT</span>
            <h2>Choose your <em>next story.</em></h2>
          </div>
          <Link to="/collection">Your collection <ArrowRight size={14} /></Link>
        </div>
        {!discovery.hasApiKey && (
          <div className="api-config-notice" role="status">
            <div>
              <strong>Connect your movie catalog</strong>
              <p>Set <code>VITE_OMDB_API_KEY</code> in your local <code>.env</code> file and restart Vite to load movies.</p>
            </div>
          </div>
        )}
        <p className="curated-disclaimer">OMDb &amp; TMDB provide verified titles tailored to your preferences.</p>
        <div className="carousel-list dashboard-carousel-list">
          <MovieCarousel collection={recommended} />
          {discovery.collections.map((collection) => (
            <MovieCarousel collection={collection} key={collection.id} />
          ))}
        </div>

        <CatalogExplorer
          isFavorite={(movie) => isFavorite(movie.imdbID)}
          onToggleFavorite={toggleFavorite}
        />
      </section>
    </main>
  )
}
