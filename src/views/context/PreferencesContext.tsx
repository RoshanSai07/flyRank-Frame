import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { UserPreferences } from '../../models/Movie'
import { loadUserPreferences, saveUserPreferences } from '../../services/localStorageService'
import { PreferencesContext } from './preferencesStore'

function readInitialPreferences() {
  try {
    return { preferences: loadUserPreferences(), error: null }
  } catch (error) {
    return {
      preferences: { displayName: '', languages: [], genres: [] },
      error: error instanceof Error ? error.message : 'Could not load profile preferences.',
    }
  }
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readInitialPreferences)
  const [preferences, setPreferences] = useState(initial.preferences)
  const [storageError, setStorageError] = useState<string | null>(initial.error)

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'frame:user-preferences:v1' && event.key !== null) return
      try {
        setPreferences(loadUserPreferences())
        setStorageError(null)
      } catch (error) {
        setStorageError(error instanceof Error ? error.message : 'Could not sync profile preferences.')
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const save = useCallback((nextPreferences: UserPreferences) => {
    saveUserPreferences(nextPreferences)
    setPreferences(nextPreferences)
    setStorageError(null)
  }, [])

  const value = useMemo(
    () => ({ preferences, storageError, savePreferences: save }),
    [preferences, save, storageError],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}
