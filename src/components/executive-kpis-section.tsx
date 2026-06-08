import { useState } from 'react'
import { EXECUTIVE_KPIS, kpiTimeRangeDescription, type KpiTimeRange } from '../lib/executive-kpis'
import { KpiCard } from './kpi-card'
import { KpiTimeRangeSelector } from './kpi-time-range-selector'

export function ExecutiveKpisSection() {
  const [timeRange, setTimeRange] = useState<KpiTimeRange>('today')

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Executive KPIs
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Live snapshot across utilization, fleet health, and incidents.{' '}
            <span className="text-foreground/80">{kpiTimeRangeDescription(timeRange)}</span>
          </p>
        </div>
        <KpiTimeRangeSelector value={timeRange} onChange={setTimeRange} className="shrink-0 self-start" />
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3 lg:grid-cols-5">
        {EXECUTIVE_KPIS.map((kpi) => (
          <KpiCard
            key={kpi.id}
            value={kpi.values[timeRange]}
            label={kpi.label}
            trend={kpi.trends[timeRange]}
          />
        ))}
      </div>
    </div>
  )
}
