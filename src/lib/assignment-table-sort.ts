import { assignmentDateTimeToSortKey } from './assignment-datetime'
import type { AssignmentTableToggleableColumnId } from './assignment-table-views'

export type AssignmentSortRow = {
  id: string
  licensePlate: string
  assignmentType: string
  driver: string
  status: string
  scheduledStart: string
  actualStart: string
  scheduledEnd: string
  actualEnd: string
}

export type AssignmentSortColumnId =
  | 'plate'
  | AssignmentTableToggleableColumnId
  | 'scheduledStart'
  | 'actualStart'
  | 'scheduledEnd'
  | 'actualEnd'

export type AssignmentSortRule = {
  column: AssignmentSortColumnId
  direction: 'asc' | 'desc'
}

export function getAssignmentSortValue(row: AssignmentSortRow, column: AssignmentSortColumnId): string {
  switch (column) {
    case 'plate':
      return row.licensePlate
    case 'type':
      return row.assignmentType
    case 'driver':
      return row.driver
    case 'status':
      return row.status
    case 'scheduledStart':
      return assignmentDateTimeToSortKey(row.scheduledStart)
    case 'actualStart':
      return assignmentDateTimeToSortKey(row.actualStart)
    case 'scheduledEnd':
      return assignmentDateTimeToSortKey(row.scheduledEnd)
    case 'actualEnd':
      return assignmentDateTimeToSortKey(row.actualEnd)
    default:
      return ''
  }
}

function compareLocale(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
}

export function compareAssignmentRowsWithRules(
  a: AssignmentSortRow,
  b: AssignmentSortRow,
  rules: AssignmentSortRule[],
): number {
  for (const { column, direction } of rules) {
    const va = getAssignmentSortValue(a, column)
    const vb = getAssignmentSortValue(b, column)
    const cmp = compareLocale(va, vb)
    if (cmp !== 0) return direction === 'asc' ? cmp : -cmp
  }
  return a.id.localeCompare(b.id)
}

export function defaultAssignmentRowSort(a: AssignmentSortRow, b: AssignmentSortRow): number {
  return compareLocale(a.licensePlate, b.licensePlate)
}

export function cycleAssignmentSortRules(
  prev: AssignmentSortRule[],
  column: AssignmentSortColumnId,
  shiftKey: boolean,
): AssignmentSortRule[] {
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
