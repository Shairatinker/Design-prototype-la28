export const ASSIGNMENT_PLATE_COLUMN_WIDTH_STORAGE_KEY = 'fleet-command:assignments-plate-column-width'

export const ASSIGNMENT_PLATE_COLUMN_DEFAULT_WIDTH = 88
export const ASSIGNMENT_PLATE_COLUMN_MIN_WIDTH = 72
export const ASSIGNMENT_PLATE_COLUMN_MAX_WIDTH = 160

export function loadAssignmentPlateColumnWidth(): number {
  if (typeof window === 'undefined') return ASSIGNMENT_PLATE_COLUMN_DEFAULT_WIDTH
  try {
    const n = parseInt(window.localStorage.getItem(ASSIGNMENT_PLATE_COLUMN_WIDTH_STORAGE_KEY) ?? '', 10)
    if (!Number.isFinite(n)) return ASSIGNMENT_PLATE_COLUMN_DEFAULT_WIDTH
    return Math.min(ASSIGNMENT_PLATE_COLUMN_MAX_WIDTH, Math.max(ASSIGNMENT_PLATE_COLUMN_MIN_WIDTH, n))
  } catch {
    return ASSIGNMENT_PLATE_COLUMN_DEFAULT_WIDTH
  }
}

export function saveAssignmentPlateColumnWidth(width: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ASSIGNMENT_PLATE_COLUMN_WIDTH_STORAGE_KEY, String(width))
  } catch {
    /* quota / private mode */
  }
}

export function clampAssignmentPlateColumnWidth(width: number): number {
  return Math.min(ASSIGNMENT_PLATE_COLUMN_MAX_WIDTH, Math.max(ASSIGNMENT_PLATE_COLUMN_MIN_WIDTH, width))
}
