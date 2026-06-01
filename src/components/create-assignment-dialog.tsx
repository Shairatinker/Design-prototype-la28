import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ScrollArea } from './ui/scroll-area'
import { cn } from './ui/utils'
import type { AssignmentType } from '../data/assignments'

export interface CreateAssignmentPayload {
  licensePlate: string
  assignmentType: AssignmentType
  driver: string
  counterparty: string
  scheduledStart: string
  scheduledEnd: string
}

const VEHICLE_OPTIONS = [
  { plate: '7ABC001', label: '7ABC001 – 2024 Honda Accord' },
  { plate: '7ABC002', label: '7ABC002 – 2023 Honda Accord' },
  { plate: 'TN42000', label: 'TN42000 – 2025 Honda Prologue' },
  { plate: 'TN42001', label: 'TN42001 – 2024 Honda Accord' },
  { plate: 'TN42002', label: 'TN42002 – 2023 Honda Accord' },
  { plate: 'TN42007', label: 'TN42007 – 2024 Honda Accord' },
  { plate: 'TN42009', label: 'TN42009 – 2024 Tesla Model 3' },
  { plate: 'TN42005', label: 'TN42005 – 2023 Honda Civic' },
  { plate: 'TN42008', label: 'TN42008 – 2023 Toyota Camry' },
] as const

const DRIVER_OPTIONS = [
  'Maria Garcia',
  'James Chen',
  'Ana Rodriguez',
  'John Smith',
  'Susan Harrison',
  'David Lee',
  'Sarah Johnson',
  'Michael Brown',
  'Jennifer Davis',
  'Robert Wilson',
] as const

const ASSIGNMENT_TYPES: AssignmentType[] = ['Taxi', 'Allocated Vehicle', 'Fleet Pool', 'Rate Card']

function defaultDateTimeLocal(daysFromNow: number, hour: number, minute: number) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, minute, 0, 0)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

interface CreateAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (payload: CreateAssignmentPayload) => void
}

export function CreateAssignmentDialog({ open, onOpenChange, onSave }: CreateAssignmentDialogProps) {
  const [vehicleQuery, setVehicleQuery] = useState('')
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null)
  const [driverQuery, setDriverQuery] = useState('')
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [counterparty, setCounterparty] = useState('')
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('Taxi')
  const [scheduledStart, setScheduledStart] = useState(defaultDateTimeLocal(0, 9, 0))
  const [scheduledEnd, setScheduledEnd] = useState(defaultDateTimeLocal(30, 17, 0))

  useEffect(() => {
    if (!open) return
    setVehicleQuery('')
    setSelectedPlate(null)
    setDriverQuery('')
    setSelectedDriver(null)
    setCounterparty('')
    setAssignmentType('Taxi')
    setScheduledStart(defaultDateTimeLocal(0, 9, 0))
    setScheduledEnd(defaultDateTimeLocal(30, 17, 0))
  }, [open])

  const filteredVehicles = useMemo(() => {
    const q = vehicleQuery.trim().toLowerCase()
    if (!q) return [...VEHICLE_OPTIONS]
    return VEHICLE_OPTIONS.filter((o) => o.label.toLowerCase().includes(q))
  }, [vehicleQuery])

  const filteredDrivers = useMemo(() => {
    const q = driverQuery.trim().toLowerCase()
    if (!q) return [...DRIVER_OPTIONS]
    return DRIVER_OPTIONS.filter((d) => d.toLowerCase().includes(q))
  }, [driverQuery])

  const selectedVehicleLabel = useMemo(() => {
    if (!selectedPlate) return null
    return VEHICLE_OPTIONS.find((v) => v.plate === selectedPlate)?.label ?? selectedPlate
  }, [selectedPlate])

  const handleSave = () => {
    if (!selectedPlate || !scheduledStart || !scheduledEnd) return
    onSave({
      licensePlate: selectedPlate,
      assignmentType,
      driver: selectedDriver ?? '',
      counterparty: counterparty.trim(),
      scheduledStart,
      scheduledEnd,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,760px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="space-y-1 border-b border-border px-6 pb-4 pt-6 pr-14">
          <DialogHeader className="gap-1 space-y-0 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">Create assignment</DialogTitle>
            <DialogDescription className="sr-only">
              Choose a vehicle, optional driver, counterparty, and schedule. New assignments are saved as Scheduled.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="ca-vehicle-search">
              License Plate / Vehicle <span className="text-destructive">(required)</span>
            </Label>
            <Input
              id="ca-vehicle-search"
              placeholder="Search by plate, make, model..."
              value={vehicleQuery}
              onChange={(e) => setVehicleQuery(e.target.value)}
              autoComplete="off"
            />
            {selectedVehicleLabel ? (
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{selectedVehicleLabel}</span>
              </p>
            ) : null}
            <ScrollArea className="h-44 rounded-md border border-border">
              <div className="space-y-0.5 p-1 pr-3">
                {filteredVehicles.map((opt) => (
                  <button
                    key={opt.plate}
                    type="button"
                    onClick={() => {
                      setSelectedPlate(opt.plate)
                      setVehicleQuery('')
                    }}
                    className={cn(
                      'w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted',
                      selectedPlate === opt.plate && 'bg-muted font-medium',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
                {filteredVehicles.length === 0 ? (
                  <p className="px-2 py-3 text-center text-sm text-muted-foreground">No matches</p>
                ) : null}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ca-driver-search">Driver (optional)</Label>
            <Input
              id="ca-driver-search"
              placeholder="Search drivers by name..."
              value={driverQuery}
              onChange={(e) => setDriverQuery(e.target.value)}
              autoComplete="off"
            />
            {selectedDriver ? (
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{selectedDriver}</span>
              </p>
            ) : null}
            <ScrollArea className="h-36 rounded-md border border-border">
              <div className="space-y-0.5 p-1 pr-3">
                {filteredDrivers.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setSelectedDriver(name)
                      setDriverQuery('')
                    }}
                    className={cn(
                      'w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted',
                      selectedDriver === name && 'bg-muted font-medium',
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium leading-none">Assignment type</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ASSIGNMENT_TYPES.map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={assignmentType === t ? 'default' : 'outline'}
                  className="h-auto min-h-9 whitespace-normal px-2 py-2 text-center text-xs leading-tight"
                  style={
                    assignmentType === t ? { backgroundColor: '#007FE0', color: '#ffffff' } : undefined
                  }
                  onClick={() => setAssignmentType(t)}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ca-counterparty">Counterparty (e.g. Uber, Hertz)</Label>
            <Input
              id="ca-counterparty"
              placeholder="e.g. Uber, Hertz"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ca-start">Scheduled start</Label>
              <Input
                id="ca-start"
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ca-end">Scheduled end</Label>
              <Input
                id="ca-end"
                type="datetime-local"
                value={scheduledEnd}
                onChange={(e) => setScheduledEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-0 border-t border-border">
          <Button
            type="button"
            className="h-12 rounded-none rounded-bl-lg border-0 border-r border-border bg-emerald-600 text-white hover:bg-emerald-600/90"
            onClick={handleSave}
            disabled={!selectedPlate}
          >
            Save Assignment
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-12 rounded-none rounded-br-lg border-0"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
