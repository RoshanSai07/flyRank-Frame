import { Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Footer } from '../views/components/Footer'
import { Header } from '../views/components/Header'
import { CollectionPage } from '../views/pages/CollectionPage'
import { DemoAuthPage } from '../views/pages/DemoAuthPage'
import { DiscoverPage } from '../views/pages/DiscoverPage'
import { MovieDetailsPage } from '../views/pages/MovieDetailsPage'
import { NotFoundPage } from '../views/pages/NotFoundPage'
import { ProfileSettingsPage } from '../views/pages/ProfileSettingsPage'

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PageFrame><DiscoverPage /></PageFrame>} path="/" />
      <Route element={<PageFrame><MovieDetailsPage /></PageFrame>} path="/movie/:id" />
      <Route element={<PageFrame><CollectionPage /></PageFrame>} path="/collection" />
      <Route element={<PageFrame><ProfileSettingsPage /></PageFrame>} path="/settings" />
      <Route element={<PageFrame><DemoAuthPage mode="login" /></PageFrame>} path="/login" />
      <Route element={<PageFrame><DemoAuthPage mode="register" /></PageFrame>} path="/register" />
      <Route element={<PageFrame><NotFoundPage /></PageFrame>} path="*" />
    </Routes>
  )
}
