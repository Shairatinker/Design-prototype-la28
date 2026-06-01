import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Download,
  X,
} from 'lucide-react'
import { maintenanceWorkOrdersData, type MaintenanceWorkOrder } from '../data/maintenance-work-orders'
import { maintenanceCompletedData } from '../data/maintenance-completed'
import { maintenanceScheduledData } from '../data/maintenance-scheduled'
import { MaintenanceTableFilters } from './maintenance-table-filters'
import { MaintenanceServiceFilters } from './maintenance-service-filters'
import { MaintenanceServiceTable } from './maintenance-service-table'
import { MaintenanceTableViewPopover } from './maintenance-table-view-popover'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { TableSurface } from './table-surface'
import { FleetSearchBar } from './fleet-search-bar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { cn } from './ui/utils'
import {
  maintenanceDispositionBadgeClass,
  maintenanceDispositionLabel,
  maintenancePriorityBadgeClass,
  maintenancePriorityLabel,
  maintenanceStatusBadgeClass,
  maintenanceStatusLabel,
} from '../lib/maintenance-badge-styles'
import {
  compareMaintenanceRowsWithRules,
  cycleMaintenanceSortRules,
  defaultMaintenanceRowSort,
  type MaintenanceSortColumnId,
  type MaintenanceSortRule,
} from '../lib/maintenance-table-sort'
import {
  MAINTENANCE_TABLE_COLUMN_HEAD_CLASS,
  MAINTENANCE_TABLE_COLUMN_LABELS,
  effectiveMaintenanceToggleableColumns,
  loadMaintenanceTableViewsState,
  saveMaintenanceTableViewsState,
  type MaintenanceTableToggleableColumnId,
  type MaintenanceTableViewsState,
} from '../lib/maintenance-table-views'
import {
  EMPTY_MAINTENANCE_COLUMN_FILTERS,
  formatMaintenanceFilterChipLabel,
  maintenanceMatchesColumnFilters,
  maintenanceMatchesSearch,
  removeMaintenanceFilterValue,
  type MaintenanceColumnFilters,
  type MaintenanceFilterKey,
} from '../lib/maintenance-table-filters'
import { buildCsv, downloadCsv } from '../lib/export-csv'
import {
  clampMaintenanceDepotColumnWidth,
  loadMaintenanceDepotColumnWidth,
  saveMaintenanceDepotColumnWidth,
} from '../lib/maintenance-depot-column-width'
import {
  clampMaintenanceDescriptionColumnWidth,
  loadMaintenanceDescriptionColumnWidth,
  saveMaintenanceDescriptionColumnWidth,
} from '../lib/maintenance-description-column-width'
import {
  compareMaintenanceServiceRowsWithRules,
  cycleMaintenanceServiceSortRules,
  defaultMaintenanceServiceRowSort,
  type MaintenanceServiceSortColumnId,
  type MaintenanceServiceSortRule,
} from '../lib/maintenance-service-sort'
import {
  EMPTY_MAINTENANCE_SERVICE_COLUMN_FILTERS,
  removeMaintenanceServiceFilterValue,
  maintenanceServiceMatchesColumnFilters,
  maintenanceServiceMatchesSearch,
  type MaintenanceServiceColumnFilters,
  type MaintenanceServiceFilterKey,
} from '../lib/maintenance-service-filters'
import {
  completedRowToService,
  scheduledRowToService,
  type MaintenanceServiceRow,
} from '../lib/maintenance-service-rows'

const MAINTENANCE_PAGE_SIZE_OPTIONS = [15, 25, 50, 75] as const
const VEHICLE_STICKY_WIDTH = 100

/** Secondary nav — smaller than Fleet / Vehicles / Drivers / Assignments in App. */
const maintenanceSubTabTriggerClass =
  'flex-none shrink-0 rounded-none border-0 border-b-[1.5px] border-transparent bg-transparent px-2 py-1 text-xs font-normal leading-snug text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-none sm:px-2.5'

const VEHICLE_STICKY_HEAD_CLASS = cn(
  'sticky left-0 z-30 border-r border-border bg-[color-mix(in_srgb,var(--card)_50%,var(--muted)_50%)] shadow-[6px_0_10px_-4px_rgb(0_0_0/0.12)]',
)
const VEHICLE_STICKY_CELL_BASE = cn(
  'sticky left-0 z-20 border-r border-border bg-card shadow-[6px_0_10px_-4px_rgb(0_0_0/0.1)]',
  'group-hover:bg-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)]',
)

type MaintenanceSubTab = 'work-orders' | 'flagged' | 'scheduled' | 'completed'

function rowMatchesSubTab(row: MaintenanceWorkOrder, subTab: MaintenanceSubTab): boolean {
  switch (subTab) {
    case 'work-orders':
      return true
    case 'flagged':
      return row.status === 'triaged'
    case 'scheduled':
    case 'completed':
      return false
  }
}

function MaintenanceTableSortHeaderContent({
  label,
  active,
  dir,
  sortPriority,
}: {
  label: string
  active: boolean
  dir: 'asc' | 'desc' | null
  sortPriority: number | null
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
        ) : (
          <ChevronsUpDown
            className="h-3 w-3 shrink-0 text-muted-foreground/55 transition-colors group-hover:text-muted-foreground"
            aria-hidden
          />
        )}
      </span>
    </>
  )
}

function MaintenanceTableSortHeader({
  column,
  label,
  className,
  rules,
  onSort,
}: {
  column: MaintenanceSortColumnId
  label: string
  className?: string
  rules: MaintenanceSortRule[]
  onSort: (column: MaintenanceSortColumnId, shiftKey: boolean) => void
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
        <MaintenanceTableSortHeaderContent
          label={label}
          active={active}
          dir={dir}
          sortPriority={active && rules.length > 1 ? idx + 1 : null}
        />
      </button>
    </TableHead>
  )
}

function MaintenanceVehicleHeader({
  width,
  rules,
  onSort,
  onResizeStart,
}: {
  width: number
  rules: MaintenanceSortRule[]
  onSort: (column: MaintenanceSortColumnId, shiftKey: boolean) => void
  onResizeStart: (event: React.MouseEvent) => void
}) {
  const idx = rules.findIndex((r) => r.column === 'vehicle')
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null

  return (
    <TableHead
      className={cn('group relative max-w-0 p-0 align-middle', VEHICLE_STICKY_HEAD_CLASS)}
      style={{ width, minWidth: width, maxWidth: width }}
    >
      <button
        type="button"
        className={cn(
          'flex min-h-8 w-full items-center gap-0.5 pr-2.5 text-left text-xs font-medium text-foreground',
          'px-2 py-1.5 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          active && 'text-primary',
        )}
        onClick={(e) => onSort('vehicle', e.shiftKey)}
        title="Sort column. Shift+click to add or adjust secondary sorts."
      >
        <MaintenanceTableSortHeaderContent
          label="Vehicle"
          active={active}
          dir={dir}
          sortPriority={active && rules.length > 1 ? idx + 1 : null}
        />
      </button>
      <button
        type="button"
        aria-label="Resize Vehicle column"
        className={cn(
          'absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize touch-none',
          'border-r-2 border-transparent hover:border-primary/50 group-hover:border-border',
        )}
        onMouseDown={onResizeStart}
        onClick={(e) => e.stopPropagation()}
      />
    </TableHead>
  )
}

function MaintenanceDepotHeader({
  width,
  rules,
  onSort,
  onResizeStart,
}: {
  width: number
  rules: MaintenanceSortRule[]
  onSort: (column: MaintenanceSortColumnId, shiftKey: boolean) => void
  onResizeStart: (event: React.MouseEvent) => void
}) {
  const idx = rules.findIndex((r) => r.column === 'depot')
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null

  return (
    <TableHead className="group relative max-w-0 p-0 align-middle" style={{ width, minWidth: width, maxWidth: width }}>
      <button
        type="button"
        className={cn(
          'flex min-h-8 w-full items-center gap-0.5 pr-2.5 text-left text-xs font-medium text-foreground',
          'px-2 py-1.5 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          active && 'text-primary',
        )}
        onClick={(e) => onSort('depot', e.shiftKey)}
        title="Sort column. Shift+click to add or adjust secondary sorts."
      >
        <MaintenanceTableSortHeaderContent
          label="Depot"
          active={active}
          dir={dir}
          sortPriority={active && rules.length > 1 ? idx + 1 : null}
        />
      </button>
      <button
        type="button"
        aria-label="Resize Depot column"
        className={cn(
          'absolute right-0 top-0 z-10 h-full w-1.5 cursor-col-resize touch-none',
          'border-r-2 border-transparent hover:border-primary/50 group-hover:border-border',
        )}
        onMouseDown={onResizeStart}
        onClick={(e) => e.stopPropagation()}
      />
    </TableHead>
  )
}

function renderMaintenanceCell(row: MaintenanceWorkOrder, colId: MaintenanceTableToggleableColumnId, depotWidth: number): ReactNode {
  switch (colId) {
    case 'depot':
      return (
        <TableCell
          key={colId}
          className="max-w-0 px-2"
          style={{ width: depotWidth, minWidth: depotWidth, maxWidth: depotWidth }}
          title={row.depot}
        >
          <span className="block truncate">{row.depot}</span>
        </TableCell>
      )
    case 'status':
      return (
        <TableCell key={colId} className="px-2">
          <Badge variant="outline" className={cn('whitespace-nowrap px-1.5 py-0 text-xs', maintenanceStatusBadgeClass(row.status))}>
            {maintenanceStatusLabel(row.status)}
          </Badge>
        </TableCell>
      )
    case 'priority':
      return (
        <TableCell key={colId} className="px-2">
          <Badge variant="outline" className={cn('whitespace-nowrap px-1.5 py-0 text-xs', maintenancePriorityBadgeClass(row.priority))}>
            {maintenancePriorityLabel(row.priority)}
          </Badge>
        </TableCell>
      )
    case 'disposition':
      return (
        <TableCell key={colId} className="px-2">
          <Badge variant="outline" className={cn('whitespace-nowrap px-1.5 py-0 text-xs', maintenanceDispositionBadgeClass(row.disposition))}>
            {maintenanceDispositionLabel(row.disposition)}
          </Badge>
        </TableCell>
      )
    case 'created':
      return (
        <TableCell key={colId} className="whitespace-nowrap px-2 tabular-nums text-foreground">
          {row.created}
        </TableCell>
      )
    default:
      return null
  }
}

export function MaintenanceView() {
  const [subTab, setSubTab] = useState<MaintenanceSubTab>('work-orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [columnFilters, setColumnFilters] = useState<MaintenanceColumnFilters>(EMPTY_MAINTENANCE_COLUMN_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(15)
  const [sortRules, setSortRules] = useState<MaintenanceSortRule[]>([{ column: 'created', direction: 'desc' }])
  const [serviceSortRules, setServiceSortRules] = useState<MaintenanceServiceSortRule[]>([
    { column: 'date', direction: 'asc' },
  ])
  const [serviceFilters, setServiceFilters] = useState<MaintenanceServiceColumnFilters>(
    EMPTY_MAINTENANCE_SERVICE_COLUMN_FILTERS,
  )
  const [depotColumnWidth, setDepotColumnWidth] = useState(loadMaintenanceDepotColumnWidth)
  const [descriptionColumnWidth, setDescriptionColumnWidth] = useState(loadMaintenanceDescriptionColumnWidth)
  const [tableViewState, setTableViewState] = useState<MaintenanceTableViewsState>(() => loadMaintenanceTableViewsState())
  const skipTableViewSave = useRef(true)

  const isScheduledTab = subTab === 'scheduled'
  const isCompletedTab = subTab === 'completed'
  const isServiceTab = isScheduledTab || isCompletedTab

  const effectiveToggleable = useMemo(
    () => effectiveMaintenanceToggleableColumns(tableViewState),
    [tableViewState],
  )

  useEffect(() => {
    if (skipTableViewSave.current) {
      skipTableViewSave.current = false
      return
    }
    saveMaintenanceTableViewsState(tableViewState)
  }, [tableViewState])

  useEffect(() => {
    setPage(1)
    if (subTab === 'scheduled') {
      setServiceSortRules([{ column: 'date', direction: 'asc' }])
      setServiceFilters(EMPTY_MAINTENANCE_SERVICE_COLUMN_FILTERS)
    } else if (subTab === 'completed') {
      setServiceSortRules([{ column: 'date', direction: 'desc' }])
      setServiceFilters(EMPTY_MAINTENANCE_SERVICE_COLUMN_FILTERS)
    } else {
      setSortRules([{ column: 'created', direction: 'desc' }])
      setColumnFilters(EMPTY_MAINTENANCE_COLUMN_FILTERS)
    }
  }, [subTab])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, columnFilters, serviceFilters, sortRules, serviceSortRules, pageSize])

  const handleSortColumn = useCallback((column: MaintenanceSortColumnId, shiftKey: boolean) => {
    setSortRules((prev) => cycleMaintenanceSortRules(prev, column, shiftKey))
  }, [])

  const handleServiceSortColumn = useCallback((column: MaintenanceServiceSortColumnId, shiftKey: boolean) => {
    setServiceSortRules((prev) => cycleMaintenanceServiceSortRules(prev, column, shiftKey))
  }, [])

  const serviceSourceRows = useMemo((): MaintenanceServiceRow[] => {
    if (isScheduledTab) return maintenanceScheduledData.map(scheduledRowToService)
    if (isCompletedTab) return maintenanceCompletedData.map(completedRowToService)
    return []
  }, [isScheduledTab, isCompletedTab])

  const startDepotColumnResize = useCallback(
    (event: React.MouseEvent) => {
      const startX = event.clientX
      const startWidth = depotColumnWidth
      let latestWidth = startWidth

      const onMove = (moveEvent: MouseEvent) => {
        latestWidth = clampMaintenanceDepotColumnWidth(startWidth + moveEvent.clientX - startX)
        setDepotColumnWidth(latestWidth)
      }

      const onUp = () => {
        saveMaintenanceDepotColumnWidth(latestWidth)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [depotColumnWidth],
  )

  const startDescriptionColumnResize = useCallback(
    (event: React.MouseEvent) => {
      const startX = event.clientX
      const startWidth = descriptionColumnWidth
      let latestWidth = startWidth

      const onMove = (moveEvent: MouseEvent) => {
        latestWidth = clampMaintenanceDescriptionColumnWidth(startWidth + moveEvent.clientX - startX)
        setDescriptionColumnWidth(latestWidth)
      }

      const onUp = () => {
        saveMaintenanceDescriptionColumnWidth(latestWidth)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [descriptionColumnWidth],
  )

  const filteredWorkOrderRows = useMemo(() => {
    const filtered = maintenanceWorkOrdersData.filter(
      (row) =>
        rowMatchesSubTab(row, subTab) &&
        maintenanceMatchesSearch(row, searchQuery) &&
        maintenanceMatchesColumnFilters(row, columnFilters),
    )
    return [...filtered].sort((a, b) => {
      if (sortRules.length > 0) return compareMaintenanceRowsWithRules(a, b, sortRules)
      return defaultMaintenanceRowSort(a, b)
    })
  }, [subTab, searchQuery, columnFilters, sortRules])

  const filteredServiceRows = useMemo(() => {
    const filtered = serviceSourceRows.filter(
      (row) =>
        maintenanceServiceMatchesSearch(row, searchQuery) &&
        maintenanceServiceMatchesColumnFilters(row, serviceFilters),
    )
    return [...filtered].sort((a, b) => {
      if (serviceSortRules.length > 0) return compareMaintenanceServiceRowsWithRules(a, b, serviceSortRules)
      return defaultMaintenanceServiceRowSort(a, b)
    })
  }, [serviceSourceRows, searchQuery, serviceFilters, serviceSortRules])

  const filteredRows = isServiceTab ? filteredServiceRows : filteredWorkOrderRows

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedWorkOrderRows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredWorkOrderRows.slice(start, start + pageSize)
  }, [filteredWorkOrderRows, safePage, pageSize])

  const paginatedServiceRows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredServiceRows.slice(start, start + pageSize)
  }, [filteredServiceRows, safePage, pageSize])

  const rangeStart = filteredRows.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, filteredRows.length)

  const filterChipEntries = useMemo(() => {
    const entries: { key: MaintenanceFilterKey; value: string }[] = []
    for (const key of Object.keys(columnFilters) as MaintenanceFilterKey[]) {
      for (const value of columnFilters[key]) {
        entries.push({ key, value })
      }
    }
    return entries
  }, [columnFilters])

  const serviceFilterChipEntries = useMemo(() => {
    const entries: { key: MaintenanceServiceFilterKey; value: string }[] = []
    for (const key of Object.keys(serviceFilters) as MaintenanceServiceFilterKey[]) {
      for (const value of serviceFilters[key]) {
        entries.push({ key, value })
      }
    }
    return entries
  }, [serviceFilters])

  function handleExportServiceCsv() {
    const dateHeader = isCompletedTab ? 'Completed date' : 'Scheduled'
    const headers = ['Vehicle', 'Depot', dateHeader, 'Description', 'Type', 'Status']
    const rows = filteredServiceRows.map((row) => [
      row.vehicle,
      row.depot,
      row.date,
      row.description,
      row.type,
      isCompletedTab ? 'Completed' : row.status,
    ])
    const date = new Date().toISOString().slice(0, 10)
    const prefix = isCompletedTab ? 'maintenance-completed' : 'maintenance-scheduled'
    downloadCsv(`${prefix}-export-${date}.csv`, buildCsv(headers, rows))
  }

  function handleExportCsv() {
    const headers = ['Vehicle', ...effectiveToggleable.map((id) => MAINTENANCE_TABLE_COLUMN_LABELS[id])]
    const rows = filteredWorkOrderRows.map((row) => [
      row.vehicle,
      ...effectiveToggleable.map((colId) => {
        switch (colId) {
          case 'depot':
            return row.depot
          case 'status':
            return maintenanceStatusLabel(row.status)
          case 'priority':
            return maintenancePriorityLabel(row.priority)
          case 'disposition':
            return maintenanceDispositionLabel(row.disposition)
          case 'created':
            return row.created
          default:
            return ''
        }
      }),
    ])
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`maintenance-export-${date}.csv`, buildCsv(headers, rows))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Maintenance</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Work orders, flagged vehicles, and shop disposition across the fleet.
          </p>
        </div>
        <Button
          size="sm"
          type="button"
          className="shrink-0"
          style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
        >
          Schedule Maintenance
        </Button>
      </div>

      <Tabs
        value={subTab}
        onValueChange={(v) => {
          if (v === 'work-orders' || v === 'flagged' || v === 'scheduled' || v === 'completed') setSubTab(v)
        }}
        className="w-full gap-0"
      >
        <div className="w-full border-b border-border">
          <TabsList className="h-auto w-fit max-w-full flex-wrap justify-start gap-x-1 rounded-none border-0 bg-transparent p-0">
            <TabsTrigger value="work-orders" className={maintenanceSubTabTriggerClass}>
              Work Orders
            </TabsTrigger>
            <TabsTrigger value="flagged" className={maintenanceSubTabTriggerClass}>
              Flagged Vehicles
            </TabsTrigger>
            <TabsTrigger value="scheduled" className={maintenanceSubTabTriggerClass}>
              Scheduled for Maintenance
            </TabsTrigger>
            <TabsTrigger value="completed" className={maintenanceSubTabTriggerClass}>
              Completed Maintenance
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={subTab} className="mt-3 space-y-4 focus-visible:outline-none">
          <div className="flex flex-wrap items-center gap-2">
            <FleetSearchBar
              compact
              className="min-w-0 w-full flex-1 basis-[min(100%,16rem)] sm:max-w-md"
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={
                isServiceTab
                  ? isCompletedTab
                    ? 'Search completed maintenance by vehicle, description, type...'
                    : 'Search scheduled maintenance by vehicle, description, type...'
                  : 'Search work orders by vehicle, depot, status...'
              }
            />
            {isServiceTab ? (
              <MaintenanceServiceFilters
                variant={isCompletedTab ? 'completed' : 'scheduled'}
                rows={serviceSourceRows}
                filters={serviceFilters}
                onChangeFilters={setServiceFilters}
              />
            ) : (
              <MaintenanceTableFilters
                rows={maintenanceWorkOrdersData}
                filters={columnFilters}
                onChangeFilters={setColumnFilters}
              />
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-2 rounded-lg border-2 px-3"
              onClick={isServiceTab ? handleExportServiceCsv : handleExportCsv}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            {!isServiceTab ? (
              <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
                <span className="shrink-0 text-sm font-semibold text-foreground">View</span>
                <MaintenanceTableViewPopover
                  state={tableViewState}
                  effectiveToggleable={effectiveToggleable}
                  onReplaceState={setTableViewState}
                />
              </div>
            ) : null}
          </div>

          {isServiceTab && serviceFilterChipEntries.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {serviceFilterChipEntries.map(({ key, value }) => (
                <Badge
                  key={`${key}-${value}`}
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/5 py-1 pr-1 pl-2 text-xs font-medium"
                >
                  {key}: {value}
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-primary/15"
                    aria-label={`Remove filter ${value}`}
                    onClick={() => setServiceFilters((f) => removeMaintenanceServiceFilterValue(f, key, value))}
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
                onClick={() => setServiceFilters(EMPTY_MAINTENANCE_SERVICE_COLUMN_FILTERS)}
              >
                Clear all
              </Button>
            </div>
          ) : null}

          {!isServiceTab && filterChipEntries.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {filterChipEntries.map(({ key, value }) => (
                <Badge
                  key={`${key}-${value}`}
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/5 py-1 pr-1 pl-2 text-xs font-medium"
                >
                  {formatMaintenanceFilterChipLabel(key, value)}
                  <button
                    type="button"
                    className="rounded p-0.5 hover:bg-primary/15"
                    aria-label={`Remove filter ${formatMaintenanceFilterChipLabel(key, value)}`}
                    onClick={() => setColumnFilters((f) => removeMaintenanceFilterValue(f, key, value))}
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
                onClick={() => setColumnFilters(EMPTY_MAINTENANCE_COLUMN_FILTERS)}
              >
                Clear all
              </Button>
            </div>
          ) : null}

          {isServiceTab ? (
            <MaintenanceServiceTable
              variant={isCompletedTab ? 'completed' : 'scheduled'}
              rows={paginatedServiceRows}
              sortRules={serviceSortRules}
              onSort={handleServiceSortColumn}
              depotColumnWidth={depotColumnWidth}
              onDepotResizeStart={startDepotColumnResize}
              descriptionColumnWidth={descriptionColumnWidth}
              onDescriptionResizeStart={startDescriptionColumnResize}
            />
          ) : (
            <TableSurface scrollable>
              <Table scrollContainer={false} className="min-w-max text-xs">
                <TableHeader>
                  <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
                    <MaintenanceVehicleHeader
                      width={VEHICLE_STICKY_WIDTH}
                      rules={sortRules}
                      onSort={handleSortColumn}
                      onResizeStart={() => {}}
                    />
                    {effectiveToggleable.map((colId) =>
                      colId === 'depot' ? (
                        <MaintenanceDepotHeader
                          key={colId}
                          width={depotColumnWidth}
                          rules={sortRules}
                          onSort={handleSortColumn}
                          onResizeStart={startDepotColumnResize}
                        />
                      ) : (
                        <MaintenanceTableSortHeader
                          key={colId}
                          column={colId}
                          label={MAINTENANCE_TABLE_COLUMN_LABELS[colId]}
                          className={MAINTENANCE_TABLE_COLUMN_HEAD_CLASS[colId]}
                          rules={sortRules}
                          onSort={handleSortColumn}
                        />
                      ),
                    )}
                    <TableHead className="w-[40px] px-1" aria-label="Open detail" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWorkOrderRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={effectiveToggleable.length + 2}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No work orders match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedWorkOrderRows.map((row) => (
                      <TableRow key={row.id} className="group border-border transition-colors hover:bg-primary/5">
                        <TableCell
                          className={cn(VEHICLE_STICKY_CELL_BASE, 'px-2 font-medium')}
                          style={{
                            width: VEHICLE_STICKY_WIDTH,
                            minWidth: VEHICLE_STICKY_WIDTH,
                            maxWidth: VEHICLE_STICKY_WIDTH,
                          }}
                        >
                          {row.vehicle}
                        </TableCell>
                        {effectiveToggleable.map((colId) => renderMaintenanceCell(row, colId, depotColumnWidth))}
                        <TableCell className="px-1">
                          <Button variant="ghost" size="icon" type="button" className="h-7 w-7" aria-label="View details">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableSurface>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Showing {rangeStart}-{rangeEnd} of {filteredRows.length} results
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="maintenance-page-size" className="text-sm text-muted-foreground">
                  Rows per page
                </label>
                <select
                  id="maintenance-page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  {MAINTENANCE_PAGE_SIZE_OPTIONS.map((n) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
