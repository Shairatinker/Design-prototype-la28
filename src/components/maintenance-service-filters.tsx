import { ListFilter } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Badge } from './ui/badge'
import { cn } from './ui/utils'
import {
  EMPTY_MAINTENANCE_SERVICE_COLUMN_FILTERS,
  MAINTENANCE_SERVICE_FILTER_LABELS,
  type MaintenanceServiceColumnFilters,
  type MaintenanceServiceFilterKey,
  activeMaintenanceServiceFilterCount,
  getMaintenanceServiceFilterOptions,
} from '../lib/maintenance-service-filters'
import type { MaintenanceServiceRow } from '../lib/maintenance-service-rows'
import type { MaintenanceServiceTableVariant } from './maintenance-service-table'

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export interface MaintenanceServiceFiltersProps {
  variant: MaintenanceServiceTableVariant
  rows: MaintenanceServiceRow[]
  filters: MaintenanceServiceColumnFilters
  onChangeFilters: (next: MaintenanceServiceColumnFilters) => void
}

export function MaintenanceServiceFilters({
  variant,
  rows,
  filters,
  onChangeFilters,
}: MaintenanceServiceFiltersProps) {
  const count = activeMaintenanceServiceFilterCount(filters)
  const filterKeys: MaintenanceServiceFilterKey[] =
    variant === 'completed' ? ['depot', 'type'] : ['depot', 'type', 'status']

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
      <PopoverContent className="w-[min(100vw-2rem,280px)] p-0" align="start">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Filters</p>
        </div>
        <div className="max-h-[min(50vh,280px)] overflow-y-auto px-3">
          {filterKeys.map((key) => {
            const options = getMaintenanceServiceFilterOptions(rows, key)
            const selected = filters[key]
            return (
              <div key={key} className="border-b border-border py-3 last:border-b-0">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{MAINTENANCE_SERVICE_FILTER_LABELS[key]}</p>
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
                <ul className="space-y-1.5">
                  {options.map((opt) => (
                    <li key={opt} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`msf-${variant}-${key}-${opt}`}
                        className="size-4 shrink-0 rounded border-input accent-primary"
                        checked={selected.includes(opt)}
                        onChange={() =>
                          onChangeFilters({ ...filters, [key]: toggleValue(selected, opt) })
                        }
                      />
                      <Label
                        htmlFor={`msf-${variant}-${key}-${opt}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {opt}
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
            onClick={() => onChangeFilters(EMPTY_MAINTENANCE_SERVICE_COLUMN_FILTERS)}
          >
            Clear all filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
