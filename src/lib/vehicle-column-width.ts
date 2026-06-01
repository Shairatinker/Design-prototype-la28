export const VEHICLE_COLUMN_WIDTH_STORAGE_KEY = 'fleet-command:vehicles-vehicle-column-width'

export const VEHICLE_COLUMN_DEFAULT_WIDTH = 100
export const VEHICLE_COLUMN_MIN_WIDTH = 80
export const VEHICLE_COLUMN_MAX_WIDTH = 400

export function loadVehicleColumnWidth(): number {
  if (typeof window === 'undefined') return VEHICLE_COLUMN_DEFAULT_WIDTH
  try {
    const n = parseInt(window.localStorage.getItem(VEHICLE_COLUMN_WIDTH_STORAGE_KEY) ?? '', 10)
    if (!Number.isFinite(n)) return VEHICLE_COLUMN_DEFAULT_WIDTH
    return Math.min(VEHICLE_COLUMN_MAX_WIDTH, Math.max(VEHICLE_COLUMN_MIN_WIDTH, n))
  } catch {
    return VEHICLE_COLUMN_DEFAULT_WIDTH
  }
}

export function saveVehicleColumnWidth(width: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VEHICLE_COLUMN_WIDTH_STORAGE_KEY, String(width))
  } catch {
    /* quota / private mode */
  }
}

export function clampVehicleColumnWidth(width: number): number {
  return Math.min(VEHICLE_COLUMN_MAX_WIDTH, Math.max(VEHICLE_COLUMN_MIN_WIDTH, width))
}
