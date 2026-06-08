import { useMemo } from 'react'
import { withChartColors } from '../lib/chart-colors'
import { Card, CardContent } from './ui/card'

export type HorizontalBarChartItem = {
  name: string
  value: number
  color?: string
}

interface HorizontalBarChartProps {
  title: string
  subtitle?: string
  data: HorizontalBarChartItem[]
}

export function HorizontalBarChart({
  title,
  subtitle = 'Current fleet snapshot',
  data,
}: HorizontalBarChartProps) {
  const coloredData = useMemo(() => withChartColors(data), [data])
  const total = coloredData.reduce((sum, item) => sum + item.value, 0)
  const max = Math.max(...coloredData.map((item) => item.value), 1)

  return (
    <Card className="gap-0 overflow-hidden border shadow-sm">
      <CardContent className="flex flex-col gap-4 p-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <ul className="space-y-4">
          {coloredData.map((item) => {
            const widthPercent = (item.value / max) * 100
            const sharePercent = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <li key={item.name}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
                      style={{ backgroundColor: item.color }}
                      aria-hidden
                    />
                    <span className="truncate font-medium text-foreground/90">{item.name}</span>
                  </div>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {item.value}
                    <span className="ml-1 text-xs">({sharePercent}%)</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted/80">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{ width: `${widthPercent}%`, backgroundColor: item.color }}
                    role="presentation"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
