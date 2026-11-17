import type { DemoUser, Movie, UserPreferences } from '../models/Movie'

const FAVORITES_KEY = 'frame:favorites:v1'
const DEMO_SESSION_KEY = 'frame:demo-session:v1'
const USER_PREFERENCES_KEY = 'frame:user-preferences:v1'

export function loadFavorites(): Movie[] {
  const stored = localStorage.getItem(FAVORITES_KEY)
  if (!stored) return []

  const data: unknown = JSON.parse(stored)
  if (!Array.isArray(data)) throw new Error('Saved collection data is invalid. Clear FRAME storage to continue.')

  return data.filter(
    (item: unknown): item is Movie =>
      typeof item === 'object' &&
      item !== null &&
      'imdbID' in item &&
      typeof item.imdbID === 'string' &&
      'title' in item &&
      typeof item.title === 'string',
  )
}

export function saveFavorites(movies: Movie[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(movies))
}

export function loadDemoUser(): DemoUser | null {
  const stored = localStorage.getItem(DEMO_SESSION_KEY)
  if (!stored) return null

  const data: unknown = JSON.parse(stored)
  if (
    typeof data === 'object' &&
    data !== null &&
    'email' in data &&
    typeof data.email === 'string'
  ) {
    return { email: data.email }
  }
  throw new Error('Saved demo session data is invalid. Clear FRAME storage to continue.')
}

export function saveDemoUser(user: DemoUser | null) {
  if (user) localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user))
  else localStorage.removeItem(DEMO_SESSION_KEY)
}

export function loadUserPreferences(): UserPreferences {
  const stored = localStorage.getItem(USER_PREFERENCES_KEY)
  if (!stored) return { displayName: '', languages: [], genres: [] }

  const data: unknown = JSON.parse(stored)
  if (
    typeof data !== 'object' ||
    data === null ||
    !('displayName' in data) ||
    typeof data.displayName !== 'string' ||
    !('languages' in data) ||
    !Array.isArray(data.languages) ||
    !data.languages.every((language: unknown) => typeof language === 'string') ||
    !('genres' in data) ||
    !Array.isArray(data.genres) ||
    !data.genres.every((genre: unknown) => typeof genre === 'string')
  ) {
    throw new Error('Saved profile preferences are invalid. Clear FRAME storage to continue.')
  }

  return {
    displayName: data.displayName,
    languages: data.languages,
    genres: data.genres,
  }
}

export function saveUserPreferences(preferences: UserPreferences) {
  localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences))
}
