export const REGIONS = {
  Africa: { slug: 'africa', label: 'Africa' },
  Americas: { slug: 'americas', label: 'Americas' },
  'South-East Asia': { slug: 'south-east-asia', label: 'South-East Asia' },
  Europe: { slug: 'europe', label: 'Europe' },
  'Eastern Mediterranean': { slug: 'eastern-mediterranean', label: 'Eastern Mediterranean' },
  'Western Pacific': { slug: 'western-pacific', label: 'Western Pacific' },
} as const

export type RegionSlug = keyof typeof REGIONS
export const VALID_REGIONS = Object.values(REGIONS).map((r) => r.slug)
