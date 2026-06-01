export type ScheduledMaintenanceType = 'Repair' | 'Routing' | 'Inspection' | 'Other'
export type ScheduledMaintenanceStatus = 'In Progress' | 'Scheduled'

export type ScheduledMaintenanceRow = {
  id: string
  vehicle: string
  depot: string
  /** yyyy/mm/dd */
  scheduled: string
  description: string
  type: ScheduledMaintenanceType
  status: ScheduledMaintenanceStatus
}

export const maintenanceScheduledData: ScheduledMaintenanceRow[] = [
  {
    id: 'sm-1',
    vehicle: '7ABC003',
    depot: 'Downtown LA Depot',
    scheduled: '2026/05/28',
    description:
      'Brake inspection and pad replacement. EV battery health check and software update.',
    type: 'Repair',
    status: 'Scheduled',
  },
  {
    id: 'sm-2',
    vehicle: '7ABC004',
    depot: 'Downtown LA Depot',
    scheduled: '2026/05/30',
    description: 'Annual safety inspection and tire rotation. Cabin air filter replacement.',
    type: 'Inspection',
    status: 'In Progress',
  },
  {
    id: 'sm-3',
    vehicle: '7ABC008',
    depot: 'Downtown LA Depot',
    scheduled: '2026/06/02',
    description: 'Route to Inglewood Depot for scheduled service window. Driver handoff at 08:00.',
    type: 'Routing',
    status: 'Scheduled',
  },
  {
    id: 'sm-4',
    vehicle: '7ABC009',
    depot: 'El Segundo Depot',
    scheduled: '2026/06/05',
    description: 'Diagnostic scan for warning light. General systems check pending parts availability.',
    type: 'Other',
    status: 'Scheduled',
  },
]
