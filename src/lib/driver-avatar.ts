const AVATAR_PALETTES = [
  { bg: 'bg-sky-100', text: 'text-sky-900' },
  { bg: 'bg-violet-100', text: 'text-violet-900' },
  { bg: 'bg-emerald-100', text: 'text-emerald-900' },
  { bg: 'bg-amber-100', text: 'text-amber-900' },
  { bg: 'bg-rose-100', text: 'text-rose-900' },
  { bg: 'bg-cyan-100', text: 'text-cyan-900' },
  { bg: 'bg-indigo-100', text: 'text-indigo-900' },
  { bg: 'bg-teal-100', text: 'text-teal-900' },
] as const

export function driverInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]![0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]![0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

export function driverAvatarPalette(seed: string): (typeof AVATAR_PALETTES)[number] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 2147483647
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]!
}
