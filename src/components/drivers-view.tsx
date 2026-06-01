import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown, Download, X } from 'lucide-react'
import {
  buildDriverDetail,
  driversData,
  formatDriverStatusLabel,
  formatDriverTrainingLabel,
  formatDriverVerificationLabel,
  getDriverExportCell,
  type DriverRow,
  type DriverRosterStatus,
} from '../data/drivers'
import { DriverRowDetailPopover } from './driver-row-detail-popover'
import { DriverDetail } from './driver-detail'
import { DriverAvatar } from './driver-avatar'
import { DriverTableFilters } from './driver-table-filters'
import { DriverTableViewPopover } from './driver-table-view-popover'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { TableSurface } from './table-surface'
import { FleetSearchBar } from './fleet-search-bar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from './ui/utils'
import {
  DRIVER_ROSTER_STATUS_OPTIONS,
  driverRiskScoreClass,
  driverRosterStatusClass,
  driverTrainingClass,
  driverVerificationClass,
} from '../lib/status-badge-styles'
import {
  compareDriverRowsWithRules,
  cycleDriverSortRules,
  defaultDriverRowSort,
  type DriverSortColumnId,
  type DriverSortRule,
} from '../lib/driver-table-sort'
import {
  DRIVER_TABLE_COLUMN_HEAD_CLASS,
  DRIVER_TABLE_COLUMN_LABELS,
  effectiveDriverToggleableColumns,
  loadDriverTableViewsState,
  saveDriverTableViewsState,
  type DriverTableToggleableColumnId,
  type DriverTableViewsState,
} from '../lib/driver-table-views'
import {
  EMPTY_DRIVER_COLUMN_FILTERS,
  formatDriverFilterChipLabel,
  removeDriverFilterValue,
  driverMatchesColumnFilters,
  driverMatchesSearch,
  type DriverColumnFilters,
  type DriverFilterKey,
} from '../lib/driver-table-filters'
import { buildCsv, downloadCsv } from '../lib/export-csv'
import {
  clampDriverNameColumnWidth,
  loadDriverNameColumnWidth,
  saveDriverNameColumnWidth,
} from '../lib/driver-name-column-width'

const DRIVERS_PAGE_SIZE_OPTIONS = [15, 25, 50, 75] as const

const NAME_BG_DEFAULT = 'bg-card'
const NAME_BG_HOVER = 'group-hover:bg-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)]'
const NAME_BG_CHECKED =
  'bg-[color-mix(in_srgb,var(--card)_60%,var(--muted)_40%)] group-hover:bg-[color-mix(in_srgb,var(--card)_50%,var(--muted)_50%)]'
const NAME_BG_DETAIL =
  'bg-[color-mix(in_srgb,var(--card)_90%,var(--primary)_10%)] group-hover:bg-[color-mix(in_srgb,var(--card)_90%,var(--primary)_10%)]'

const NAME_STICKY_CELL_BASE = cn(
  'sticky left-0 z-20 border-r border-border shadow-[6px_0_10px_-4px_rgb(0_0_0/0.1)]',
)

function renderDriverToggleableCell(driver: DriverRow, colId: DriverTableToggleableColumnId): ReactNode {
  switch (colId) {
    case 'status':
      return (
        <TableCell key={colId} className="px-2">
          <Badge
            variant="outline"
            className={cn('whitespace-nowrap px-1.5 py-0 text-xs', driverRosterStatusClass(driver.status))}
          >
            {formatDriverStatusLabel(driver.status)}
          </Badge>
        </TableCell>
      )
    case 'type':
      return (
        <TableCell key={colId} className="max-w-0 px-2" title={driver.driverType}>
          <span className="block truncate">{driver.driverType}</span>
        </TableCell>
      )
    case 'riskScore':
      return (
        <TableCell
          key={colId}
          className={cn('px-2 tabular-nums', driverRiskScoreClass(driver.riskScore))}
        >
          {driver.riskScore}
        </TableCell>
      )
    case 'mvr':
      return (
        <TableCell key={colId} className="px-2">
          <Badge variant="outline" className={cn('text-xs', driverVerificationClass(driver.mvrStatus))}>
            {formatDriverVerificationLabel(driver.mvrStatus)}
          </Badge>
        </TableCell>
      )
    case 'background':
      return (
        <TableCell key={colId} className="px-2">
          <Badge
            variant="outline"
            className={cn('text-xs', driverVerificationClass(driver.backgroundCheck))}
          >
            {formatDriverVerificationLabel(driver.backgroundCheck)}
          </Badge>
        </TableCell>
      )
    case 'training':
      return (
        <TableCell key={colId} className="px-2">
          <Badge variant="outline" className={cn('text-xs', driverTrainingClass(driver.training))}>
            {formatDriverTrainingLabel(driver.training)}
          </Badge>
        </TableCell>
      )
    case 'vehicle':
      return (
        <TableCell key={colId} className="max-w-0 px-2" title={driver.vehicle}>
          <span className="block truncate">{driver.vehicle}</span>
        </TableCell>
      )
    case 'created':
      return (
        <TableCell key={colId} className="whitespace-nowrap px-2 tabular-nums">
          {driver.created}
        </TableCell>
      )
    default:
      return null
  }
}

function DriverTableSortHeaderContent({
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

function DriverTableSortHeader({
  column,
  label,
  className,
  rules,
  onSort,
}: {
  column: DriverSortColumnId
  label: string
  className?: string
  rules: DriverSortRule[]
  onSort: (column: DriverSortColumnId, shiftKey: boolean) => void
}) {
  const idx = rules.findIndex((r) => r.column === column)
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null
  return (
    <TableHead className={cn(className, 'group p-0 align-middle')}>
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
        <DriverTableSortHeaderContent
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

function DriverTableResizableNameHeader({
  column,
  label,
  width,
  rules,
  onSort,
  onResizeStart,
}: {
  column: DriverSortColumnId
  label: string
  width: number
  rules: DriverSortRule[]
  onSort: (column: DriverSortColumnId, shiftKey: boolean) => void
  onResizeStart: (event: React.MouseEvent) => void
}) {
  const idx = rules.findIndex((r) => r.column === column)
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null

  return (
    <TableHead
      className={cn(
        'group relative max-w-0 p-0 align-middle',
        'sticky left-0 z-30 border-r border-border bg-[color-mix(in_srgb,var(--card)_50%,var(--muted)_50%)] shadow-[6px_0_10px_-4px_rgb(0_0_0/0.12)]',
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
        <DriverTableSortHeaderContent
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
        aria-label="Resize Name column"
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

export function DriversView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [driverOverrides, setDriverOverrides] = useState<Record<string, Partial<DriverRow>>>({})
  const driverRows = useMemo(
    () => driversData.map((d) => (driverOverrides[d.id] ? { ...d, ...driverOverrides[d.id] } : d)),
    [driverOverrides],
  )
  const [checkedDriverIds, setCheckedDriverIds] = useState<Set<string>>(() => new Set())
  const [bulkStatusPopoverOpen, setBulkStatusPopoverOpen] = useState(false)
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)
  const [columnFilters, setColumnFilters] = useState<DriverColumnFilters>(EMPTY_DRIVER_COLUMN_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(15)
  const [tableViewState, setTableViewState] = useState<DriverTableViewsState>(() => loadDriverTableViewsState())
  const skipTableViewSave = useRef(true)
  const [sortRules, setSortRules] = useState<DriverSortRule[]>([])
  const [nameColumnWidth, setNameColumnWidth] = useState(loadDriverNameColumnWidth)
  const tableAreaRef = useRef<HTMLDivElement>(null)

  function driverIdFromLocation(): string | null {
    if (typeof window === 'undefined') return null
    const hash = window.location.hash.slice(1)
    if (hash) {
      const d = new URLSearchParams(hash).get('driver')
      if (d) return d
    }
    return new URLSearchParams(window.location.search).get('driver')
  }

  function readDriverViewFromLocation(): 'preview' | 'full' {
    if (typeof window === 'undefined') return 'preview'
    const hash = window.location.hash.slice(1)
    const fromHash = hash ? new URLSearchParams(hash).get('driverView') : null
    const fromSearch = new URLSearchParams(window.location.search).get('driverView')
    const raw = fromHash ?? fromSearch
    return raw === 'full' ? 'full' : 'preview'
  }

  const [selectedId, setSelectedId] = useState<string | null>(driverIdFromLocation)
  const [driverDetailView, setDriverDetailView] = useState<'preview' | 'full'>(() =>
    driverIdFromLocation() && readDriverViewFromLocation() === 'full' ? 'full' : 'preview',
  )

  const syncDriverLocation = useCallback((driverId: string | null, view: 'preview' | 'full' | null) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (driverId) {
      url.searchParams.set('tab', 'Drivers')
      url.searchParams.set('driver', driverId)
      if (view === 'full') url.searchParams.set('driverView', 'full')
      else url.searchParams.delete('driverView')
    } else {
      url.searchParams.delete('driver')
      url.searchParams.delete('driverView')
    }
    if (url.hash.includes('figmacapture')) {
      const hp = new URLSearchParams(url.hash.slice(1))
      if (driverId) {
        hp.set('tab', 'Drivers')
        hp.set('driver', driverId)
        if (view === 'full') hp.set('driverView', 'full')
        else hp.delete('driverView')
      } else {
        hp.delete('driver')
        hp.delete('driverView')
      }
      window.history.replaceState(null, '', `${url.pathname}${url.search}#${hp.toString()}`)
    } else {
      url.hash = ''
      window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    }
  }, [])

  const selectDriver = useCallback(
    (driverId: string | null, view: 'preview' | 'full' | null = 'preview') => {
      setSelectedId(driverId)
      if (!driverId) {
        setDriverDetailView('preview')
        syncDriverLocation(null, null)
        return
      }
      setDriverDetailView(view === 'full' ? 'full' : 'preview')
      syncDriverLocation(driverId, view === 'full' ? 'full' : 'preview')
    },
    [syncDriverLocation],
  )

  const startNameColumnResize = useCallback((event: React.MouseEvent) => {
    const startX = event.clientX
    const startWidth = nameColumnWidth
    let latestWidth = startWidth

    const onMove = (moveEvent: MouseEvent) => {
      latestWidth = clampDriverNameColumnWidth(startWidth + moveEvent.clientX - startX)
      setNameColumnWidth(latestWidth)
    }

    const onUp = () => {
      saveDriverNameColumnWidth(latestWidth)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [nameColumnWidth])

  useEffect(() => {
    if (skipTableViewSave.current) {
      skipTableViewSave.current = false
      return
    }
    saveDriverTableViewsState(tableViewState)
  }, [tableViewState])

  const effectiveToggleable = useMemo(
    () => effectiveDriverToggleableColumns(tableViewState),
    [tableViewState],
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery, columnFilters, sortRules, pageSize])

  useEffect(() => {
    setCheckedDriverIds(new Set())
    setBulkStatusPopoverOpen(false)
  }, [searchQuery, columnFilters])

  const handleSortColumn = (column: DriverSortColumnId, shiftKey: boolean) => {
    setSortRules((prev) => cycleDriverSortRules(prev, column, shiftKey))
  }

  const filteredDrivers = useMemo(() => {
    const filtered = driverRows.filter(
      (d) => driverMatchesSearch(d, searchQuery) && driverMatchesColumnFilters(d, columnFilters),
    )
    return [...filtered].sort((a, b) => {
      if (sortRules.length > 0) return compareDriverRowsWithRules(a, b, sortRules)
      return defaultDriverRowSort(a, b)
    })
  }, [driverRows, searchQuery, columnFilters, sortRules])

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginatedDrivers = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredDrivers.slice(start, start + pageSize)
  }, [filteredDrivers, safePage, pageSize])

  const pageDriverIds = useMemo(() => paginatedDrivers.map((d) => d.id), [paginatedDrivers])
  const filteredDriverIds = useMemo(() => filteredDrivers.map((d) => d.id), [filteredDrivers])
  const selectedOnPageCount = useMemo(
    () => pageDriverIds.filter((id) => checkedDriverIds.has(id)).length,
    [pageDriverIds, checkedDriverIds],
  )
  const allPageSelected = pageDriverIds.length > 0 && selectedOnPageCount === pageDriverIds.length
  const somePageSelected = selectedOnPageCount > 0 && !allPageSelected
  const allFilteredSelected =
    filteredDriverIds.length > 0 && filteredDriverIds.every((id) => checkedDriverIds.has(id))
  const showSelectAllFilteredBanner =
    allPageSelected && !allFilteredSelected && filteredDrivers.length > pageDriverIds.length

  useEffect(() => {
    const el = selectAllCheckboxRef.current
    if (!el) return
    const headerChecked = allPageSelected || allFilteredSelected
    const headerIndeterminate =
      !headerChecked &&
      (somePageSelected || (checkedDriverIds.size > 0 && !allFilteredSelected))
    el.indeterminate = headerIndeterminate
    el.checked = headerChecked
  }, [allPageSelected, allFilteredSelected, somePageSelected, checkedDriverIds.size])

  const rangeStart = filteredDrivers.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, filteredDrivers.length)

  const filterChipEntries = useMemo(() => {
    const entries: { key: DriverFilterKey; value: string }[] = []
    for (const key of Object.keys(columnFilters) as DriverFilterKey[]) {
      for (const value of columnFilters[key]) {
        entries.push({ key, value })
      }
    }
    return entries
  }, [columnFilters])

  const selectedRow = useMemo(() => {
    if (!selectedId) return null
    const row = driverRows.find((d) => d.id === selectedId)
    return row ? buildDriverDetail(row) : null
  }, [selectedId, driverRows])

  const selectedNavIndex = useMemo(
    () => (selectedId ? filteredDrivers.findIndex((d) => d.id === selectedId) : -1),
    [selectedId, filteredDrivers],
  )

  const showPreviewPanel = Boolean(selectedRow && driverDetailView === 'preview')
  const showFullDetail = Boolean(selectedRow && driverDetailView === 'full')

  const driverNavPositionLabel =
    selectedNavIndex >= 0 ? `${selectedNavIndex + 1} of ${filteredDrivers.length}` : ''

  const goToAdjacentDriver = useCallback(
    (delta: -1 | 1) => {
      const nextIndex = selectedNavIndex + delta
      if (nextIndex < 0 || nextIndex >= filteredDrivers.length) return
      const next = filteredDrivers[nextIndex]!
      selectDriver(next.id, driverDetailView)
      setPage(Math.floor(nextIndex / pageSize) + 1)
    },
    [driverDetailView, filteredDrivers, pageSize, selectDriver, selectedNavIndex],
  )

  useEffect(() => {
    if (!selectedId) return
    if (!driverRows.some((d) => d.id === selectedId)) selectDriver(null)
  }, [driverRows, selectedId, selectDriver])

  useEffect(() => {
    if (!selectedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectDriver(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, selectDriver])

  function toggleDriverChecked(id: string) {
    setCheckedDriverIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllHeader() {
    if (allFilteredSelected) {
      setCheckedDriverIds(new Set())
      return
    }
    setCheckedDriverIds((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        for (const id of pageDriverIds) next.delete(id)
      } else {
        for (const id of pageDriverIds) next.add(id)
      }
      return next
    })
  }

  function selectAllFilteredDrivers() {
    setCheckedDriverIds(new Set(filteredDriverIds))
  }

  function handleBulkChangeStatus(status: DriverRosterStatus) {
    setDriverOverrides((prev) => {
      const next = { ...prev }
      for (const id of checkedDriverIds) {
        next[id] = { ...next[id], status }
      }
      return next
    })
    setCheckedDriverIds(new Set())
    setBulkStatusPopoverOpen(false)
  }

  function handleExportSelectedCsv() {
    const selected = driverRows.filter((d) => checkedDriverIds.has(d.id))
    if (selected.length === 0) return
    const headers = ['Name', ...effectiveToggleable.map((id) => DRIVER_TABLE_COLUMN_LABELS[id])]
    const rows = selected.map((row) => [
      row.name,
      ...effectiveToggleable.map((id) => getDriverExportCell(row, id)),
    ])
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`drivers-selected-${selected.length}-${date}.csv`, buildCsv(headers, rows))
  }

  function handleExportCsv() {
    const headers = ['Name', ...effectiveToggleable.map((id) => DRIVER_TABLE_COLUMN_LABELS[id])]
    const rows = filteredDrivers.map((row) => [
      row.name,
      ...effectiveToggleable.map((id) => getDriverExportCell(row, id)),
    ])
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`drivers-export-${date}.csv`, buildCsv(headers, rows))
  }

  if (showFullDetail && selectedRow) {
    return (
      <div className="relative min-w-0 space-y-4">
        <DriverDetail
          key={selectedRow.id}
          layout="page"
          variant="full"
          driver={selectedRow}
          onBack={() => selectDriver(null)}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Drivers</h1>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Filter your roster; open a row for full driver verification and vehicle history.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FleetSearchBar
          compact
          className="min-w-0 w-full flex-1 basis-[min(100%,16rem)] sm:max-w-md"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search drivers by name, type, vehicle..."
        />
        <DriverTableFilters
          rows={driverRows}
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
          <DriverTableViewPopover
            state={tableViewState}
            effectiveToggleable={effectiveToggleable}
            onReplaceState={setTableViewState}
          />
        </div>
      </div>

      {filterChipEntries.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {filterChipEntries.map(({ key, value }) => (
            <Badge
              key={`${key}-${value}`}
              variant="outline"
              className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/5 py-1 pr-1 pl-2 text-xs font-medium"
            >
              {formatDriverFilterChipLabel(key, value)}
              <button
                type="button"
                className="rounded p-0.5 hover:bg-primary/15"
                aria-label={`Remove filter ${formatDriverFilterChipLabel(key, value)}`}
                onClick={() => setColumnFilters((f) => removeDriverFilterValue(f, key, value))}
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
            onClick={() => setColumnFilters(EMPTY_DRIVER_COLUMN_FILTERS)}
          >
            Clear all
          </Button>
        </div>
      ) : null}

      {checkedDriverIds.size > 0 ? (
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
              All {pageDriverIds.length} drivers on this page are selected.{' '}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-sm font-medium text-primary"
                onClick={selectAllFilteredDrivers}
              >
                Select all {filteredDrivers.length} drivers
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
                ? `All ${filteredDrivers.length} matching drivers selected`
                : `${checkedDriverIds.size} selected`}
            </span>
          )}
          <Popover open={bulkStatusPopoverOpen} onOpenChange={setBulkStatusPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Change status
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1" align="start">
              <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Set status for {checkedDriverIds.size} drivers
              </p>
              <ul className="flex flex-col gap-0.5">
                {DRIVER_ROSTER_STATUS_OPTIONS.map((status) => (
                  <li key={status}>
                    <button
                      type="button"
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      onClick={() => handleBulkChangeStatus(status)}
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          'whitespace-nowrap px-1.5 py-0 text-xs capitalize',
                          driverRosterStatusClass(status),
                        )}
                      >
                        {formatDriverStatusLabel(status)}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportSelectedCsv}
          >
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
            onClick={() => {
              setCheckedDriverIds(new Set())
              setBulkStatusPopoverOpen(false)
            }}
          >
            Clear selection
          </Button>
        </div>
      ) : null}

      <div
        ref={tableAreaRef}
        className={cn('relative', showPreviewPanel && 'min-h-[min(85vh,640px)]')}
      >
        <TableSurface scrollable className={cn(showPreviewPanel && 'lg:mr-[min(420px,44vw)]')}>
          <Table scrollContainer={false} className="min-w-max text-xs">
          <TableHeader>
            <TableRow className="group border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[40px] px-2">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  className="size-4 shrink-0 rounded border-input accent-primary"
                  aria-label={
                    allFilteredSelected ? 'Clear all selected drivers' : 'Select all drivers on this page'
                  }
                  checked={allPageSelected || allFilteredSelected}
                  onChange={toggleSelectAllHeader}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableHead>
              <DriverTableResizableNameHeader
                column="name"
                label="Name"
                width={nameColumnWidth}
                rules={sortRules}
                onSort={handleSortColumn}
                onResizeStart={startNameColumnResize}
              />
              {effectiveToggleable.map((colId) => (
                <DriverTableSortHeader
                  key={colId}
                  column={colId}
                  label={DRIVER_TABLE_COLUMN_LABELS[colId]}
                  className={DRIVER_TABLE_COLUMN_HEAD_CLASS[colId]}
                  rules={sortRules}
                  onSort={handleSortColumn}
                />
              ))}
              <TableHead className="w-[40px] px-1" aria-label="Open detail" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDrivers.map((driver) => {
              const isDetailSelected = selectedId === driver.id
              const isChecked = checkedDriverIds.has(driver.id)
              return (
                <TableRow
                  key={driver.id}
                  className={cn(
                    'group cursor-pointer border-border transition-colors',
                    isDetailSelected
                      ? 'relative z-10 border-l-4 border-l-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgb(0_127_224/0.12)] hover:bg-primary/10'
                      : isChecked
                        ? 'bg-muted/40 hover:bg-muted/50'
                        : 'hover:bg-primary/5',
                  )}
                  onClick={() => selectDriver(driver.id, 'preview')}
                  aria-selected={isDetailSelected}
                >
                  <TableCell className="w-[40px] px-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="size-4 shrink-0 rounded border-input accent-primary"
                      aria-label={`Select ${driver.name}`}
                      checked={isChecked}
                      onChange={() => toggleDriverChecked(driver.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      NAME_STICKY_CELL_BASE,
                      'px-2 font-medium',
                      isDetailSelected && cn(NAME_BG_DETAIL, 'text-primary'),
                      !isDetailSelected && isChecked && NAME_BG_CHECKED,
                      !isDetailSelected && !isChecked && cn(NAME_BG_DEFAULT, NAME_BG_HOVER),
                    )}
                    style={{
                      width: nameColumnWidth,
                      minWidth: nameColumnWidth,
                      maxWidth: nameColumnWidth,
                    }}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <DriverAvatar name={driver.name} seed={driver.id} />
                      <span className="truncate" title={driver.name}>
                        {driver.name}
                      </span>
                    </span>
                  </TableCell>
                  {effectiveToggleable.map((colId) => renderDriverToggleableCell(driver, colId))}
                  <TableCell className="px-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className={cn(
                        'h-7 w-7',
                        isDetailSelected && 'bg-primary/15 text-primary',
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        selectDriver(driver.id, 'preview')
                      }}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        </TableSurface>

        {showPreviewPanel && selectedRow ? (
          <DriverRowDetailPopover
            driver={selectedRow}
            onClose={() => selectDriver(null)}
            onViewAll={() => selectDriver(selectedRow.id, 'full')}
            onPrevious={() => goToAdjacentDriver(-1)}
            onNext={() => goToAdjacentDriver(1)}
            hasPrevious={selectedNavIndex > 0}
            hasNext={selectedNavIndex >= 0 && selectedNavIndex < filteredDrivers.length - 1}
            positionLabel={driverNavPositionLabel}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {rangeStart}-{rangeEnd} of {filteredDrivers.length} results
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="drivers-page-size" className="text-sm text-muted-foreground">
              Rows per page
            </label>
            <select
              id="drivers-page-size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
            >
              {DRIVERS_PAGE_SIZE_OPTIONS.map((n) => (
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
          <span className="flex items-center px-3 text-sm">
            Page {safePage} of {totalPages}
          </span>
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
