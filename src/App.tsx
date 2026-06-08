import { useCallback, useLayoutEffect, useState } from 'react'
import { FleetSidebar } from './components/fleet-sidebar'
import { ExecutiveKpisSection } from './components/executive-kpis-section'
import { HorizontalBarChart } from './components/horizontal-bar-chart'
import { VehicleStatusPieChart } from './components/vehicle-status-pie-chart'
import { FleetMap } from './components/fleet-map'
import { AlertsTable } from './components/alerts-table'
import { FleetSearchBar } from './components/fleet-search-bar'
import { VehiclesView } from './components/vehicles-view'
import { DriversView } from './components/drivers-view'
import { AssignmentsView } from './components/assignments-view'
import { MaintenanceView } from './components/maintenance-view'
import { Button } from './components/ui/button'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'

type MainTab = 'Fleet' | 'Vehicles' | 'Drivers' | 'Assignment'

function parseMainTab(raw: string | null): MainTab | null {
  if (raw === 'Vehicles' || raw === 'Drivers' || raw === 'Assignment' || raw === 'Fleet') return raw
  return null
}

/** Read `tab` from hash first, then query. Figma html-to-design requires the hash to *start* with `#figmacapture=...`, so capture links should use `?tab=Vehicles#figmacapture=...` (not `tab` before `figmacapture` in the hash). */
function getTabFromLocation(): MainTab {
  const hash = window.location.hash.slice(1)
  if (hash) {
    const fromHash = parseMainTab(new URLSearchParams(hash).get('tab'))
    if (fromHash) return fromHash
  }
  const fromSearch = parseMainTab(new URLSearchParams(window.location.search).get('tab'))
  if (fromSearch) return fromSearch
  return 'Fleet'
}

function tabForSidebarLabel(label: string): MainTab | null {
  switch (label) {
    case 'Home':
      return 'Fleet'
    case 'Vehicles':
      return 'Vehicles'
    case 'Drivers':
      return 'Drivers'
    case 'Assignments':
      return 'Assignment'
    default:
      return null
  }
}

type SidebarItem =
  | 'Home'
  | 'Vehicles'
  | 'Drivers'
  | 'Assignments'
  | 'Maintenance'
  | 'FNOL / Claims'
  | 'Violations'
  | 'Insurance'
  | 'Support'
  | 'Telematics'
  | 'Settings'

function sidebarLabelForTab(tab: MainTab): SidebarItem {
  switch (tab) {
    case 'Fleet':
      return 'Home'
    case 'Vehicles':
      return 'Vehicles'
    case 'Drivers':
      return 'Drivers'
    case 'Assignment':
      return 'Assignments'
    default:
      return 'Home'
  }
}

const SEARCH_PLACEHOLDER: Record<MainTab, string> = {
  Fleet: 'Search alerts by plate, view, or message...',
  Vehicles: 'Search vehicles by plate, driver, depot...',
  Drivers: 'Search drivers by name, type, vehicle...',
  Assignment: 'Search assignments by plate, driver, or status...',
}

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>(getTabFromLocation)
  const [sidebarActive, setSidebarActive] = useState<SidebarItem>(() => sidebarLabelForTab(getTabFromLocation()))
  const [searchQuery, setSearchQuery] = useState('')

  useLayoutEffect(() => {
    const tab = getTabFromLocation()
    setActiveTab(tab)
    setSidebarActive(sidebarLabelForTab(tab))
  }, [])

  const setTab = useCallback((tab: string) => {
    const next = tab as MainTab
    setActiveTab(next)
    setSidebarActive(sidebarLabelForTab(next))
    setSearchQuery('')
    const url = new URL(window.location.href)
    if (url.hash.includes('figmacapture')) {
      const hp = new URLSearchParams(url.hash.slice(1))
      hp.set('tab', next)
      window.history.replaceState(null, '', `${url.pathname}${url.search}#${hp.toString()}`)
    } else {
      url.searchParams.set('tab', next)
      url.hash = ''
      window.history.replaceState(null, '', `${url.pathname}${url.search}`)
    }
  }, [])

  const vehicleStatusData = [
    { name: 'Available', value: 47 },
    { name: 'In Service', value: 23 },
    { name: 'Maintenance', value: 18 },
    { name: 'Incident', value: 9 },
    { name: 'Out of Service', value: 3 },
  ]

  const currentUseData = [
    { name: 'Available', value: 67 },
    { name: 'Taxi', value: 23 },
    { name: 'Allocated Vehicle', value: 2 },
    { name: 'Rate Card', value: 2 },
    { name: 'Fleet Pool', value: 6 },
  ]

  const tabTriggerClass =
    'rounded-none border-0 border-b-2 border-transparent bg-transparent px-1 py-2.5 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none sm:px-3 sm:text-base'

  return (
    <div className="flex h-dvh w-full min-w-0 overflow-hidden bg-muted/35">
      <div className="flex min-h-0 h-full w-full min-w-0 overflow-hidden shadow-sm">
        <FleetSidebar
          activeItem={sidebarActive}
          onNavigate={(label) => {
            setSidebarActive(label as SidebarItem)
            const next = tabForSidebarLabel(label)
            if (next) setTab(next)
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
          <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <img
                  src="/la28-header-banner.png"
                  alt="Honda, LA28 Olympic and Paralympic Games, Team USA, and NBC Olympics"
                  className="h-11 max-h-14 w-auto max-w-full object-contain object-left sm:h-12"
                />
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <Button size="sm" type="button" className="rounded-md bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                  EN
                </Button>
                <Button size="sm" type="button" variant="secondary" className="rounded-md border-0 bg-accent text-accent-foreground shadow-none hover:bg-accent/80">
                  ES
                </Button>
              </div>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-auto shadow-[inset_0_1px_0_0_rgb(15_23_42/0.05)]">
            <div className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={setTab} className="mb-6 gap-0">
                <TabsList className="h-auto w-full flex-wrap justify-start gap-x-1 rounded-none border-b border-border bg-transparent p-0 sm:w-auto">
                  <TabsTrigger value="Fleet" className={tabTriggerClass}>
                    Fleet
                  </TabsTrigger>
                  <TabsTrigger value="Vehicles" className={tabTriggerClass}>
                    Vehicles
                  </TabsTrigger>
                  <TabsTrigger value="Drivers" className={tabTriggerClass}>
                    Drivers
                  </TabsTrigger>
                  <TabsTrigger value="Assignment" className={tabTriggerClass}>
                    Assignments
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {sidebarActive !== 'Maintenance' &&
              activeTab !== 'Vehicles' &&
              activeTab !== 'Drivers' &&
              activeTab !== 'Assignment' ? (
                <FleetSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={SEARCH_PLACEHOLDER[activeTab]}
                />
              ) : null}

              <div key={`${sidebarActive}-${activeTab}`} className="fleet-tab-panel">
              {sidebarActive === 'Maintenance' ? (
                <MaintenanceView />
              ) : activeTab === 'Vehicles' ? (
                <VehiclesView />
              ) : activeTab === 'Drivers' ? (
                <DriversView />
              ) : activeTab === 'Assignment' ? (
                <AssignmentsView />
              ) : (
                <div className="space-y-8">
                  <ExecutiveKpisSection />

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <VehicleStatusPieChart data={vehicleStatusData} />
                    <HorizontalBarChart title="Current Use" data={currentUseData} />
                  </div>

                  <FleetMap />

                  <AlertsTable searchQuery={searchQuery} />
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
