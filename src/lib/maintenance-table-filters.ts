import type { MaintenanceWorkOrder } from '../data/maintenance-work-orders'
import {
  maintenanceDispositionLabel,
  maintenancePriorityLabel,
  maintenanceStatusLabel,
} from './maintenance-badge-styles'

export type MaintenanceFilterKey = 'status' | 'priority' | 'disposition' | 'depot'

export type MaintenanceColumnFilters = Record<MaintenanceFilterKey, string[]>

export const EMPTY_MAINTENANCE_COLUMN_FILTERS: MaintenanceColumnFilters = {
  status: [],
  priority: [],
  disposition: [],
  depot: [],
}

export const MAINTENANCE_FILTER_LABELS: Record<MaintenanceFilterKey, string> = {
  status: 'Status',
  priority: 'Priority',
  disposition: 'Disposition',
  depot: 'Depot',
}

export function maintenanceMatchesSearch(row: MaintenanceWorkOrder, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [
    row.vehicle,
    row.depot,
    maintenanceStatusLabel(row.status),
    row.status,
    maintenancePriorityLabel(row.priority),
    maintenanceDispositionLabel(row.disposition),
    row.disposition,
    row.created,
  ].some((part) => part.toLowerCase().includes(q))
}

export function maintenanceMatchesColumnFilters(
  row: MaintenanceWorkOrder,
  filters: MaintenanceColumnFilters,
): boolean {
  if (filters.status.length > 0 && !filters.status.includes(row.status)) return false
  if (filters.priority.length > 0 && !filters.priority.includes(row.priority)) return false
  if (filters.disposition.length > 0 && !filters.disposition.includes(row.disposition)) return false
  if (filters.depot.length > 0 && !filters.depot.includes(row.depot)) return false
  return true
}

export function getMaintenanceFilterOptions(
  rows: MaintenanceWorkOrder[],
  key: MaintenanceFilterKey,
): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    switch (key) {
      case 'status':
        set.add(row.status)
        break
      case 'priority':
        set.add(row.priority)
        break
      case 'disposition':
        set.add(row.disposition)
        break
      case 'depot':
        set.add(row.depot)
        break
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function formatMaintenanceFilterChipLabel(key: MaintenanceFilterKey, value: string): string {
  switch (key) {
    case 'status':
      return maintenanceStatusLabel(value)
    case 'priority':
      return maintenancePriorityLabel(value)
    case 'disposition':
      return maintenanceDispositionLabel(value)
    default:
      return value
  }
}

export function removeMaintenanceFilterValue(
  filters: MaintenanceColumnFilters,
  key: MaintenanceFilterKey,
  value: string,
): MaintenanceColumnFilters {
  return { ...filters, [key]: filters[key].filter((v) => v !== value) }
}

export function activeMaintenanceFilterCount(filters: MaintenanceColumnFilters): number {
  return Object.values(filters).reduce((n, list) => n + list.length, 0)
}
