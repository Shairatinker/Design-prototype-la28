import type { MaintenanceServiceRow } from './maintenance-service-rows'

export type MaintenanceServiceFilterKey = 'depot' | 'type' | 'status'

export type MaintenanceServiceColumnFilters = Record<MaintenanceServiceFilterKey, string[]>

export const EMPTY_MAINTENANCE_SERVICE_COLUMN_FILTERS: MaintenanceServiceColumnFilters = {
  depot: [],
  type: [],
  status: [],
}

export const MAINTENANCE_SERVICE_FILTER_LABELS: Record<MaintenanceServiceFilterKey, string> = {
  depot: 'Depot',
  type: 'Type',
  status: 'Status',
}

export function maintenanceServiceMatchesSearch(row: MaintenanceServiceRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [row.vehicle, row.depot, row.date, row.description, row.type, row.status].some((part) =>
    part.toLowerCase().includes(q),
  )
}

export function maintenanceServiceMatchesColumnFilters(
  row: MaintenanceServiceRow,
  filters: MaintenanceServiceColumnFilters,
): boolean {
  if (filters.depot.length > 0 && !filters.depot.includes(row.depot)) return false
  if (filters.type.length > 0 && !filters.type.includes(row.type)) return false
  if (filters.status.length > 0 && !filters.status.includes(row.status)) return false
  return true
}

export function getMaintenanceServiceFilterOptions(
  rows: MaintenanceServiceRow[],
  key: MaintenanceServiceFilterKey,
): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    if (key === 'depot') set.add(row.depot)
    else if (key === 'type') set.add(row.type)
    else set.add(row.status)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function removeMaintenanceServiceFilterValue(
  filters: MaintenanceServiceColumnFilters,
  key: MaintenanceServiceFilterKey,
  value: string,
): MaintenanceServiceColumnFilters {
  return { ...filters, [key]: filters[key].filter((v) => v !== value) }
}

export function activeMaintenanceServiceFilterCount(filters: MaintenanceServiceColumnFilters): number {
  return Object.values(filters).reduce((n, list) => n + list.length, 0)
}
