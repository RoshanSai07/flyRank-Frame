import { Eye, EyeOff, Film, LockKeyhole } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useDemoAuth } from '../context/useDemoAuth'

interface DemoAuthPageProps {
  mode: 'login' | 'register'
}

export function DemoAuthPage({ mode }: DemoAuthPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const { signIn, user } = useDemoAuth()
  const navigate = useNavigate()
  const isRegister = mode === 'register'

  if (user) return <Navigate replace to="/" />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for the password.')
      return
    }
    if (isRegister && password !== confirmation) {
      setError('Those passwords don’t match.')
      return
    }

    setLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 450))
    try {
      signIn(email.trim().toLowerCase())
      setMessage(isRegister ? 'Your demo profile is ready.' : 'Your demo session has started.')
      window.setTimeout(() => navigate('/'), 650)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The demo session could not be saved.')
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art" aria-hidden="true"><div className="auth-art-frame">F</div><span>EVERY FILM HOLDS A WORLD.</span></div>
      <section className="auth-panel">
        <span className="eyebrow section-eyebrow">{isRegister ? 'A GOOD PLACE TO START' : 'WELCOME BACK'}</span>
        <h1>{isRegister ? <>Make room for<br /><em>more stories.</em></> : <>Good films<br /><em>bring us back.</em></>}</h1>
        <p className="auth-intro">{isRegister ? 'Create a local demo profile to try the FRAME experience.' : 'Enter an email and password to start a local demo session.'}</p>
        <div className="demo-warning"><LockKeyhole size={15} /><span>Frontend-only demo. Credentials are not verified or stored; this is not secure authentication.</span></div>
        <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
          <label>Email address<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required type="email" value={email} /></label>
          <label>Password
            <span className="password-field">
              <input autoComplete={isRegister ? 'new-password' : 'current-password'} minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required type={showPassword ? 'text' : 'password'} value={password} />
              <button aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((shown) => !shown)} type="button">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {isRegister && <label>Confirm password<input autoComplete="new-password" onChange={(event) => setConfirmation(event.target.value)} placeholder="Enter your password again" required type={showPassword ? 'text' : 'password'} value={confirmation} /></label>}
          {error && <p className="form-message form-error" role="alert">{error}</p>}
          {message && <p className="form-message form-success" role="status">{message}</p>}
          <button className="button button-primary auth-submit" disabled={loading} type="submit">
            {loading ? <span className="button-spinner" /> : <Film size={16} />}
            {loading ? 'Opening your FRAME…' : isRegister ? 'Create demo profile' : 'Start demo session'}
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already have a demo profile?' : 'New to FRAME?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create a profile'}</Link>
        </p>
        <Link className="auth-browse" to="/">Continue browsing without signing in</Link>
      </section>
    </main>
  )
}
