import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown, Download, X } from 'lucide-react'
import { CreateAssignmentDialog } from './create-assignment-dialog'
import {
  assignmentsData,
  getAssignmentExportCell,
  type AssignmentRow,
  type AssignmentStatus,
} from '../data/assignments'
import { AssignmentTableFilters } from './assignment-table-filters'
import { AssignmentTableViewPopover } from './assignment-table-view-popover'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { TableSurface } from './table-surface'
import { FleetSearchBar } from './fleet-search-bar'
import { cn } from './ui/utils'
import { formatAssignmentDateTime } from '../lib/assignment-datetime'
import {
  assignmentStatusBadgeClass,
  assignmentTypeBadgeClass,
} from '../lib/assignment-type-styles'
import {
  compareAssignmentRowsWithRules,
  cycleAssignmentSortRules,
  defaultAssignmentRowSort,
  type AssignmentSortColumnId,
  type AssignmentSortRule,
} from '../lib/assignment-table-sort'
import {
  ASSIGNMENT_TABLE_COLUMN_HEAD_CLASS,
  ASSIGNMENT_TABLE_COLUMN_LABELS,
  effectiveAssignmentToggleableColumns,
  loadAssignmentTableViewsState,
  saveAssignmentTableViewsState,
  type AssignmentTableToggleableColumnId,
  type AssignmentTableViewsState,
} from '../lib/assignment-table-views'
import {
  EMPTY_ASSIGNMENT_COLUMN_FILTERS,
  ASSIGNMENT_STATUS_FILTER_OPTIONS,
  formatAssignmentFilterChipLabel,
  removeAssignmentFilterValue,
  assignmentMatchesColumnFilters,
  assignmentMatchesSearch,
  type AssignmentColumnFilters,
  type AssignmentFilterKey,
} from '../lib/assignment-table-filters'
import { buildCsv, downloadCsv } from '../lib/export-csv'
import {
  clampAssignmentPlateColumnWidth,
  loadAssignmentPlateColumnWidth,
  saveAssignmentPlateColumnWidth,
} from '../lib/assignment-plate-column-width'

const ASSIGNMENTS_PAGE_SIZE_OPTIONS = [15, 25, 50, 75] as const

const PLATE_BG_DEFAULT = 'bg-card'
const PLATE_BG_HOVER = 'group-hover:bg-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)]'
const PLATE_BG_CHECKED =
  'bg-[color-mix(in_srgb,var(--card)_60%,var(--muted)_40%)] group-hover:bg-[color-mix(in_srgb,var(--card)_50%,var(--muted)_50%)]'

const PLATE_STICKY_HEAD_CLASS = cn(
  'sticky left-0 z-30 border-r border-border bg-[color-mix(in_srgb,var(--card)_50%,var(--muted)_50%)] shadow-[6px_0_10px_-4px_rgb(0_0_0/0.12)]',
)
const PLATE_STICKY_CELL_BASE = cn(
  'sticky left-0 z-20 border-r border-border shadow-[6px_0_10px_-4px_rgb(0_0_0/0.1)]',
)

const DATE_GROUP_BORDER = 'border-l border-border'

function nextAssignmentId(rows: AssignmentRow[]) {
  let max = 0
  for (const r of rows) {
    const m = /^assignment-(\d+)$/.exec(r.id)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return `assignment-${max + 1}`
}

function datetimeLocalToTable(isoLocal: string) {
  if (!isoLocal) return '—'
  return isoLocal.replace('T', ' ').slice(0, 16)
}

function renderAssignmentToggleableCell(row: AssignmentRow, colId: AssignmentTableToggleableColumnId): ReactNode {
  switch (colId) {
    case 'type':
      return (
        <TableCell key={colId} className="px-2">
          <Badge
            variant="outline"
            className={cn('whitespace-nowrap px-1.5 py-0 text-xs', assignmentTypeBadgeClass(row.assignmentType))}
          >
            {row.assignmentType}
          </Badge>
        </TableCell>
      )
    case 'driver':
      return (
        <TableCell key={colId} className="max-w-0 px-2" title={row.driver}>
          <span className="block truncate font-medium text-foreground">{row.driver}</span>
        </TableCell>
      )
    case 'status':
      return (
        <TableCell key={colId} className="px-2">
          <Badge
            variant="outline"
            className={cn('whitespace-nowrap px-1.5 py-0 text-xs', assignmentStatusBadgeClass(row.status))}
          >
            {row.status}
          </Badge>
        </TableCell>
      )
    default:
      return null
  }
}

function AssignmentTableSortHeaderContent({
  label,
  active,
  dir,
  sortPriority,
  showInactiveSortIcon,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc' | null
  sortPriority: number | null
  showInactiveSortIcon: boolean
}) {
  return (
    <>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="flex shrink-0 items-center gap-0.5">
        {active ? (
          <>
            {dir === 'asc' ? (
              <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
            )}
            {sortPriority !== null ? (
              <span className="w-3.5 text-center text-[10px] font-semibold leading-none tabular-nums">
                {sortPriority}
              </span>
            ) : null}
          </>
        ) : showInactiveSortIcon ? (
          <ChevronsUpDown
            className="h-3 w-3 shrink-0 text-muted-foreground/55 transition-colors group-hover:text-muted-foreground"
            aria-hidden
          />
        ) : null}
      </span>
    </>
  )
}

function AssignmentTableSortHeader({
  column,
  label,
  className,
  rules,
  onSort,
  rowSpan,
}: {
  column: AssignmentSortColumnId
  label: string
  className?: string
  rules: AssignmentSortRule[]
  onSort: (column: AssignmentSortColumnId, shiftKey: boolean) => void
  rowSpan?: number
}) {
  const idx = rules.findIndex((r) => r.column === column)
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null
  return (
    <TableHead className={cn(className, 'group p-0 align-middle')} rowSpan={rowSpan}>
      <button
        type="button"
        className={cn(
          'flex min-h-8 w-full items-center gap-0.5 text-left text-xs font-medium text-foreground',
          'px-2 py-1.5 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          active && 'text-primary',
        )}
        onClick={(e) => onSort(column, e.shiftKey)}
        title="Sort column. Shift+click to add or adjust secondary sorts."
      >
        <AssignmentTableSortHeaderContent
          label={label}
          active={active}
          dir={dir}
          sortPriority={active && rules.length > 1 ? idx + 1 : null}
          showInactiveSortIcon
        />
      </button>
    </TableHead>
  )
}

function AssignmentTableResizablePlateHeader({
  column,
  label,
  width,
  rules,
  onSort,
  onResizeStart,
}: {
  column: AssignmentSortColumnId
  label: string
  width: number
  rules: AssignmentSortRule[]
  onSort: (column: AssignmentSortColumnId, shiftKey: boolean) => void
  onResizeStart: (event: React.MouseEvent) => void
}) {
  const idx = rules.findIndex((r) => r.column === column)
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null

  return (
    <TableHead
      rowSpan={2}
      className={cn(
        'group relative max-w-0 p-0 align-middle',
        PLATE_STICKY_HEAD_CLASS,
      )}
      style={{ width, minWidth: width, maxWidth: width }}
    >
      <button
        type="button"
        className={cn(
          'flex min-h-8 w-full items-center gap-0.5 pr-2.5 text-left text-xs font-medium text-foreground',
          'px-2 py-1.5 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          active && 'text-primary',
        )}
        onClick={(e) => onSort(column, e.shiftKey)}
        title="Sort column. Shift+click to add or adjust secondary sorts."
      >
        <AssignmentTableSortHeaderContent
          label={label}
          active={active}
          dir={dir}
          sortPriority={active && rules.length > 1 ? idx + 1 : null}
          showInactiveSortIcon
        />
      </button>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize License plate column"
        title="Drag to resize"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onResizeStart(e)
        }}
        className={cn(
          'absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize touch-none select-none',
          'border-r-2 border-transparent hover:border-primary/50',
          'group-hover:border-border',
        )}
      />
    </TableHead>
  )
}

export function AssignmentsView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [addedAssignments, setAddedAssignments] = useState<AssignmentRow[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [columnFilters, setColumnFilters] = useState<AssignmentColumnFilters>(EMPTY_ASSIGNMENT_COLUMN_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(15)
  const [tableViewState, setTableViewState] = useState<AssignmentTableViewsState>(() =>
    loadAssignmentTableViewsState(),
  )
  const skipTableViewSave = useRef(true)
  const [sortRules, setSortRules] = useState<AssignmentSortRule[]>([])
  const [plateColumnWidth, setPlateColumnWidth] = useState(loadAssignmentPlateColumnWidth)
  const [checkedAssignmentIds, setCheckedAssignmentIds] = useState<Set<string>>(() => new Set())
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)

  const allAssignments = useMemo(
    () => [...assignmentsData, ...addedAssignments],
    [addedAssignments],
  )

  const startPlateColumnResize = useCallback((event: React.MouseEvent) => {
    const startX = event.clientX
    const startWidth = plateColumnWidth
    let latestWidth = startWidth

    const onMove = (moveEvent: MouseEvent) => {
      latestWidth = clampAssignmentPlateColumnWidth(startWidth + moveEvent.clientX - startX)
      setPlateColumnWidth(latestWidth)
    }

    const onUp = () => {
      saveAssignmentPlateColumnWidth(latestWidth)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [plateColumnWidth])

  useEffect(() => {
    if (skipTableViewSave.current) {
      skipTableViewSave.current = false
      return
    }
    saveAssignmentTableViewsState(tableViewState)
  }, [tableViewState])

  const effectiveToggleable = useMemo(
    () => effectiveAssignmentToggleableColumns(tableViewState),
    [tableViewState],
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery, columnFilters, sortRules, pageSize])

  useEffect(() => {
    setCheckedAssignmentIds(new Set())
  }, [searchQuery, columnFilters])

  const handleSortColumn = (column: AssignmentSortColumnId, shiftKey: boolean) => {
    setSortRules((prev) => cycleAssignmentSortRules(prev, column, shiftKey))
  }

  const filteredAssignments = useMemo(() => {
    const filtered = allAssignments.filter(
      (row) =>
        assignmentMatchesSearch(row, searchQuery) && assignmentMatchesColumnFilters(row, columnFilters),
    )
    return [...filtered].sort((a, b) => {
      if (sortRules.length > 0) return compareAssignmentRowsWithRules(a, b, sortRules)
      return defaultAssignmentRowSort(a, b)
    })
  }, [allAssignments, searchQuery, columnFilters, sortRules])

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginatedAssignments = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredAssignments.slice(start, start + pageSize)
  }, [filteredAssignments, safePage, pageSize])

  const pageAssignmentIds = useMemo(() => paginatedAssignments.map((r) => r.id), [paginatedAssignments])
  const filteredAssignmentIds = useMemo(
    () => filteredAssignments.map((r) => r.id),
    [filteredAssignments],
  )
  const selectedOnPageCount = useMemo(
    () => pageAssignmentIds.filter((id) => checkedAssignmentIds.has(id)).length,
    [pageAssignmentIds, checkedAssignmentIds],
  )
  const allPageSelected =
    pageAssignmentIds.length > 0 && selectedOnPageCount === pageAssignmentIds.length
  const somePageSelected = selectedOnPageCount > 0 && !allPageSelected
  const allFilteredSelected =
    filteredAssignmentIds.length > 0 &&
    filteredAssignmentIds.every((id) => checkedAssignmentIds.has(id))
  const showSelectAllFilteredBanner =
    allPageSelected &&
    !allFilteredSelected &&
    filteredAssignments.length > pageAssignmentIds.length

  useEffect(() => {
    const el = selectAllCheckboxRef.current
    if (!el) return
    const headerChecked = allPageSelected || allFilteredSelected
    const headerIndeterminate =
      !headerChecked &&
      (somePageSelected || (checkedAssignmentIds.size > 0 && !allFilteredSelected))
    el.indeterminate = headerIndeterminate
    el.checked = headerChecked
  }, [allPageSelected, allFilteredSelected, somePageSelected, checkedAssignmentIds.size])

  const rangeStart = filteredAssignments.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, filteredAssignments.length)

  const filterChipEntries = useMemo(() => {
    const entries: { key: AssignmentFilterKey; value: string }[] = []
    for (const key of Object.keys(columnFilters) as AssignmentFilterKey[]) {
      for (const value of columnFilters[key]) {
        entries.push({ key, value })
      }
    }
    return entries
  }, [columnFilters])

  function toggleQuickStatus(status: AssignmentStatus) {
    setColumnFilters((f) => {
      const has = f.status.includes(status)
      return {
        ...f,
        status: has ? f.status.filter((s) => s !== status) : [...f.status, status],
      }
    })
  }

  function toggleAssignmentChecked(id: string) {
    setCheckedAssignmentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllHeader() {
    if (allFilteredSelected) {
      setCheckedAssignmentIds(new Set())
      return
    }
    setCheckedAssignmentIds((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        for (const id of pageAssignmentIds) next.delete(id)
      } else {
        for (const id of pageAssignmentIds) next.add(id)
      }
      return next
    })
  }

  function selectAllFilteredAssignments() {
    setCheckedAssignmentIds(new Set(filteredAssignmentIds))
  }

  function handleExportCsv() {
    const headers = [
      'License plate',
      ...effectiveToggleable.map((id) => ASSIGNMENT_TABLE_COLUMN_LABELS[id]),
      'Scheduled start',
      'Actual start',
      'Scheduled end',
      'Actual end',
    ]
    const rows = filteredAssignments.map((row) => [
      row.licensePlate,
      ...effectiveToggleable.map((id) => getAssignmentExportCell(row, id)),
      row.scheduledStart,
      row.actualStart,
      row.scheduledEnd,
      row.actualEnd,
    ])
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`assignments-export-${date}.csv`, buildCsv(headers, rows))
  }

  function handleExportSelectedCsv() {
    const selected = allAssignments.filter((r) => checkedAssignmentIds.has(r.id))
    if (selected.length === 0) return
    const headers = [
      'License plate',
      ...effectiveToggleable.map((id) => ASSIGNMENT_TABLE_COLUMN_LABELS[id]),
      'Scheduled start',
      'Actual start',
      'Scheduled end',
      'Actual end',
    ]
    const rows = selected.map((row) => [
      row.licensePlate,
      ...effectiveToggleable.map((id) => getAssignmentExportCell(row, id)),
      row.scheduledStart,
      row.actualStart,
      row.scheduledEnd,
      row.actualEnd,
    ])
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`assignments-selected-${selected.length}-${date}.csv`, buildCsv(headers, rows))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Assignments</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Dispatch windows, lifecycle states, and timing — filter and export without leaving this view.
          </p>
        </div>
        <Button
          size="sm"
          type="button"
          className="shrink-0"
          style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
          onClick={() => setCreateOpen(true)}
        >
          Create assignment
        </Button>
      </div>

      <CreateAssignmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSave={(p) => {
          setAddedAssignments((prev) => {
            const combined = [...assignmentsData, ...prev]
            const id = nextAssignmentId(combined)
            const row: AssignmentRow = {
              id,
              licensePlate: p.licensePlate,
              assignmentType: p.assignmentType,
              driver: p.driver.trim() || '—',
              status: 'Scheduled',
              scheduledStart: datetimeLocalToTable(p.scheduledStart),
              actualStart: '—',
              scheduledEnd: datetimeLocalToTable(p.scheduledEnd),
              actualEnd: '—',
            }
            return [...prev, row]
          })
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <FleetSearchBar
          compact
          className="min-w-0 w-full flex-1 basis-[min(100%,16rem)] sm:max-w-md"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search assignments by plate, driver, or status..."
        />
        <AssignmentTableFilters
          rows={allAssignments}
          filters={columnFilters}
          onChangeFilters={setColumnFilters}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 gap-2 rounded-lg border-2 px-3"
          onClick={handleExportCsv}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          <span className="shrink-0 text-sm font-semibold text-foreground">View</span>
          <AssignmentTableViewPopover
            state={tableViewState}
            effectiveToggleable={effectiveToggleable}
            onReplaceState={setTableViewState}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ASSIGNMENT_STATUS_FILTER_OPTIONS.map((status) => (
          <Button
            key={status}
            type="button"
            variant={columnFilters.status.includes(status) ? 'default' : 'outline'}
            size="sm"
            style={
              columnFilters.status.includes(status)
                ? { backgroundColor: '#007FE0', color: '#ffffff' }
                : undefined
            }
            onClick={() => toggleQuickStatus(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      {filterChipEntries.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {filterChipEntries.map(({ key, value }) => (
            <Badge
              key={`${key}-${value}`}
              variant="outline"
              className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/5 py-1 pr-1 pl-2 text-xs font-medium"
            >
              {formatAssignmentFilterChipLabel(key, value)}
              <button
                type="button"
                className="rounded p-0.5 hover:bg-primary/15"
                aria-label={`Remove filter ${formatAssignmentFilterChipLabel(key, value)}`}
                onClick={() => setColumnFilters((f) => removeAssignmentFilterValue(f, key, value))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-1 text-xs text-primary"
            onClick={() => setColumnFilters(EMPTY_ASSIGNMENT_COLUMN_FILTERS)}
          >
            Clear all
          </Button>
        </div>
      ) : null}

      {checkedAssignmentIds.size > 0 ? (
        <div
          className={cn(
            'flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2',
            allFilteredSelected
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-border bg-muted/30',
          )}
        >
          {showSelectAllFilteredBanner ? (
            <span className="text-sm text-foreground">
              All {pageAssignmentIds.length} assignments on this page are selected.{' '}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-sm font-medium text-primary"
                onClick={selectAllFilteredAssignments}
              >
                Select all {filteredAssignments.length} assignments
              </Button>
            </span>
          ) : (
            <span
              className={cn(
                'text-sm font-medium',
                allFilteredSelected ? 'text-amber-950' : 'text-foreground',
              )}
            >
              {allFilteredSelected
                ? `All ${filteredAssignments.length} matching assignments selected`
                : `${checkedAssignmentIds.size} selected`}
            </span>
          )}
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleExportSelectedCsv}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            type="button"
            variant="link"
            size="sm"
            className={cn(
              'h-auto px-1 text-sm',
              allFilteredSelected ? 'text-amber-900 hover:text-amber-950' : 'text-primary',
            )}
            onClick={() => setCheckedAssignmentIds(new Set())}
          >
            Clear selection
          </Button>
        </div>
      ) : null}

      <TableSurface scrollable>
        <Table scrollContainer={false} className="min-w-max text-xs">
          <TableHeader>
            <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
              <TableHead rowSpan={2} className="w-[40px] px-2 align-middle">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  className="size-4 shrink-0 rounded border-input accent-primary"
                  aria-label={
                    allFilteredSelected
                      ? 'Clear all selected assignments'
                      : 'Select all assignments on this page'
                  }
                  checked={allPageSelected || allFilteredSelected}
                  onChange={toggleSelectAllHeader}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableHead>
              <AssignmentTableResizablePlateHeader
                column="plate"
                label="License plate"
                width={plateColumnWidth}
                rules={sortRules}
                onSort={handleSortColumn}
                onResizeStart={startPlateColumnResize}
              />
              {effectiveToggleable.map((colId) => (
                <AssignmentTableSortHeader
                  key={colId}
                  column={colId}
                  label={ASSIGNMENT_TABLE_COLUMN_LABELS[colId]}
                  className={ASSIGNMENT_TABLE_COLUMN_HEAD_CLASS[colId]}
                  rules={sortRules}
                  onSort={handleSortColumn}
                  rowSpan={2}
                />
              ))}
              <TableHead
                colSpan={2}
                className="border-l border-border bg-muted/50 px-0 py-1.5 text-center text-xs font-semibold text-foreground"
              >
                Start
              </TableHead>
              <TableHead
                colSpan={2}
                className="border-l border-border bg-muted/50 px-0 py-1.5 text-center text-xs font-semibold text-foreground"
              >
                End
              </TableHead>
              <TableHead rowSpan={2} className="w-[40px] px-1" aria-label="Open detail" />
            </TableRow>
            <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
              <AssignmentTableSortHeader
                column="scheduledStart"
                label="Scheduled"
                className={cn('w-[108px]', DATE_GROUP_BORDER)}
                rules={sortRules}
                onSort={handleSortColumn}
              />
              <AssignmentTableSortHeader
                column="actualStart"
                label="Actual"
                className="w-[108px]"
                rules={sortRules}
                onSort={handleSortColumn}
              />
              <AssignmentTableSortHeader
                column="scheduledEnd"
                label="Scheduled"
                className={cn('w-[108px]', DATE_GROUP_BORDER)}
                rules={sortRules}
                onSort={handleSortColumn}
              />
              <AssignmentTableSortHeader
                column="actualEnd"
                label="Actual"
                className="w-[108px]"
                rules={sortRules}
                onSort={handleSortColumn}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssignments.map((row) => {
              const isChecked = checkedAssignmentIds.has(row.id)
              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    'group border-border transition-colors',
                    isChecked ? 'bg-muted/40 hover:bg-muted/50' : 'hover:bg-primary/5',
                  )}
                >
                  <TableCell className="w-[40px] px-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="size-4 shrink-0 rounded border-input accent-primary"
                      aria-label={`Select ${row.licensePlate}`}
                      checked={isChecked}
                      onChange={() => toggleAssignmentChecked(row.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      PLATE_STICKY_CELL_BASE,
                      'px-2 font-medium tabular-nums',
                      isChecked && PLATE_BG_CHECKED,
                      !isChecked && cn(PLATE_BG_DEFAULT, PLATE_BG_HOVER),
                    )}
                    style={{
                      width: plateColumnWidth,
                      minWidth: plateColumnWidth,
                      maxWidth: plateColumnWidth,
                    }}
                  >
                    {row.licensePlate}
                  </TableCell>
                  {effectiveToggleable.map((colId) => renderAssignmentToggleableCell(row, colId))}
                  <TableCell
                    className={cn('whitespace-nowrap px-2 tabular-nums text-muted-foreground', DATE_GROUP_BORDER)}
                  >
                    {formatAssignmentDateTime(row.scheduledStart)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2 tabular-nums text-muted-foreground">
                    {formatAssignmentDateTime(row.actualStart)}
                  </TableCell>
                  <TableCell
                    className={cn('whitespace-nowrap px-2 tabular-nums text-muted-foreground', DATE_GROUP_BORDER)}
                  >
                    {formatAssignmentDateTime(row.scheduledEnd)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2 tabular-nums text-muted-foreground">
                    {formatAssignmentDateTime(row.actualEnd)}
                  </TableCell>
                  <TableCell className="px-1">
                    <Button variant="ghost" size="icon" type="button" className="h-7 w-7" aria-label="View details">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableSurface>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {rangeStart}-{rangeEnd} of {filteredAssignments.length} results
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="assignments-page-size" className="text-sm text-muted-foreground">
              Rows per page
            </label>
            <select
              id="assignments-page-size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {ASSIGNMENTS_PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm">Page {safePage} of {totalPages}</span>
          <Button
            size="sm"
            type="button"
            style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
