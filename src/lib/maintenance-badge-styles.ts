import type {
  MaintenanceDisposition,
  MaintenancePriority,
  MaintenanceWorkOrderStatus,
} from '../data/maintenance-work-orders'
function capitalizeFirstLetter(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function maintenanceStatusLabel(status: MaintenanceWorkOrderStatus | string): string {
  switch (status) {
    case 'in_progress':
      return 'In progress'
    case 'Scheduled':
      return 'Scheduled'
    case 'triaged':
      return 'Triaged'
    case 'completed':
      return 'Completed'
    default:
      return capitalizeFirstLetter(String(status).replace(/_/g, ' '))
  }
}

export function maintenanceStatusBadgeClass(status: string): string {
  switch (status) {
    case 'in_progress':
      return 'border-blue-200 bg-blue-100 text-blue-800'
    case 'Scheduled':
      return 'border-orange-200 bg-orange-100 text-orange-900'
    case 'triaged':
      return 'border-violet-200 bg-violet-100 text-violet-900'
    case 'completed':
      return 'border-border bg-muted text-muted-foreground'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

export function maintenancePriorityLabel(priority: MaintenancePriority | string): string {
  return capitalizeFirstLetter(String(priority))
}

export function maintenancePriorityBadgeClass(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'border-red-200 bg-red-100 text-red-800'
    case 'medium':
      return 'border-amber-200 bg-amber-100 text-amber-900'
    case 'low':
      return 'border-border bg-muted/80 text-muted-foreground'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

export function maintenanceDispositionLabel(disposition: MaintenanceDisposition | string): string {
  switch (disposition) {
    case 'on_site_fix':
      return 'On site fix'
    case 'dealer_referral':
      return 'Dealer referral'
    case 'hold':
      return 'Hold'
    default:
      return capitalizeFirstLetter(String(disposition).replace(/_/g, ' '))
  }
}

export function maintenanceDispositionBadgeClass(disposition: string): string {
  switch (disposition) {
    case 'on_site_fix':
      return 'border-sky-200 bg-sky-50 text-sky-900'
    case 'dealer_referral':
      return 'border-indigo-200 bg-indigo-50 text-indigo-900'
    case 'hold':
      return 'border-border bg-muted/80 text-muted-foreground'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}
