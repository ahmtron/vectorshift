export const LAYER_DEFS = {
  'country-fill': {
    type: 'fill',
    paint: {
      'fill-color': ['interpolate', ['linear'], ['coalesce', ['get', 'score'], 0], 0.0, '#1A1F2E', 0.2, '#1E3A2F', 0.4, '#4A3B1A', 0.6, '#6B2D10', 0.8, '#7A1515', 1.0, '#9B1A1A'],
      'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.85, 0.70],
    },
  },
  'country-border': {
    type: 'line',
    paint: { 'line-color': '#2A3358', 'line-width': 0.5 },
  },
  'country-new-risk-border': {
    type: 'line',
    filter: ['==', ['get', 'is_newly_at_risk'], true],
    paint: { 'line-color': '#F5A623', 'line-width': 2, 'line-opacity': ['interpolate', ['linear'], ['get', 'suitability_score'], 0.4, 0.5, 1.0, 1.0] },
  },
} as const
