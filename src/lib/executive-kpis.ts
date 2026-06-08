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
    id: 'utilization',
    label: 'Utilization Rate',
    values: { today: '19%', week: '21%', month: '18%' },
    trends: {
      today: { direction: 'up', changePercent: 2.4, period: 'yesterday' },
      week: { direction: 'up', changePercent: 4.8, period: 'last week' },
      month: { direction: 'down', changePercent: 1.2, period: 'last month' },
    },
  },
  {
    id: 'vehicles-available',
    label: 'Vehicles Available',
    values: { today: '44', week: '47', month: '51' },
    trends: {
      today: { direction: 'down', changePercent: 3.1, period: 'yesterday' },
      week: { direction: 'down', changePercent: 6.0, period: 'last week' },
      month: { direction: 'down', changePercent: 12.1, period: 'last month' },
    },
  },
  {
    id: 'drivers-dispatched',
    label: 'Drivers Dispatched / Approved',
    values: { today: '7 / 67', week: '18 / 67', month: '52 / 67' },
    trends: {
      today: { direction: 'up', changePercent: 16.7, period: 'yesterday' },
      week: { direction: 'up', changePercent: 12.5, period: 'last week' },
      month: { direction: 'up', changePercent: 8.3, period: 'last month' },
    },
  },
  {
    id: 'alerts-incidents',
    label: 'Alerts Incidents',
    invertColors: true,
    values: { today: '10', week: '24', month: '68' },
    trends: {
      today: { direction: 'up', changePercent: 25, period: 'yesterday', invertColors: true },
      week: { direction: 'up', changePercent: 14.3, period: 'last week', invertColors: true },
      month: { direction: 'down', changePercent: 5.6, period: 'last month', invertColors: true },
    },
  },
  {
    id: 'maintenance-backlog',
    label: 'Maintenance Backlog',
    invertColors: true,
    values: { today: '5', week: '12', month: '38' },
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
