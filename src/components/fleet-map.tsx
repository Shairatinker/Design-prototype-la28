import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export function FleetMap() {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/10">
      <CardHeader className="border-b border-border/60 bg-muted/40 pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Live map</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-96 w-full overflow-hidden bg-muted/60 bg-[linear-gradient(to_right,theme(colors.slate.300/0.35)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.300/0.35)_1px,transparent_1px)] bg-[size:28px_28px]">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-primary/5" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-xl border border-border/60 bg-card/90 px-6 py-4 text-center shadow-sm backdrop-blur-sm">
              <div className="text-sm font-medium text-foreground">Map view</div>
              <div className="mt-1 text-xs text-muted-foreground">Vehicle locations would be displayed here</div>
            </div>
          </div>
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-card text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
              aria-label="Zoom in"
            >
              <span className="text-lg leading-none">+</span>
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-card text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted"
              aria-label="Zoom out"
            >
              <span className="text-lg leading-none">−</span>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
