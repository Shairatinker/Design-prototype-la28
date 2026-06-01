export const VEHICLE_TABLE_TAG_OPTIONS = [
  'Taxi',
  'Allocated Vehicle',
  'Rate Card',
  'Fleet Pool',
] as const

export type VehicleTableTag = (typeof VEHICLE_TABLE_TAG_OPTIONS)[number]

const LEGACY_TAG_TO_CANONICAL: Record<string, VehicleTableTag> = {
  'New Cars': 'Fleet Pool',
  New: 'Fleet Pool',
  'New R': 'Rate Card',
  Fleet: 'Fleet Pool',
  Electric: 'Fleet Pool',
  Trucks: 'Fleet Pool',
  Taxi: 'Taxi',
  'Allocated Vehicle': 'Allocated Vehicle',
  'Rate Card': 'Rate Card',
  'Fleet Pool': 'Fleet Pool',
}

export function cleanVehicleTagLabel(tag: string): string {
  return tag.replace(/ X$/, '').trim()
}

function toCanonical(tag: string): VehicleTableTag | null {
  const label = cleanVehicleTagLabel(tag)
  if ((VEHICLE_TABLE_TAG_OPTIONS as readonly string[]).includes(label)) {
    return label as VehicleTableTag
  }
  return LEGACY_TAG_TO_CANONICAL[label] ?? null
}

function uniqueTags(tags: VehicleTableTag[]): VehicleTableTag[] {
  return [...new Set(tags)]
}

/** Normalize seed tags and add demo multi-tag variety across the fleet. */
export function resolveVehicleTags(seedTags: string[], index: number): VehicleTableTag[] {
  const pool = VEHICLE_TABLE_TAG_OPTIONS
  const fromSeed = uniqueTags(
    seedTags.map(cleanVehicleTagLabel).map(toCanonical).filter((t): t is VehicleTableTag => t != null),
  )
  if (fromSeed.length > 1) return fromSeed

  const primary = fromSeed[0] ?? pool[index % pool.length]!

  if (index % 11 === 0) {
    return uniqueTags([pool[0], pool[1], pool[2], pool[3]])
  }
  if (index % 6 === 0) {
    return uniqueTags([primary, pool[(index + 1) % 4]!])
  }
  if (index % 4 === 0) {
    return uniqueTags([primary, pool[(index + 2) % 4]!, pool[(index + 3) % 4]!])
  }
  return [primary]
}
