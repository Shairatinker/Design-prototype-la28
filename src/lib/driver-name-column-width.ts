export const DRIVER_NAME_COLUMN_WIDTH_STORAGE_KEY = 'fleet-command:drivers-name-column-width'

export const DRIVER_NAME_COLUMN_DEFAULT_WIDTH = 160
export const DRIVER_NAME_COLUMN_MIN_WIDTH = 120
export const DRIVER_NAME_COLUMN_MAX_WIDTH = 320

export function loadDriverNameColumnWidth(): number {
  if (typeof window === 'undefined') return DRIVER_NAME_COLUMN_DEFAULT_WIDTH
  try {
    const n = parseInt(window.localStorage.getItem(DRIVER_NAME_COLUMN_WIDTH_STORAGE_KEY) ?? '', 10)
    if (!Number.isFinite(n)) return DRIVER_NAME_COLUMN_DEFAULT_WIDTH
    return Math.min(DRIVER_NAME_COLUMN_MAX_WIDTH, Math.max(DRIVER_NAME_COLUMN_MIN_WIDTH, n))
  } catch {
    return DRIVER_NAME_COLUMN_DEFAULT_WIDTH
  }
}

export function saveDriverNameColumnWidth(width: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DRIVER_NAME_COLUMN_WIDTH_STORAGE_KEY, String(width))
  } catch {
    /* quota / private mode */
  }
}

export function clampDriverNameColumnWidth(width: number): number {
  return Math.min(DRIVER_NAME_COLUMN_MAX_WIDTH, Math.max(DRIVER_NAME_COLUMN_MIN_WIDTH, width))
}
