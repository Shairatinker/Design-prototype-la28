import type { MaintenanceServiceRow } from './maintenance-service-rows'

export type MaintenanceServiceSortColumnId =
  | 'vehicle'
  | 'depot'
  | 'date'
  | 'description'
  | 'type'
  | 'status'

export type MaintenanceServiceSortRule = {
  column: MaintenanceServiceSortColumnId
  direction: 'asc' | 'desc'
}

function compareLocale(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function getMaintenanceServiceSortValue(
  row: MaintenanceServiceRow,
  column: MaintenanceServiceSortColumnId,
): string {
  switch (column) {
    case 'vehicle':
      return row.vehicle
    case 'depot':
      return row.depot
    case 'date':
      return row.date
    case 'description':
      return row.description
    case 'type':
      return row.type
    case 'status':
      return row.status
    default:
      return ''
  }
}

export function compareMaintenanceServiceRowsWithRules(
  a: MaintenanceServiceRow,
  b: MaintenanceServiceRow,
  rules: MaintenanceServiceSortRule[],
): number {
  for (const { column, direction } of rules) {
    const cmp = compareLocale(getMaintenanceServiceSortValue(a, column), getMaintenanceServiceSortValue(b, column))
    if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
  }
  return a.id.localeCompare(b.id)
}

export function defaultMaintenanceServiceRowSort(a: MaintenanceServiceRow, b: MaintenanceServiceRow): number {
  return compareLocale(b.date, a.date)
}

export function cycleMaintenanceServiceSortRules(
  prev: MaintenanceServiceSortRule[],
  column: MaintenanceServiceSortColumnId,
  shiftKey: boolean,
): MaintenanceServiceSortRule[] {
  if (shiftKey) {
    const idx = prev.findIndex((r) => r.column === column)
    if (idx < 0) return [...prev, { column, direction: 'asc' }]
    const next = [...prev]
    const rule = next[idx]!
    if (rule.direction === 'asc') next[idx] = { column, direction: 'desc' }
    else next.splice(idx, 1)
    return next
  }
  const idx = prev.findIndex((r) => r.column === column)
  if (idx < 0) return [{ column, direction: 'asc' }]
  const rule = prev[idx]!
  if (rule.direction === 'asc') return [{ column, direction: 'desc' }]
  return []
}
