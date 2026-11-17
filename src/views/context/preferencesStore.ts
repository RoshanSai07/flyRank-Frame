import { createContext } from 'react'
import type { UserPreferences } from '../../models/Movie'

export interface PreferencesContextValue {
  preferences: UserPreferences
  storageError: string | null
  savePreferences: (preferences: UserPreferences) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)
