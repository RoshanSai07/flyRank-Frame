import { Search, X } from 'lucide-react'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}

export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <label className="search-field">
      <Search aria-hidden="true" size={18} strokeWidth={1.7} />
      <span className="sr-only">Search movies</span>
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search a title, mood, or genre"
        type="search"
        value={value}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange('')} type="button">
          <X size={16} />
        </button>
      )}
      {!value && <span className="search-shortcut">⌘ K</span>}
    </label>
  )
}
