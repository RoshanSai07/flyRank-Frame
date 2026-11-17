import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DemoUser } from '../../models/Movie'
import { useEscapeKey } from '../../hooks/useEscapeKey'

interface ProfileMenuProps {
  user: DemoUser
  displayName: string
  onSignOut: () => void
  onNavigate: () => void
}

export function ProfileMenu({ user, displayName, onSignOut, onNavigate }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEscapeKey(() => setOpen(false), open)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join('') || user.email[0].toLocaleUpperCase()

  return (
    <div className="profile-menu" ref={root}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="profile-menu-trigger"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="profile-avatar">{initials}</span>
        <span className="profile-menu-name">{displayName}</span>
        <ChevronDown aria-hidden="true" size={14} />
      </button>
      {open && (
        <div aria-label="Profile menu" className="profile-menu-panel" role="menu">
          <div className="profile-menu-identity">
            <span className="profile-menu-display">{displayName}</span>
            <span>{user.email}</span>
            <small>Frontend-only demo profile</small>
          </div>
          <Link onClick={() => { setOpen(false); onNavigate() }} role="menuitem" to="/settings">
            <Settings size={15} /> Profile & preferences
          </Link>
          <Link onClick={() => { setOpen(false); onNavigate() }} role="menuitem" to="/collection">
            <UserRound size={15} /> My collection
          </Link>
          <button
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            role="menuitem"
            type="button"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
