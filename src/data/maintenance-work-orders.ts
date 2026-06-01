export type MaintenanceWorkOrderStatus = 'in_progress' | 'Scheduled' | 'triaged' | 'completed'
export type MaintenancePriority = 'critical' | 'high' | 'medium' | 'low'
export type MaintenanceDisposition = 'on_site_fix' | 'dealer_referral' | 'hold'

export type MaintenanceWorkOrder = {
  id: string
  vehicle: string
  depot: string
  status: MaintenanceWorkOrderStatus
  priority: MaintenancePriority
  disposition: MaintenanceDisposition
  /** yyyy/mm/dd */
  created: string
}

export const maintenanceWorkOrdersData: MaintenanceWorkOrder[] = [
  {
    id: 'wo-1',
    vehicle: '7ABC005',
    depot: 'Downtown LA Depot',
    status: 'in_progress',
    priority: 'medium',
    disposition: 'on_site_fix',
    created: '2026/05/26',
  },
  {
    id: 'wo-2',
    vehicle: '7ABC003',
    depot: 'Downtown LA Depot',
    status: 'Scheduled',
    priority: 'high',
    disposition: 'on_site_fix',
    created: '2026/05/26',
  },
  {
    id: 'wo-3',
    vehicle: '7ABC001',
    depot: 'Downtown LA Depot',
    status: 'triaged',
    priority: 'medium',
    disposition: 'on_site_fix',
    created: '2026/05/26',
  },
  {
    id: 'wo-4',
    vehicle: '7ABC007',
    depot: 'Downtown LA Depot',
    status: 'triaged',
    priority: 'medium',
    disposition: 'on_site_fix',
    created: '2026/05/26',
  },
  {
    id: 'wo-5',
    vehicle: '7ABC002',
    depot: 'Downtown LA Depot',
    status: 'triaged',
    priority: 'high',
    disposition: 'dealer_referral',
    created: '2026/05/25',
  },
  {
    id: 'wo-6',
    vehicle: '7ABC004',
    depot: 'Downtown LA Depot',
    status: 'Scheduled',
    priority: 'medium',
    disposition: 'on_site_fix',
    created: '2026/05/25',
  },
  {
    id: 'wo-7',
    vehicle: '7ABC006',
    depot: 'Downtown LA Depot',
    status: 'triaged',
    priority: 'low',
    disposition: 'hold',
    created: '2026/05/25',
  },
]
