import { Link } from 'react-router-dom'

export function Brand() {
  return (
    <Link aria-label="FRAME home" className="brand" to="/">
      <span className="brand-mark" aria-hidden="true">
        F
      </span>
      <span className="brand-word">FRAME</span>
    </Link>
  )
}
