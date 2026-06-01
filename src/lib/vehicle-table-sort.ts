import { getVehicleDepot } from './vehicle-table-filters'
import type { VehicleTableToggleableColumnId } from './vehicle-table-views'

/** Row shape used by vehicles table (seed + user-added). */
export type VehicleSortRow = {
  id: string
  plate: string
  vehicle: string
  type: string
  status: string
  currentUse: string
  tags: string[]
  driver: string
  location: string
  lastUpdated: string
  mileage: number
  maintenance: string
}

export type VehicleSortColumnId = 'plate' | VehicleTableToggleableColumnId

export type VehicleSortRule = {
  column: VehicleSortColumnId
  direction: 'asc' | 'desc'
}

export function getVehicleSortValue(row: VehicleSortRow, column: VehicleSortColumnId): string {
  switch (column) {
    case 'plate':
      return row.plate
    case 'vehicle':
      return row.vehicle
    case 'type':
      return row.type
    case 'status':
      return row.status
    case 'currentUse':
      return row.currentUse
    case 'tags':
      return row.tags
        .map((t) => t.replace(/ X$/, ''))
        .filter(Boolean)
        .join(', ')
    case 'driver':
      return row.driver
    case 'location':
      return getVehicleDepot(row)
    case 'lastUpdated':
      return row.lastUpdated
    case 'mileage':
      return String(row.mileage).padStart(12, '0')
    case 'maintenance':
      return row.maintenance
    default:
      return ''
  }
}

/** Lexicographic compare with numeric-aware locale. */
function compareLocale(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function compareVehicleRowsWithRules(a: VehicleSortRow, b: VehicleSortRow, rules: VehicleSortRule[]): number {
  for (const { column, direction } of rules) {
    const va = getVehicleSortValue(a, column)
    const vb = getVehicleSortValue(b, column)
    const cmp = compareLocale(va, vb)
    if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
  }
  return a.id.localeCompare(b.id)
}

/** Default: plate order so page-one showcase rows (TN42000–TN42014) stay grouped. */
export function defaultVehicleRowSort(a: VehicleSortRow, b: VehicleSortRow): number {
  return compareLocale(a.plate, b.plate)
}

export function cycleSortRules(
  prev: VehicleSortRule[],
  column: VehicleSortColumnId,
  shiftKey: boolean,
): VehicleSortRule[] {
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
