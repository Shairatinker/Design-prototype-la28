export const MAINTENANCE_DESCRIPTION_COLUMN_WIDTH_STORAGE_KEY =
  'fleet-command:maintenance-description-column-width'

export const MAINTENANCE_DESCRIPTION_COLUMN_DEFAULT_WIDTH = 280
export const MAINTENANCE_DESCRIPTION_COLUMN_MIN_WIDTH = 120
export const MAINTENANCE_DESCRIPTION_COLUMN_MAX_WIDTH = 560

export function loadMaintenanceDescriptionColumnWidth(): number {
  if (typeof window === 'undefined') return MAINTENANCE_DESCRIPTION_COLUMN_DEFAULT_WIDTH
  try {
    const n = parseInt(window.localStorage.getItem(MAINTENANCE_DESCRIPTION_COLUMN_WIDTH_STORAGE_KEY) ?? '', 10)
    if (!Number.isFinite(n)) return MAINTENANCE_DESCRIPTION_COLUMN_DEFAULT_WIDTH
    return Math.min(
      MAINTENANCE_DESCRIPTION_COLUMN_MAX_WIDTH,
      Math.max(MAINTENANCE_DESCRIPTION_COLUMN_MIN_WIDTH, n),
    )
  } catch {
    return MAINTENANCE_DESCRIPTION_COLUMN_DEFAULT_WIDTH
  }
}

export function saveMaintenanceDescriptionColumnWidth(width: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MAINTENANCE_DESCRIPTION_COLUMN_WIDTH_STORAGE_KEY, String(width))
  } catch {
    /* quota */
  }
}

export function clampMaintenanceDescriptionColumnWidth(width: number): number {
  return Math.min(
    MAINTENANCE_DESCRIPTION_COLUMN_MAX_WIDTH,
    Math.max(MAINTENANCE_DESCRIPTION_COLUMN_MIN_WIDTH, width),
  )
}
