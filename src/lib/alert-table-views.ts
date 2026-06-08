export const ALERT_TABLE_VIEWS_STORAGE_KEY = 'fleet-command:alerts-table-views'

export const MAX_SAVED_ALERT_TABLE_VIEWS = 15

/** "Triggered" is always shown; these columns can be toggled/reordered. */
export type AlertTableToggleableColumnId =
  | 'view'
  | 'licensePlate'
  | 'message'
  | 'status'

export const ALERT_TABLE_TOGGLEABLE_COLUMN_ORDER: readonly AlertTableToggleableColumnId[] = [
  'view',
  'licensePlate',
  'message',
  'status',
] as const

export const ALERT_TABLE_COLUMN_LABELS: Record<AlertTableToggleableColumnId, string> = {
  view: 'View',
  licensePlate: 'License Plate',
  message: 'Message',
  status: 'Status',
}

export type SavedAlertTableView = {
  id: string
  name: string
  columns: AlertTableToggleableColumnId[]
  columnOrder?: AlertTableToggleableColumnId[]
}

export type AlertTableViewsState = {
  v: 2
  activeViewId: string | null
  customColumns: AlertTableToggleableColumnId[] | null
  columnOrder: AlertTableToggleableColumnId[] | null
  savedViews: SavedAlertTableView[]
}

const TOGGLEABLE_SET = new Set<string>(ALERT_TABLE_TOGGLEABLE_COLUMN_ORDER)

export function isAlertTableToggleableColumnId(value: string): value is AlertTableToggleableColumnId {
  return TOGGLEABLE_SET.has(value)
}

export function defaultAlertTableViewsState(): AlertTableViewsState {
  return { v: 2, activeViewId: null, customColumns: null, columnOrder: null, savedViews: [] }
}

export function allAlertToggleableColumns(): AlertTableToggleableColumnId[] {
  return [...ALERT_TABLE_TOGGLEABLE_COLUMN_ORDER]
}

function orderToggleableSubset(cols: readonly string[]): AlertTableToggleableColumnId[] {
  const allowed = new Set<AlertTableToggleableColumnId>()
  for (const c of cols) {
    if (isAlertTableToggleableColumnId(c)) allowed.add(c)
  }
  return ALERT_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((id) => allowed.has(id))
}

function visibleColumnSet(state: AlertTableViewsState): Set<AlertTableToggleableColumnId> {
  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view) return new Set(orderToggleableSubset(view.columns))
  }
  if (state.customColumns !== null) return new Set(orderToggleableSubset(state.customColumns))
  return new Set(allAlertToggleableColumns())
}

export function getAlertFullColumnOrder(state: AlertTableViewsState): AlertTableToggleableColumnId[] {
  const all = allAlertToggleableColumns()

  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view?.columnOrder && orderToggleableSubset(view.columnOrder).length === all.length) {
      return orderToggleableSubset(view.columnOrder)
    }
    if (view) {
      const visible = orderToggleableSubset(view.columns)
      const hidden = ALERT_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((c) => !visible.includes(c))
      return [...visible, ...hidden]
    }
  }

  if (state.columnOrder && orderToggleableSubset(state.columnOrder).length === all.length) {
    return orderToggleableSubset(state.columnOrder)
  }

  return all
}

export function effectiveAlertToggleableColumns(state: AlertTableViewsState): AlertTableToggleableColumnId[] {
  const order = getAlertFullColumnOrder(state)
  const visible = visibleColumnSet(state)
  const result = order.filter((id) => visible.has(id))
  return result.length > 0 ? result : allAlertToggleableColumns()
}

export function getAlertViewTriggerLabel(state: AlertTableViewsState): string {
  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view) return view.name
  }
  return 'All columns'
}

export function isAlertTableViewDirty(state: AlertTableViewsState): boolean {
  return state.customColumns !== null || state.columnOrder !== null
}

export function resetAlertTableViewToDefault(state: AlertTableViewsState): AlertTableViewsState {
  return { ...state, activeViewId: null, customColumns: null, columnOrder: null }
}

function isCanonicalOrder(order: readonly AlertTableToggleableColumnId[]): boolean {
  return (
    order.length === ALERT_TABLE_TOGGLEABLE_COLUMN_ORDER.length &&
    order.every((id, i) => id === ALERT_TABLE_TOGGLEABLE_COLUMN_ORDER[i])
  )
}

export function commitAlertColumnLayout(
  state: AlertTableViewsState,
  order: AlertTableToggleableColumnId[],
  visible: AlertTableToggleableColumnId[],
): AlertTableViewsState {
  const all = allAlertToggleableColumns()
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

function parseColumnOrder(value: unknown): AlertTableToggleableColumnId[] | undefined {
  if (!Array.isArray(value)) return undefined
  const ordered = orderToggleableSubset(value as string[])
  return ordered.length === ALERT_TABLE_TOGGLEABLE_COLUMN_ORDER.length ? ordered : undefined
}

function parseStored(raw: string | null): AlertTableViewsState | null {
  if (!raw) return null
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return null }
  if (!parsed || typeof parsed !== 'object') return null
  const o = parsed as Record<string, unknown>
  if (o.v !== 1 && o.v !== 2) return null
  const activeViewId =
    o.activeViewId === null || typeof o.activeViewId === 'string' ? (o.activeViewId as string | null) : null
  let customColumns: AlertTableToggleableColumnId[] | null = null
  if (Array.isArray(o.customColumns)) {
    const ordered = orderToggleableSubset(o.customColumns as string[])
    customColumns = ordered.length > 0 ? ordered : null
  }
  let columnOrder: AlertTableToggleableColumnId[] | null = null
  if (o.v === 2) {
    const parsedOrder = parseColumnOrder(o.columnOrder)
    columnOrder = parsedOrder ?? null
  }
  const savedViews: SavedAlertTableView[] = []
  if (Array.isArray(o.savedViews)) {
    for (const entry of o.savedViews) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      if (typeof e.id !== 'string' || typeof e.name !== 'string' || !Array.isArray(e.columns)) continue
      const columns = orderToggleableSubset(e.columns as string[])
      if (columns.length === 0) continue
      const view: SavedAlertTableView = { id: e.id, name: e.name.slice(0, 80), columns }
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
    savedViews: savedViews.slice(0, MAX_SAVED_ALERT_TABLE_VIEWS),
  }
}

export function loadAlertTableViewsState(): AlertTableViewsState {
  if (typeof window === 'undefined') return defaultAlertTableViewsState()
  try {
    const parsed = parseStored(window.localStorage.getItem(ALERT_TABLE_VIEWS_STORAGE_KEY))
    if (!parsed) return defaultAlertTableViewsState()
    if (parsed.activeViewId && !parsed.savedViews.some((v) => v.id === parsed.activeViewId)) {
      return { ...parsed, activeViewId: null }
    }
    return parsed
  } catch {
    return defaultAlertTableViewsState()
  }
}

export function saveAlertTableViewsState(state: AlertTableViewsState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ALERT_TABLE_VIEWS_STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota / private mode */ }
}
