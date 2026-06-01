export const MAINTENANCE_DEPOT_COLUMN_WIDTH_STORAGE_KEY = 'fleet-command:maintenance-depot-column-width'

export const MAINTENANCE_DEPOT_COLUMN_DEFAULT_WIDTH = 160
export const MAINTENANCE_DEPOT_COLUMN_MIN_WIDTH = 96
export const MAINTENANCE_DEPOT_COLUMN_MAX_WIDTH = 400

export function loadMaintenanceDepotColumnWidth(): number {
  if (typeof window === 'undefined') return MAINTENANCE_DEPOT_COLUMN_DEFAULT_WIDTH
  try {
    const n = parseInt(window.localStorage.getItem(MAINTENANCE_DEPOT_COLUMN_WIDTH_STORAGE_KEY) ?? '', 10)
    if (!Number.isFinite(n)) return MAINTENANCE_DEPOT_COLUMN_DEFAULT_WIDTH
    return Math.min(MAINTENANCE_DEPOT_COLUMN_MAX_WIDTH, Math.max(MAINTENANCE_DEPOT_COLUMN_MIN_WIDTH, n))
  } catch {
    return MAINTENANCE_DEPOT_COLUMN_DEFAULT_WIDTH
  }
}

export function saveMaintenanceDepotColumnWidth(width: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MAINTENANCE_DEPOT_COLUMN_WIDTH_STORAGE_KEY, String(width))
  } catch {
    /* quota / private mode */
  }
}

export function clampMaintenanceDepotColumnWidth(width: number): number {
  return Math.min(MAINTENANCE_DEPOT_COLUMN_MAX_WIDTH, Math.max(MAINTENANCE_DEPOT_COLUMN_MIN_WIDTH, width))
}
