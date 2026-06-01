import { Card } from './ui/card'
import { cn } from './ui/utils'

interface KpiCardProps {
  value: string
  label: string
  sublabel?: string
  /** Shorter cards for dense layouts (e.g. Assignments summary row). */
  size?: 'default' | 'compact'
}

export function KpiCard({ value, label, sublabel, size = 'default' }: KpiCardProps) {
  const compact = size === 'compact'
  return (
    <Card
      className={cn(
        'h-full gap-0 overflow-hidden border-0 shadow-md ring-1 ring-black/[0.04] transition-shadow hover:shadow-lg dark:ring-white/10',
        compact ? 'rounded-xl shadow-sm hover:shadow-md' : 'rounded-2xl',
      )}
    >
      {/* Plain div: avoid CardContent’s px-6 / last-child pb-6 adding extra space */}
      <div className="flex min-h-0 flex-1 flex-col p-0">
        <div
          className={cn(
            'w-full shrink-0 bg-gradient-to-r from-primary via-sky-400 to-primary/40',
            compact ? 'h-[2px]' : 'h-1',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col justify-center',
            compact ? 'px-3 py-2.5 sm:px-3.5 sm:py-3' : 'p-5 sm:p-6',
          )}
        >
          <div
            className={cn(
              'font-bold tabular-nums tracking-tight text-foreground',
              compact ? 'text-lg leading-none sm:text-xl' : 'text-3xl sm:text-4xl',
            )}
          >
            {value}
          </div>
          <div
            className={cn(
              'font-medium text-muted-foreground',
              compact ? 'mt-0.5 text-[10px] leading-tight sm:text-[11px]' : 'mt-2 text-sm leading-snug',
            )}
          >
            {label}
          </div>
          {sublabel ? (
            <div
              className={cn(
                'text-muted-foreground/80',
                compact ? 'mt-px text-[10px] leading-tight' : 'mt-1 text-xs',
              )}
            >
              {sublabel}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
