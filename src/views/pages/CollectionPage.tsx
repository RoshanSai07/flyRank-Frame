import { Link } from 'react-router-dom'
import { useFavorites } from '../context/useFavorites'
import { MovieGrid } from '../components/MovieGrid'

export function CollectionPage() {
  const { count, favorites, isFavorite, toggleFavorite } = useFavorites()

  return (
    <main className="page-width collection-page">
      <div className="page-kicker"><span className="eyebrow section-eyebrow">YOUR FRAME / YOUR FILMS</span><span>{String(count).padStart(2, '0')} SAVED</span></div>
      <h1>My <em>Collection.</em></h1>
      <p className="page-intro">The stories you want to keep close.</p>
      {favorites.length ? (
        <MovieGrid movies={favorites} favorites={isFavorite} onToggleFavorite={toggleFavorite} />
      ) : (
        <div className="collection-empty">
          <div className="empty-art" aria-hidden="true">F</div>
          <span className="eyebrow section-eyebrow">A LITTLE ROOM FOR SOMETHING GOOD</span>
          <h2>Your collection is waiting.</h2>
          <p>Save films as you discover them and they’ll find their place here.</p>
          <Link className="button button-primary" to="/#collections">Discover films <span aria-hidden="true">→</span></Link>
        </div>
      )}
    </main>
  )
}
