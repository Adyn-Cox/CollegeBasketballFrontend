/**
 * Loading skeleton component
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-zinc-200 animate-pulse rounded-lg dark:bg-zinc-700 ${className}`} />
  )
}
