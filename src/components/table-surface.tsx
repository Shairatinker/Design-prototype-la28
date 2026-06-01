import { cn } from './ui/utils'

type TableSurfaceProps = {
  children: React.ReactNode
  /** Wide tables: allow horizontal scroll while keeping rounded corners */
  scrollable?: boolean
  className?: string
}

export function TableSurface({ children, scrollable, className }: TableSurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card shadow-md ring-1 ring-black/[0.04]',
        scrollable ? 'overflow-x-auto' : 'overflow-hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
