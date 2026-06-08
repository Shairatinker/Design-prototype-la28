import { KPI_TIME_RANGE_OPTIONS, type KpiTimeRange } from '../lib/executive-kpis'
import { cn } from './ui/utils'

interface KpiTimeRangeSelectorProps {
  value: KpiTimeRange
  onChange: (value: KpiTimeRange) => void
  className?: string
}

export function KpiTimeRangeSelector({ value, onChange, className }: KpiTimeRangeSelectorProps) {
  return (
    <div
      role="group"
      aria-label="KPI time range"
      className={cn(
        'inline-flex h-9 items-center rounded-lg border border-border bg-muted/50 p-1',
        className,
      )}
    >
      {KPI_TIME_RANGE_OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
