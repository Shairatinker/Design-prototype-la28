export const DEPOT_COLUMN_WIDTH_STORAGE_KEY = 'fleet-command:vehicles-depot-column-width'

export const DEPOT_COLUMN_DEFAULT_WIDTH = 100
export const DEPOT_COLUMN_MIN_WIDTH = 72
export const DEPOT_COLUMN_MAX_WIDTH = 400

export function loadDepotColumnWidth(): number {
  if (typeof window === 'undefined') return DEPOT_COLUMN_DEFAULT_WIDTH
  try {
    const n = parseInt(window.localStorage.getItem(DEPOT_COLUMN_WIDTH_STORAGE_KEY) ?? '', 10)
    if (!Number.isFinite(n)) return DEPOT_COLUMN_DEFAULT_WIDTH
    return Math.min(DEPOT_COLUMN_MAX_WIDTH, Math.max(DEPOT_COLUMN_MIN_WIDTH, n))
  } catch {
    return DEPOT_COLUMN_DEFAULT_WIDTH
  }
}

export function saveDepotColumnWidth(width: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DEPOT_COLUMN_WIDTH_STORAGE_KEY, String(width))
  } catch {
    /* quota / private mode */
  }
}

export function clampDepotColumnWidth(width: number): number {
  return Math.min(DEPOT_COLUMN_MAX_WIDTH, Math.max(DEPOT_COLUMN_MIN_WIDTH, width))
}
