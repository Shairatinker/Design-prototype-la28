import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from './ui/card'
import { cn } from './ui/utils'

export type KpiTrendPeriod = 'yesterday' | 'last week' | 'last month'

export type KpiTrend = {
  direction: 'up' | 'down'
  changePercent: number
  period: KpiTrendPeriod
  /** When true, an increase is shown as negative (e.g. incidents, backlog). */
  invertColors?: boolean
}

interface KpiCardProps {
  value: string
  label: string
  sublabel?: string
  trend?: KpiTrend
  /** Shorter cards for dense layouts (e.g. Assignments summary row). */
  size?: 'default' | 'compact'
}

function formatTrendChange({ direction, changePercent }: KpiTrend): string {
  const sign = direction === 'up' ? '+' : '−'
  const abs = Math.abs(changePercent)
  const formatted = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1)
  return `${sign}${formatted}%`
}

function trendPeriodLabel(period: KpiTrendPeriod): string {
  switch (period) {
    case 'yesterday':
      return 'vs. yesterday'
    case 'last week':
      return 'vs. last week'
    case 'last month':
      return 'vs. last month'
  }
}

export function KpiCard({
  value,
  label,
  sublabel,
  trend,
  size = 'default',
}: KpiCardProps) {
  const compact = size === 'compact'

  return (
    <Card
      className={cn(
        'h-full gap-0 overflow-hidden border border-border/80 bg-gradient-to-b from-card to-sky-50/90 shadow-sm transition-shadow hover:shadow-md',
        compact ? 'rounded-xl' : 'rounded-xl',
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col p-0">
        <div
          className={cn(
            'w-full shrink-0',
            compact ? 'h-[2px]' : 'h-1',
            'bg-gradient-to-r from-sky-400 via-[#7ec8f0] to-sky-200',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col',
            compact
              ? 'gap-0.5 px-3 py-2.5 sm:px-3.5 sm:py-3'
              : 'gap-1.5 p-5 sm:p-6',
          )}
        >
          <div
            className={cn(
              'font-bold tabular-nums leading-none tracking-tight text-foreground',
              compact ? 'text-base sm:text-lg' : 'text-2xl sm:text-3xl',
            )}
          >
            {value}
          </div>
          <div
            className={cn(
              'font-medium text-muted-foreground',
              compact ? 'text-[10px] leading-tight sm:text-[11px]' : 'text-sm leading-snug',
            )}
          >
            {label}
          </div>
          {trend ? (
            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 tabular-nums',
                  compact ? 'text-[10px]' : 'text-xs',
                  trend.invertColors
                    ? trend.direction === 'up'
                      ? 'border-red-200 bg-red-50 text-red-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : trend.direction === 'up'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-red-200 bg-red-50 text-red-800',
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className={cn(compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} aria-hidden />
                ) : (
                  <TrendingDown className={cn(compact ? 'h-2.5 w-2.5' : 'h-3 w-3')} aria-hidden />
                )}
                {formatTrendChange(trend)}
              </span>
              <span
                className={cn(
                  'text-muted-foreground/70',
                  compact ? 'text-[10px]' : 'text-xs',
                )}
              >
                {trendPeriodLabel(trend.period)}
              </span>
            </div>
          ) : sublabel ? (
            <div
              className={cn(
                'mt-auto text-muted-foreground/80',
                compact ? 'text-[10px] leading-tight' : 'text-xs',
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
