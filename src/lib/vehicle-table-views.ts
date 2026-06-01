export const VEHICLE_TABLE_VIEWS_STORAGE_KEY = 'fleet-command:vehicles-table-views'

export const MAX_SAVED_VEHICLE_TABLE_VIEWS = 15

/** Data columns the user may show or hide (plate and row actions are always on). */
export type VehicleTableToggleableColumnId =
  | 'vehicle'
  | 'type'
  | 'status'
  | 'currentUse'
  | 'tags'
  | 'driver'
  | 'location'
  | 'lastUpdated'
  | 'mileage'
  | 'maintenance'

export const VEHICLE_TABLE_TOGGLEABLE_COLUMN_ORDER: readonly VehicleTableToggleableColumnId[] = [
  'vehicle',
  'type',
  'status',
  'currentUse',
  'tags',
  'driver',
  'location',
  'lastUpdated',
  'mileage',
  'maintenance',
] as const

export type SavedVehicleTableView = {
  id: string
  name: string
  columns: VehicleTableToggleableColumnId[]
  /** Full toggleable column order (all toggleable columns); optional for views saved before v2. */
  columnOrder?: VehicleTableToggleableColumnId[]
}

export type VehicleTableViewsState = {
  v: 2
  activeViewId: string | null
  /** Visible columns in display order; null = all visible in default order. */
  customColumns: VehicleTableToggleableColumnId[] | null
  /** Full toggleable column order (all toggleable columns); null = canonical order. */
  columnOrder: VehicleTableToggleableColumnId[] | null
  savedViews: SavedVehicleTableView[]
}

export const VEHICLE_TABLE_COLUMN_LABELS: Record<VehicleTableToggleableColumnId, string> = {
  vehicle: 'Vehicle',
  type: 'Type',
  status: 'Status',
  currentUse: 'Current use',
  tags: 'Tags',
  driver: 'Driver',
  location: 'Depot',
  lastUpdated: 'Last Updated',
  mileage: 'Mileage',
  maintenance: 'Maintenance',
}

export const VEHICLE_TABLE_COLUMN_HEAD_CLASS: Record<VehicleTableToggleableColumnId, string> = {
  vehicle: 'w-[100px] px-2',
  type: 'w-[40px] px-1',
  status: 'w-[80px] px-2',
  currentUse: 'w-[85px] px-2',
  tags: 'min-w-[118px] w-[118px] px-2',
  driver: 'min-w-[140px] w-[140px] px-2',
  location: 'w-[100px] px-2',
  lastUpdated: 'w-[88px] px-2',
  mileage: 'w-[72px] px-2',
  maintenance: 'w-[75px] px-2',
}

const TOGGLEABLE_SET = new Set<string>(VEHICLE_TABLE_TOGGLEABLE_COLUMN_ORDER)

export function isVehicleTableToggleableColumnId(value: string): value is VehicleTableToggleableColumnId {
  return TOGGLEABLE_SET.has(value)
}

export function defaultVehicleTableViewsState(): VehicleTableViewsState {
  return { v: 2, activeViewId: null, customColumns: null, columnOrder: null, savedViews: [] }
}

export function getViewTriggerLabel(state: VehicleTableViewsState): string {
  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view) return view.name
  }
  return 'All columns'
}

function visibleColumnSet(state: VehicleTableViewsState): Set<VehicleTableToggleableColumnId> {
  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view) return new Set(orderToggleableSubset(view.columns))
  }
  if (state.customColumns !== null) {
    return new Set(orderToggleableSubset(state.customColumns))
  }
  return new Set(allToggleableColumns())
}

/** Full toggleable column order (visible + hidden), used by the view popover and table. */
export function getFullColumnOrder(state: VehicleTableViewsState): VehicleTableToggleableColumnId[] {
  const all = allToggleableColumns()

  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view?.columnOrder && orderToggleableSubset(view.columnOrder).length === all.length) {
      return orderToggleableSubset(view.columnOrder)
    }
    if (view) {
      const visible = orderToggleableSubset(view.columns)
      const hidden = VEHICLE_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((c) => !visible.includes(c))
      return [...visible, ...hidden]
    }
  }

  if (state.columnOrder && orderToggleableSubset(state.columnOrder).length === all.length) {
    return orderToggleableSubset(state.columnOrder)
  }

  return all
}

export function isTableViewDirty(state: VehicleTableViewsState): boolean {
  if (state.customColumns !== null || state.columnOrder !== null) return true
  return false
}

/** Clears active layout customizations; keeps saved views. */
export function resetTableViewToDefault(state: VehicleTableViewsState): VehicleTableViewsState {
  return {
    ...state,
    activeViewId: null,
    customColumns: null,
    columnOrder: null,
  }
}

function isCanonicalOrder(order: readonly VehicleTableToggleableColumnId[]): boolean {
  return (
    order.length === VEHICLE_TABLE_TOGGLEABLE_COLUMN_ORDER.length &&
    order.every((id, i) => id === VEHICLE_TABLE_TOGGLEABLE_COLUMN_ORDER[i])
  )
}

export function commitTableColumnLayout(
  state: VehicleTableViewsState,
  order: VehicleTableToggleableColumnId[],
  visible: VehicleTableToggleableColumnId[],
): VehicleTableViewsState {
  const all = allToggleableColumns()
  const visibleOrdered = order.filter((id) => visible.includes(id))
  const allVisible = visibleOrdered.length === all.length
  const canonical = isCanonicalOrder(order)

  return {
    ...state,
    v: 2,
    activeViewId: null,
    columnOrder: canonical ? null : orderToggleableSubset(order),
    customColumns: allVisible && canonical ? null : visibleOrdered,
  }
}

/** Ordered visible toggleable columns: subset of canonical order. */
export function orderToggleableSubset(cols: readonly string[]): VehicleTableToggleableColumnId[] {
  const allowed = new Set<VehicleTableToggleableColumnId>()
  for (const c of cols) {
    if (isVehicleTableToggleableColumnId(c)) allowed.add(c)
  }
  return VEHICLE_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((id) => allowed.has(id))
}

export function allToggleableColumns(): VehicleTableToggleableColumnId[] {
  return [...VEHICLE_TABLE_TOGGLEABLE_COLUMN_ORDER]
}

export function effectiveToggleableColumns(state: VehicleTableViewsState): VehicleTableToggleableColumnId[] {
  const order = getFullColumnOrder(state)
  const visible = visibleColumnSet(state)
  const result = order.filter((id) => visible.has(id))
  return result.length > 0 ? result : allToggleableColumns()
}

function parseColumnOrder(value: unknown): VehicleTableToggleableColumnId[] | undefined {
  if (!Array.isArray(value)) return undefined
  const ordered = orderToggleableSubset(value as string[])
  return ordered.length === VEHICLE_TABLE_TOGGLEABLE_COLUMN_ORDER.length ? ordered : undefined
}

function parseStored(raw: string | null): VehicleTableViewsState | null {
  if (!raw) return null
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const o = parsed as Record<string, unknown>
  if (o.v !== 1 && o.v !== 2) return null
  const activeViewId =
    o.activeViewId === null || typeof o.activeViewId === 'string' ? (o.activeViewId as string | null) : null
  let customColumns: VehicleTableToggleableColumnId[] | null = null
  if (Array.isArray(o.customColumns)) {
    const ordered = orderToggleableSubset(o.customColumns as string[])
    customColumns = ordered.length > 0 ? ordered : null
  }
  let columnOrder: VehicleTableToggleableColumnId[] | null = null
  if (o.v === 2) {
    const parsedOrder = parseColumnOrder(o.columnOrder)
    columnOrder = parsedOrder ?? null
  }
  const savedViews: SavedVehicleTableView[] = []
  if (Array.isArray(o.savedViews)) {
    for (const entry of o.savedViews) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      if (typeof e.id !== 'string' || typeof e.name !== 'string' || !Array.isArray(e.columns)) continue
      const columns = orderToggleableSubset(e.columns as string[])
      if (columns.length === 0) continue
      const view: SavedVehicleTableView = {
        id: e.id,
        name: e.name.slice(0, 80),
        columns,
      }
      const viewOrder = parseColumnOrder(e.columnOrder)
      if (viewOrder) view.columnOrder = viewOrder
      savedViews.push(view)
    }
  }
  return {
    v: 2,
    activeViewId,
    customColumns,
    columnOrder,
    savedViews: savedViews.slice(0, MAX_SAVED_VEHICLE_TABLE_VIEWS),
  }
}

export function loadVehicleTableViewsState(): VehicleTableViewsState {
  if (typeof window === 'undefined') return defaultVehicleTableViewsState()
  try {
    const parsed = parseStored(window.localStorage.getItem(VEHICLE_TABLE_VIEWS_STORAGE_KEY))
    if (!parsed) return defaultVehicleTableViewsState()
    if (parsed.activeViewId && !parsed.savedViews.some((v) => v.id === parsed.activeViewId)) {
      return { ...parsed, activeViewId: null }
    }
    return parsed
  } catch {
    return defaultVehicleTableViewsState()
  }
}

export function saveVehicleTableViewsState(state: VehicleTableViewsState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VEHICLE_TABLE_VIEWS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}
