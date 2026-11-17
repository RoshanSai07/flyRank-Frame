import { ArrowDown, ArrowRight, Bookmark, Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDiscoverViewModel } from '../../viewmodels/useDiscoverViewModel'
import { useMovieTrailerViewModel } from '../../viewmodels/useMovieTrailerViewModel'
import { MovieCarousel } from '../components/MovieCarousel'

export function PublicLandingPage() {
  const discovery = useDiscoverViewModel()
  const media = useMovieTrailerViewModel(discovery.featuredMovie)
  const popular = discovery.collections.find((collection) => collection.id === 'popular')
  const action = discovery.collections.find((collection) => collection.id === 'action')
  const topRated = discovery.collections.find((collection) => collection.id === 'top-rated')

  return (
    <main className="public-landing">
      <section aria-labelledby="landing-title" className="landing-hero">
        {media.backdropUrl && (
          <img
            alt=""
            className="landing-hero-art"
            onError={(event) => { event.currentTarget.remove() }}
            src={media.backdropUrl}
          />
        )}
        <div className="landing-hero-shade" />
        <div className="page-width landing-hero-content">
          <span className="eyebrow"><span className="eyebrow-dot" /> FRAME / DISCOVER. COLLECT. REVISIT.</span>
          <h1 id="landing-title">Your next favorite<br /><em>story starts here.</em></h1>
          <p>Find a film worth remembering, keep the ones you love, and make your next movie night feel like yours.</p>
          <div className="landing-actions">
            <a className="button button-primary" href="#landing-picks">Explore movies <ArrowDown size={16} /></a>
            <Link className="button button-quiet" to="/register">Get started <ArrowRight size={16} /></Link>
          </div>
          {discovery.featuredMovie && (
            <span className="landing-featured-note">
              Featured from OMDb · {discovery.featuredMovie.title} ({discovery.featuredMovie.year})
            </span>
          )}
        </div>
      </section>

      <section className="page-width landing-intro" id="landing-picks">
        <div className="landing-intro-copy">
          <span className="eyebrow section-eyebrow">A BETTER WAY TO FIND YOUR NEXT FILM</span>
          <h2>Made for the<br /><em>love of film.</em></h2>
        </div>
        <p>FRAME brings discovery and your personal collection together. Search the OMDb catalog, save films to revisit, and shape recommendations around the genres and languages you enjoy.</p>
      </section>

      {!discovery.hasApiKey ? (
        <section className="page-width api-config-notice" role="status">
          <div>
            <strong>Movie picks need an OMDb connection</strong>
            <p>Add <code>VITE_OMDB_API_KEY</code> to your local <code>.env</code> file and restart the app to load real movie data.</p>
          </div>
        </section>
      ) : (
        <section className="page-width landing-movies">
          <div className="landing-section-heading">
            <div>
              <span className="eyebrow section-eyebrow">A FEW GOOD PLACES TO BEGIN</span>
              <h2>Find your <em>frame.</em></h2>
            </div>
            <p>Curated OMDb title searches, not live rankings.</p>
          </div>
          {popular && <MovieCarousel collection={popular} />}
          <div className="landing-categories">
            <div>
              <span className="eyebrow section-eyebrow">EXPLORE BY MOOD</span>
              <p>Jump into a curated title search.</p>
            </div>
            <div aria-label="Genres for the featured film" className="landing-category-links">
              {(discovery.featuredMovie?.genre ?? '').split(',').map((genre) => genre.trim()).filter(Boolean).map((genre) => (
                <span className="landing-category-chip" key={genre}>{genre}</span>
              ))}
              {!discovery.featuredMovie?.genre && <span className="landing-category-chip">Movie genres from OMDb</span>}
            </div>
          </div>
          <div className="landing-secondary-shelves">
            {topRated && <MovieCarousel collection={topRated} />}
            {action && <MovieCarousel collection={action} />}
          </div>
        </section>
      )}

      <section className="page-width landing-features">
        <div className="landing-feature">
          <span><Search size={17} /></span>
          <h3>Discover</h3>
          <p>Search real film details and explore curated starting points from OMDb.</p>
        </div>
        <div className="landing-feature">
          <span><Bookmark size={17} /></span>
          <h3>Collect</h3>
          <p>Keep a personal collection in this browser, ready to revisit any time.</p>
        </div>
        <div className="landing-feature">
          <span><SlidersHorizontal size={17} /></span>
          <h3>Make it yours</h3>
          <p>Set language and genre preferences to guide your recommendations.</p>
        </div>
      </section>
      <div className="landing-signup page-width">
        <p>Start collecting stories worth coming back to.</p>
        <div>
          <Link className="button button-primary" to="/register">Create a demo profile <ArrowRight size={15} /></Link>
          <Link className="landing-sign-in" to="/login">Already have a profile? Sign in</Link>
        </div>
      </div>
    </main>
  )
}
