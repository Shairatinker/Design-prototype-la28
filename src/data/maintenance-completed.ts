import type { ScheduledMaintenanceType } from './maintenance-scheduled'

export type CompletedMaintenanceRow = {
  id: string
  vehicle: string
  depot: string
  /** yyyy/mm/dd */
  completedDate: string
  description: string
  type: ScheduledMaintenanceType
}

export const maintenanceCompletedData: CompletedMaintenanceRow[] = [
  {
    id: 'cm-1',
    vehicle: '7ABC002',
    depot: 'Downtown LA Depot',
    completedDate: '2026/05/20',
    description: 'Dealer referral — transmission fluid service and road test completed.',
    type: 'Repair',
  },
  {
    id: 'cm-2',
    vehicle: '7ABC006',
    depot: 'Downtown LA Depot',
    completedDate: '2026/05/22',
    description: 'Hold released after parts arrival. Brake pads replaced and systems verified.',
    type: 'Repair',
  },
  {
    id: 'cm-3',
    vehicle: '7ABC010',
    depot: 'El Segundo Depot',
    completedDate: '2026/05/24',
    description: 'Pre-event inspection completed. Tire pressure and lighting checklist signed off.',
    type: 'Inspection',
  },
  {
    id: 'cm-4',
    vehicle: '7ABC011',
    depot: 'Downtown LA Depot',
    completedDate: '2026/05/25',
    description: 'Returned from Inglewood routing assignment. Post-trip EV charge and cabin reset.',
    type: 'Routing',
  },
  {
    id: 'cm-5',
    vehicle: '7ABC012',
    depot: 'El Segundo Depot',
    completedDate: '2026/05/26',
    description: 'Miscellaneous warranty follow-up and OBD code clear. No further action required.',
    type: 'Other',
  },
]
