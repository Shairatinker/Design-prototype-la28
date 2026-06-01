import { useEffect, useState } from 'react'
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

export interface NewVehicleForm {
  vin: string
  plate: string
  make: string
  model: string
  year: string
  type: 'EV' | 'ICE'
  depot: string
}

const emptyForm: NewVehicleForm = {
  vin: '',
  plate: '',
  make: '',
  model: '',
  year: '',
  type: 'EV',
  depot: 'Downtown LA Depot',
}

interface AddVehicleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (values: NewVehicleForm) => void
}

export function AddVehicleDialog({ open, onOpenChange, onSave }: AddVehicleDialogProps) {
  const [form, setForm] = useState<NewVehicleForm>(emptyForm)

  useEffect(() => {
    if (open) setForm(emptyForm)
  }, [open])

  function patch<K extends keyof NewVehicleForm>(key: K, value: NewVehicleForm[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const handleSave = () => {
    const plate = form.plate.trim()
    const vin = form.vin.trim()
    if (!plate && !vin) return
    const resolvedPlate = plate || vin.slice(-8).toUpperCase() || `NEW-${Date.now().toString(36).slice(-6)}`
    onSave({
      ...form,
      plate: resolvedPlate,
      vin,
      make: form.make.trim(),
      model: form.model.trim(),
      year: form.year.trim(),
      depot: form.depot.trim() || 'Downtown LA Depot',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="space-y-1 border-b border-border px-6 pb-4 pt-6 pr-14">
          <DialogHeader className="gap-1 space-y-0 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">Add vehicle</DialogTitle>
            <p className="text-base font-medium text-foreground">Vehicle Detail</p>
            <DialogDescription className="sr-only">
              Enter VIN, license plate, make, model, year, vehicle type, and depot. New vehicles are saved as
              Onboarding until ready for service.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="add-vin">VIN</Label>
            <Input
              id="add-vin"
              placeholder="e.g. 1HGBH41JXMN109186"
              value={form.vin}
              onChange={(e) => patch('vin', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-plate">License Plate</Label>
            <Input
              id="add-plate"
              placeholder="e.g. 7ABC001"
              value={form.plate}
              onChange={(e) => patch('plate', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-make">Make</Label>
            <Input
              id="add-make"
              placeholder="e.g. Honda"
              value={form.make}
              onChange={(e) => patch('make', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-model">Model</Label>
            <Input
              id="add-model"
              placeholder="e.g. Prologue"
              value={form.model}
              onChange={(e) => patch('model', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-year">Year</Label>
            <Input
              id="add-year"
              placeholder="e.g. 2024"
              value={form.year}
              onChange={(e) => patch('year', e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium leading-none">Type</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={form.type === 'EV' ? 'default' : 'outline'}
                className="flex-1"
                style={form.type === 'EV' ? { backgroundColor: '#007FE0', color: '#ffffff' } : undefined}
                onClick={() => patch('type', 'EV')}
              >
                EV
              </Button>
              <Button
                type="button"
                variant={form.type === 'ICE' ? 'default' : 'outline'}
                className="flex-1"
                style={form.type === 'ICE' ? { backgroundColor: '#007FE0', color: '#ffffff' } : undefined}
                onClick={() => patch('type', 'ICE')}
              >
                ICE
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-depot">Depot</Label>
            <Input
              id="add-depot"
              placeholder="e.g. Downtown LA Depot"
              value={form.depot}
              onChange={(e) => patch('depot', e.target.value)}
              autoComplete="off"
            />
          </div>
          <p className="text-xs italic leading-relaxed text-muted-foreground">
            New vehicles are saved with status &apos;Onboarding&apos; until ready for service.
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-0 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            className="h-12 rounded-none rounded-bl-lg border-0 border-r border-border"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-12 rounded-none rounded-br-lg border-0"
            style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
