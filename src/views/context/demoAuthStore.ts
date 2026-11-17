import { createContext } from 'react'
import type { DemoUser } from '../../models/Movie'

export interface DemoAuthContextValue {
  user: DemoUser | null
  storageError: string | null
  signIn: (email: string) => void
  signOut: () => void
}

export const DemoAuthContext = createContext<DemoAuthContextValue | null>(null)
