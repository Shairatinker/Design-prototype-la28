import { TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { withChartColors } from '../lib/chart-colors'
import { Card, CardContent } from './ui/card'

export type VehicleStatusPieChartItem = {
  name: string
  value: number
  color?: string
}

interface VehicleStatusPieChartProps {
  data: VehicleStatusPieChartItem[]
  subtitle?: string
  trendPercent?: number
  trendLabel?: string
  footerCaption?: string
}

export function VehicleStatusPieChart({
  data,
  subtitle = 'Current fleet snapshot',
  trendPercent = 5.2,
  trendLabel = 'this month',
  footerCaption = 'Showing vehicle status across the fleet',
}: VehicleStatusPieChartProps) {
  const chartData = useMemo(
    () =>
      withChartColors(data).map((item) => ({
        ...item,
        fill: item.color,
      })),
    [data],
  )
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="gap-0 overflow-hidden border shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Vehicle Status</h3>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="relative h-44 w-44 shrink-0 sm:h-48 sm:w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="88%"
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 flex size-[54%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-card text-center shadow-[0_0_0_1px_rgb(15_23_42/0.04)]"
              aria-hidden
            >
              <span className="text-2xl font-bold tabular-nums leading-none tracking-tight text-foreground sm:text-3xl">
                {total.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2.5">
            {chartData.map((entry) => (
              <li key={entry.name} className="flex items-center gap-2.5 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
                  style={{ backgroundColor: entry.fill }}
                  aria-hidden
                />
                <span className="text-foreground/90">
                  <span className="font-medium">{entry.name}</span>
                  <span className="text-muted-foreground">: {entry.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
            Trending up by {trendPercent % 1 === 0 ? trendPercent.toFixed(0) : trendPercent.toFixed(1)}% {trendLabel}
            <TrendingUp className="h-4 w-4 text-foreground" aria-hidden />
          </p>
          <p className="text-xs text-muted-foreground">
            {footerCaption}
            <span className="sr-only"> Total vehicles: {total}.</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
