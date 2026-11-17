import { AppRouter } from './routes/AppRouter'
import { DemoAuthProvider } from './views/context/DemoAuthContext'
import { FavoritesProvider } from './views/context/FavoritesContext'
import { PreferencesProvider } from './views/context/PreferencesContext'
import { StorageNotice } from './views/components/StorageNotice'
import { useDemoAuth } from './views/context/useDemoAuth'
import { useFavorites } from './views/context/useFavorites'
import { usePreferences } from './views/context/usePreferences'

export default function App() {
  return (
    <DemoAuthProvider>
      <FavoritesProvider>
        <PreferencesProvider>
          <AppContent />
        </PreferencesProvider>
      </FavoritesProvider>
    </DemoAuthProvider>
  )
}

function AppContent() {
  const { storageError: favoritesError } = useFavorites()
  const { storageError: sessionError } = useDemoAuth()
  const { storageError: preferencesError } = usePreferences()
  const storageError = [favoritesError, sessionError, preferencesError].filter(Boolean).join(' ')

  return (
    <>
      <StorageNotice message={storageError || null} />
      <AppRouter />
    </>
  )
}
