import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { Movie } from '../../models/Movie'
import { loadFavorites, saveFavorites } from '../../services/localStorageService'
import { FavoritesContext } from './favoritesStore'

function readInitialFavorites() {
  try {
    return { favorites: loadFavorites(), error: null }
  } catch (error) {
    return {
      favorites: [] as Movie[],
      error: error instanceof Error ? error.message : 'Could not load your saved collection.',
    }
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readInitialFavorites)
  const [favorites, setFavorites] = useState(initial.favorites)
  const [storageError, setStorageError] = useState<string | null>(initial.error)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      return
    }
    try {
      saveFavorites(favorites)
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Could not save your collection.')
    }
  }, [favorites])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'frame:favorites:v1' && event.key !== null) return
      try {
        setFavorites(loadFavorites())
        setStorageError(null)
      } catch (error) {
        setStorageError(error instanceof Error ? error.message : 'Could not sync your collection.')
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const isFavorite = useCallback(
    (imdbID: string) => favorites.some((movie) => movie.imdbID === imdbID),
    [favorites],
  )

  const toggleFavorite = useCallback((movie: Movie) => {
    setStorageError(null)
    setFavorites((current) =>
      current.some((saved) => saved.imdbID === movie.imdbID)
        ? current.filter((saved) => saved.imdbID !== movie.imdbID)
        : [movie, ...current],
    )
  }, [])

  const removeFavorite = useCallback((imdbID: string) => {
    setStorageError(null)
    setFavorites((current) => current.filter((movie) => movie.imdbID !== imdbID))
  }, [])

  const value = useMemo(
    () => ({ favorites, count: favorites.length, storageError, isFavorite, toggleFavorite, removeFavorite }),
    [favorites, isFavorite, removeFavorite, storageError, toggleFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

