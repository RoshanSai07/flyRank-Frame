import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import type { UserPreferences } from '../../models/Movie'
import { useDemoAuth } from '../context/useDemoAuth'
import { usePreferences } from '../context/usePreferences'

const LANGUAGE_OPTIONS = [
  'English', 'French', 'German', 'Hindi', 'Italian',
  'Japanese', 'Korean', 'Mandarin', 'Spanish', 'Telugu',
]

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller',
]

function toggleChoice(values: string[], choice: string) {
  return values.includes(choice)
    ? values.filter((value) => value !== choice)
    : [...values, choice]
}

export function ProfileSettingsPage() {
  const { user } = useDemoAuth()
  const { preferences, savePreferences } = usePreferences()
  const [draft, setDraft] = useState<UserPreferences>(preferences)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!user) return <Navigate replace to="/login" />

  const displayName = draft.displayName.trim() || user.email.split('@')[0] || 'Film fan'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join('')

  const update = (changes: Partial<UserPreferences>) => {
    setDraft((current) => ({ ...current, ...changes }))
    setMessage(null)
    setError(null)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      savePreferences({ ...draft, displayName: draft.displayName.trim() })
      setMessage('Your profile and discovery preferences are saved on this device.')
      setError(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your preferences could not be saved.')
      setMessage(null)
    }
  }

  return (
    <main className="page-width profile-page">
      <header className="profile-page-heading">
        <span className="eyebrow section-eyebrow">YOUR FRAME / YOUR PREFERENCES</span>
        <h1>Make it <em>yours.</em></h1>
        <p>Set a few preferences to give your movie discovery a personal touch.</p>
      </header>

      <form className="profile-settings-form" onSubmit={submit}>
        <section aria-labelledby="profile-section-title" className="profile-panel">
          <div className="profile-panel-heading">
            <div>
              <span className="eyebrow section-eyebrow">PROFILE</span>
              <h2 id="profile-section-title">Your demo account</h2>
            </div>
            <span aria-hidden="true" className="settings-avatar">{initials || 'F'}</span>
          </div>
          <div className="profile-fields">
            <label>
              Display name
              <input
                autoComplete="nickname"
                maxLength={50}
                onChange={(event) => update({ displayName: event.target.value })}
                placeholder="How should FRAME greet you?"
                value={draft.displayName}
              />
            </label>
            <label>
              Email
              <input readOnly value={user.email} />
            </label>
          </div>
          <p className="profile-demo-note">Demo profile only. Your email and preferences stay in this browser; no password or account data is sent to a server.</p>
        </section>

        <section aria-labelledby="language-section-title" className="profile-panel">
          <div className="profile-panel-heading">
            <div>
              <span className="eyebrow section-eyebrow">LANGUAGES</span>
              <h2 id="language-section-title">What do you like to watch in?</h2>
            </div>
            <span className="preference-count">{draft.languages.length} selected</span>
          </div>
          <div className="preference-options">
            {LANGUAGE_OPTIONS.map((language) => (
              <label className="preference-option" key={language}>
                <input
                  checked={draft.languages.includes(language)}
                  onChange={() => update({ languages: toggleChoice(draft.languages, language) })}
                  type="checkbox"
                />
                <span>{language}</span>
              </label>
            ))}
          </div>
        </section>

        <section aria-labelledby="genre-section-title" className="profile-panel">
          <div className="profile-panel-heading">
            <div>
              <span className="eyebrow section-eyebrow">GENRES</span>
              <h2 id="genre-section-title">Stories you gravitate toward</h2>
            </div>
            <span className="preference-count">{draft.genres.length} selected</span>
          </div>
          <div className="preference-options">
            {GENRE_OPTIONS.map((genre) => (
              <label className="preference-option" key={genre}>
                <input
                  checked={draft.genres.includes(genre)}
                  onChange={() => update({ genres: toggleChoice(draft.genres, genre) })}
                  type="checkbox"
                />
                <span>{genre}</span>
              </label>
            ))}
          </div>
        </section>

        {error && <p className="profile-form-message is-error" role="alert">{error}</p>}
        {message && <p className="profile-form-message is-success" role="status">{message}</p>}
        <div className="profile-save-row">
          <p>Recommendations use verified OMDb movie metadata and your selected preferences.</p>
          <button className="button button-primary" type="submit">Save preferences</button>
        </div>
      </form>
    </main>
  )
}
