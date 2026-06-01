import { ChevronLeft, ChevronRight } from 'lucide-react'
import { VehicleDetail, type VehicleDetailSummary } from './vehicle-detail'
import { Button } from './ui/button'
import { cn } from './ui/utils'

export interface VehicleRowDetailPopoverProps {
  summary: VehicleDetailSummary
  onClose: () => void
  onViewAll: () => void
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
  positionLabel: string
}

export function VehicleRowDetailPopover({
  summary,
  onClose,
  onViewAll,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  positionLabel,
}: VehicleRowDetailPopoverProps) {
  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-20 cursor-default bg-black/20 max-lg:bg-black/25 lg:pointer-events-none lg:bg-transparent"
        aria-label="Close vehicle details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label={`Vehicle preview for ${summary.plate}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          'z-30 flex max-h-[min(85vh,640px)] w-full flex-col overflow-hidden bg-card shadow-xl',
          'max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:max-w-lg max-lg:rounded-l-2xl max-lg:border-y max-lg:border-l',
          'lg:absolute lg:top-0 lg:right-0 lg:w-[min(520px,calc(100%-1rem))] lg:rounded-xl lg:border',
          'border-primary/30 ring-2 ring-primary/15',
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <VehicleDetail
            key={summary.id}
            layout="drawer"
            variant="preview"
            summary={summary}
            onClose={onClose}
            onViewAll={onViewAll}
          />
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-card px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!hasPrevious}
            onClick={onPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-xs tabular-nums text-muted-foreground">{positionLabel}</span>
          <Button type="button" variant="outline" size="sm" className="gap-1" disabled={!hasNext} onClick={onNext}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </footer>
      </div>
    </>
  )
}
