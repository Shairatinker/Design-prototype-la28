/** Theme chart tokens — lightest (`chart-1`) → darkest (`chart-5`). */
export const CHART_COLOR_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

export function chartColorVar(index: number): string {
  return CHART_COLOR_VARS[((index % CHART_COLOR_VARS.length) + CHART_COLOR_VARS.length) % CHART_COLOR_VARS.length]!
}

export function withChartColors<T extends { color?: string }>(
  items: readonly T[],
): (T & { color: string })[] {
  return items.map((item, index) => ({
    ...item,
    color: item.color ?? chartColorVar(index),
  }))
}
