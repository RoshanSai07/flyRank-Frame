export function MovieSkeletons({ count = 5 }: { count?: number }) {
  return (
    <div aria-label="Loading movies" className="movie-skeletons" role="status">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton-poster" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  )
}
