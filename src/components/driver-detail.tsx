import { ChevronLeft, X } from 'lucide-react'
import { DriverAvatar } from './driver-avatar'
import { DriverDetailSections } from './driver-detail-sections'
import { DriverRouteView } from './driver-route-view'

import type { DriverFullDetail } from '../data/drivers'
import {
  formatDriverStatusLabel,
  formatDriverTrainingLabel,
  formatDriverVerificationLabel,
} from '../data/drivers'
import {
  driverRiskScoreClass,
  driverRosterStatusClass,
  driverTrainingClass,
  driverVerificationClass,
} from '../lib/status-badge-styles'
import { cn } from './ui/utils'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const a = parts[0]?.[0] ?? ''
  const b = parts[1]?.[0] ?? ''
  return (a + b).toUpperCase() || '?'
}

const detailFields: { key: keyof Pick<
  DriverFullDetail,
  | 'driver'
  | 'status'
  | 'driverType'
  | 'dob'
  | 'age'
  | 'email'
  | 'phone'
  | 'riskScore'
  | 'licenseExpiry'
  | 'mvrStatus'
  | 'backgroundCheck'
  | 'training'
  | 'operatorBadge'
  | 'vehicleAssigned'
>; label: string; format?: (d: DriverFullDetail) => string }[] = [
  { key: 'driver', label: 'Driver' },
  { key: 'status', label: 'Status', format: (d) => formatDriverStatusLabel(d.status) },
  { key: 'driverType', label: 'Driver type' },
  { key: 'dob', label: 'DOB' },
  { key: 'age', label: 'Age', format: (d) => String(d.age) },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'riskScore', label: 'Risk Score', format: (d) => String(d.riskScore) },
  { key: 'licenseExpiry', label: 'License Expiry' },
  { key: 'mvrStatus', label: 'MVR Status', format: (d) => formatDriverVerificationLabel(d.mvrStatus) },
  {
    key: 'backgroundCheck',
    label: 'Background Check',
    format: (d) => formatDriverVerificationLabel(d.backgroundCheck),
  },
  { key: 'training', label: 'Training', format: (d) => formatDriverTrainingLabel(d.training) },
  { key: 'operatorBadge', label: 'Operator Badge' },
  { key: 'vehicleAssigned', label: 'Vehicle assigned' },
]

function renderFieldValue(
  driver: DriverFullDetail,
  key: (typeof detailFields)[number]['key'],
  raw: string | number,
  displayValue: string,
) {
  const isStatus = key === 'status'
  const isTraining = key === 'training'
  const isMvrOrBg = key === 'mvrStatus' || key === 'backgroundCheck'
  const isRisk = key === 'riskScore'

  if (isStatus) {
    return (
      <Badge variant="outline" className={cn('text-xs', driverRosterStatusClass(String(raw)))}>
        {displayValue}
      </Badge>
    )
  }
  if (isTraining) {
    return (
      <Badge variant="outline" className={cn('text-xs', driverTrainingClass(String(raw)))}>
        {displayValue}
      </Badge>
    )
  }
  if (isMvrOrBg) {
    return (
      <Badge variant="outline" className={cn('text-xs', driverVerificationClass(String(raw)))}>
        {displayValue}
      </Badge>
    )
  }
  if (isRisk) {
    return (
      <span className={cn('tabular-nums', driverRiskScoreClass(driver.riskScore))}>{displayValue}</span>
    )
  }
  return displayValue
}

export function DriverDetail({
  driver,
  onBack,
  onClose,
  onViewAll,
  layout = 'page',
  variant = 'full',
}: {
  driver: DriverFullDetail
  onBack?: () => void
  onClose?: () => void
  onViewAll?: () => void
  layout?: 'page' | 'drawer'
  /** Drawer side panel — compact summary with route web view. */
  variant?: 'preview' | 'full'
}) {
  const isDrawer = layout === 'drawer'
  const isPreview = isDrawer && variant === 'preview'

  const actionButtons = (
    <div className={cn('flex flex-wrap gap-2', isDrawer && 'w-full')}>
      <Button
        size="sm"
        type="button"
        className={isDrawer ? 'text-xs' : ''}
        style={{ backgroundColor: '#007FE0', color: '#ffffff' }}
      >
        Mark MVR &amp; background check passed
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className={cn(
          'rounded-md border-transparent bg-[#DBEAFE] text-[#0C4A6E] shadow-none hover:bg-[#BFDBFE]',
          isDrawer && 'text-xs',
        )}
      >
        Create assignment
      </Button>
    </div>
  )

  const fieldsList = detailFields.map(({ key, label, format }) => {
    const raw = driver[key]
    const value = format ? format(driver) : String(raw)
    const displayValue =
      key === 'operatorBadge' && String(raw) === 'Active' ? 'Uber-approved' : value
    return { key, label, displayValue, raw, rendered: renderFieldValue(driver, key, raw, displayValue) }
  })

  return (
    <div className={isDrawer ? 'space-y-4' : 'space-y-6'}>
      {isDrawer ? (
        <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <DriverAvatar name={driver.name} seed={driver.id} className="size-9 text-xs" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-foreground">{driver.name}</h2>
              <p className="truncate text-sm text-muted-foreground">{driver.driverType}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{driver.evaluatedLine}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {isPreview && onViewAll ? (
              <Button type="button" variant="outline" size="sm" onClick={onViewAll}>
                View all
              </Button>
            ) : null}
            {onClose ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label="Close details"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            ) : null}
          </div>
        </div>
      ) : onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#007FE0] hover:underline"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to dashboard
        </button>
      ) : null}

      {!isDrawer ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Driver Detail</h1>
            <p className="mt-1 text-sm text-muted-foreground">{driver.evaluatedLine}</p>
          </div>
          {actionButtons}
        </div>
      ) : isPreview ? null : (
        actionButtons
      )}

      {isPreview ? null : isDrawer ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
          {fieldsList.map(({ key, label, rendered }) => (
            <div
              key={key}
              className="flex flex-col gap-1 border-b border-border pb-2 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:gap-3"
            >
              <span className="shrink-0 text-xs text-muted-foreground sm:w-28">{label}</span>
              <span className="min-w-0 text-sm font-medium text-foreground">{rendered}</span>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
            <Avatar className="size-28 shrink-0 rounded-lg border bg-muted">
              <AvatarFallback className="rounded-lg text-lg font-medium text-muted-foreground">
                {initials(driver.driver)}
              </AvatarFallback>
            </Avatar>
            <dl className="grid min-w-0 flex-1 grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
              {fieldsList.map(({ key, label, rendered }) => (
                <div key={key} className="grid grid-cols-[minmax(0,140px)_1fr] gap-x-3 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 font-medium text-foreground">{rendered}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {isPreview ? (
        <DriverRouteView driverName={driver.name} compact />
      ) : (
        <>
          <DriverRouteView driverName={driver.name} />

          <DriverDetailSections driver={driver} tabStyle="underline" />
        </>
      )}
    </div>
  )
}
