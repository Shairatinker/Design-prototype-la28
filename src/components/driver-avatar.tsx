import { driverAvatarPalette, driverInitials } from '../lib/driver-avatar'
import { cn } from './ui/utils'

type DriverAvatarProps = {
  name: string
  seed?: string
  className?: string
}

export function DriverAvatar({ name, seed, className }: DriverAvatarProps) {
  const palette = driverAvatarPalette(seed ?? name)
  return (
    <span
      className={cn(
        'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
        palette.bg,
        palette.text,
        className,
      )}
      aria-hidden
    >
      {driverInitials(name)}
    </span>
  )
}
