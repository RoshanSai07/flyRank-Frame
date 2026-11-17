import { createContext } from 'react'
import type { Movie } from '../../models/Movie'

export interface FavoritesContextValue {
  favorites: Movie[]
  count: number
  storageError: string | null
  isFavorite: (imdbID: string) => boolean
  toggleFavorite: (movie: Movie) => void
  removeFavorite: (imdbID: string) => void
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null)
