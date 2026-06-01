import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { cn } from './ui/utils'

export interface FleetSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  compact?: boolean
  className?: string
}

export function FleetSearchBar({
  value,
  onChange,
  placeholder,
  compact = false,
  className,
}: FleetSearchBarProps) {
  return (
    <div className={cn('relative', compact ? 'mb-0' : 'mb-6', className)}>
      <Search
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
          compact ? 'left-2.5 h-3.5 w-3.5' : 'left-3.5 h-4 w-4',
        )}
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search drivers, vehicles, claims...'}
        className={cn(
          'rounded-md border-border/80 bg-input-background shadow-inner',
          compact ? 'h-9 pl-8 text-sm' : 'h-11 pl-10',
        )}
        aria-label="Search fleet"
      />
    </div>
  )
}
