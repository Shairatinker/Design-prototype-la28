import type { AssignmentStatus, AssignmentType } from '../data/assignments'

export type AssignmentFilterKey = 'type' | 'status'

export type AssignmentFilterRow = {
  assignmentType: AssignmentType
  status: AssignmentStatus
}

export type AssignmentColumnFilters = Record<AssignmentFilterKey, string[]>

export const EMPTY_ASSIGNMENT_COLUMN_FILTERS: AssignmentColumnFilters = {
  type: [],
  status: [],
}

export const ASSIGNMENT_FILTER_LABELS: Record<AssignmentFilterKey, string> = {
  type: 'Type',
  status: 'Status',
}

export const ASSIGNMENT_STATUS_FILTER_OPTIONS: AssignmentStatus[] = ['Active', 'Scheduled', 'Ended']

export function getAssignmentFilterOptions(
  rows: AssignmentFilterRow[],
): Record<AssignmentFilterKey, string[]> {
  const type = new Set<string>()
  const status = new Set<string>()

  for (const row of rows) {
    if (row.assignmentType) type.add(row.assignmentType)
    if (row.status) status.add(row.status)
  }

  const sort = (s: Set<string>) => [...s].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))

  return { type: sort(type), status: sort(status) }
}

export function activeAssignmentFilterCount(filters: AssignmentColumnFilters): number {
  return Object.values(filters).reduce((n, arr) => n + arr.length, 0)
}

export function assignmentMatchesColumnFilters(
  row: AssignmentFilterRow,
  filters: AssignmentColumnFilters,
): boolean {
  if (filters.type.length > 0 && !filters.type.includes(row.assignmentType)) return false
  if (filters.status.length > 0 && !filters.status.includes(row.status)) return false
  return true
}

export function assignmentMatchesSearch(
  row: AssignmentFilterRow & { licensePlate?: string; driver?: string },
  query: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const hay = [row.licensePlate, row.driver, row.assignmentType, row.status]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

export function formatAssignmentFilterChipLabel(key: AssignmentFilterKey, value: string): string {
  return `${ASSIGNMENT_FILTER_LABELS[key]}: ${value}`
}

export function removeAssignmentFilterValue(
  filters: AssignmentColumnFilters,
  key: AssignmentFilterKey,
  value: string,
): AssignmentColumnFilters {
  return { ...filters, [key]: filters[key].filter((v) => v !== value) }
}
