export const ASSIGNMENT_TABLE_VIEWS_STORAGE_KEY = 'fleet-command:assignments-table-views'

export const MAX_SAVED_ASSIGNMENT_TABLE_VIEWS = 15

export type AssignmentTableToggleableColumnId = 'type' | 'driver' | 'status'

export const ASSIGNMENT_TABLE_TOGGLEABLE_COLUMN_ORDER: readonly AssignmentTableToggleableColumnId[] = [
  'type',
  'driver',
  'status',
] as const

export type SavedAssignmentTableView = {
  id: string
  name: string
  columns: AssignmentTableToggleableColumnId[]
  columnOrder?: AssignmentTableToggleableColumnId[]
}

export type AssignmentTableViewsState = {
  v: 2
  activeViewId: string | null
  customColumns: AssignmentTableToggleableColumnId[] | null
  columnOrder: AssignmentTableToggleableColumnId[] | null
  savedViews: SavedAssignmentTableView[]
}

export const ASSIGNMENT_TABLE_COLUMN_LABELS: Record<AssignmentTableToggleableColumnId, string> = {
  type: 'Type',
  driver: 'Driver / Party',
  status: 'Status',
}

export const ASSIGNMENT_TABLE_COLUMN_HEAD_CLASS: Record<AssignmentTableToggleableColumnId, string> = {
  type: 'min-w-[108px] w-[108px] px-2',
  driver: 'min-w-[120px] w-[120px] px-2',
  status: 'w-[88px] px-2',
}

const TOGGLEABLE_SET = new Set<string>(ASSIGNMENT_TABLE_TOGGLEABLE_COLUMN_ORDER)

export function isAssignmentTableToggleableColumnId(
  value: string,
): value is AssignmentTableToggleableColumnId {
  return TOGGLEABLE_SET.has(value)
}

export function defaultAssignmentTableViewsState(): AssignmentTableViewsState {
  return { v: 2, activeViewId: null, customColumns: null, columnOrder: null, savedViews: [] }
}

export function getAssignmentViewTriggerLabel(state: AssignmentTableViewsState): string {
  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view) return view.name
  }
  return 'All columns'
}

function visibleColumnSet(state: AssignmentTableViewsState): Set<AssignmentTableToggleableColumnId> {
  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view) return new Set(orderToggleableSubset(view.columns))
  }
  if (state.customColumns !== null) {
    return new Set(orderToggleableSubset(state.customColumns))
  }
  return new Set(allToggleableColumns())
}

export function getAssignmentFullColumnOrder(
  state: AssignmentTableViewsState,
): AssignmentTableToggleableColumnId[] {
  const all = allToggleableColumns()

  if (state.activeViewId) {
    const view = state.savedViews.find((v) => v.id === state.activeViewId)
    if (view?.columnOrder && orderToggleableSubset(view.columnOrder).length === all.length) {
      return orderToggleableSubset(view.columnOrder)
    }
    if (view) {
      const visible = orderToggleableSubset(view.columns)
      const hidden = ASSIGNMENT_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((c) => !visible.includes(c))
      return [...visible, ...hidden]
    }
  }

  if (state.columnOrder && orderToggleableSubset(state.columnOrder).length === all.length) {
    return orderToggleableSubset(state.columnOrder)
  }

  return all
}

export function isAssignmentTableViewDirty(state: AssignmentTableViewsState): boolean {
  return state.customColumns !== null || state.columnOrder !== null
}

export function resetAssignmentTableViewToDefault(
  state: AssignmentTableViewsState,
): AssignmentTableViewsState {
  return { ...state, activeViewId: null, customColumns: null, columnOrder: null }
}

function isCanonicalOrder(order: readonly AssignmentTableToggleableColumnId[]): boolean {
  return (
    order.length === ASSIGNMENT_TABLE_TOGGLEABLE_COLUMN_ORDER.length &&
    order.every((id, i) => id === ASSIGNMENT_TABLE_TOGGLEABLE_COLUMN_ORDER[i])
  )
}

export function commitAssignmentTableColumnLayout(
  state: AssignmentTableViewsState,
  order: AssignmentTableToggleableColumnId[],
  visible: AssignmentTableToggleableColumnId[],
): AssignmentTableViewsState {
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

export function orderToggleableSubset(cols: readonly string[]): AssignmentTableToggleableColumnId[] {
  const allowed = new Set<AssignmentTableToggleableColumnId>()
  for (const c of cols) {
    if (isAssignmentTableToggleableColumnId(c)) allowed.add(c)
  }
  return ASSIGNMENT_TABLE_TOGGLEABLE_COLUMN_ORDER.filter((id) => allowed.has(id))
}

export function allToggleableColumns(): AssignmentTableToggleableColumnId[] {
  return [...ASSIGNMENT_TABLE_TOGGLEABLE_COLUMN_ORDER]
}

export function effectiveAssignmentToggleableColumns(
  state: AssignmentTableViewsState,
): AssignmentTableToggleableColumnId[] {
  const order = getAssignmentFullColumnOrder(state)
  const visible = visibleColumnSet(state)
  const result = order.filter((id) => visible.has(id))
  return result.length > 0 ? result : allToggleableColumns()
}

function parseColumnOrder(value: unknown): AssignmentTableToggleableColumnId[] | undefined {
  if (!Array.isArray(value)) return undefined
  const ordered = orderToggleableSubset(value as string[])
  return ordered.length === ASSIGNMENT_TABLE_TOGGLEABLE_COLUMN_ORDER.length ? ordered : undefined
}

function parseStored(raw: string | null): AssignmentTableViewsState | null {
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
  let customColumns: AssignmentTableToggleableColumnId[] | null = null
  if (Array.isArray(o.customColumns)) {
    const ordered = orderToggleableSubset(o.customColumns as string[])
    customColumns = ordered.length > 0 ? ordered : null
  }
  let columnOrder: AssignmentTableToggleableColumnId[] | null = null
  if (o.v === 2) {
    columnOrder = parseColumnOrder(o.columnOrder) ?? null
  }
  const savedViews: SavedAssignmentTableView[] = []
  if (Array.isArray(o.savedViews)) {
    for (const entry of o.savedViews) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      if (typeof e.id !== 'string' || typeof e.name !== 'string' || !Array.isArray(e.columns)) continue
      const columns = orderToggleableSubset(e.columns as string[])
      if (columns.length === 0) continue
      const view: SavedAssignmentTableView = { id: e.id, name: e.name.slice(0, 80), columns }
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
    savedViews: savedViews.slice(0, MAX_SAVED_ASSIGNMENT_TABLE_VIEWS),
  }
}

export function loadAssignmentTableViewsState(): AssignmentTableViewsState {
  if (typeof window === 'undefined') return defaultAssignmentTableViewsState()
  try {
    const parsed = parseStored(window.localStorage.getItem(ASSIGNMENT_TABLE_VIEWS_STORAGE_KEY))
    if (!parsed) return defaultAssignmentTableViewsState()
    if (parsed.activeViewId && !parsed.savedViews.some((v) => v.id === parsed.activeViewId)) {
      return { ...parsed, activeViewId: null }
    }
    return parsed
  } catch {
    return defaultAssignmentTableViewsState()
  }
}

export function saveAssignmentTableViewsState(state: AssignmentTableViewsState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ASSIGNMENT_TABLE_VIEWS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode */
  }
}
