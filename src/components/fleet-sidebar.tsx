import { useState } from 'react'
import {
  Home,
  Truck,
  Users,
  ClipboardList,
  Wrench,
  LifeBuoy,
  BarChart3,
  Settings,
  Sidebar,
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from './ui/utils'

interface FleetSidebarProps {
  activeItem?: string
  onNavigate?: (item: string) => void
}

export function FleetSidebar({ activeItem = 'Home', onNavigate }: FleetSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Truck, label: 'Vehicles', href: '#' },
    { icon: Users, label: 'Drivers', href: '#' },
    { icon: ClipboardList, label: 'Assignments', href: '#' },
    { icon: Wrench, label: 'Maintenance', href: '#' },
    { icon: BarChart3, label: 'FNOL / Claims', href: '#' },
    { icon: LifeBuoy, label: 'Violations', href: '#' },
    { icon: BarChart3, label: 'Insurance', href: '#' },
    { icon: LifeBuoy, label: 'Support', href: '#' },
    { icon: BarChart3, label: 'Telematics', href: '#' },
    { icon: Settings, label: 'Settings', href: '#' },
  ]

  const operatorSection = [{ label: 'Operator', href: '#' }]

  return (
    <div
      className={cn(
        'relative h-full shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-3 sm:px-4">
          {!isCollapsed && (
            <>
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground ring-1 ring-white/10">
                  JD
                </div>
                <span className="truncate text-sm font-medium text-sidebar-foreground">John Doe</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Sidebar className="h-4 w-4" />
              </Button>
            </>
          )}
          {isCollapsed && (
            <div className="flex w-full flex-col items-center gap-2 py-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground ring-1 ring-white/10">
                JD
              </div>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Expand sidebar"
              >
                <Sidebar className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate?.(item.label)}
              className={cn(
                'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors',
                isCollapsed ? 'justify-center' : 'gap-3',
                activeItem === item.label
                  ? 'bg-sidebar-primary font-medium text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-90" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          {operatorSection.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                'flex w-full items-center rounded-md px-3 py-2 text-sm text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isCollapsed ? 'justify-center' : 'gap-3',
              )}
            >
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-400/30 ring-1 ring-sky-300/40" />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
