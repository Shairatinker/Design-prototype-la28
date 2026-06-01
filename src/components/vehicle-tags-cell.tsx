import { Badge } from './ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from './ui/utils'
import { cleanVehicleTagLabel } from '../lib/vehicle-tags'

function TagBadge({ label, className }: { label: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn('inline-flex whitespace-nowrap px-1.5 py-0 text-xs', className)}
    >
      {label}
    </Badge>
  )
}

type VehicleTagsCellProps = {
  tags: string[]
  className?: string
}

export function VehicleTagsCell({ tags, className }: VehicleTagsCellProps) {
  const labels = tags.map(cleanVehicleTagLabel).filter(Boolean)
  if (labels.length === 0) {
    return <span className={cn('text-muted-foreground', className)}>—</span>
  }

  const [first, ...rest] = labels

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <TagBadge label={first} />
      {rest.length > 0 ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label={`Show ${rest.length} more tags`}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Badge
                variant="outline"
                className="inline-flex whitespace-nowrap border-border bg-muted/50 px-1.5 py-0 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                +{rest.length}
              </Badge>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto max-w-[min(100vw-2rem,280px)] p-2"
            align="start"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              All tags
            </p>
            <div className="flex flex-wrap gap-1">
              {labels.map((label) => (
                <TagBadge key={label} label={label} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}
