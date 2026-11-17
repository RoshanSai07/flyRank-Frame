import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadDemoUser, saveDemoUser } from '../../services/localStorageService'
import { DemoAuthContext } from './demoAuthStore'

function readInitialUser() {
  try {
    return { user: loadDemoUser(), error: null }
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Could not load demo session.',
    }
  }
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readInitialUser)
  const [user, setUser] = useState(initial.user)
  const [storageError, setStorageError] = useState<string | null>(initial.error)

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== 'frame:demo-session:v1' && event.key !== null) return
      try {
        setUser(loadDemoUser())
        setStorageError(null)
      } catch (error) {
        setStorageError(error instanceof Error ? error.message : 'Could not sync demo session.')
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const signIn = useCallback((email: string) => {
    const nextUser = { email }
    saveDemoUser(nextUser)
    setUser(nextUser)
    setStorageError(null)
  }, [])

  const signOut = useCallback(() => {
    try {
      saveDemoUser(null)
      setUser(null)
      setStorageError(null)
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : 'Could not end the demo session.')
    }
  }, [])

  const value = useMemo(
    () => ({ user, storageError, signIn, signOut }),
    [signIn, signOut, storageError, user],
  )

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>
}

