import { MapPin, Navigation } from 'lucide-react'
import { cn } from './ui/utils'

export type DriverRouteStop = {
  label: string
  time: string
}

type DriverRouteViewProps = {
  driverName: string
  compact?: boolean
  className?: string
}

const DEMO_ROUTES: DriverRouteStop[][] = [
  [
    { label: 'Inglewood Depot', time: '08:15' },
    { label: 'SoFi Stadium', time: '08:42' },
    { label: 'LA Convention Center', time: '09:10' },
  ],
  [
    { label: 'Downtown LA Hub', time: '07:50' },
    { label: 'Crypto.com Arena', time: '08:20' },
    { label: 'LAX Terminal 4', time: '09:05' },
  ],
]

function routeForDriver(driverName: string): DriverRouteStop[] {
  const index = driverName.length % DEMO_ROUTES.length
  return DEMO_ROUTES[index]!
}

export function DriverRouteView({ driverName, compact = false, className }: DriverRouteViewProps) {
  const stops = routeForDriver(driverName)
  const origin = stops[0]!
  const destination = stops[stops.length - 1]!

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}>
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-2.5 py-1.5">
        <div className="flex gap-1">
          <span className="size-2 rounded-full bg-red-400/90" aria-hidden />
          <span className="size-2 rounded-full bg-amber-400/90" aria-hidden />
          <span className="size-2 rounded-full bg-emerald-400/90" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
          maps.fleet-command.la28/route/{encodeURIComponent(driverName.toLowerCase().replace(/\s+/g, '-'))}
        </div>
      </div>

      <div className={cn('relative w-full overflow-hidden bg-muted/50', compact ? 'h-44' : 'h-72 sm:h-80')}>
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.slate.300/0.35)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.300/0.35)_1px,transparent_1px)] bg-[size:24px_24px]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-primary/10" />

        <svg
          className="absolute inset-0 h-full w-full text-primary"
          viewBox="0 0 360 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 40 160 C 90 120, 120 80, 180 100 S 280 60, 320 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.85"
          />
        </svg>

        <div className="absolute left-[8%] top-[72%] flex flex-col items-center gap-0.5">
          <span className="rounded-full bg-primary p-1 text-primary-foreground shadow-md">
            <MapPin className="size-3" aria-hidden />
          </span>
          {!compact ? (
            <span className="max-w-[5.5rem] truncate rounded bg-card/95 px-1.5 py-0.5 text-[9px] font-medium shadow-sm">
              {origin.label}
            </span>
          ) : null}
        </div>

        <div className="absolute right-[8%] top-[14%] flex flex-col items-center gap-0.5">
          <span className="rounded-full bg-emerald-600 p-1 text-white shadow-md">
            <Navigation className="size-3" aria-hidden />
          </span>
          {!compact ? (
            <span className="max-w-[5.5rem] truncate rounded bg-card/95 px-1.5 py-0.5 text-[9px] font-medium shadow-sm">
              {destination.label}
            </span>
          ) : null}
        </div>

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-card text-xs shadow-sm hover:bg-muted"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-card text-xs shadow-sm hover:bg-muted"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      <div className={cn('border-t border-border bg-background', compact ? 'px-2.5 py-2' : 'px-3 py-3')}>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('font-medium text-foreground', compact ? 'text-xs' : 'text-sm')}>Today&apos;s route</p>
          <span className="text-[10px] tabular-nums text-muted-foreground">{stops.length} stops</span>
        </div>
        <ol className={cn('mt-2 space-y-1.5', compact && 'space-y-1')}>
          {stops.map((stop, index) => (
            <li key={stop.label} className="flex items-center gap-2 text-xs">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-foreground">{stop.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{stop.time}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
