import type { ScheduledMaintenanceStatus, ScheduledMaintenanceType } from '../data/maintenance-scheduled'

export function scheduledMaintenanceTypeBadgeClass(type: ScheduledMaintenanceType | string): string {
  switch (type) {
    case 'Repair':
      return 'border-red-200 bg-red-50 text-red-800'
    case 'Routing':
      return 'border-violet-200 bg-violet-50 text-violet-900'
    case 'Inspection':
      return 'border-sky-200 bg-sky-50 text-sky-900'
    case 'Other':
      return 'border-border bg-muted/80 text-muted-foreground'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

export function scheduledMaintenanceStatusBadgeClass(status: ScheduledMaintenanceStatus | string): string {
  switch (status) {
    case 'In Progress':
      return 'border-blue-200 bg-blue-100 text-blue-800'
    case 'Scheduled':
      return 'border-orange-200 bg-orange-100 text-orange-900'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

export function completedMaintenanceStatusBadgeClass(): string {
  return 'border-green-200 bg-green-100 text-green-800'
}
