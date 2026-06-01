import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, MapPin, Pencil, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { VehicleTagsCell } from './vehicle-tags-cell'
import { cleanVehicleTagLabel, VEHICLE_TABLE_TAG_OPTIONS } from '../lib/vehicle-tags'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { vehicleMaintenanceClass } from '../lib/status-badge-styles'
import { capitalizeFirstLetter, cn } from './ui/utils'

const NO_DRIVER = 'No Driver Assigned'

const VEHICLE_DETAIL_SECTION_IDS = [
  'Drivers',
  'Assignments',
  'Alerts',
  'Maintenance',
  'Claims',
  'Violations',
  'Insurance',
] as const

type VehicleDetailSection = (typeof VEHICLE_DETAIL_SECTION_IDS)[number]

function isVehicleDetailSection(value: string): value is VehicleDetailSection {
  return (VEHICLE_DETAIL_SECTION_IDS as readonly string[]).includes(value)
}

const underlineTabTriggerClass =
  'rounded-none border-0 border-b-2 border-transparent bg-transparent px-2 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none sm:px-3'

function parseDepotFromLocation(location: string): string {
  if (location.includes('(')) return location.split('(')[0]?.trim() ?? location
  return location
}

function parseYearMakeModel(vehicle: string): string {
  const match = vehicle.match(/^(\d{4})\s+(.+)$/)
  if (match) return `${match[1]} / ${match[2]}`
  return vehicle || '—'
}

function demoVin(plate: string): string {
  return `HIGH${plate.replace(/[^A-Z0-9]/gi, '').slice(0, 6)}DEMO01`
}

function demoFuelPercent(plate: string): number {
  const num = parseInt(plate.replace(/\D/g, ''), 10) || 0
  return 35 + (num % 61)
}

function demoMpg(plate: string): number {
  const num = parseInt(plate.replace(/\D/g, ''), 10) || 0
  return 26 + (num % 7)
}

function demoLockState(plate: string): 'Locked' | 'Unlocked' {
  const num = parseInt(plate.replace(/\D/g, ''), 10) || 0
  return num % 3 === 0 ? 'Locked' : 'Unlocked'
}

function demoLastIncident(summary: Pick<VehicleDetailSummary, 'status' | 'lastUpdated'>): string {
  if (summary.status === 'Incident') {
    return /^\d{4}\/\d{2}\/\d{2}$/.test(summary.lastUpdated) ? summary.lastUpdated : summary.lastUpdated
  }
  return 'None'
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-2.5 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm text-muted-foreground sm:w-40">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-medium text-foreground sm:text-right">{children}</dd>
    </div>
  )
}

export type VehicleDetailSummary = {
  id: string
  plate: string
  vehicle: string
  type: string
  status: string
  currentUse: string
  tags: string[]
  driver: string
  location: string
  lastUpdated: string
  mileage?: number
  maintenance: string
}

interface VehicleDetailProps {
  onBack?: () => void
  onClose?: () => void
  onViewAll?: () => void
  summary?: VehicleDetailSummary | null
  layout?: 'page' | 'drawer'
  /** Drawer preview panel — compact header with View all. */
  variant?: 'preview' | 'full'
}

export function VehicleDetail({
  onBack,
  onClose,
  onViewAll,
  summary,
  layout = 'page',
  variant = 'full',
}: VehicleDetailProps) {
  const [activeTab, setActiveTab] = useState<VehicleDetailSection>('Drivers')
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [assignmentType, setAssignmentType] = useState<string>('Taxi')
  const [selectedDriver, setSelectedDriver] = useState<string>('')
  const [driverSearch, setDriverSearch] = useState<string>('')
  const [assignedDriver, setAssignedDriver] = useState(NO_DRIVER)
  const [editedTags, setEditedTags] = useState<string[]>([])
  const [editedDepot, setEditedDepot] = useState('')
  const [editingTags, setEditingTags] = useState(false)
  const [editingDepot, setEditingDepot] = useState(false)
  const [tagsDraft, setTagsDraft] = useState('')
  const [depotDraft, setDepotDraft] = useState('')

  const drivers = ['Maria Garcia', 'James Chen', 'Ana Rodriguez']

  useEffect(() => {
    setActiveTab('Drivers')
    setOpenDialog(null)
    setSelectedDriver('')
    setDriverSearch('')
    setEditingTags(false)
    setEditingDepot(false)
    if (summary) {
      setAssignedDriver(summary.driver)
      setEditedTags(summary.tags.map(cleanVehicleTagLabel).filter(Boolean))
      setEditedDepot(parseDepotFromLocation(summary.location))
    } else {
      setAssignedDriver(NO_DRIVER)
      setEditedTags([])
      setEditedDepot('')
    }
  }, [summary?.id, summary])

  const plateForDialogs = summary?.plate ?? '7ABC003'
  const mapCaption = summary?.location ?? 'Inglewood Depot'

  const vehicleMetrics = useMemo(() => {
    const plate = summary?.plate ?? '7ABC003'
    return {
      vin: demoVin(plate),
      lock: demoLockState(plate),
      fuelPercent: demoFuelPercent(plate),
      mpg: demoMpg(plate),
      lastIncident: summary ? demoLastIncident(summary) : 'None',
      yearMakeModel: parseYearMakeModel(summary?.vehicle ?? ''),
      mileage:
        summary?.mileage != null ? `${summary.mileage.toLocaleString('en-US')} mi` : '—',
    }
  }, [summary])

  const isDrawer = layout === 'drawer'
  const isPreview = isDrawer && variant === 'preview'
  const hasNoDriver = assignedDriver === NO_DRIVER || !assignedDriver.trim()

  function saveTagsEdit() {
    const next = tagsDraft
      .split(',')
      .map((t) => cleanVehicleTagLabel(t))
      .filter(Boolean)
    setEditedTags(next.length > 0 ? next : editedTags)
    setEditingTags(false)
  }

  function saveDepotEdit() {
    setEditedDepot(depotDraft.trim() || editedDepot)
    setEditingDepot(false)
  }

  function openAssignDriver() {
    setOpenDialog('assignment')
  }

  return (
    <div className="space-y-4">
      {isDrawer ? (
        <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
          <div className="min-w-0 flex-1">
            {!isPreview ? (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Vehicle</p>
            ) : null}
            <h2 className="truncate text-lg font-semibold text-foreground">{summary?.plate ?? 'Vehicle'}</h2>
            <p className="truncate text-sm text-muted-foreground">{summary?.vehicle ?? 'Select a vehicle'}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isPreview && onViewAll ? (
              <Button type="button" variant="outline" size="sm" onClick={onViewAll}>
                View all
              </Button>
            ) : null}
            {onClose ? (
              <Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label="Close details" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            ) : null}
          </div>
        </div>
      ) : onBack ? (
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-primary hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Back to vehicles
        </button>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {!isDrawer ? <h1 className="text-2xl font-semibold">Vehicle Detail</h1> : <h2 className="sr-only">Vehicle actions</h2>}
        <div className={`flex flex-wrap gap-2 ${isDrawer ? 'w-full' : ''}`}>
          <Button
            size="sm"
            type="button"
            style={{ backgroundColor: '#E0F0FB', color: '#030213' }}
            onClick={() => setOpenDialog('assignment')}
          >
            Create assignment
          </Button>
          <Button
            size="sm"
            type="button"
            style={{ backgroundColor: '#E0F0FB', color: '#030213' }}
            onClick={() => setOpenDialog('problem')}
          >
            Problem detection report
          </Button>
          <Button
            size="sm"
            type="button"
            style={{ backgroundColor: '#E0F0FB', color: '#030213' }}
            onClick={() => setOpenDialog('inspection')}
          >
            Operation Inspection
          </Button>
          <Button
            size="sm"
            type="button"
            style={{ backgroundColor: '#E0F0FB', color: '#030213' }}
            onClick={() => setOpenDialog('unlock')}
          >
            Unlock
          </Button>
          <Button
            size="sm"
            type="button"
            style={{ backgroundColor: '#E0F0FB', color: '#030213' }}
            onClick={() => setOpenDialog('maintenance')}
          >
            Schedule Maintenance
          </Button>
          <Button
            size="sm"
            type="button"
            style={{ backgroundColor: '#E0F0FB', color: '#030213' }}
            onClick={() => setOpenDialog('incident')}
          >
            Report Incident
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'grid grid-cols-1 gap-4',
          !isDrawer && !isPreview && 'lg:grid-cols-2',
        )}
      >
        <Card>
          <CardContent className={cn(isPreview ? 'p-4' : 'p-6')}>
            <h3 className="mb-1 text-base font-semibold text-foreground">Vehicle detail</h3>
            <dl>
              <DetailRow label="License Plate">{summary?.plate ?? '—'}</DetailRow>
              <DetailRow label="VIN">{vehicleMetrics.vin}</DetailRow>
              <DetailRow label="Lock">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      vehicleMetrics.lock === 'Locked'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-green-100 text-green-800 border-green-200',
                    )}
                  >
                    {vehicleMetrics.lock}
                  </Badge>
                  {vehicleMetrics.lock === 'Locked' ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setOpenDialog('unlock')}
                    >
                      Unlock
                    </Button>
                  ) : null}
                </div>
              </DetailRow>
              <DetailRow label="Type">{summary?.type ?? '—'}</DetailRow>
              <DetailRow label="Year / Make / Model">{vehicleMetrics.yearMakeModel}</DetailRow>
              <DetailRow label="Mileage">{vehicleMetrics.mileage}</DetailRow>
              <DetailRow label="Maintenance">
                <Badge
                  variant="outline"
                  className={`text-xs ${vehicleMaintenanceClass(summary?.maintenance ?? 'none')}`}
                >
                  {capitalizeFirstLetter(summary?.maintenance ?? 'none')}
                </Badge>
              </DetailRow>
              <DetailRow label="Last Incident">{vehicleMetrics.lastIncident}</DetailRow>
              <DetailRow label="Fuel level">{vehicleMetrics.fuelPercent}%</DetailRow>
              <DetailRow label="MPG">{vehicleMetrics.mpg}</DetailRow>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn(isPreview ? 'p-4' : 'p-6')}>
            <h3 className="mb-1 text-base font-semibold text-foreground">Assignment</h3>
            <dl>
              <DetailRow label="Driver">
                <div className="flex flex-col items-end gap-2">
                  <span>{assignedDriver}</span>
                  {hasNoDriver ? (
                    <Button type="button" size="sm" onClick={openAssignDriver}>
                      Assign a driver
                    </Button>
                  ) : null}
                </div>
              </DetailRow>
              <DetailRow label="Current Use">{summary?.currentUse ?? '—'}</DetailRow>
              <DetailRow label="Tags">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {editingTags ? (
                    <div className="flex w-full min-w-0 flex-col items-stretch gap-2 sm:max-w-xs">
                      <Input
                        value={tagsDraft}
                        onChange={(e) => setTagsDraft(e.target.value)}
                        placeholder={VEHICLE_TABLE_TAG_OPTIONS.join(', ')}
                        className="h-8 text-xs"
                      />
                      <p className="text-left text-[10px] text-muted-foreground">
                        Comma-separated. Options: {VEHICLE_TABLE_TAG_OPTIONS.join(', ')}
                      </p>
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="sm" variant="secondary" onClick={() => setEditingTags(false)}>
                          Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={saveTagsEdit}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <VehicleTagsCell tags={editedTags} className="justify-end" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        aria-label="Edit tags"
                        onClick={() => {
                          setTagsDraft(editedTags.join(', '))
                          setEditingTags(true)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    </>
                  )}
                </div>
              </DetailRow>
              <DetailRow label="Depot">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {editingDepot ? (
                    <div className="flex w-full min-w-0 items-center gap-1 sm:max-w-xs">
                      <Input
                        value={depotDraft}
                        onChange={(e) => setDepotDraft(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Button type="button" size="sm" variant="secondary" onClick={() => setEditingDepot(false)}>
                        Cancel
                      </Button>
                      <Button type="button" size="sm" onClick={saveDepotEdit}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="break-words">{editedDepot || '—'}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        aria-label="Edit depot"
                        onClick={() => {
                          setDepotDraft(editedDepot)
                          setEditingDepot(true)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    </>
                  )}
                </div>
              </DetailRow>
              <DetailRow label="Location">
                <span className="break-words text-right">{summary?.location ?? '—'}</span>
              </DetailRow>
            </dl>
          </CardContent>
        </Card>
      </div>

      {!isPreview ? (
        <Card>
          <CardContent className="p-4">
            <div className="mb-2">
              <h3 className="font-medium">Vehicle Location</h3>
            </div>
            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <div className="text-sm text-gray-500">Map View</div>
                  <div className="text-xs text-gray-400">{mapCaption}</div>
                </div>
              </div>
              <div className="absolute left-2 top-2 flex flex-col gap-2">
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded bg-white shadow hover:bg-gray-50"
                >
                  <span className="text-lg">+</span>
                </button>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded bg-white shadow hover:bg-gray-50"
                >
                  <span className="text-lg">−</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!isPreview ? (
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (isVehicleDetailSection(value)) setActiveTab(value)
          }}
          className="w-full"
        >
          <TabsList
            className="h-auto w-full flex-wrap justify-start gap-x-1 rounded-none border-b border-border bg-transparent p-0"
            aria-label="Vehicle detail section"
          >
            {VEHICLE_DETAIL_SECTION_IDS.map((id) => (
              <TabsTrigger
                key={id}
                value={id}
                className={cn(underlineTabTriggerClass, isDrawer && 'text-xs sm:text-sm')}
              >
                {id}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Drivers" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium">Drivers</h3>
                <p className="mt-2 text-sm text-gray-600">No Driver Assigned</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="Assignments" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">No assignments</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="Alerts" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">No alerts</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="Maintenance" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">Maintenance scheduled</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="Claims" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">No claims</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="Violations" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">No violations</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="Insurance" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">No insurance information</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}

      <Dialog open={openDialog === 'assignment'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl" aria-describedby="assignment-dialog-description">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create assignment</DialogTitle>
            <DialogDescription id="assignment-dialog-description" className="sr-only">
              Create a new assignment for this vehicle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">License Plate / Vehicle (required)</Label>
              <p className="mt-2 text-base">{plateForDialogs}</p>
            </div>

            <div>
              <Label className="text-base font-semibold">Assignment type (required)</Label>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant={assignmentType === 'Taxi' ? 'default' : 'secondary'}
                  onClick={() => setAssignmentType('Taxi')}
                  className="px-6"
                  style={assignmentType === 'Taxi' ? { backgroundColor: '#E0F0FB', color: '#030213' } : {}}
                >
                  Taxi
                </Button>
                <Button
                  type="button"
                  variant={assignmentType === 'Allocated Vehicle' ? 'default' : 'secondary'}
                  onClick={() => setAssignmentType('Allocated Vehicle')}
                  className="px-6"
                  style={
                    assignmentType === 'Allocated Vehicle'
                      ? { backgroundColor: '#E0F0FB', color: '#030213' }
                      : {}
                  }
                >
                  Allocated Vehicle
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Driver (optional)</Label>
              <Input
                placeholder="Search drivers by name..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="mt-2"
              />
              <ScrollArea className="mt-2 h-40 rounded-md border">
                <div className="p-2">
                  {drivers
                    .filter((driver) => driver.toLowerCase().includes(driverSearch.toLowerCase()))
                    .map((driver) => (
                      <button
                        type="button"
                        key={driver}
                        onClick={() => setSelectedDriver(driver)}
                        className={`w-full cursor-pointer rounded p-3 text-left hover:bg-gray-100 ${
                          selectedDriver === driver ? 'bg-gray-100' : ''
                        }`}
                      >
                        <p className="text-base">{driver}</p>
                      </button>
                    ))}
                </div>
              </ScrollArea>
            </div>

            <div>
              <Label className="text-base font-semibold">Counterparty (e.g. Uber, Hertz)</Label>
              <Input placeholder="e.g. Uber, Hertz" className="mt-2" />
            </div>

            <div>
              <Label className="text-base font-semibold">Scheduled start</Label>
              <Input type="datetime-local" defaultValue="2026-04-30T23:44" className="mt-2" />
            </div>

            <div>
              <Label className="text-base font-semibold">Scheduled end</Label>
              <Input type="datetime-local" defaultValue="2026-05-30T23:44" className="mt-2" />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                size="lg"
                style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
                onClick={() => {
                  if (selectedDriver) setAssignedDriver(selectedDriver)
                  setOpenDialog(null)
                }}
              >
                Save Assignment
              </Button>
              <Button type="button" size="lg" variant="secondary" onClick={() => setOpenDialog(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'problem'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent aria-describedby="problem-dialog-description">
          <DialogHeader>
            <DialogTitle>Problem Detection Report</DialogTitle>
            <DialogDescription id="problem-dialog-description">
              Submit a problem detection report for this vehicle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Problem detection form will go here.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'inspection'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent aria-describedby="inspection-dialog-description">
          <DialogHeader>
            <DialogTitle>Operation Inspection</DialogTitle>
            <DialogDescription id="inspection-dialog-description">
              Conduct an operation inspection for this vehicle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Operation inspection form will go here.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'unlock'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent aria-describedby="unlock-dialog-description">
          <DialogHeader>
            <DialogTitle>Unlock Vehicle</DialogTitle>
            <DialogDescription id="unlock-dialog-description">Unlock this vehicle remotely.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Are you sure you want to unlock this vehicle?</p>
            <div className="mt-4 flex gap-2">
              <Button type="button" style={{ backgroundColor: '#007FE0', color: '#ffffff' }}>
                Confirm Unlock
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'maintenance'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent aria-describedby="maintenance-dialog-description">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription id="maintenance-dialog-description">
              Schedule maintenance for this vehicle.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Maintenance scheduling form will go here.</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === 'incident'} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent aria-describedby="incident-dialog-description">
          <DialogHeader>
            <DialogTitle>Report Incident</DialogTitle>
            <DialogDescription id="incident-dialog-description">Report an incident for this vehicle.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Incident report form will go here.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
