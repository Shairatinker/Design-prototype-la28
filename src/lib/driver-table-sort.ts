import type { DriverTableToggleableColumnId } from './driver-table-views'

export type DriverSortRow = {
  id: string
  name: string
  status: string
  driverType: string
  riskScore: number
  mvrStatus: string
  backgroundCheck: string
  training: string
  vehicle: string
  created: string
}

export type DriverSortColumnId = 'name' | DriverTableToggleableColumnId

export type DriverSortRule = {
  column: DriverSortColumnId
  direction: 'asc' | 'desc'
}

export function getDriverSortValue(row: DriverSortRow, column: DriverSortColumnId): string {
  switch (column) {
    case 'name':
      return row.name
    case 'status':
      return row.status
    case 'type':
      return row.driverType
    case 'riskScore':
      return String(row.riskScore).padStart(3, '0')
    case 'mvr':
      return row.mvrStatus
    case 'background':
      return row.backgroundCheck
    case 'training':
      return row.training
    case 'vehicle':
      return row.vehicle
    case 'created':
      return row.created
    default:
      return ''
  }
}

function compareLocale(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function compareDriverRowsWithRules(a: DriverSortRow, b: DriverSortRow, rules: DriverSortRule[]): number {
  for (const { column, direction } of rules) {
    const va = getDriverSortValue(a, column)
    const vb = getDriverSortValue(b, column)
    const cmp = compareLocale(va, vb)
    if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
  }
  return a.id.localeCompare(b.id)
}

export function defaultDriverRowSort(a: DriverSortRow, b: DriverSortRow): number {
  return compareLocale(a.name, b.name)
}

export function cycleDriverSortRules(
  prev: DriverSortRule[],
  column: DriverSortColumnId,
  shiftKey: boolean,
): DriverSortRule[] {
  if (shiftKey) {
    const idx = prev.findIndex((r) => r.column === column)
    if (idx < 0) return [...prev, { column, direction: 'asc' }]
    const cur = prev[idx]
    if (cur.direction === 'asc') {
      const next = [...prev]
      next[idx] = { column, direction: 'desc' }
      return next
    }
    return prev.filter((_, i) => i !== idx)
  }

  const first = prev[0]
  if (prev.length === 1 && first?.column === column) {
    if (first.direction === 'asc') return [{ column, direction: 'desc' }]
    return []
  }
  return [{ column, direction: 'asc' }]
}
