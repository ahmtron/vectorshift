export const SCENARIOS = {
  SSP1_2_6: {
    slug: 'SSP1-2.6',
    label: 'SSP1-2.6',
    short: 'Optimistic',
    description: 'Low-emissions scenario with aggressive climate action.',
  },
  SSP2_4_5: {
    slug: 'SSP2-4.5',
    label: 'SSP2-4.5',
    short: 'Middle Path',
    description: 'Moderate emissions with balanced mitigation efforts.',
  },
  SSP5_8_5: {
    slug: 'SSP5-8.5',
    label: 'SSP5-8.5',
    short: 'Worst Case',
    description: 'High-emissions scenario with limited climate action.',
  },
} as const

export type ScenarioSlug = keyof typeof SCENARIOS
export const VALID_SCENARIOS = Object.values(SCENARIOS).map((s) => s.slug)
