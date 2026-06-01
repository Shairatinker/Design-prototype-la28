export type DriverRosterStatus =
  | 'approved'
  | 'verified'
  | 'trained'
  | 'rejected'
  | 'flagged'
  | 'pending'

export type DriverVerificationStatus = 'pass' | 'fail' | 'pending'

export type DriverTrainingStatus = 'complete' | 'pending'

export type DriverType =
  | 'LA28 Staff'
  | 'LA28 VIP'
  | 'LA28 Family'
  | 'Partner (Uber)'
  | 'Partner (Corporate)'
  | 'TX Volunteer'
  | 'AV Volunteer'
  | 'Stakeholder'
  | 'Private Driver'

export const DRIVER_TYPES: readonly DriverType[] = [
  'LA28 Staff',
  'LA28 VIP',
  'LA28 Family',
  'Partner (Uber)',
  'Partner (Corporate)',
  'TX Volunteer',
  'AV Volunteer',
  'Stakeholder',
  'Private Driver',
] as const

export interface DriverRow {
  id: string
  name: string
  created: string
  status: DriverRosterStatus
  driverType: DriverType
  riskScore: number
  mvrStatus: DriverVerificationStatus
  backgroundCheck: DriverVerificationStatus
  training: DriverTrainingStatus
  vehicle: string
}

export interface DriverVehicleRow {
  plate: string
  vehicle: string
  type: string
  status: string
}

export interface DriverFullDetail extends DriverRow {
  /** Alias for detail panels */
  driver: string
  driverCode: string
  plateNumber: string
  updatedAt: string
  evaluatedLine: string
  dob: string
  age: number
  email: string
  phone: string
  licenseExpiry: string
  trainingComplete: string
  operatorBadge: string
  vehicleAssigned: string
  vehicles: DriverVehicleRow[]
}

const VEHICLE_BY_PLATE: Record<string, string> = {
  TN42000: '2025 Honda Prologue',
  TN42001: '2024 Honda Accord',
  TN42002: '2023 Honda Accord',
  TN42005: '2023 Honda Civic',
  TN42007: '2024 Honda Accord',
  TN42008: '2023 Toyota Camry',
  TN42009: '2024 Tesla Model 3',
  TN42013: '2024 Chevrolet Malibu',
  TN42014: '2023 Honda Civic',
  TN42017: '2025 Honda Prologue',
}

function toCreated(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${y}/${m}/${d}`
}

const driversSeed: DriverRow[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    created: toCreated('2018-10-01'),
    status: 'approved',
    driverType: 'LA28 Staff',
    riskScore: 38,
    mvrStatus: 'pass',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: VEHICLE_BY_PLATE.TN42002!,
  },
  {
    id: '2',
    name: 'Angelica Gomez',
    created: toCreated('2018-12-14'),
    status: 'verified',
    driverType: 'LA28 VIP',
    riskScore: 58,
    mvrStatus: 'pass',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: VEHICLE_BY_PLATE.TN42007!,
  },
  {
    id: '3',
    name: 'Ana Rodriguez',
    created: toCreated('2020-10-29'),
    status: 'flagged',
    driverType: 'TX Volunteer',
    riskScore: 94,
    mvrStatus: 'pending',
    backgroundCheck: 'fail',
    training: 'pending',
    vehicle: VEHICLE_BY_PLATE.TN42005!,
  },
  {
    id: '4',
    name: 'Khoi Kim',
    created: toCreated('2020-10-30'),
    status: 'trained',
    driverType: 'Partner (Uber)',
    riskScore: 15,
    mvrStatus: 'pass',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: '—',
  },
  {
    id: '5',
    name: 'Lisa Nguyen',
    created: toCreated('2018-12-20'),
    status: 'rejected',
    driverType: 'Partner (Corporate)',
    riskScore: 12,
    mvrStatus: 'fail',
    backgroundCheck: 'fail',
    training: 'pending',
    vehicle: '—',
  },
  {
    id: '6',
    name: 'Maria Martinez',
    created: toCreated('2018-12-28'),
    status: 'approved',
    driverType: 'LA28 Staff',
    riskScore: 35,
    mvrStatus: 'pass',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: VEHICLE_BY_PLATE.TN42001!,
  },
  {
    id: '7',
    name: 'Maria Garcia',
    created: toCreated('2018-08-17'),
    status: 'verified',
    driverType: 'AV Volunteer',
    riskScore: 48,
    mvrStatus: 'pass',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: VEHICLE_BY_PLATE.TN42009!,
  },
  {
    id: '8',
    name: 'David Santos',
    created: toCreated('2018-08-24'),
    status: 'pending',
    driverType: 'Stakeholder',
    riskScore: 88,
    mvrStatus: 'pending',
    backgroundCheck: 'fail',
    training: 'pending',
    vehicle: '—',
  },
  {
    id: '9',
    name: 'Ana Garcia',
    created: toCreated('2018-08-08'),
    status: 'flagged',
    driverType: 'Private Driver',
    riskScore: 20,
    mvrStatus: 'fail',
    backgroundCheck: 'pending',
    training: 'pending',
    vehicle: '—',
  },
  {
    id: '10',
    name: 'David Rivera',
    created: toCreated('2018-08-24'),
    status: 'trained',
    driverType: 'Partner (Uber)',
    riskScore: 52,
    mvrStatus: 'pass',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: VEHICLE_BY_PLATE.TN42013!,
  },
  {
    id: '11',
    name: 'Lisa Garcia',
    created: toCreated('2019-08-23'),
    status: 'rejected',
    driverType: 'LA28 VIP',
    riskScore: 8,
    mvrStatus: 'fail',
    backgroundCheck: 'fail',
    training: 'pending',
    vehicle: '—',
  },
  {
    id: '12',
    name: 'Robert Garcia',
    created: toCreated('2019-08-23'),
    status: 'approved',
    driverType: 'LA28 Family',
    riskScore: 61,
    mvrStatus: 'pass',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: VEHICLE_BY_PLATE.TN42014!,
  },
  {
    id: '13',
    name: 'Emma Garcia',
    created: toCreated('2018-08-23'),
    status: 'verified',
    driverType: 'Partner (Corporate)',
    riskScore: 44,
    mvrStatus: 'pending',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: VEHICLE_BY_PLATE.TN42008!,
  },
  {
    id: '14',
    name: 'Michael Garcia',
    created: toCreated('2018-08-23'),
    status: 'flagged',
    driverType: 'TX Volunteer',
    riskScore: 91,
    mvrStatus: 'fail',
    backgroundCheck: 'fail',
    training: 'pending',
    vehicle: '—',
  },
  {
    id: '15',
    name: 'Sofia Garcia',
    created: toCreated('2018-08-19'),
    status: 'trained',
    driverType: 'AV Volunteer',
    riskScore: 38,
    mvrStatus: 'pass',
    backgroundCheck: 'pass',
    training: 'complete',
    vehicle: VEHICLE_BY_PLATE.TN42017!,
  },
]

const EXTRA_NAMES = [
  'James Chen',
  'Jennifer Davis',
  'John Smith',
  'Lehane Chan',
  'Michael Brown',
  'Reginald Martinez',
  'Robert Wilson',
  'Sarah Johnson',
  'Susan Harrison',
  'Carlos Mendez',
  'Priya Patel',
  'Wei Zhang',
  'Olivia Brooks',
  'Noah Thompson',
]

function buildFleetDrivers(): DriverRow[] {
  const rows: DriverRow[] = driversSeed.map((d) => ({ ...d }))
  const statuses: DriverRosterStatus[] = [
    'approved',
    'verified',
    'trained',
    'rejected',
    'flagged',
    'pending',
  ]
  for (let i = driversSeed.length; i < 75; i++) {
    const base = driversSeed[i % driversSeed.length]!
    const name = EXTRA_NAMES[i % EXTRA_NAMES.length] ?? `Driver ${i + 1}`
    const type = DRIVER_TYPES[i % DRIVER_TYPES.length]!
    const status = statuses[i % statuses.length]!
    const plateKey = Object.keys(VEHICLE_BY_PLATE)[i % Object.keys(VEHICLE_BY_PLATE).length]!
    rows.push({
      ...base,
      id: String(i + 1),
      name: i < driversSeed.length + EXTRA_NAMES.length ? name : `${name} ${i}`,
      created: toCreated(`20${18 + (i % 7)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`),
      status,
      driverType: type,
      riskScore: 5 + ((i * 13) % 96),
      mvrStatus: i % 5 === 0 ? 'pending' : i % 7 === 0 ? 'fail' : 'pass',
      backgroundCheck: i % 6 === 0 ? 'pending' : i % 8 === 0 ? 'fail' : 'pass',
      training: i % 4 === 0 ? 'pending' : 'complete',
      vehicle: i % 3 === 0 ? '—' : VEHICLE_BY_PLATE[plateKey]!,
    })
  }
  return rows
}

export const driversData: DriverRow[] = buildFleetDrivers()

function slugEmail(name: string): string {
  const parts = name.toLowerCase().split(/\s+/)
  return `${parts[0]}.${parts[parts.length - 1] ?? parts[0]}@example.com`
}

function phoneFromId(id: string): string {
  const n = Number.parseInt(id, 10) || 1
  return `+1-310-555-${String(2000 + n * 3).padStart(4, '0')}`
}

function ageFromSeed(id: string): number {
  return 32 + (Number.parseInt(id, 10) % 18)
}

function dobFromAge(age: number): string {
  const y = new Date().getFullYear() - age
  return `${y}-01-10`
}

function buildVehiclesForRow(row: DriverRow): DriverVehicleRow[] {
  if (row.id === '3') {
    return [
      { plate: '7ABC005', vehicle: '2023 Honda CR-V', type: 'ICE', status: 'maintenance' },
      { plate: '7ABC019', vehicle: '2024 Honda CR-V', type: 'ICE', status: 'available' },
    ]
  }
  const plate = Object.entries(VEHICLE_BY_PLATE).find(([, v]) => v === row.vehicle)?.[0]
  if (plate) {
    return [
      {
        plate,
        vehicle: row.vehicle,
        type: row.vehicle.includes('Tesla') ? 'EV' : 'ICE',
        status: row.status === 'approved' || row.status === 'verified' ? 'available' : 'in service',
      },
    ]
  }
  return []
}

function capitalizeVerification(status: DriverVerificationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function formatDriverStatusLabel(status: DriverRosterStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function buildDriverDetail(row: DriverRow): DriverFullDetail {
  const age = row.id === '3' ? 40 : ageFromSeed(row.id)
  const plate = Object.entries(VEHICLE_BY_PLATE).find(([, v]) => v === row.vehicle)?.[0] ?? '—'
  const evaluatedLine =
    row.status === 'rejected'
      ? `Evaluated: rejected (${row.created})`
      : row.status === 'flagged'
        ? `Evaluated: flagged (${row.created})`
        : row.status === 'pending'
          ? `Evaluated: pending (${row.created})`
          : `Evaluated: ${row.status} (${row.created})`

  return {
    ...row,
    driver: row.name,
    driverCode: `FL_customer_${row.id.padStart(6, '0')}`,
    plateNumber: plate,
    updatedAt: row.created.replace(/\//g, '-'),
    evaluatedLine,
    dob: row.id === '3' ? '1985-01-10' : dobFromAge(age),
    age,
    email: row.id === '3' ? 'ana.rodriguez@example.com' : slugEmail(row.name),
    phone: row.id === '3' ? '+1-310-555-2003' : phoneFromId(row.id),
    licenseExpiry: row.id === '3' ? '2025-06-01' : '2026-03-15',
    trainingComplete: row.training === 'complete' ? 'Yes' : 'No',
    operatorBadge: row.mvrStatus === 'fail' && row.backgroundCheck === 'fail' ? 'Blocked' : 'Active',
    vehicleAssigned: plate !== '—' ? `${plate} (MN${row.id.padStart(6, '0')})` : '—',
    vehicles: buildVehiclesForRow(row),
  }
}

export function formatDriverVerificationLabel(status: DriverVerificationStatus): string {
  return capitalizeVerification(status)
}

export function formatDriverTrainingLabel(training: DriverTrainingStatus): string {
  return training === 'complete' ? 'Complete' : 'Pending'
}

export function getDriverExportCell(row: DriverRow, colId: string): string {
  switch (colId) {
    case 'status':
      return formatDriverStatusLabel(row.status)
    case 'type':
      return row.driverType
    case 'riskScore':
      return String(row.riskScore)
    case 'mvr':
      return formatDriverVerificationLabel(row.mvrStatus)
    case 'background':
      return formatDriverVerificationLabel(row.backgroundCheck)
    case 'training':
      return formatDriverTrainingLabel(row.training)
    case 'vehicle':
      return row.vehicle
    case 'created':
      return row.created
    default:
      return ''
  }
}
