import type { AssignmentType } from '../data/assignments'

export const ASSIGNMENT_TYPE_OPTIONS: readonly AssignmentType[] = [
  'Taxi',
  'Allocated Vehicle',
  'Rate Card',
  'Fleet Pool',
] as const

export function assignmentTypeBadgeClass(type: string): string {
  switch (type) {
    case 'Taxi':
      return 'border-sky-200 bg-sky-100 text-sky-900'
    case 'Fleet Pool':
      return 'border-slate-700 bg-slate-800 text-white'
    case 'Allocated Vehicle':
      return 'border-violet-200 bg-violet-100 text-violet-900'
    case 'Rate Card':
      return 'border-emerald-200 bg-emerald-100 text-emerald-900'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

export function assignmentStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Active':
      return 'border-blue-200 bg-blue-100 text-blue-800'
    case 'Scheduled':
      return 'border-green-200 bg-green-100 text-green-800'
    case 'Ended':
      return 'border-border bg-muted text-muted-foreground'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}
