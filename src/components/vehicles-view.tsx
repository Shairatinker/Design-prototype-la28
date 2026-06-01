import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown, Download, X } from 'lucide-react'
import { AddVehicleDialog, type NewVehicleForm } from './add-vehicle-dialog'
import { VehicleTableViewPopover } from './vehicle-table-view-popover'
import { VehicleTableFilters } from './vehicle-table-filters'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { VehicleRowDetailPopover } from './vehicle-row-detail-popover'
import { VehicleDetail } from './vehicle-detail'
import { VehicleTagsCell } from './vehicle-tags-cell'
import { TableSurface } from './table-surface'
import { capitalizeFirstLetter, cn } from './ui/utils'
import {
  VEHICLE_FLEET_STATUS_OPTIONS,
  vehicleFleetStatusClass,
  vehicleMaintenanceClass,
} from '../lib/status-badge-styles'
import {
  compareVehicleRowsWithRules,
  cycleSortRules,
  defaultVehicleRowSort,
  type VehicleSortColumnId,
  type VehicleSortRule,
} from '../lib/vehicle-table-sort'
import {
  VEHICLE_TABLE_COLUMN_HEAD_CLASS,
  VEHICLE_TABLE_COLUMN_LABELS,
  effectiveToggleableColumns,
  loadVehicleTableViewsState,
  saveVehicleTableViewsState,
  type VehicleTableToggleableColumnId,
  type VehicleTableViewsState,
} from '../lib/vehicle-table-views'
import {
  EMPTY_VEHICLE_COLUMN_FILTERS,
  formatFilterChipLabel,
  getVehicleDepot,
  removeFilterValue,
  vehicleMatchesColumnFilters,
  vehicleMatchesSearch,
  type VehicleColumnFilters,
  type VehicleFilterKey,
} from '../lib/vehicle-table-filters'
import { buildCsv, downloadCsv } from '../lib/export-csv'
import {
  clampDepotColumnWidth,
  loadDepotColumnWidth,
  saveDepotColumnWidth,
} from '../lib/depot-column-width'
import {
  clampVehicleColumnWidth,
  loadVehicleColumnWidth,
  saveVehicleColumnWidth,
} from '../lib/vehicle-column-width'
import { FleetSearchBar } from './fleet-search-bar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { resolveVehicleTags } from '../lib/vehicle-tags'

const PLATE_STICKY_WIDTH_CLASS = 'min-w-[70px] w-[70px] max-w-[70px]'
/** Opaque mixes that match row translucent backgrounds (blocks scroll bleed-through). */
const PLATE_BG_DEFAULT = 'bg-card'
const PLATE_BG_HOVER = 'group-hover:bg-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)]'
const PLATE_BG_CHECKED =
  'bg-[color-mix(in_srgb,var(--card)_60%,var(--muted)_40%)] group-hover:bg-[color-mix(in_srgb,var(--card)_50%,var(--muted)_50%)]'
const PLATE_BG_DETAIL =
  'bg-[color-mix(in_srgb,var(--card)_90%,var(--primary)_10%)] group-hover:bg-[color-mix(in_srgb,var(--card)_90%,var(--primary)_10%)]'

const PLATE_STICKY_HEAD_CLASS = cn(
  PLATE_STICKY_WIDTH_CLASS,
  'sticky left-0 z-30 border-r border-border bg-[color-mix(in_srgb,var(--card)_50%,var(--muted)_50%)] shadow-[6px_0_10px_-4px_rgb(0_0_0/0.12)]',
)
const PLATE_STICKY_CELL_BASE = cn(
  PLATE_STICKY_WIDTH_CLASS,
  'sticky left-0 z-20 border-r border-border shadow-[6px_0_10px_-4px_rgb(0_0_0/0.1)]',
)

const DOWNTOWN_LA_LOCATION =
  'Downtown LA Depot (Electrification Hub, 1200 S Figueroa Street, Los Angeles CA 90015)'

const EL_SEGUNDO_LOCATION =
  'El Segundo Depot (TNADOE01 South Terminal, 200 Continental Blvd, El Segundo CA 90245)'

const VEHICLES_PAGE_SIZE_OPTIONS = [15, 25, 50, 75] as const
const VEHICLES_TARGET_COUNT = 135

const LEGACY_LAST_UPDATED_TO_DATE: Record<string, string> = {
  'Unlinked Vehicle': '2025/08/14',
  'Collision reported': '2026/05/10',
  'Minor incident': '2026/04/22',
}

function formatYmd(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

function resolveLastUpdated(row: { plate: string; lastUpdated: string }): string {
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(row.lastUpdated)) return row.lastUpdated
  const mapped = LEGACY_LAST_UPDATED_TO_DATE[row.lastUpdated]
  if (mapped) return mapped
  const num = parseInt(row.plate.replace(/\D/g, ''), 10) || 0
  const d = new Date(2025, 6, 1)
  d.setDate(d.getDate() + (num % 240))
  return formatYmd(d)
}

function demoMileage(plate: string, index: number): number {
  const num = parseInt(plate.replace(/\D/g, ''), 10) || index
  return 8200 + (num % 500) * 193
}

function formatMileage(mileage: number): string {
  return mileage.toLocaleString('en-US')
}

/** First 15 rows (page 1): every fleet status + maintenance badge variant. */
const vehiclesPageOneShowcase = [
  {
    id: 'TN42000',
    plate: 'TN42000',
    vehicle: '2025 Honda Prologue',
    type: 'EV',
    status: 'Onboarding',
    currentUse: 'Fleet Pool',
    tags: ['Fleet Pool'],
    driver: 'No Driver Assigned',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'None',
    maintenance: 'Active',
  },
  {
    id: 'TN42001',
    plate: 'TN42001',
    vehicle: '2024 Honda Accord',
    type: 'ICE',
    status: 'Available',
    currentUse: 'Taxi',
    tags: ['Taxi', 'Rate Card'],
    driver: 'Reginald Martinez',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'None',
    maintenance: 'Active',
  },
  {
    id: 'TN42002',
    plate: 'TN42002',
    vehicle: '2023 Honda Accord',
    type: 'ICE',
    status: 'In Service',
    currentUse: 'Fleet Pool',
    tags: ['Taxi', 'Rate Card'],
    driver: 'Maria Garcia',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'None',
    maintenance: 'scheduled',
  },
  {
    id: 'TN42003',
    plate: 'TN42003',
    vehicle: '2023 Honda Accord',
    type: 'ICE',
    status: 'Maintenance',
    currentUse: 'Taxi',
    tags: ['Taxi', 'Rate Card'],
    driver: 'No Driver Assigned',
    location: 'Inglewood Depot CJAL...',
    lastUpdated: 'None',
    maintenance: 'scheduled',
  },
  {
    id: 'TN42004',
    plate: 'TN42004',
    vehicle: '2024 Honda Accord',
    type: 'ICE',
    status: 'Inactive',
    currentUse: 'Taxi',
    tags: ['Taxi', 'Rate Card'],
    driver: 'Lehane Chan',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'Unlinked Vehicle',
    maintenance: 'None',
  },
  {
    id: 'TN42005',
    plate: 'TN42005',
    vehicle: '2023 Honda Civic',
    type: 'ICE',
    status: 'Out of Service',
    currentUse: 'Allocated Vehicle',
    tags: ['Rate Card', 'Allocated Vehicle'],
    driver: 'Ana Rodriguez',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'None',
    maintenance: 'None',
  },
  {
    id: 'TN42006',
    plate: 'TN42006',
    vehicle: '2024 Honda Accord',
    type: 'ICE',
    status: 'Incident',
    currentUse: 'Taxi',
    tags: ['Allocated Vehicle', 'Taxi'],
    driver: 'Susan Harrison',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'Collision reported',
    maintenance: 'None',
  },
  {
    id: 'TN42007',
    plate: 'TN42007',
    vehicle: '2024 Honda Accord',
    type: 'ICE',
    status: 'Available',
    currentUse: 'Available',
    tags: ['Taxi'],
    driver: 'No Driver Assigned',
    location: EL_SEGUNDO_LOCATION,
    lastUpdated: 'None',
    maintenance: 'Active',
  },
  {
    id: 'TN42008',
    plate: 'TN42008',
    vehicle: '2023 Toyota Camry',
    type: 'ICE',
    status: 'In Service',
    currentUse: 'Taxi',
    tags: ['Fleet Pool'],
    driver: 'John Smith',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'None',
    maintenance: 'scheduled',
  },
  {
    id: 'TN42009',
    plate: 'TN42009',
    vehicle: '2024 Tesla Model 3',
    type: 'EV',
    status: 'Onboarding',
    currentUse: 'Allocated Vehicle',
    tags: ['Rate Card', 'Fleet Pool'],
    driver: 'Sarah Johnson',
    location: 'Santa Monica Depot...',
    lastUpdated: 'None',
    maintenance: 'Active',
  },
  {
    id: 'TN42010',
    plate: 'TN42010',
    vehicle: '2023 Ford F-150',
    type: 'ICE',
    status: 'Maintenance',
    currentUse: 'Fleet Pool',
    tags: ['Fleet Pool', 'Taxi', 'Rate Card'],
    driver: 'Michael Brown',
    location: 'Inglewood Depot CJAL...',
    lastUpdated: 'None',
    maintenance: 'scheduled',
  },
  {
    id: 'TN42011',
    plate: 'TN42011',
    vehicle: '2024 Honda Accord',
    type: 'ICE',
    status: 'Inactive',
    currentUse: 'Taxi',
    tags: ['Taxi', 'Rate Card'],
    driver: 'No Driver Assigned',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'None',
    maintenance: 'None',
  },
  {
    id: 'TN42012',
    plate: 'TN42012',
    vehicle: '2023 Nissan Altima',
    type: 'ICE',
    status: 'Out of Service',
    currentUse: 'Taxi',
    tags: ['Fleet Pool'],
    driver: 'David Lee',
    location: EL_SEGUNDO_LOCATION,
    lastUpdated: 'None',
    maintenance: 'None',
  },
  {
    id: 'TN42013',
    plate: 'TN42013',
    vehicle: '2024 Chevrolet Malibu',
    type: 'ICE',
    status: 'Incident',
    currentUse: 'Allocated Vehicle',
    tags: ['Taxi', 'Rate Card'],
    driver: 'Jennifer Davis',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'Minor incident',
    maintenance: 'Active',
  },
  {
    id: 'TN42014',
    plate: 'TN42014',
    vehicle: '2023 Honda Civic',
    type: 'ICE',
    status: 'Available',
    currentUse: 'Taxi',
    tags: ['Fleet Pool'],
    driver: 'Robert Wilson',
    location: 'Inglewood Depot CJAL...',
    lastUpdated: 'None',
    maintenance: 'scheduled',
  },
]

const vehiclesSeed = [
  ...vehiclesPageOneShowcase,
  {
    id: 'TN42015',
    plate: 'TN42015',
    vehicle: '2024 Toyota Corolla',
    type: 'ICE',
    status: 'Maintenance',
    currentUse: 'Fleet Pool',
    tags: ['Taxi', 'Rate Card'],
    driver: 'No Driver Assigned',
    location: DOWNTOWN_LA_LOCATION,
    lastUpdated: 'None',
    maintenance: 'scheduled',
  },
  {
    id: 'TN42016',
    plate: 'TN42016',
    vehicle: '2024 Honda Civic',
    type: 'ICE',
    status: 'Available',
    currentUse: 'Taxi',
    tags: ['Fleet Pool'],
    driver: 'James Chen',
    location: 'Santa Monica Depot',
    lastUpdated: 'None',
    maintenance: 'Active',
  },
  {
    id: 'TN42017',
    plate: 'TN42017',
    vehicle: '2025 Honda Prologue',
    type: 'EV',
    status: 'Onboarding',
    currentUse: 'Fleet Pool',
    tags: ['Fleet Pool'],
    driver: 'No Driver Assigned',
    location: 'El Segundo Depot (Maintenance Bay 4, 180 Continental Blvd, El Segundo CA 90245)',
    lastUpdated: 'None',
    maintenance: 'scheduled',
  },
]

type VehicleSeedRow = (typeof vehiclesSeed)[number]
type VehicleRow = VehicleSeedRow & { mileage: number }

function enrichVehicleRow(v: VehicleSeedRow, index: number): VehicleRow {
  return {
    ...v,
    tags: resolveVehicleTags(v.tags, index),
    lastUpdated: resolveLastUpdated(v),
    mileage: demoMileage(v.plate, index),
  }
}

function buildFleetVehicles(): VehicleRow[] {
  const rows: VehicleRow[] = vehiclesSeed.map((v, i) => enrichVehicleRow(v, i))
  for (let i = vehiclesSeed.length; i < VEHICLES_TARGET_COUNT; i++) {
    const base = vehiclesSeed[i % vehiclesSeed.length]!
    const plate = `TN${42000 + i}`
    rows.push(
      enrichVehicleRow(
        {
          ...base,
          id: plate,
          plate,
        },
        i,
      ),
    )
  }
  return rows
}

const vehiclesData = buildFleetVehicles()

function getVehicleExportCell(row: VehicleRow, colId: VehicleTableToggleableColumnId): string {
  switch (colId) {
    case 'vehicle':
      return row.vehicle
    case 'type':
      return row.type
    case 'status':
      return row.status
    case 'currentUse':
      return row.currentUse
    case 'tags':
      return row.tags.map((t) => t.replace(/ X$/, '')).join(', ')
    case 'driver':
      return row.driver
    case 'location':
      return getVehicleDepot(row)
    case 'lastUpdated':
      return row.lastUpdated
    case 'mileage':
      return formatMileage(row.mileage)
    case 'maintenance':
      return capitalizeFirstLetter(row.maintenance)
    default:
      return ''
  }
}

function rowFromNewVehicleForm(f: NewVehicleForm): VehicleRow {
  const vehicleLabel = [f.year, f.make, f.model].filter(Boolean).join(' ') || 'New vehicle'
  return {
    id: f.plate,
    plate: f.plate,
    vehicle: vehicleLabel,
    type: f.type,
    status: 'Onboarding',
    currentUse: 'Fleet Pool',
    tags: ['Fleet Pool'],
    driver: 'No Driver Assigned',
    location: f.depot,
    lastUpdated: formatYmd(new Date()),
    mileage: 0,
    maintenance: 'Active',
  }
}

function renderVehicleToggleableCell(
  vehicle: VehicleRow,
  colId: VehicleTableToggleableColumnId,
  columnWidths: { vehicle: number; depot: number },
): ReactNode {
  switch (colId) {
    case 'vehicle':
      return (
        <TableCell
          key={colId}
          className="max-w-0 px-2"
          style={{
            width: columnWidths.vehicle,
            minWidth: columnWidths.vehicle,
            maxWidth: columnWidths.vehicle,
          }}
        >
          <span className="block min-w-0 truncate" title={vehicle.vehicle}>
            {vehicle.vehicle}
          </span>
        </TableCell>
      )
    case 'type':
      return (
        <TableCell key={colId} className="px-1">
          {vehicle.type}
        </TableCell>
      )
    case 'status':
      return (
        <TableCell key={colId} className="px-2">
          <Badge
            variant="outline"
            className={`whitespace-nowrap px-1.5 py-0 text-xs ${vehicleFleetStatusClass(vehicle.status)}`}
          >
            {vehicle.status}
          </Badge>
        </TableCell>
      )
    case 'currentUse':
      return (
        <TableCell key={colId} className="truncate px-2">
          {vehicle.currentUse}
        </TableCell>
      )
    case 'tags':
      return (
        <TableCell key={colId} className="px-2">
          <VehicleTagsCell tags={vehicle.tags} />
        </TableCell>
      )
    case 'driver':
      return (
        <TableCell key={colId} className="max-w-0 px-2">
          <span className="block min-w-0 truncate" title={vehicle.driver}>
            {vehicle.driver}
          </span>
        </TableCell>
      )
    case 'location': {
      const fullLocation = vehicle.location
      return (
        <TableCell
          key={colId}
          className="max-w-0 px-2"
          style={{
            width: columnWidths.depot,
            minWidth: columnWidths.depot,
            maxWidth: columnWidths.depot,
          }}
        >
          <span className="block min-w-0 truncate" title={fullLocation}>
            {fullLocation}
          </span>
        </TableCell>
      )
    }
    case 'lastUpdated':
      return (
        <TableCell key={colId} className="whitespace-nowrap px-2 tabular-nums">
          {vehicle.lastUpdated}
        </TableCell>
      )
    case 'mileage':
      return (
        <TableCell key={colId} className="whitespace-nowrap px-2 text-left tabular-nums">
          {formatMileage(vehicle.mileage)}
        </TableCell>
      )
    case 'maintenance':
      return (
        <TableCell key={colId} className="px-2">
          <Badge
            variant="outline"
            className={`whitespace-nowrap px-1.5 py-0 text-xs ${vehicleMaintenanceClass(vehicle.maintenance)}`}
          >
            {capitalizeFirstLetter(vehicle.maintenance)}
          </Badge>
        </TableCell>
      )
    default:
      return null
  }
}

function VehicleTableSortHeaderContent({
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

function VehicleTableSortHeader({
  column,
  label,
  className,
  rules,
  onSort,
}: {
  column: VehicleSortColumnId
  label: string
  className?: string
  rules: VehicleSortRule[]
  onSort: (column: VehicleSortColumnId, shiftKey: boolean) => void
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
        <VehicleTableSortHeaderContent
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

function VehicleTableResizableColumnHeader({
  column,
  label,
  width,
  rules,
  onSort,
  onResizeStart,
  resizeAriaLabel,
}: {
  column: VehicleSortColumnId
  label: string
  width: number
  rules: VehicleSortRule[]
  onSort: (column: VehicleSortColumnId, shiftKey: boolean) => void
  onResizeStart: (event: React.MouseEvent) => void
  resizeAriaLabel: string
}) {
  const idx = rules.findIndex((r) => r.column === column)
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null

  return (
    <TableHead
      className="group relative max-w-0 p-0 align-middle"
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
        <VehicleTableSortHeaderContent
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
        aria-label={resizeAriaLabel}
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

export function VehiclesView() {
  const [searchQuery, setSearchQuery] = useState('')
  /** User-added rows only; seed rows always come from `vehiclesData` so new demo data shows without a full reload. */
  const [addedVehicleRows, setAddedVehicleRows] = useState<VehicleRow[]>([])
  const [vehicleOverrides, setVehicleOverrides] = useState<Record<string, Partial<VehicleRow>>>({})
  const [checkedVehicleIds, setCheckedVehicleIds] = useState<Set<string>>(() => new Set())
  const [bulkStatusPopoverOpen, setBulkStatusPopoverOpen] = useState(false)
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null)
  const vehicleRows = useMemo(() => {
    const base = [...vehiclesData.map((v) => ({ ...v })), ...addedVehicleRows]
    return base.map((v) => (vehicleOverrides[v.id] ? { ...v, ...vehicleOverrides[v.id] } : v))
  }, [addedVehicleRows, vehicleOverrides])
  const [addVehicleOpen, setAddVehicleOpen] = useState(false)
  const [columnFilters, setColumnFilters] = useState<VehicleColumnFilters>(EMPTY_VEHICLE_COLUMN_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(15)
  function readVehicleFromLocation(): string | null {
    if (typeof window === 'undefined') return null
    const hash = window.location.hash.slice(1)
    if (hash) {
      const v = new URLSearchParams(hash).get('vehicle')
      if (v) return v
    }
    return new URLSearchParams(window.location.search).get('vehicle')
  }

  function readVehicleViewFromLocation(): 'preview' | 'full' {
    if (typeof window === 'undefined') return 'preview'
    const hash = window.location.hash.slice(1)
    const fromHash = hash ? new URLSearchParams(hash).get('vehicleView') : null
    const fromSearch = new URLSearchParams(window.location.search).get('vehicleView')
    const raw = fromHash ?? fromSearch
    return raw === 'full' ? 'full' : 'preview'
  }

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(readVehicleFromLocation)
  const [vehicleDetailView, setVehicleDetailView] = useState<'preview' | 'full'>(() =>
    readVehicleFromLocation() && readVehicleViewFromLocation() === 'full' ? 'full' : 'preview',
  )

  const syncVehicleLocation = useCallback((vehicleId: string | null, view: 'preview' | 'full' | null) => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (vehicleId) {
      url.searchParams.set('tab', 'Vehicles')
      url.searchParams.set('vehicle', vehicleId)
      if (view === 'full') url.searchParams.set('vehicleView', 'full')
      else url.searchParams.delete('vehicleView')
    } else {
      url.searchParams.delete('vehicle')
      url.searchParams.delete('vehicleView')
    }
    if (url.hash.includes('figmacapture')) {
      const hp = new URLSearchParams(url.hash.slice(1))
      if (vehicleId) {
        hp.set('tab', 'Vehicles')
        hp.set('vehicle', vehicleId)
        if (view === 'full') hp.set('vehicleView', 'full')
        else hp.delete('vehicleView')
      } else {
        hp.delete('vehicle')
        hp.delete('vehicleView')
      }
      window.history.replaceState(null, '', `${url.pathname}${url.search}#${hp.toString()}`)
    } else {
      url.hash = ''
      window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    }
  }, [])

  const selectVehicle = useCallback(
    (vehicleId: string | null, view: 'preview' | 'full' | null = 'preview') => {
      setSelectedVehicle(vehicleId)
      if (!vehicleId) {
        setVehicleDetailView('preview')
        syncVehicleLocation(null, null)
        return
      }
      setVehicleDetailView(view === 'full' ? 'full' : 'preview')
      syncVehicleLocation(vehicleId, view === 'full' ? 'full' : 'preview')
    },
    [syncVehicleLocation],
  )

  const [tableViewState, setTableViewState] = useState<VehicleTableViewsState>(() => loadVehicleTableViewsState())
  const skipTableViewSave = useRef(true)
  const [sortRules, setSortRules] = useState<VehicleSortRule[]>([])
  const [depotColumnWidth, setDepotColumnWidth] = useState(loadDepotColumnWidth)
  const [vehicleColumnWidth, setVehicleColumnWidth] = useState(loadVehicleColumnWidth)
  const tableAreaRef = useRef<HTMLDivElement>(null)

  const startDepotColumnResize = useCallback((event: React.MouseEvent) => {
    const startX = event.clientX
    const startWidth = depotColumnWidth
    let latestWidth = startWidth

    const onMove = (moveEvent: MouseEvent) => {
      latestWidth = clampDepotColumnWidth(startWidth + moveEvent.clientX - startX)
      setDepotColumnWidth(latestWidth)
    }

    const onUp = () => {
      saveDepotColumnWidth(latestWidth)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [depotColumnWidth])

  const startVehicleColumnResize = useCallback((event: React.MouseEvent) => {
    const startX = event.clientX
    const startWidth = vehicleColumnWidth
    let latestWidth = startWidth

    const onMove = (moveEvent: MouseEvent) => {
      latestWidth = clampVehicleColumnWidth(startWidth + moveEvent.clientX - startX)
      setVehicleColumnWidth(latestWidth)
    }

    const onUp = () => {
      saveVehicleColumnWidth(latestWidth)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [vehicleColumnWidth])

  const tableColumnWidths = useMemo(
    () => ({ vehicle: vehicleColumnWidth, depot: depotColumnWidth }),
    [vehicleColumnWidth, depotColumnWidth],
  )

  useEffect(() => {
    if (skipTableViewSave.current) {
      skipTableViewSave.current = false
      return
    }
    saveVehicleTableViewsState(tableViewState)
  }, [tableViewState])

  const effectiveToggleable = useMemo(
    () => effectiveToggleableColumns(tableViewState),
    [tableViewState],
  )

  useEffect(() => {
    setPage(1)
  }, [searchQuery, columnFilters, sortRules, pageSize])

  useEffect(() => {
    setCheckedVehicleIds(new Set())
    setBulkStatusPopoverOpen(false)
  }, [searchQuery, columnFilters])

  const handleSortColumn = (column: VehicleSortColumnId, shiftKey: boolean) => {
    setSortRules((prev) => cycleSortRules(prev, column, shiftKey))
  }

  const filteredVehicles = useMemo(() => {
    const filtered = vehicleRows.filter(
      (vehicle) =>
        vehicleMatchesSearch(vehicle, searchQuery) && vehicleMatchesColumnFilters(vehicle, columnFilters),
    )
    return [...filtered].sort((a, b) => {
      if (sortRules.length > 0) return compareVehicleRowsWithRules(a, b, sortRules)
      return defaultVehicleRowSort(a, b)
    })
  }, [vehicleRows, searchQuery, columnFilters, sortRules])

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paginatedVehicles = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredVehicles.slice(start, start + pageSize)
  }, [filteredVehicles, safePage, pageSize])

  const pageVehicleIds = useMemo(() => paginatedVehicles.map((v) => v.id), [paginatedVehicles])
  const filteredVehicleIds = useMemo(() => filteredVehicles.map((v) => v.id), [filteredVehicles])
  const selectedOnPageCount = useMemo(
    () => pageVehicleIds.filter((id) => checkedVehicleIds.has(id)).length,
    [pageVehicleIds, checkedVehicleIds],
  )
  const allPageSelected = pageVehicleIds.length > 0 && selectedOnPageCount === pageVehicleIds.length
  const somePageSelected = selectedOnPageCount > 0 && !allPageSelected
  const allFilteredSelected =
    filteredVehicleIds.length > 0 &&
    filteredVehicleIds.every((id) => checkedVehicleIds.has(id))
  const showSelectAllFilteredBanner =
    allPageSelected &&
    !allFilteredSelected &&
    filteredVehicles.length > pageVehicleIds.length

  useEffect(() => {
    const el = selectAllCheckboxRef.current
    if (!el) return
    const headerChecked = allPageSelected || allFilteredSelected
    const headerIndeterminate =
      !headerChecked &&
      (somePageSelected || (checkedVehicleIds.size > 0 && !allFilteredSelected))
    el.indeterminate = headerIndeterminate
    el.checked = headerChecked
  }, [allPageSelected, allFilteredSelected, somePageSelected, checkedVehicleIds.size])

  const rangeStart = filteredVehicles.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, filteredVehicles.length)

  const filterChipEntries = useMemo(() => {
    const entries: { key: VehicleFilterKey; value: string }[] = []
    for (const key of Object.keys(columnFilters) as VehicleFilterKey[]) {
      for (const value of columnFilters[key]) {
        entries.push({ key, value })
      }
    }
    return entries
  }, [columnFilters])

  function toggleVehicleChecked(id: string) {
    setCheckedVehicleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllHeader() {
    if (allFilteredSelected) {
      setCheckedVehicleIds(new Set())
      return
    }
    setCheckedVehicleIds((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        for (const id of pageVehicleIds) next.delete(id)
      } else {
        for (const id of pageVehicleIds) next.add(id)
      }
      return next
    })
  }

  function selectAllFilteredVehicles() {
    setCheckedVehicleIds(new Set(filteredVehicleIds))
  }

  function handleFlagForMaintenance() {
    setVehicleOverrides((prev) => {
      const next = { ...prev }
      for (const id of checkedVehicleIds) {
        next[id] = { ...next[id], status: 'Maintenance', maintenance: 'scheduled' }
      }
      return next
    })
    setCheckedVehicleIds(new Set())
    setBulkStatusPopoverOpen(false)
  }

  function handleBulkChangeStatus(status: string) {
    setVehicleOverrides((prev) => {
      const next = { ...prev }
      for (const id of checkedVehicleIds) {
        const patch: Partial<VehicleRow> = { status }
        if (status === 'Maintenance') patch.maintenance = 'scheduled'
        next[id] = { ...next[id], ...patch }
      }
      return next
    })
    setCheckedVehicleIds(new Set())
    setBulkStatusPopoverOpen(false)
  }

  function handleExportSelectedCsv() {
    const selected = vehicleRows.filter((v) => checkedVehicleIds.has(v.id))
    if (selected.length === 0) return
    const headers = ['Plate', ...effectiveToggleable.map((id) => VEHICLE_TABLE_COLUMN_LABELS[id])]
    const rows = selected.map((row) => [
      row.plate,
      ...effectiveToggleable.map((id) => getVehicleExportCell(row, id)),
    ])
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`vehicles-selected-${selected.length}-${date}.csv`, buildCsv(headers, rows))
  }

  function handleExportCsv() {
    const headers = ['Plate', ...effectiveToggleable.map((id) => VEHICLE_TABLE_COLUMN_LABELS[id])]
    const rows = filteredVehicles.map((row) => [
      row.plate,
      ...effectiveToggleable.map((id) => getVehicleExportCell(row, id)),
    ])
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(`vehicles-export-${date}.csv`, buildCsv(headers, rows))
  }

  const selectedRow = useMemo(
    () => (selectedVehicle ? (vehicleRows.find((v) => v.id === selectedVehicle) ?? null) : null),
    [selectedVehicle, vehicleRows],
  )

  const selectedNavIndex = useMemo(
    () => (selectedVehicle ? filteredVehicles.findIndex((v) => v.id === selectedVehicle) : -1),
    [selectedVehicle, filteredVehicles],
  )

  const showPreviewPanel = Boolean(selectedRow && vehicleDetailView === 'preview')
  const showFullDetail = Boolean(selectedRow && vehicleDetailView === 'full')

  const vehicleNavPositionLabel =
    selectedNavIndex >= 0 ? `${selectedNavIndex + 1} of ${filteredVehicles.length}` : ''

  const goToAdjacentVehicle = useCallback(
    (delta: -1 | 1) => {
      const nextIndex = selectedNavIndex + delta
      if (nextIndex < 0 || nextIndex >= filteredVehicles.length) return
      const next = filteredVehicles[nextIndex]!
      selectVehicle(next.id, vehicleDetailView)
      setPage(Math.floor(nextIndex / pageSize) + 1)
    },
    [filteredVehicles, pageSize, selectVehicle, selectedNavIndex, vehicleDetailView],
  )

  useEffect(() => {
    if (!selectedVehicle) return
    if (!vehicleRows.some((v) => v.id === selectedVehicle)) selectVehicle(null)
  }, [vehicleRows, selectedVehicle, selectVehicle])

  useEffect(() => {
    if (!selectedVehicle) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectVehicle(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedVehicle, selectVehicle])

  if (showFullDetail && selectedRow) {
    return (
      <div className="relative min-w-0 space-y-4">
        <VehicleDetail
          key={selectedRow.id}
          layout="page"
          variant="full"
          summary={selectedRow}
          onBack={() => selectVehicle(null)}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Vehicles</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Browse plates, utilization tags, and maintenance signals across the fleet.
          </p>
        </div>
        <Button
          size="sm"
          type="button"
          className="shrink-0"
          style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
          onClick={() => setAddVehicleOpen(true)}
        >
          Add Vehicle
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FleetSearchBar
          compact
          className="min-w-0 w-full flex-1 basis-[min(100%,16rem)] sm:max-w-md"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search vehicles by plate, driver, depot..."
        />
        <VehicleTableFilters
          rows={vehicleRows}
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
          <VehicleTableViewPopover
            state={tableViewState}
            effectiveToggleable={effectiveToggleable}
            onReplaceState={setTableViewState}
          />
        </div>
      </div>

      <AddVehicleDialog
        open={addVehicleOpen}
        onOpenChange={setAddVehicleOpen}
        onSave={(f) => setAddedVehicleRows((rows) => [...rows, rowFromNewVehicleForm(f)])}
      />

      {filterChipEntries.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {filterChipEntries.map(({ key, value }) => (
            <Badge
              key={`${key}-${value}`}
              variant="outline"
              className="inline-flex items-center gap-1 rounded-md border-primary/30 bg-primary/5 py-1 pr-1 pl-2 text-xs font-medium"
            >
              {formatFilterChipLabel(key, value)}
              <button
                type="button"
                className="rounded p-0.5 hover:bg-primary/15"
                aria-label={`Remove filter ${formatFilterChipLabel(key, value)}`}
                onClick={() => setColumnFilters((f) => removeFilterValue(f, key, value))}
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
            onClick={() => setColumnFilters(EMPTY_VEHICLE_COLUMN_FILTERS)}
          >
            Clear all
          </Button>
        </div>
      ) : null}

      {checkedVehicleIds.size > 0 ? (
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
              All {pageVehicleIds.length} vehicles on this page are selected.{' '}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto px-0 text-sm font-medium text-primary"
                onClick={selectAllFilteredVehicles}
              >
                Select all {filteredVehicles.length} vehicles
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
                ? `All ${filteredVehicles.length} matching vehicles selected`
                : `${checkedVehicleIds.size} selected`}
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
                Set status for {checkedVehicleIds.size} vehicles
              </p>
              <ul className="flex flex-col gap-0.5">
                {VEHICLE_FLEET_STATUS_OPTIONS.map((status) => (
                  <li key={status}>
                    <button
                      type="button"
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                      onClick={() => handleBulkChangeStatus(status)}
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          'whitespace-nowrap px-1.5 py-0 text-xs',
                          vehicleFleetStatusClass(status),
                        )}
                      >
                        {status}
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
            onClick={handleFlagForMaintenance}
          >
            Flag for maintenance
          </Button>
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
              allFilteredSelected
                ? 'text-amber-900 hover:text-amber-950'
                : 'text-primary',
            )}
            onClick={() => {
              setCheckedVehicleIds(new Set())
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
          <TableSurface
            scrollable
            className={cn(showPreviewPanel && 'lg:mr-[min(536px,calc(46vw+1rem))]')}
          >
            <Table scrollContainer={false} className="min-w-max text-xs">
              <TableHeader>
                <TableRow className="group border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[40px] px-2">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      className="size-4 shrink-0 rounded border-input accent-primary"
                      aria-label={
                        allFilteredSelected
                          ? 'Clear all selected vehicles'
                          : 'Select all vehicles on this page'
                      }
                      checked={allPageSelected || allFilteredSelected}
                      onChange={toggleSelectAllHeader}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableHead>
                  <VehicleTableSortHeader
                    column="plate"
                    label="Plate"
                    className={PLATE_STICKY_HEAD_CLASS}
                    rules={sortRules}
                    onSort={handleSortColumn}
                  />
                  {effectiveToggleable.map((colId) =>
                    colId === 'location' ? (
                      <VehicleTableResizableColumnHeader
                        key={colId}
                        column={colId}
                        label={VEHICLE_TABLE_COLUMN_LABELS[colId]}
                        width={depotColumnWidth}
                        rules={sortRules}
                        onSort={handleSortColumn}
                        onResizeStart={startDepotColumnResize}
                        resizeAriaLabel="Resize Depot column"
                      />
                    ) : colId === 'vehicle' ? (
                      <VehicleTableResizableColumnHeader
                        key={colId}
                        column={colId}
                        label={VEHICLE_TABLE_COLUMN_LABELS[colId]}
                        width={vehicleColumnWidth}
                        rules={sortRules}
                        onSort={handleSortColumn}
                        onResizeStart={startVehicleColumnResize}
                        resizeAriaLabel="Resize Vehicle column"
                      />
                    ) : (
                      <VehicleTableSortHeader
                        key={colId}
                        column={colId}
                        label={VEHICLE_TABLE_COLUMN_LABELS[colId]}
                        className={VEHICLE_TABLE_COLUMN_HEAD_CLASS[colId]}
                        rules={sortRules}
                        onSort={handleSortColumn}
                      />
                    ),
                  )}
                  <TableHead className="w-[40px] px-1" aria-label="Open detail" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVehicles.map((vehicle) => {
                  const isDetailSelected = selectedVehicle === vehicle.id
                  const isChecked = checkedVehicleIds.has(vehicle.id)
                  return (
                  <TableRow
                    key={vehicle.id}
                    className={cn(
                      'group cursor-pointer border-border transition-colors',
                      isDetailSelected
                        ? 'relative z-10 border-l-4 border-l-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgb(0_127_224/0.12)] hover:bg-primary/10'
                        : isChecked
                          ? 'bg-muted/40 hover:bg-muted/50'
                          : 'hover:bg-primary/5',
                    )}
                    onClick={() => selectVehicle(vehicle.id, 'preview')}
                    aria-selected={isDetailSelected}
                  >
                    <TableCell className="w-[40px] px-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="size-4 shrink-0 rounded border-input accent-primary"
                        aria-label={`Select ${vehicle.plate}`}
                        checked={isChecked}
                        onChange={() => toggleVehicleChecked(vehicle.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        PLATE_STICKY_CELL_BASE,
                        'px-2 font-medium',
                        isDetailSelected && cn(PLATE_BG_DETAIL, 'text-primary'),
                        !isDetailSelected && isChecked && PLATE_BG_CHECKED,
                        !isDetailSelected &&
                          !isChecked &&
                          cn(PLATE_BG_DEFAULT, PLATE_BG_HOVER),
                      )}
                    >
                      {vehicle.plate}
                    </TableCell>
                    {effectiveToggleable.map((colId) =>
                      renderVehicleToggleableCell(vehicle, colId, tableColumnWidths),
                    )}
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
                          selectVehicle(vehicle.id, 'preview')
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
            <VehicleRowDetailPopover
              summary={selectedRow}
              onClose={() => selectVehicle(null)}
              onViewAll={() => selectVehicle(selectedRow.id, 'full')}
              onPrevious={() => goToAdjacentVehicle(-1)}
              onNext={() => goToAdjacentVehicle(1)}
              hasPrevious={selectedNavIndex > 0}
              hasNext={selectedNavIndex >= 0 && selectedNavIndex < filteredVehicles.length - 1}
              positionLabel={vehicleNavPositionLabel}
            />
          ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Showing {rangeStart}-{rangeEnd} of {filteredVehicles.length} results
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="vehicles-page-size" className="text-sm text-muted-foreground">
                  Rows per page
                </label>
                <select
                  id="vehicles-page-size"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  {VEHICLES_PAGE_SIZE_OPTIONS.map((n) => (
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
    </div>
  )
}
