import { capitalizeFirstLetter } from '../components/ui/utils'

export type VehicleFilterKey = 'type' | 'status' | 'currentUse' | 'depot' | 'maintenance'

export type VehicleFilterRow = {
  type: string
  status: string
  currentUse: string
  location: string
  maintenance: string
  mileage?: number
}

export type VehicleColumnFilters = Record<VehicleFilterKey, string[]>

export const EMPTY_VEHICLE_COLUMN_FILTERS: VehicleColumnFilters = {
  type: [],
  status: [],
  currentUse: [],
  depot: [],
  maintenance: [],
}

export const VEHICLE_FILTER_LABELS: Record<VehicleFilterKey, string> = {
  type: 'Type',
  status: 'Status',
  currentUse: 'Current use',
  depot: 'Depot',
  maintenance: 'Maintenance',
}

/** Normalize depot from location string (matches vehicle detail drawer). */
export function getVehicleDepot(row: { location: string }): string {
  const loc = row.location.trim()
  if (!loc) return '—'
  if (loc.includes('(')) return loc.split('(')[0]?.trim() ?? loc
  if (loc.endsWith('...')) return loc.slice(0, -3).trim()
  return loc
}

export function getFilterOptions(rows: VehicleFilterRow[]): Record<VehicleFilterKey, string[]> {
  const type = new Set<string>()
  const status = new Set<string>()
  const currentUse = new Set<string>()
  const depot = new Set<string>()
  const maintenance = new Set<string>()

  for (const row of rows) {
    if (row.type) type.add(row.type)
    if (row.status) status.add(row.status)
    if (row.currentUse) currentUse.add(row.currentUse)
    depot.add(getVehicleDepot(row))
    if (row.maintenance) maintenance.add(row.maintenance)
  }

  const sort = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

  return {
    type: sort(type),
    status: sort(status),
    currentUse: sort(currentUse),
    depot: sort(depot),
    maintenance: sort(maintenance),
  }
}

export function activeFilterCount(filters: VehicleColumnFilters): number {
  return Object.values(filters).reduce((n, arr) => n + arr.length, 0)
}

export function vehicleMatchesColumnFilters(row: VehicleFilterRow, filters: VehicleColumnFilters): boolean {
  if (filters.type.length > 0 && !filters.type.includes(row.type)) return false
  if (filters.status.length > 0 && !filters.status.includes(row.status)) return false
  if (filters.currentUse.length > 0 && !filters.currentUse.includes(row.currentUse)) return false
  if (filters.depot.length > 0 && !filters.depot.includes(getVehicleDepot(row))) return false
  if (filters.maintenance.length > 0 && !filters.maintenance.includes(row.maintenance)) return false
  return true
}

export function vehicleMatchesSearch(row: VehicleFilterRow & { plate?: string; vehicle?: string; driver?: string; tags?: string[] }, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    row.plate,
    row.vehicle,
    row.driver,
    row.type,
    row.status,
    row.currentUse,
    getVehicleDepot(row),
    row.location,
    row.maintenance,
    String(row.mileage ?? ''),
    row.tags?.join(' '),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function formatFilterChipLabel(key: VehicleFilterKey, value: string): string {
  if (key === 'maintenance') return `${VEHICLE_FILTER_LABELS[key]}: ${capitalizeFirstLetter(value)}`
  return `${VEHICLE_FILTER_LABELS[key]}: ${value}`
}

export function removeFilterValue(
  filters: VehicleColumnFilters,
  key: VehicleFilterKey,
  value: string,
): VehicleColumnFilters {
  return {
    ...filters,
    [key]: filters[key].filter((v) => v !== value),
  }
}
