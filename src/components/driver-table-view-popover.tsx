import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, GripVertical, LayoutGrid, Plus, Search } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Switch } from './ui/switch'
import { cn } from './ui/utils'
import {
  MAX_SAVED_DRIVER_TABLE_VIEWS,
  DRIVER_TABLE_COLUMN_LABELS,
  DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER,
  allToggleableColumns,
  commitDriverTableColumnLayout,
  effectiveDriverToggleableColumns,
  getDriverFullColumnOrder,
  getDriverViewTriggerLabel,
  isDriverTableViewDirty,
  resetDriverTableViewToDefault,
  type DriverTableToggleableColumnId,
  type DriverTableViewsState,
} from '../lib/driver-table-views'

export interface DriverTableViewPopoverProps {
  state: DriverTableViewsState
  effectiveToggleable: DriverTableToggleableColumnId[]
  onReplaceState: (next: DriverTableViewsState) => void
}

export function DriverTableViewPopover({
  state,
  effectiveToggleable,
  onReplaceState,
}: DriverTableViewPopoverProps) {
  const [open, setOpen] = useState(false)
  const [columnSearch, setColumnSearch] = useState('')
  const [creatingView, setCreatingView] = useState(false)
  const [newViewName, setNewViewName] = useState('')
  const [dragId, setDragId] = useState<DriverTableToggleableColumnId | null>(null)

  const fullOrder = useMemo(() => getDriverFullColumnOrder(state), [state])
  const visibleSet = useMemo(() => new Set(effectiveToggleable), [effectiveToggleable])
  const totalToggleable = DRIVER_TABLE_TOGGLEABLE_COLUMN_ORDER.length
  const visibleCount = effectiveToggleable.length
  const triggerLabel = getDriverViewTriggerLabel(state)
  const dirty = isDriverTableViewDirty(state)
  const canSaveView = dirty && state.savedViews.length < MAX_SAVED_DRIVER_TABLE_VIEWS
  const isAllColumnsActive = !state.activeViewId && state.customColumns === null && state.columnOrder === null

  useEffect(() => {
    if (!dirty) {
      setCreatingView(false)
      setNewViewName('')
    }
  }, [dirty])

  const filteredOrder = useMemo(() => {
    const q = columnSearch.trim().toLowerCase()
    if (!q) return fullOrder
    return fullOrder.filter((id) => DRIVER_TABLE_COLUMN_LABELS[id].toLowerCase().includes(q))
  }, [columnSearch, fullOrder])

  function commit(order: DriverTableToggleableColumnId[], visible: DriverTableToggleableColumnId[]) {
    onReplaceState(commitDriverTableColumnLayout(state, order, visible))
  }

  function toggleColumn(id: DriverTableToggleableColumnId) {
    const nextVisible = new Set(visibleSet)
    if (nextVisible.has(id)) {
      if (nextVisible.size <= 1) return
      nextVisible.delete(id)
    } else {
      nextVisible.add(id)
    }
    const visible = fullOrder.filter((colId) => nextVisible.has(colId))
    commit(fullOrder, visible)
  }

  function reorderColumns(sourceId: DriverTableToggleableColumnId, targetId: DriverTableToggleableColumnId) {
    if (sourceId === targetId) return
    const next = [...fullOrder]
    const from = next.indexOf(sourceId)
    const to = next.indexOf(targetId)
    if (from < 0 || to < 0) return
    next.splice(from, 1)
    next.splice(to, 0, sourceId)
    commit(next, effectiveToggleable)
  }

  function handleReset() {
    onReplaceState(resetDriverTableViewToDefault(state))
    setColumnSearch('')
    setCreatingView(false)
    setNewViewName('')
  }

  function selectAllColumnsView() {
    onReplaceState({
      ...state,
      activeViewId: null,
      customColumns: null,
      columnOrder: null,
    })
  }

  function selectSavedView(viewId: string) {
    onReplaceState({
      ...state,
      activeViewId: viewId,
      customColumns: null,
      columnOrder: null,
    })
  }

  function handleSaveView() {
    if (!dirty) return
    const name = newViewName.trim()
    if (!name) return
    if (state.savedViews.length >= MAX_SAVED_DRIVER_TABLE_VIEWS) return
    const visible = effectiveDriverToggleableColumns(state)
    const order = getDriverFullColumnOrder(state)
    if (visible.length === 0) return
    const id = crypto.randomUUID()
    onReplaceState({
      ...state,
      savedViews: [
        ...state.savedViews,
        { id, name: name.slice(0, 80), columns: visible, columnOrder: order },
      ],
      activeViewId: id,
      customColumns: null,
      columnOrder: null,
    })
    setNewViewName('')
    setCreatingView(false)
  }

  function handleDeleteView(viewId: string, e: React.MouseEvent) {
    e.stopPropagation()
    const wasActive = state.activeViewId === viewId
    onReplaceState({
      ...state,
      savedViews: state.savedViews.filter((v) => v.id !== viewId),
      activeViewId: wasActive ? null : state.activeViewId,
      customColumns: wasActive ? null : state.customColumns,
      columnOrder: wasActive ? null : state.columnOrder,
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'h-10 min-w-[10.5rem] max-w-sm justify-between gap-2 rounded-lg border-2 border-border bg-card px-3.5 text-sm font-medium shadow-sm',
            'hover:border-primary/45 hover:bg-muted/30',
            'data-[state=open]:border-primary data-[state=open]:ring-[3px] data-[state=open]:ring-primary/25',
          )}
          aria-label="Table view and columns"
        >
          <span className="flex min-w-0 items-center gap-2">
            <LayoutGrid className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="truncate">{triggerLabel}</span>
            {dirty ? (
              <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unsaved column changes" />
            ) : null}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[min(22.5rem,calc(100vw-2rem))] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          <div className="border-b border-border px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Saved views
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 gap-1 px-2 text-xs',
                  canSaveView
                    ? 'text-primary hover:bg-primary/10 hover:text-primary'
                    : 'text-muted-foreground',
                )}
                onClick={() => {
                  if (!canSaveView) return
                  setCreatingView(true)
                }}
                disabled={!canSaveView}
                title={
                  !dirty
                    ? 'Customize columns to save a view'
                    : state.savedViews.length >= MAX_SAVED_DRIVER_TABLE_VIEWS
                      ? `Maximum ${MAX_SAVED_DRIVER_TABLE_VIEWS} saved views`
                      : 'Save current column layout'
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Save View
              </Button>
            </div>
            {creatingView ? (
              <div className="mt-2 flex gap-2">
                <Input
                  autoFocus
                  placeholder="View name"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  maxLength={80}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveView()
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 shrink-0"
                  style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
                  onClick={handleSaveView}
                  disabled={!newViewName.trim()}
                >
                  Save
                </Button>
              </div>
            ) : null}
            <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto">
              <li>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                    isAllColumnsActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60',
                  )}
                  onClick={selectAllColumnsView}
                >
                  {isAllColumnsActive ? (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <span className="w-4 shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate font-medium">All columns</span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {allToggleableColumns().length}
                  </span>
                </button>
              </li>
              {state.savedViews.map((view) => {
                const active = state.activeViewId === view.id && !dirty
                return (
                  <li key={view.id}>
                    <button
                      type="button"
                      className={cn(
                        'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                        active ? 'bg-primary/10 text-primary' : 'hover:bg-muted/60',
                      )}
                      onClick={() => selectSavedView(view.id)}
                    >
                      {active ? (
                        <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      ) : (
                        <span className="w-4 shrink-0" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1 truncate">{view.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                        {view.columns.length}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                        onClick={(e) => handleDeleteView(view.id, e)}
                      >
                        Delete
                      </Button>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">Columns</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {visibleCount} / {totalToggleable} visible
              </p>
            </div>
            <p className="mb-2 text-xs text-muted-foreground">
              Name is always shown. Toggle and drag to customize the rest.
            </p>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Find a column…"
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <ul className="max-h-52 space-y-0.5 overflow-y-auto overscroll-contain pr-0.5">
              {filteredOrder.map((id) => {
                const checked = visibleSet.has(id)
                const canTurnOff = visibleSet.size > 1
                return (
                  <li
                    key={id}
                    draggable
                    onDragStart={() => setDragId(id)}
                    onDragEnd={() => setDragId(null)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (dragId) reorderColumns(dragId, id)
                      setDragId(null)
                    }}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md px-1 py-1',
                      dragId === id && 'bg-muted/80 opacity-70',
                      'hover:bg-muted/40',
                    )}
                  >
                    <button
                      type="button"
                      className="flex h-7 w-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
                      aria-label={`Reorder ${DRIVER_TABLE_COLUMN_LABELS[id]}`}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {DRIVER_TABLE_COLUMN_LABELS[id]}
                    </span>
                    <Switch
                      checked={checked}
                      disabled={checked && !canTurnOff}
                      onCheckedChange={() => toggleColumn(id)}
                      aria-label={`${checked ? 'Hide' : 'Show'} ${DRIVER_TABLE_COLUMN_LABELS[id]}`}
                    />
                  </li>
                )
              })}
              {filteredOrder.length === 0 ? (
                <li className="px-2 py-3 text-center text-xs text-muted-foreground">No columns match</li>
              ) : null}
            </ul>
          </div>

          <div className="border-t border-border px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={handleReset}
            >
              Reset to default
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
