import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, Filter, X } from 'lucide-react'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { TableSurface } from './table-surface'
import { buildCsv, downloadCsv } from '../lib/export-csv'
import { AlertTableViewPopover } from './alert-table-view-popover'
import {
  effectiveAlertToggleableColumns,
  loadAlertTableViewsState,
  saveAlertTableViewsState,
  type AlertTableToggleableColumnId,
  type AlertTableViewsState,
} from '../lib/alert-table-views'

const PAGE_SIZE = 10

type AlertStatus = 'Active' | 'Acknowledged'

type AlertRow = {
  id: string
  received: string
  view: string
  licensePlate: string
  message: string
  status: AlertStatus
}

function alertStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'border-amber-200 bg-amber-100 text-amber-950'
    case 'Acknowledged':
      return 'border-emerald-200 bg-emerald-100 text-emerald-900'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

function buildAlerts(): AlertRow[] {
  const core: AlertRow[] = [
    {
      id: '1',
      received: 'Apr 30, 09:35 AM',
      view: 'Check engine',
      licensePlate: 'TN42001',
      message: 'Check engine light on',
      status: 'Active',
    },
    {
      id: '2',
      received: 'Apr 30, 07:35 AM',
      view: 'Low fuel',
      licensePlate: 'TN42022',
      message: 'Low fuel—under 15%',
      status: 'Acknowledged',
    },
    {
      id: '3',
      received: 'Apr 30, 09:04 AM',
      view: 'Collision detected',
      licensePlate: 'TN42001',
      message: 'Vehicle left road side',
      status: 'Active',
    },
    {
      id: '4',
      received: 'Apr 29, 04:33 AM',
      view: 'Vibrations',
      licensePlate: 'TN42022',
      message: 'Vibrations detected',
      status: 'Active',
    },
  ]

  const views: Array<[string, string]> = [
    ['GPS offline', 'No GPS signal for 12+ min'],
    ['Odometer jump', 'Unusual odometer delta'],
    ['Battery low', '12V battery below threshold'],
    ['Hard brake', 'Hard braking event logged'],
    ['Speeding', 'Exceeded posted limit'],
    ['Geofence exit', 'Left authorized area'],
    ['Extended idle', 'Engine on, parked 45+ min'],
    ['Oil change due', 'Oil change due in 500 mi'],
    ['Coolant temp', 'Coolant temperature elevated'],
    ['ABS fault', 'ABS diagnostic code present'],
    ['Lane assist', 'Lane assist temporarily disabled'],
    ['Tire rotation', 'Tire rotation recommended'],
    ['Brake pads', 'Brake pad wear at 20%'],
    ['DEF low', 'DEF fluid below 25%'],
    ['AdBlue', 'AdBlue refill window'],
    ['Door ajar', 'Driver door open while moving'],
    ['HVAC fault', 'Climate system diagnostic'],
    ['Charging fault', 'EV charge session interrupted'],
    ['Regen limited', 'Regenerative braking limited'],
    ['Maintenance', 'Scheduled maintenance window'],
  ]

  for (let i = 0; i < 20; i++) {
    const [v, m] = views[i % views.length]!
    const hour = ((7 + (i % 12)) % 12) + 1
    const minute = (i * 7) % 60
    const ampm = i % 2 === 0 ? 'AM' : 'PM'
    const day = 29 - (i % 5)
    core.push({
      id: `gen-${i}`,
      received: `Apr ${day}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`,
      view: v,
      licensePlate: `TN${42000 + (i % 16)}`,
      message: m,
      status: i % 4 === 0 ? 'Acknowledged' : 'Active',
    })
  }

  return core
}

const allAlerts = buildAlerts()

const ALL_STATUSES: AlertStatus[] = ['Active', 'Acknowledged']

export function AlertsTable({ searchQuery = '' }: { searchQuery?: string }) {
  const [page, setPage] = useState(1)
  const [statusFilters, setStatusFilters] = useState<Set<AlertStatus>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const selectAllRef = useRef<HTMLInputElement>(null)
  const [tableViewState, setTableViewState] = useState<AlertTableViewsState>(() => loadAlertTableViewsState())
  const skipViewSave = useRef(true)

  useEffect(() => {
    if (skipViewSave.current) { skipViewSave.current = false; return }
    saveAlertTableViewsState(tableViewState)
  }, [tableViewState])

  const effectiveColumns = useMemo(() => effectiveAlertToggleableColumns(tableViewState), [tableViewState])

  const filteredAlerts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allAlerts.filter((a) => {
      if (statusFilters.size > 0 && !statusFilters.has(a.status)) return false
      if (!q) return true
      return `${a.view} ${a.licensePlate} ${a.message} ${a.status}`.toLowerCase().includes(q)
    })
  }, [searchQuery, statusFilters])

  useEffect(() => { setPage(1) }, [searchQuery, statusFilters])
  useEffect(() => { setCheckedIds(new Set()) }, [searchQuery, statusFilters])

  const total = filteredAlerts.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredAlerts.slice(start, start + PAGE_SIZE)
  }, [safePage, filteredAlerts])

  const pageIds = useMemo(() => pageRows.map((a) => a.id), [pageRows])
  const filteredIds = useMemo(() => filteredAlerts.map((a) => a.id), [filteredAlerts])
  const selectedOnPage = pageIds.filter((id) => checkedIds.has(id)).length
  const allPageSelected = pageIds.length > 0 && selectedOnPage === pageIds.length
  const somePageSelected = selectedOnPage > 0 && !allPageSelected
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => checkedIds.has(id))
  const showSelectAllBanner = allPageSelected && !allFilteredSelected && filteredAlerts.length > pageIds.length

  useEffect(() => {
    const el = selectAllRef.current
    if (!el) return
    el.indeterminate = somePageSelected || (checkedIds.size > 0 && !allFilteredSelected && !allPageSelected)
    el.checked = allPageSelected || allFilteredSelected
  }, [allPageSelected, allFilteredSelected, somePageSelected, checkedIds.size])

  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, total)

  function toggleChecked(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleSelectAllHeader() {
    if (allFilteredSelected) { setCheckedIds(new Set()); return }
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (allPageSelected) { for (const id of pageIds) next.delete(id) }
      else { for (const id of pageIds) next.add(id) }
      return next
    })
  }

  function handleAcknowledgeSelected() {
    setCheckedIds(new Set())
  }

  function handleExportSelected() {
    const rows = allAlerts.filter((a) => checkedIds.has(a.id))
    if (rows.length === 0) return
    const headers = ['Triggered', 'View', 'License Plate', 'Message', 'Status']
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(
      `alerts-selected-${rows.length}-${date}.csv`,
      buildCsv(headers, rows.map((a) => [a.received, a.view, a.licensePlate, a.message, a.status])),
    )
  }

  function handleExportAll() {
    const headers = ['Triggered', 'View', 'License Plate', 'Message', 'Status']
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(
      `alerts-export-${date}.csv`,
      buildCsv(headers, filteredAlerts.map((a) => [a.received, a.view, a.licensePlate, a.message, a.status])),
    )
  }

  function toggleStatusFilter(status: AlertStatus) {
    setStatusFilters((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status); else next.add(status)
      return next
    })
  }

  const activeFilterCount = statusFilters.size

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex-1 text-base font-semibold text-foreground">Alerts</h2>
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-2 px-3">
              <Filter className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1" align="end">
            <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </p>
            <ul className="flex flex-col gap-0.5">
              {ALL_STATUSES.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                    onClick={() => toggleStatusFilter(s)}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={statusFilters.has(s)}
                      className="size-3.5 rounded accent-primary"
                    />
                    <Badge variant="outline" className={`text-xs font-medium ${alertStatusBadgeClass(s)}`}>
                      {s}
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
          className="h-9 gap-2 rounded-lg border-2 px-3"
          onClick={handleExportAll}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-sm font-semibold text-foreground">View</span>
          <AlertTableViewPopover
            state={tableViewState}
            effectiveToggleable={effectiveColumns}
            onReplaceState={setTableViewState}
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {Array.from(statusFilters).map((s) => (
            <Badge
              key={s}
              variant="outline"
              className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/5 py-1 pr-1 pl-2 text-xs font-medium"
            >
              Status: {s}
              <button
                type="button"
                className="rounded p-0.5 hover:bg-primary/15"
                aria-label={`Remove filter ${s}`}
                onClick={() => toggleStatusFilter(s)}
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
            onClick={() => setStatusFilters(new Set())}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Bulk action bar */}
      {checkedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
          {showSelectAllBanner ? (
            <span className="text-sm text-foreground">
              All {pageIds.length} alerts on this page are selected.{' '}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-sm font-medium text-primary"
                onClick={() => setCheckedIds(new Set(filteredIds))}
              >
                Select all {filteredAlerts.length} alerts
              </Button>
            </span>
          ) : (
            <span className="text-sm font-medium text-foreground">
              {allFilteredSelected
                ? `All ${filteredAlerts.length} matching alerts selected`
                : `${checkedIds.size} selected`}
            </span>
          )}
          <Button type="button" variant="outline" size="sm" onClick={handleAcknowledgeSelected}>
            Acknowledge
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleExportSelected}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-1 text-sm text-primary"
            onClick={() => setCheckedIds(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <TableSurface scrollable>
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[40px] px-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="size-4 rounded border-input accent-primary"
                  aria-label="Select all alerts on this page"
                  onChange={toggleSelectAllHeader}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableHead>
              <TableHead className="px-2">Triggered</TableHead>
              {effectiveColumns.includes('view') && <TableHead className="px-2">View</TableHead>}
              {effectiveColumns.includes('licensePlate') && <TableHead className="px-2">License Plate</TableHead>}
              {effectiveColumns.includes('message') && <TableHead className="px-2">Message</TableHead>}
              {effectiveColumns.includes('status') && <TableHead className="px-2">Status</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((alert) => {
              const isChecked = checkedIds.has(alert.id)
              return (
                <TableRow
                  key={alert.id}
                  className={`border-border transition-colors ${isChecked ? 'bg-muted/40 hover:bg-muted/50' : 'hover:bg-primary/5'}`}
                >
                  <TableCell className="w-[40px] px-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input accent-primary"
                      aria-label={`Select alert ${alert.id}`}
                      checked={isChecked}
                      onChange={() => toggleChecked(alert.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="px-2 tabular-nums">{alert.received}</TableCell>
                  {effectiveColumns.includes('view') && (
                    <TableCell className="px-2 font-medium">{alert.view}</TableCell>
                  )}
                  {effectiveColumns.includes('licensePlate') && (
                    <TableCell className="px-2 tabular-nums">{alert.licensePlate}</TableCell>
                  )}
                  {effectiveColumns.includes('message') && (
                    <TableCell className="px-2 text-muted-foreground">{alert.message}</TableCell>
                  )}
                  {effectiveColumns.includes('status') && (
                    <TableCell className="px-2">
                      <Badge
                        variant="outline"
                        className={`whitespace-nowrap text-xs font-medium ${alertStatusBadgeClass(alert.status)}`}
                      >
                        {alert.status}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableSurface>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0 ? 'Showing 0 alerts' : `Showing ${rangeStart}–${rangeEnd} of ${total} alerts`}
        </p>
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
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </span>
          <Button
            size="sm"
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
