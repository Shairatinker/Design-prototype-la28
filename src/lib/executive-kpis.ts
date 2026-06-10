import type { KpiTrend } from '../components/kpi-card'

export type KpiTimeRange = 'today' | 'week' | 'month'

export const KPI_TIME_RANGE_OPTIONS: { value: KpiTimeRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

export type ExecutiveKpiDefinition = {
  id: string
  label: string
  invertColors?: boolean
  values: Record<KpiTimeRange, string>
  trends: Record<KpiTimeRange, KpiTrend>
}

export const EXECUTIVE_KPIS: ExecutiveKpiDefinition[] = [
  {
    id: 'fleet-uptime',
    label: 'Fleet Uptime',
    values: { today: '70%', week: '72%', month: '68%' },
    trends: {
      today: { direction: 'up', changePercent: 2.9, period: 'yesterday' },
      week: { direction: 'up', changePercent: 4.3, period: 'last week' },
      month: { direction: 'down', changePercent: 1.4, period: 'last month' },
    },
  },
  {
    id: 'compliance',
    label: 'Compliance (Drivers Cleared)',
    values: { today: '50%', week: '55%', month: '61%' },
    trends: {
      today: { direction: 'up', changePercent: 5.0, period: 'yesterday' },
      week: { direction: 'up', changePercent: 10.0, period: 'last week' },
      month: { direction: 'up', changePercent: 22.0, period: 'last month' },
    },
  },
  {
    id: 'avg-incident-resolution',
    label: 'Avg Incident Resolution',
    invertColors: true,
    values: { today: '5 days', week: '4.8 days', month: '5.2 days' },
    trends: {
      today: { direction: 'down', changePercent: 4.0, period: 'yesterday', invertColors: true },
      week: { direction: 'down', changePercent: 8.0, period: 'last week', invertColors: true },
      month: { direction: 'up', changePercent: 4.0, period: 'last month', invertColors: true },
    },
  },
  {
    id: 'active-incidents',
    label: 'Active Incidents',
    invertColors: true,
    values: { today: '10', week: '24', month: '68' },
    trends: {
      today: { direction: 'down', changePercent: 9.1, period: 'yesterday', invertColors: true },
      week: { direction: 'up', changePercent: 14.3, period: 'last week', invertColors: true },
      month: { direction: 'down', changePercent: 5.6, period: 'last month', invertColors: true },
    },
  },
  {
    id: 'vehicles-in-service',
    label: 'Vehicles In Service',
    values: { today: '70', week: '73', month: '75' },
    trends: {
      today: { direction: 'up', changePercent: 4.5, period: 'yesterday' },
      week: { direction: 'up', changePercent: 8.9, period: 'last week' },
      month: { direction: 'up', changePercent: 11.9, period: 'last month' },
    },
  },
  {
    id: 'out-of-service',
    label: 'Out Of Service',
    invertColors: true,
    values: { today: '30', week: '27', month: '25' },
    trends: {
      today: { direction: 'up', changePercent: 11.1, period: 'yesterday', invertColors: true },
      week: { direction: 'down', changePercent: 10.0, period: 'last week', invertColors: true },
      month: { direction: 'down', changePercent: 16.7, period: 'last month', invertColors: true },
    },
  },
  {
    id: 'maintenance-backlog',
    label: 'Maintenance Backlog',
    invertColors: true,
    values: { today: '6', week: '12', month: '38' },
    trends: {
      today: { direction: 'down', changePercent: 16.7, period: 'yesterday', invertColors: true },
      week: { direction: 'up', changePercent: 9.1, period: 'last week', invertColors: true },
      month: { direction: 'down', changePercent: 11.6, period: 'last month', invertColors: true },
    },
  },
]

export function kpiTimeRangeDescription(range: KpiTimeRange): string {
  switch (range) {
    case 'today':
      return 'Metrics for today compared to yesterday.'
    case 'week':
      return 'Metrics for this week compared to last week.'
    case 'month':
      return 'Metrics for this month compared to last month.'
  }
}
