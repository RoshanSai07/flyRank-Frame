import { useContext } from 'react'
import { DemoAuthContext } from './demoAuthStore'

export function useDemoAuth() {
  const context = useContext(DemoAuthContext)
  if (!context) throw new Error('useDemoAuth must be used within DemoAuthProvider.')
  return context
}
