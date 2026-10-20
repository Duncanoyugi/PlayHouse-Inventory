export function SkeletonLoader({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className ?? ''}`} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton h-4" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  )
}
