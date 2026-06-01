export type AssignmentStatus = 'Active' | 'Scheduled' | 'Ended'

export type AssignmentType = 'Taxi' | 'Allocated Vehicle' | 'Fleet Pool' | 'Rate Card'

export interface AssignmentRow {
  id: string
  licensePlate: string
  assignmentType: AssignmentType
  driver: string
  status: AssignmentStatus
  scheduledStart: string
  actualStart: string
  scheduledEnd: string
  actualEnd: string
}

const drivers = [
  'Robert Martinez',
  'David Kim',
  'Maria Garcia',
  'John Smith',
  'Susan Harrison',
  'Ana Rodriguez',
  'David Lee',
  'Sarah Johnson',
  'Michael Brown',
  'Jennifer Davis',
  'James Chen',
  'Lisa Nguyen',
  'Emma Garcia',
  'Carlos Mendez',
  'Priya Patel',
  'Wei Zhang',
  'Olivia Brooks',
  'Noah Thompson',
]

const plates = [
  '7ABC006',
  '7ABC001',
  '7ABC002',
  '7ABC003',
  '7ABC004',
  '7ABC005',
  'TN42001',
  'TN42002',
  'TN42007',
  'TN42009',
]

const types: AssignmentType[] = ['Taxi', 'Allocated Vehicle', 'Fleet Pool', 'Rate Card']

const statuses: AssignmentStatus[] = ['Active', 'Scheduled', 'Ended']

/** 18 mock rows aligned with assignments reference. */
export const assignmentsData: AssignmentRow[] = Array.from({ length: 18 }, (_, i) => {
  const status = statuses[i % statuses.length]
  const day = 26 + Math.floor(i / 6)
  const sh = 6 + (i % 4) * 2
  const eh = sh + 4
  const scheduledStart = `2028-07-${String(day).padStart(2, '0')} ${String(sh).padStart(2, '0')}:00`
  const scheduledEnd = `2028-07-${String(day).padStart(2, '0')} ${String(eh).padStart(2, '0')}:00`
  const hasStart = status === 'Active' || status === 'Ended'
  const hasEnd = status === 'Ended'
  return {
    id: `assignment-${i + 1}`,
    licensePlate: plates[i % plates.length],
    assignmentType: types[i % types.length],
    driver: drivers[i % drivers.length],
    status,
    scheduledStart,
    actualStart: hasStart
      ? `2028-07-${String(day).padStart(2, '0')} ${String(Math.min(23, sh + 1)).padStart(2, '0')}:15`
      : '—',
    scheduledEnd,
    actualEnd: hasEnd
      ? `2028-07-${String(day).padStart(2, '0')} ${String(Math.min(23, eh - 1)).padStart(2, '0')}:45`
      : '—',
  }
})

export function getAssignmentExportCell(row: AssignmentRow, colId: string): string {
  switch (colId) {
    case 'type':
      return row.assignmentType
    case 'driver':
      return row.driver
    case 'status':
      return row.status
    case 'scheduledStart':
      return row.scheduledStart
    case 'actualStart':
      return row.actualStart
    case 'scheduledEnd':
      return row.scheduledEnd
    case 'actualEnd':
      return row.actualEnd
    default:
      return ''
  }
}
