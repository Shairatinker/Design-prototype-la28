import * as React from 'react'

import { cn } from './utils'

export interface SwitchProps extends Omit<React.ComponentProps<'button'>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Switch({ className, checked = false, onCheckedChange, disabled, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-state={checked ? 'checked' : 'unchecked'}
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-xs transition-colors',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  )
}

export { Switch }
