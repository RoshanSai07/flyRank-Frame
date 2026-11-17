import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEscapeKey } from '../../hooks/useEscapeKey'
import { useDemoAuth } from '../context/useDemoAuth'
import { useFavorites } from '../context/useFavorites'
import { usePreferences } from '../context/usePreferences'
import { Brand } from './Brand'
import { InlineSearch } from './InlineSearch'
import { ProfileMenu } from './ProfileMenu'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { count } = useFavorites()
  const { user, signOut } = useDemoAuth()
  const { preferences } = usePreferences()
  const navigate = useNavigate()
  useEscapeKey(() => setMenuOpen(false), menuOpen)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const displayName = preferences.displayName.trim() || user?.email.split('@')[0] || 'Film fan'

  const handleSignOut = () => {
    signOut()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        <Brand />
        <nav aria-label="Main navigation" className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink end onClick={() => setMenuOpen(false)} to="/">
            Discover
          </NavLink>
          {user && (
            <NavLink onClick={() => setMenuOpen(false)} to="/collection">
              My collection <span className="collection-count">{count}</span>
            </NavLink>
          )}
          <InlineSearch onNavigate={() => setMenuOpen(false)} />
          {user ? (
            <ProfileMenu
              user={user}
              displayName={displayName}
              onNavigate={() => setMenuOpen(false)}
              onSignOut={handleSignOut}
            />
          ) : (
            <>
              <Link className="public-sign-in" onClick={() => setMenuOpen(false)} to="/login">Sign in</Link>
              <Link className="public-get-started" onClick={() => setMenuOpen(false)} to="/register">Get started</Link>
            </>
          )}
        </nav>
        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
    </header>
  )
}
