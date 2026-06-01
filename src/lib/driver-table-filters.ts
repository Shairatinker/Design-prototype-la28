import { capitalizeFirstLetter } from '../components/ui/utils'

export type DriverFilterKey = 'status' | 'type' | 'mvr' | 'background' | 'training'

export type DriverFilterRow = {
  status: string
  driverType: string
  mvrStatus: string
  backgroundCheck: string
  training: string
}

export type DriverColumnFilters = Record<DriverFilterKey, string[]>

export const EMPTY_DRIVER_COLUMN_FILTERS: DriverColumnFilters = {
  status: [],
  type: [],
  mvr: [],
  background: [],
  training: [],
}

export const DRIVER_FILTER_LABELS: Record<DriverFilterKey, string> = {
  status: 'Status',
  type: 'Type',
  mvr: 'MVR',
  background: 'Background',
  training: 'Training',
}

export function formatDriverFilterValue(key: DriverFilterKey, value: string): string {
  if (key === 'status' || key === 'training') return capitalizeFirstLetter(value)
  if (key === 'mvr' || key === 'background') {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }
  return value
}

export function getDriverFilterOptions(rows: DriverFilterRow[]): Record<DriverFilterKey, string[]> {
  const status = new Set<string>()
  const type = new Set<string>()
  const mvr = new Set<string>()
  const background = new Set<string>()
  const training = new Set<string>()

  for (const row of rows) {
    if (row.status) status.add(row.status)
    if (row.driverType) type.add(row.driverType)
    if (row.mvrStatus) mvr.add(row.mvrStatus)
    if (row.backgroundCheck) background.add(row.backgroundCheck)
    if (row.training) training.add(row.training)
  }

  const sort = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

  return {
    status: sort(status),
    type: sort(type),
    mvr: sort(mvr),
    background: sort(background),
    training: sort(training),
  }
}

export function activeDriverFilterCount(filters: DriverColumnFilters): number {
  return Object.values(filters).reduce((n, arr) => n + arr.length, 0)
}

export function driverMatchesColumnFilters(row: DriverFilterRow, filters: DriverColumnFilters): boolean {
  if (filters.status.length > 0 && !filters.status.includes(row.status)) return false
  if (filters.type.length > 0 && !filters.type.includes(row.driverType)) return false
  if (filters.mvr.length > 0 && !filters.mvr.includes(row.mvrStatus)) return false
  if (filters.background.length > 0 && !filters.background.includes(row.backgroundCheck)) return false
  if (filters.training.length > 0 && !filters.training.includes(row.training)) return false
  return true
}

export function driverMatchesSearch(
  row: DriverFilterRow & { name?: string; vehicle?: string; riskScore?: number },
  query: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    row.name,
    row.driverType,
    row.status,
    row.mvrStatus,
    row.backgroundCheck,
    row.training,
    row.vehicle,
    String(row.riskScore ?? ''),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function formatDriverFilterChipLabel(key: DriverFilterKey, value: string): string {
  return `${DRIVER_FILTER_LABELS[key]}: ${formatDriverFilterValue(key, value)}`
}

export function removeDriverFilterValue(
  filters: DriverColumnFilters,
  key: DriverFilterKey,
  value: string,
): DriverColumnFilters {
  return { ...filters, [key]: filters[key].filter((v) => v !== value) }
}
