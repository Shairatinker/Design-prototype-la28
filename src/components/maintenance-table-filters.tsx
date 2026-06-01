import { ListFilter } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Badge } from './ui/badge'
import { cn } from './ui/utils'
import {
  EMPTY_MAINTENANCE_COLUMN_FILTERS,
  MAINTENANCE_FILTER_LABELS,
  type MaintenanceColumnFilters,
  type MaintenanceFilterKey,
  activeMaintenanceFilterCount,
  getMaintenanceFilterOptions,
} from '../lib/maintenance-table-filters'
import type { MaintenanceWorkOrder } from '../data/maintenance-work-orders'
import {
  maintenanceDispositionLabel,
  maintenancePriorityLabel,
  maintenanceStatusLabel,
} from '../lib/maintenance-badge-styles'

const FILTER_KEYS: MaintenanceFilterKey[] = ['status', 'priority', 'disposition', 'depot']

export interface MaintenanceTableFiltersProps {
  rows: MaintenanceWorkOrder[]
  filters: MaintenanceColumnFilters
  onChangeFilters: (next: MaintenanceColumnFilters) => void
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function formatOptionLabel(key: MaintenanceFilterKey, value: string): string {
  switch (key) {
    case 'status':
      return maintenanceStatusLabel(value)
    case 'priority':
      return maintenancePriorityLabel(value)
    case 'disposition':
      return maintenanceDispositionLabel(value)
    default:
      return value
  }
}

export function MaintenanceTableFilters({ rows, filters, onChangeFilters }: MaintenanceTableFiltersProps) {
  const count = activeMaintenanceFilterCount(filters)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('h-9 shrink-0 gap-2 rounded-lg border-2 px-3', count > 0 && 'border-primary/40')}
        >
          <ListFilter className="h-4 w-4" />
          Filters
          {count > 0 ? (
            <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 text-[10px]">
              {count}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,320px)] p-0" align="start">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Filters</p>
        </div>
        <div className="max-h-[min(60vh,360px)] overflow-y-auto px-3">
          {FILTER_KEYS.map((key) => {
            const options = getMaintenanceFilterOptions(rows, key)
            const selected = filters[key]
            if (options.length === 0) return null
            return (
              <div key={key} className="border-b border-border py-3 last:border-b-0">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{MAINTENANCE_FILTER_LABELS[key]}</p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => onChangeFilters({ ...filters, [key]: [...options] })}
                    >
                      All
                    </button>
                    <span className="text-xs text-muted-foreground">·</span>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                      onClick={() => onChangeFilters({ ...filters, [key]: [] })}
                      disabled={selected.length === 0}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <ul className="max-h-32 space-y-1.5 overflow-y-auto">
                  {options.map((opt) => (
                    <li key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`mf-${key}-${opt}`}
                        className="size-4 shrink-0 rounded border-input accent-primary"
                        checked={selected.includes(opt)}
                        onChange={() =>
                          onChangeFilters({ ...filters, [key]: toggleValue(selected, opt) })
                        }
                      />
                      <Label htmlFor={`mf-${key}-${opt}`} className="cursor-pointer text-sm font-normal leading-snug">
                        {formatOptionLabel(key, opt)}
                      </Label>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <div className="border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            disabled={count === 0}
            onClick={() => onChangeFilters(EMPTY_MAINTENANCE_COLUMN_FILTERS)}
          >
            Clear all filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
