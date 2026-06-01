import type { DriverFullDetail } from '../data/drivers'
import { vehicleFleetStatusClass } from '../lib/status-badge-styles'
import { cn } from './ui/utils'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

const underlineTabTriggerClass =
  'rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none sm:px-3'

type DriverDetailSectionsProps = {
  driver: DriverFullDetail
  /** Pill tabs in drawer-style panel (legacy); underline tabs on full page. */
  tabStyle?: 'pill' | 'underline'
}

export function DriverDetailSections({ driver, tabStyle = 'underline' }: DriverDetailSectionsProps) {
  const isPill = tabStyle === 'pill'

  return (
    <Tabs defaultValue="vehicles" className="w-full">
      <div className={isPill ? undefined : 'w-full border-b border-border'}>
        <TabsList
          className={cn(
            isPill
              ? 'h-auto w-full flex-wrap justify-start gap-0.5 rounded-md bg-muted/60 p-0.5'
              : 'h-auto w-fit max-w-full flex-wrap justify-start gap-x-1 rounded-none border-0 bg-transparent p-0',
          )}
          aria-label="Driver detail sections"
        >
          {['vehicles', 'assignments', 'alerts', 'claims', 'violations', 'insurance', 'support'].map((id) => (
            <TabsTrigger
              key={id}
              value={id}
              className={cn(
                isPill
                  ? 'rounded-md px-3 py-1.5 capitalize text-[10px] data-[state=active]:bg-[#007FE0] data-[state=active]:text-white'
                  : underlineTabTriggerClass,
              )}
            >
              {id === 'support' ? 'Support conversations' : id}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="vehicles" className="mt-4 space-y-3">
        <h2 className="text-lg font-semibold">Vehicles</h2>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>License Plate</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {driver.vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No vehicles linked to this driver.
                  </TableCell>
                </TableRow>
              ) : (
                driver.vehicles.map((v) => (
                  <TableRow key={v.plate}>
                    <TableCell className="font-medium">{v.plate}</TableCell>
                    <TableCell>{v.vehicle}</TableCell>
                    <TableCell>{v.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${vehicleFleetStatusClass(v.status)}`}>
                        {v.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="assignments" className="mt-4 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Assignments for this driver will appear here.
      </TabsContent>
      <TabsContent value="alerts" className="mt-4 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        No alerts for this driver.
      </TabsContent>
      <TabsContent value="claims" className="mt-4 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Claims history will appear here.
      </TabsContent>
      <TabsContent value="violations" className="mt-4 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Violations will appear here.
      </TabsContent>
      <TabsContent value="insurance" className="mt-4 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Insurance documents will appear here.
      </TabsContent>
      <TabsContent value="support" className="mt-4 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Support conversations will appear here.
      </TabsContent>
    </Tabs>
  )
}
