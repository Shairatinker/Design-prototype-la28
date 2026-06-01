import { useEffect, useMemo, useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'

const PAGE_SIZE = 10

type AlertRow = {
  id: string
  received: string
  view: string
  licensePlate: string
  message: string
  status: 'Active' | 'Acknowledged'
}

function alertStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'border-amber-200 bg-amber-100 text-amber-950'
    case 'Acknowledged':
      return 'border-emerald-200 bg-emerald-100 text-emerald-900'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

function buildAlerts(): AlertRow[] {
  const core: AlertRow[] = [
    {
      id: '1',
      received: 'Apr 30, 09:35 AM',
      view: 'Check engine',
      licensePlate: 'TN42001',
      message: 'Check engine light on',
      status: 'Active',
    },
    {
      id: '2',
      received: 'Apr 30, 07:35 AM',
      view: 'Low fuel',
      licensePlate: 'TN42022',
      message: 'Low fuel—under 15%',
      status: 'Acknowledged',
    },
    {
      id: '3',
      received: 'Apr 30, 09:04 AM',
      view: 'Collision detected',
      licensePlate: 'TN42001',
      message: 'Vehicle left road side',
      status: 'Active',
    },
    {
      id: '4',
      received: 'Apr 29, 04:33 AM',
      view: 'Vibrations',
      licensePlate: 'TN42022',
      message: 'Vibrations detected',
      status: 'Active',
    },
  ]

  const views: Array<[string, string]> = [
    ['GPS offline', 'No GPS signal for 12+ min'],
    ['Odometer jump', 'Unusual odometer delta'],
    ['Battery low', '12V battery below threshold'],
    ['Hard brake', 'Hard braking event logged'],
    ['Speeding', 'Exceeded posted limit'],
    ['Geofence exit', 'Left authorized area'],
    ['Extended idle', 'Engine on, parked 45+ min'],
    ['Oil change due', 'Oil change due in 500 mi'],
    ['Coolant temp', 'Coolant temperature elevated'],
    ['ABS fault', 'ABS diagnostic code present'],
    ['Lane assist', 'Lane assist temporarily disabled'],
    ['Tire rotation', 'Tire rotation recommended'],
    ['Brake pads', 'Brake pad wear at 20%'],
    ['DEF low', 'DEF fluid below 25%'],
    ['AdBlue', 'AdBlue refill window'],
    ['Door ajar', 'Driver door open while moving'],
    ['HVAC fault', 'Climate system diagnostic'],
    ['Charging fault', 'EV charge session interrupted'],
    ['Regen limited', 'Regenerative braking limited'],
    ['Maintenance', 'Scheduled maintenance window'],
  ]

  for (let i = 0; i < 20; i++) {
    const [v, m] = views[i % views.length]!
    const hour = ((7 + (i % 12)) % 12) + 1
    const minute = (i * 7) % 60
    const ampm = i % 2 === 0 ? 'AM' : 'PM'
    const day = 29 - (i % 5)
    core.push({
      id: `gen-${i}`,
      received: `Apr ${day}, ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`,
      view: v,
      licensePlate: `TN${42000 + (i % 16)}`,
      message: m,
      status: i % 4 === 0 ? 'Acknowledged' : 'Active',
    })
  }

  return core
}

const allAlerts = buildAlerts()

export function AlertsTable({ searchQuery = '' }: { searchQuery?: string }) {
  const [page, setPage] = useState(1)

  const filteredAlerts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return allAlerts
    return allAlerts.filter((a) => {
      const hay = `${a.view} ${a.licensePlate} ${a.message} ${a.status}`.toLowerCase()
      return hay.includes(q)
    })
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const total = filteredAlerts.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredAlerts.slice(start, start + PAGE_SIZE)
  }, [safePage, filteredAlerts])

  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, total)

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 shadow-md ring-1 ring-black/[0.04] dark:ring-white/10">
      <CardHeader className="border-b border-border/60 bg-muted/40 pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Alerts</CardTitle>
      </CardHeader>
      <CardContent className="gap-0 px-0 pb-0 pt-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
              <TableHead className="pl-6">Triggered</TableHead>
              <TableHead>View</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="pr-6">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((alert) => (
              <TableRow key={alert.id} className="border-border/40 transition-colors hover:bg-primary/5">
                <TableCell className="pl-6 text-sm">{alert.received}</TableCell>
                <TableCell className="text-sm font-medium">{alert.view}</TableCell>
                <TableCell className="text-sm tabular-nums">{alert.licensePlate}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{alert.message}</TableCell>
                <TableCell className="pr-6 text-sm">
                  <Badge variant="outline" className={`whitespace-nowrap text-xs font-medium ${alertStatusBadgeClass(alert.status)}`}>
                    {alert.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? 'Showing 0 alerts'
              : `Showing ${rangeStart}-${rangeEnd} of ${total} alerts`}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="flex items-center px-2 text-sm text-muted-foreground sm:px-3">
              Page {safePage} of {totalPages}
            </span>
            <Button
              size="sm"
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
