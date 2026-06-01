import type { CompletedMaintenanceRow } from '../data/maintenance-completed'
import type { ScheduledMaintenanceRow } from '../data/maintenance-scheduled'

export type MaintenanceServiceRow = {
  id: string
  vehicle: string
  depot: string
  date: string
  description: string
  type: string
  status: string
}

export function scheduledRowToService(row: ScheduledMaintenanceRow): MaintenanceServiceRow {
  return {
    id: row.id,
    vehicle: row.vehicle,
    depot: row.depot,
    date: row.scheduled,
    description: row.description,
    type: row.type,
    status: row.status,
  }
}

export function completedRowToService(row: CompletedMaintenanceRow): MaintenanceServiceRow {
  return {
    id: row.id,
    vehicle: row.vehicle,
    depot: row.depot,
    date: row.completedDate,
    description: row.description,
    type: row.type,
    status: 'Completed',
  }
}
