import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="page-width not-found-page">
      <span className="eyebrow">OUT OF FRAME / 404</span>
      <h1>This scene<br /><em>doesn’t exist.</em></h1>
      <Link className="button button-primary" to="/">Return to discovery</Link>
    </main>
  )
}
