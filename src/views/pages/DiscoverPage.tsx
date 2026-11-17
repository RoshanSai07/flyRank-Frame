import { useDemoAuth } from '../context/useDemoAuth'
import { DashboardPage } from './DashboardPage'
import { PublicLandingPage } from './PublicLandingPage'

export function DiscoverPage() {
  const { user } = useDemoAuth()
  return user ? <DashboardPage /> : <PublicLandingPage />
}
