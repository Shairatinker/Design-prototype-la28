import type { CSSProperties, MouseEvent } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown } from 'lucide-react'
import type { MaintenanceServiceRow } from '../lib/maintenance-service-rows'
import {
  completedMaintenanceStatusBadgeClass,
  scheduledMaintenanceStatusBadgeClass,
  scheduledMaintenanceTypeBadgeClass,
} from '../lib/maintenance-scheduled-badge-styles'
import type {
  MaintenanceServiceSortColumnId,
  MaintenanceServiceSortRule,
} from '../lib/maintenance-service-sort'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { TableSurface } from './table-surface'
import { cn } from './ui/utils'

const VEHICLE_STICKY_WIDTH = 100

const VEHICLE_STICKY_HEAD_CLASS = cn(
  'sticky left-0 z-30 border-r border-border bg-[color-mix(in_srgb,var(--card)_50%,var(--muted)_50%)] shadow-[6px_0_10px_-4px_rgb(0_0_0/0.12)]',
)
const VEHICLE_STICKY_CELL_BASE = cn(
  'sticky left-0 z-20 border-r border-border bg-card shadow-[6px_0_10px_-4px_rgb(0_0_0/0.1)]',
  'group-hover:bg-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)]',
)

export type MaintenanceServiceTableVariant = 'scheduled' | 'completed'

function SortHeaderContent({
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

function ServiceSortHeader({
  column,
  label,
  className,
  rules,
  onSort,
  style,
}: {
  column: MaintenanceServiceSortColumnId
  label: string
  className?: string
  rules: MaintenanceServiceSortRule[]
  onSort: (column: MaintenanceServiceSortColumnId, shiftKey: boolean) => void
  style?: CSSProperties
}) {
  const idx = rules.findIndex((r) => r.column === column)
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null
  return (
    <TableHead className={cn(className, 'group p-0 align-middle')} style={style}>
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
        <SortHeaderContent
          label={label}
          active={active}
          dir={dir}
          sortPriority={active && rules.length > 1 ? idx + 1 : null}
        />
      </button>
    </TableHead>
  )
}

function ServiceVehicleHeader({
  rules,
  onSort,
}: {
  rules: MaintenanceServiceSortRule[]
  onSort: (column: MaintenanceServiceSortColumnId, shiftKey: boolean) => void
}) {
  const idx = rules.findIndex((r) => r.column === 'vehicle')
  const active = idx >= 0
  const dir = active ? rules[idx]!.direction : null
  return (
    <TableHead
      className={cn('group relative max-w-0 p-0 align-middle', VEHICLE_STICKY_HEAD_CLASS)}
      style={{ width: VEHICLE_STICKY_WIDTH, minWidth: VEHICLE_STICKY_WIDTH, maxWidth: VEHICLE_STICKY_WIDTH }}
    >
      <button
        type="button"
        className={cn(
          'flex min-h-8 w-full items-center gap-0.5 text-left text-xs font-medium text-foreground',
          'px-2 py-1.5 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
          active && 'text-primary',
        )}
        onClick={(e) => onSort('vehicle', e.shiftKey)}
        title="Sort column. Shift+click to add or adjust secondary sorts."
      >
        <SortHeaderContent
          label="Vehicle"
          active={active}
          dir={dir}
          sortPriority={active && rules.length > 1 ? idx + 1 : null}
        />
      </button>
    </TableHead>
  )
}

function ServiceResizableHeader({
  column,
  label,
  width,
  rules,
  onSort,
  onResizeStart,
}: {
  column: MaintenanceServiceSortColumnId
  label: string
  width: number
  rules: MaintenanceServiceSortRule[]
  onSort: (column: MaintenanceServiceSortColumnId, shiftKey: boolean) => void
  onResizeStart: (event: MouseEvent) => void
}) {
  const idx = rules.findIndex((r) => r.column === column)
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
        onClick={(e) => onSort(column, e.shiftKey)}
        title="Sort column. Shift+click to add or adjust secondary sorts."
      >
        <SortHeaderContent
          label={label}
          active={active}
          dir={dir}
          sortPriority={active && rules.length > 1 ? idx + 1 : null}
        />
      </button>
      <button
        type="button"
        aria-label={`Resize ${label} column`}
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

export interface MaintenanceServiceTableProps {
  variant: MaintenanceServiceTableVariant
  rows: MaintenanceServiceRow[]
  sortRules: MaintenanceServiceSortRule[]
  onSort: (column: MaintenanceServiceSortColumnId, shiftKey: boolean) => void
  depotColumnWidth: number
  onDepotResizeStart: (event: MouseEvent) => void
  descriptionColumnWidth: number
  onDescriptionResizeStart: (event: MouseEvent) => void
}

export function MaintenanceServiceTable({
  variant,
  rows,
  sortRules,
  onSort,
  depotColumnWidth,
  onDepotResizeStart,
  descriptionColumnWidth,
  onDescriptionResizeStart,
}: MaintenanceServiceTableProps) {
  const dateColumnLabel = variant === 'completed' ? 'Completed date' : 'Scheduled'
  const emptyMessage =
    variant === 'completed'
      ? 'No completed maintenance matches your filters.'
      : 'No scheduled maintenance matches your filters.'

  return (
    <TableSurface scrollable>
      <Table scrollContainer={false} className="min-w-max text-xs">
        <TableHeader>
          <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
            <ServiceVehicleHeader rules={sortRules} onSort={onSort} />
            <ServiceResizableHeader
              column="depot"
              label="Depot"
              width={depotColumnWidth}
              rules={sortRules}
              onSort={onSort}
              onResizeStart={onDepotResizeStart}
            />
            <ServiceSortHeader
              column="date"
              label={dateColumnLabel}
              className="w-[108px] px-2"
              rules={sortRules}
              onSort={onSort}
            />
            <ServiceResizableHeader
              column="description"
              label="Description"
              width={descriptionColumnWidth}
              rules={sortRules}
              onSort={onSort}
              onResizeStart={onDescriptionResizeStart}
            />
            <ServiceSortHeader
              column="type"
              label="Type"
              className="w-[100px] px-2"
              rules={sortRules}
              onSort={onSort}
            />
            <ServiceSortHeader
              column="status"
              label="Status"
              className="w-[120px] px-2"
              rules={sortRules}
              onSort={onSort}
            />
            <TableHead className="w-[40px] px-1" aria-label="Open detail" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
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
                <TableCell
                  className="max-w-0 px-2"
                  style={{
                    width: depotColumnWidth,
                    minWidth: depotColumnWidth,
                    maxWidth: depotColumnWidth,
                  }}
                  title={row.depot}
                >
                  <span className="block truncate">{row.depot}</span>
                </TableCell>
                <TableCell className="whitespace-nowrap px-2 tabular-nums">{row.date}</TableCell>
                <TableCell
                  className="max-w-0 px-2"
                  style={{
                    width: descriptionColumnWidth,
                    minWidth: descriptionColumnWidth,
                    maxWidth: descriptionColumnWidth,
                  }}
                >
                  <span className="block truncate" title={row.description}>
                    {row.description}
                  </span>
                </TableCell>
                <TableCell className="px-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'whitespace-nowrap px-1.5 py-0 text-xs',
                      scheduledMaintenanceTypeBadgeClass(row.type),
                    )}
                  >
                    {row.type}
                  </Badge>
                </TableCell>
                <TableCell className="px-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'whitespace-nowrap px-1.5 py-0 text-xs',
                      variant === 'completed'
                        ? completedMaintenanceStatusBadgeClass()
                        : scheduledMaintenanceStatusBadgeClass(row.status),
                    )}
                  >
                    {variant === 'completed' ? 'Completed' : row.status}
                  </Badge>
                </TableCell>
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
  )
}
