import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface DonutChartProps {
  title: string
  data: Array<{ name: string; value: number; color: string }>
}

export function DonutChart({ title, data }: DonutChartProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/10">
      <CardHeader className="border-b border-border/60 bg-muted/40 pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="h-40 w-40 shrink-0" style={{ minHeight: '160px' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="min-w-0 flex-1 space-y-2.5">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-2.5 text-sm">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background" style={{ backgroundColor: entry.color }} />
                <span className="text-foreground/90">
                  <span className="font-medium">{entry.name}</span>
                  <span className="text-muted-foreground"> — {entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
