export const DRIVER_TABLE_VIEWS_STORAGE_KEY = 'fleet-command:drivers-table-views'

export const MAX_SAVED_DRIVER_TABLE_VIEWS = 15

export type DriverTableToggleableColumnId =
  | 'status'
  | 'type'
  | 'riskScore'
  | 'mvr'
  | 'background'
  | 'training'
  | 'vehicle'
  | 'created'

export const DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER: readonly DriverTableToggleableColumnId[] = [
  'status',
  'type',
  'riskScore',
  'mvr',
  'background',
  'training',
  'vehicle',
  'created',
] as const

export type SavedDriverTableView = {
  id: string
  name: string
  columns: DriverTableToggleableColumnId[]
  columnOrder?: DriverTableToggleableColumnId[]
}

export type DriverTableViewsState = {
  v: 2
  activeViewId: string | null
  customColumns: DriverTableToggleableColumnId[] | null
  columnOrder: DriverTableToggleableColumnId[] | null
  savedViews: SavedDriverTableView[]
}

export const DRIVER_TABLE_COLUMN_LABELS: Record<DriverTableToggleableColumnId, string> = {
  status: 'Status',
  type: 'Type',
  riskScore: 'Risk Score',
  mvr: 'MVR',
  background: 'Background',
  training: 'Training',
  vehicle: 'Vehicle',
  created: 'Created',
}

export const DRIVER_TABLE_COLUMN_HEAD_CLASS: Record<DriverTableToggleableColumnId, string> = {
  status: 'w-[88px] px-2',
  type: 'min-w-[108px] w-[108px] px-2',
  riskScore: 'w-[72px] px-2',
  mvr: 'w-[72px] px-2',
  background: 'w-[88px] px-2',
  training: 'w-[80px] px-2',
  vehicle: 'w-[120px] px-2',
  created: 'w-[88px] px-2',
}

const TOGGLEABLE_SET = new Set<string>(DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER)

export function isDriverTableToggleableColumnId(value: string): value is DriverTableToggleableColumnId {
  return TOGGLEABLE_SET.has(value)
}

export function defaultDriverTableViewsState(): DriverTableViewsState {
  return { v: 2, activeViewId: null, customColumns: null, columnOrder: null, savedViews: [] }
}

export function getDriverViewTriggerLabel(state: DriverTableViewsState): string {
  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view) return view.name
  }
  return 'All columns'
}

function visibleColumnSet(state: DriverTableViewsState): Set<DriverTableToggleableColumnId> {
  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view) return new Set(orderToggleableSubset(view.columns))
  }
  if (state.customColumns !== null) {
    return new Set(orderToggleableSubset(state.customColumns))
  }
  return new Set(allToggleableColumns())
}

export function getDriverFullColumnOrder(state: DriverTableViewsState): DriverTableToggleableColumnId[] {
  const all = allToggleableColumns()

  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view?.columnOrder && orderToggleableSubset(view.columnOrder).length === all.length) {
      return orderToggleableSubset(view.columnOrder)
    }
    if (view) {
      const visible = orderToggleableSubset(view.columns)
      const hidden = DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((c) => !visible.includes(c))
      return [...visible, ...hidden]
    }
  }

  if (state.columnOrder && orderToggleableSubset(state.columnOrder).length === all.length) {
    return orderToggleableSubset(state.columnOrder)
  }

  return all
}

export function isDriverTableViewDirty(state: DriverTableViewsState): boolean {
  return state.customColumns !== null || state.columnOrder !== null
}

export function resetDriverTableViewToDefault(state: DriverTableViewsState): DriverTableViewsState {
  return { ...state, activeViewId: null, customColumns: null, columnOrder: null }
}

function isCanonicalOrder(order: readonly DriverTableToggleableColumnId[]): boolean {
  return (
    order.length === DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER.length &&
    order.every((id, i) => id === DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER[i])
  )
}

export function commitDriverTableColumnLayout(
  state: DriverTableViewsState,
  order: DriverTableToggleableColumnId[],
  visible: DriverTableToggleableColumnId[],
): DriverTableViewsState {
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

export function orderToggleableSubset(cols: readonly string[]): DriverTableToggleableColumnId[] {
  const allowed = new Set<DriverTableToggleableColumnId>()
  for (const c of cols) {
    if (isDriverTableToggleableColumnId(c)) allowed.add(c)
  }
  return DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((id) => allowed.has(id))
}

export function allToggleableColumns(): DriverTableToggleableColumnId[] {
  return [...DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER]
}

export function effectiveDriverToggleableColumns(state: DriverTableViewsState): DriverTableToggleableColumnId[] {
  const order = getDriverFullColumnOrder(state)
  const visible = visibleColumnSet(state)
  const result = order.filter((id) => visible.has(id))
  return result.length > 0 ? result : allToggleableColumns()
}

function parseColumnOrder(value: unknown): DriverTableToggleableColumnId[] | undefined {
  if (!Array.isArray(value)) return undefined
  const ordered = orderToggleableSubset(value as string[])
  return ordered.length === DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER.length ? ordered : undefined
}

function parseStored(raw: string | null): DriverTableViewsState | null {
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
  let customColumns: DriverTableToggleableColumnId[] | null = null
  if (Array.isArray(o.customColumns)) {
    const ordered = orderToggleableSubset(o.customColumns as string[])
    customColumns = ordered.length > 0 ? ordered : null
  }
  let columnOrder: DriverTableToggleableColumnId[] | null = null
  if (o.v === 2) {
    columnOrder = parseColumnOrder(o.columnOrder) ?? null
  }
  const savedViews: SavedDriverTableView[] = []
  if (Array.isArray(o.savedViews)) {
    for (const entry of o.savedViews) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      if (typeof e.id !== 'string' || typeof e.name !== 'string' || !Array.isArray(e.columns)) continue
      const columns = orderToggleableSubset(e.columns as string[])
      if (columns.length === 0) continue
      const view: SavedDriverTableView = { id: e.id, name: e.name.slice(0, 80), columns }
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
    savedViews: savedViews.slice(0, MAX_SAVED_DRIVER_TABLE_VIEWS),
  }
}

export function loadDriverTableViewsState(): DriverTableViewsState {
  if (typeof window === 'undefined') return defaultDriverTableViewsState()
  try {
    const parsed = parseStored(window.localStorage.getItem(DRIVER_TABLE_VIEWS_STORAGE_KEY))
    if (!parsed) return defaultDriverTableViewsState()
    if (parsed.activeViewId && !parsed.savedViews.some((v) => v.id === parsed.activeViewId)) {
      return { ...parsed, activeViewId: null }
    }
    return parsed
  } catch {
    return defaultDriverTableViewsState()
  }
}

export function saveDriverTableViewsState(state: DriverTableViewsState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DRIVER_TABLE_VIEWS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}
