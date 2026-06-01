import { ListFilter } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Badge } from './ui/badge'
import { cn } from './ui/utils'
import {
  EMPTY_DRIVER_COLUMN_FILTERS,
  DRIVER_FILTER_LABELS,
  formatDriverFilterValue,
  type DriverColumnFilters,
  type DriverFilterKey,
  type DriverFilterRow,
  activeDriverFilterCount,
  getDriverFilterOptions,
} from '../lib/driver-table-filters'

const FILTER_KEYS: DriverFilterKey[] = ['status', 'type', 'mvr', 'background', 'training']

export interface DriverTableFiltersProps {
  rows: DriverFilterRow[]
  filters: DriverColumnFilters
  onChangeFilters: (next: DriverColumnFilters) => void
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function FilterSection({
  filterKey,
  options,
  selected,
  onToggle,
  onSelectAll,
  onClear,
}: {
  filterKey: DriverFilterKey
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  onSelectAll: () => void
  onClear: () => void
}) {
  if (options.length === 0) return null

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{DRIVER_FILTER_LABELS[filterKey]}</p>
        <div className="flex gap-1">
          <button type="button" className="text-xs text-primary hover:underline" onClick={onSelectAll}>
            All
          </button>
          <span className="text-xs text-muted-foreground">·</span>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground hover:underline"
            onClick={onClear}
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
              id={`df-${filterKey}-${opt}`}
              className="size-4 shrink-0 rounded border-input accent-primary"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
            />
            <Label htmlFor={`df-${filterKey}-${opt}`} className="cursor-pointer text-sm font-normal leading-snug">
              {formatDriverFilterValue(filterKey, opt)}
            </Label>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DriverTableFilters({ rows, filters, onChangeFilters }: DriverTableFiltersProps) {
  const options = getDriverFilterOptions(rows)
  const count = activeDriverFilterCount(filters)
  const active = count > 0

  const setKey = (key: DriverFilterKey, values: string[]) => {
    onChangeFilters({ ...filters, [key]: values })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={active ? 'default' : 'outline'}
          size="sm"
          className={cn('h-9 gap-2 rounded-lg border-2 px-3', !active && 'border-border')}
          style={active ? { backgroundColor: '#007FE0', color: '#ffffff' } : undefined}
        >
          <ListFilter className="h-4 w-4" />
          Filters
          {active ? (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 rounded-full border-0 bg-white/25 px-1.5 text-xs text-white"
            >
              {count}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(100vw-2rem,360px)] p-0" align="start">
        <div className="max-h-[min(70vh,480px)] overflow-y-auto p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Filter columns</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Selections apply immediately.</p>
            </div>
            {active ? (
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto shrink-0 px-0 text-xs text-primary"
                onClick={() => onChangeFilters(EMPTY_DRIVER_COLUMN_FILTERS)}
              >
                Clear all
              </Button>
            ) : null}
          </div>
          {FILTER_KEYS.map((key) => (
            <FilterSection
              key={key}
              filterKey={key}
              options={options[key]}
              selected={filters[key]}
              onToggle={(value) => setKey(key, toggleValue(filters[key], value))}
              onSelectAll={() => setKey(key, [...options[key]])}
              onClear={() => setKey(key, [])}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
