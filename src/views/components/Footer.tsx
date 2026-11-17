import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDemoAuth } from '../context/useDemoAuth'
import { Brand } from './Brand'

export function Footer() {
  const { user } = useDemoAuth()

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <Brand />
          <p>Your next favorite story starts here.</p>
        </div>
        <div className="footer-links">
          <Link to="/">Discover</Link>
          {user && <Link to="/collection">My collection</Link>}
          {user && <Link to="/settings">Preferences</Link>}
          {!user && <Link to="/login">Sign in <ArrowUpRight size={13} /></Link>}
          {!user && <Link to="/register">Get started</Link>}
        </div>
      </div>
      <section aria-label="Credits" className="footer-credits">
        <a aria-label="TMDB, source of trailer data" href="https://www.themoviedb.org" rel="noreferrer" target="_blank">
          <img alt="The Movie Database" src="/tmdb-logo.svg" />
        </a>
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </section>
      <div className="footer-bottom">
        <span>© 2026 FRAME. MADE FOR THE LOVE OF FILM.</span>
        <span>AN INDEPENDENT FILM JOURNAL</span>
      </div>
    </footer>
  )
}
