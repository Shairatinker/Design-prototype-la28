import { useState } from 'react'
import { ChevronDown, LayoutGrid } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Switch } from './ui/switch'
import {
  MAINTENANCE_TABLE_COLUMN_LABELS,
  MAINTENANCE_TABLE_TOGGLEABLE_COLUMN_ORDER,
  getMaintenanceViewTriggerLabel,
  type MaintenanceTableToggleableColumnId,
  type MaintenanceTableViewsState,
} from '../lib/maintenance-table-views'

export interface MaintenanceTableViewPopoverProps {
  state: MaintenanceTableViewsState
  effectiveToggleable: MaintenanceTableToggleableColumnId[]
  onReplaceState: (next: MaintenanceTableViewsState) => void
}

export function MaintenanceTableViewPopover({
  state,
  effectiveToggleable,
  onReplaceState,
}: MaintenanceTableViewPopoverProps) {
  const [open, setOpen] = useState(false)
  const visibleSet = new Set(effectiveToggleable)
  const triggerLabel = getMaintenanceViewTriggerLabel(state)

  function toggleColumn(id: MaintenanceTableToggleableColumnId) {
    const hidden = new Set(state.hiddenColumns)
    if (visibleSet.has(id)) {
      if (visibleSet.size <= 1) return
      hidden.add(id)
    } else {
      hidden.delete(id)
    }
    onReplaceState({ hiddenColumns: [...hidden] })
  }

  function showAll() {
    onReplaceState({ hiddenColumns: [] })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-2 px-3">
          <LayoutGrid className="h-4 w-4" />
          {triggerLabel}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <p className="mb-2 text-sm font-semibold text-foreground">Table columns</p>
        <ul className="space-y-2">
          {MAINTENANCE_TABLE_TOGGLEABLE_COLUMN_ORDER.map((id) => (
            <li key={id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground">{MAINTENANCE_TABLE_COLUMN_LABELS[id]}</span>
              <Switch checked={visibleSet.has(id)} onCheckedChange={() => toggleColumn(id)} />
            </li>
          ))}
        </ul>
        <Button type="button" variant="link" size="sm" className="mt-2 h-auto px-0 text-primary" onClick={showAll}>
          Show all columns
        </Button>
      </PopoverContent>
    </Popover>
  )
}
