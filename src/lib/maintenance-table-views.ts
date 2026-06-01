export const MAINTENANCE_TABLE_TOGGLEABLE_COLUMN_ORDER = [
  'depot',
  'status',
  'priority',
  'disposition',
  'created',
] as const

export type MaintenanceTableToggleableColumnId = (typeof MAINTENANCE_TABLE_TOGGLEABLE_COLUMN_ORDER)[number]

export const MAINTENANCE_TABLE_COLUMN_LABELS: Record<MaintenanceTableToggleableColumnId, string> = {
  depot: 'Depot',
  status: 'Status',
  priority: 'Priority',
  disposition: 'Disposition',
  created: 'Created',
}

export const MAINTENANCE_TABLE_COLUMN_HEAD_CLASS: Record<MaintenanceTableToggleableColumnId, string> = {
  depot: 'min-w-0 px-2',
  status: 'w-[120px] px-2',
  priority: 'w-[100px] px-2',
  disposition: 'w-[140px] px-2',
  created: 'w-[108px] px-2',
}

export type MaintenanceTableViewsState = {
  hiddenColumns: MaintenanceTableToggleableColumnId[]
}

const STORAGE_KEY = 'fleet-command:maintenance-table-views'

export function loadMaintenanceTableViewsState(): MaintenanceTableViewsState {
  if (typeof window === 'undefined') return { hiddenColumns: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { hiddenColumns: [] }
    const parsed = JSON.parse(raw) as MaintenanceTableViewsState
    if (!Array.isArray(parsed.hiddenColumns)) return { hiddenColumns: [] }
    const valid = parsed.hiddenColumns.filter((c): c is MaintenanceTableToggleableColumnId =>
      (MAINTENANCE_TABLE_TOGGLEABLE_COLUMN_ORDER as readonly string[]).includes(c),
    )
    return { hiddenColumns: valid }
  } catch {
    return { hiddenColumns: [] }
  }
}

export function saveMaintenanceTableViewsState(state: MaintenanceTableViewsState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota */
  }
}

export function effectiveMaintenanceToggleableColumns(
  state: MaintenanceTableViewsState,
): MaintenanceTableToggleableColumnId[] {
  const hidden = new Set(state.hiddenColumns)
  const visible = MAINTENANCE_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((c) => !hidden.has(c))
  return visible.length > 0 ? visible : [...MAINTENANCE_TABLE_TOGGLEABLE_COLUMN_ORDER]
}

export function getMaintenanceViewTriggerLabel(state: MaintenanceTableViewsState): string {
  const visible = effectiveMaintenanceToggleableColumns(state)
  if (visible.length === MAINTENANCE_TABLE_TOGGLEABLE_COLUMN_ORDER.length) return 'All columns'
  if (visible.length === 1) return MAINTENANCE_TABLE_COLUMN_LABELS[visible[0]!]
  return `${visible.length} columns`
}
