/** Outline badge surface classes — match Drivers / Vehicles roster tables. */

export const DRIVER_ROSTER_STATUS_OPTIONS = [
  'approved',
  'verified',
  'trained',
  'rejected',
  'flagged',
  'pending',
] as const

export function driverRosterStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'verified':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'trained':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'flagged':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'pending':
      return 'bg-amber-100 text-amber-900 border-amber-200'
    default:
      return ''
  }
}

export function driverVerificationClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'pass':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'fail':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'pending':
      return 'bg-amber-100 text-amber-900 border-amber-200'
    default:
      return ''
  }
}

export function driverTrainingClass(training: string): string {
  switch (training.toLowerCase()) {
    case 'complete':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
      return 'bg-amber-100 text-amber-900 border-amber-200'
    default:
      return ''
  }
}

/** Risk score: 1–40 green, 41–70 amber, 71+ red. */
export function driverRiskScoreClass(score: number): string {
  if (score > 70) return 'text-red-700 font-semibold'
  if (score > 40) return 'text-amber-800 font-medium'
  return 'text-green-800 font-medium'
}

/** Vehicle lifecycle statuses (bulk change + filters). */
export const VEHICLE_FLEET_STATUS_OPTIONS = [
  'Onboarding',
  'Available',
  'In Service',
  'Maintenance',
  'Inactive',
  'Out of Service',
  'Incident',
] as const

export type VehicleFleetStatus = (typeof VEHICLE_FLEET_STATUS_OPTIONS)[number]

/** Vehicle lifecycle — same palette as `VehiclesView`. */
export function vehicleFleetStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'in service':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'out of service':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'incident':
      return 'bg-orange-100 text-orange-900 border-orange-200'
    case 'onboarding':
      return 'bg-sky-100 text-sky-900 border-sky-200'
    default:
      return ''
  }
}

/** Maintenance column — same palette as `VehiclesView` maintenance badges. */
export function vehicleMaintenanceClass(maintenance: string): string {
  switch (maintenance.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'none':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return ''
  }
}
