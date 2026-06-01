import type { MaintenanceWorkOrder } from '../data/maintenance-work-orders'
import type { MaintenanceTableToggleableColumnId } from './maintenance-table-views'

export type MaintenanceSortColumnId = 'vehicle' | MaintenanceTableToggleableColumnId

export type MaintenanceSortRule = {
  column: MaintenanceSortColumnId
  direction: 'asc' | 'desc'
}

function compareLocale(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function getMaintenanceSortValue(row: MaintenanceWorkOrder, column: MaintenanceSortColumnId): string {
  switch (column) {
    case 'vehicle':
      return row.vehicle
    case 'depot':
      return row.depot
    case 'status':
      return row.status
    case 'priority':
      return row.priority
    case 'disposition':
      return row.disposition
    case 'created':
      return row.created
    default:
      return ''
  }
}

export function compareMaintenanceRowsWithRules(
  a: MaintenanceWorkOrder,
  b: MaintenanceWorkOrder,
  rules: MaintenanceSortRule[],
): number {
  for (const { column, direction } of rules) {
    const cmp = compareLocale(getMaintenanceSortValue(a, column), getMaintenanceSortValue(b, column))
    if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
  }
  return a.id.localeCompare(b.id)
}

export function defaultMaintenanceRowSort(a: MaintenanceWorkOrder, b: MaintenanceWorkOrder): number {
  return compareLocale(b.created, a.created)
}

export function cycleMaintenanceSortRules(
  prev: MaintenanceSortRule[],
  column: MaintenanceSortColumnId,
  shiftKey: boolean,
): MaintenanceSortRule[] {
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
