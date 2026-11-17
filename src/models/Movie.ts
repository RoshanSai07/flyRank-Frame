export interface Movie {
  imdbID: string
  tmdbID?: number
  title: string
  year: string
  type: string
  poster: string
  backdrop?: string
  imdbRating?: string
  tmdbRating?: string
  rated?: string
  released?: string
  runtime?: string
  genre?: string
  director?: string
  writer?: string
  actors?: string
  plot?: string
  language?: string
  country?: string
  awards?: string
  metascore?: string
  imdbVotes?: string
  boxOffice?: string
  production?: string
}

export interface OmdbSearchResponse {
  Search?: OmdbSearchResult[]
  totalResults?: string
  Response: 'True' | 'False'
  Error?: string
}

export interface OmdbSearchResult {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
}

export interface OmdbMovieResponse {
  imdbID: string
  Title: string
  Year: string
  Type: string
  Poster: string
  imdbRating?: string
  Rated?: string
  Released?: string
  Runtime?: string
  Genre?: string
  Director?: string
  Writer?: string
  Actors?: string
  Plot?: string
  Language?: string
  Country?: string
  Awards?: string
  Metascore?: string
  imdbVotes?: string
  BoxOffice?: string
  Production?: string
  Response: 'True' | 'False'
  Error?: string
}

export interface MovieCarousel {
  id: string
  title: string
  query: string
}

export interface DemoUser {
  email: string
}

export interface UserPreferences {
  displayName: string
  languages: string[]
  genres: string[]
}

export interface MovieTrailer {
  provider: 'YouTube'
  videoId: string
  embedUrl: string
  watchUrl: string
}
