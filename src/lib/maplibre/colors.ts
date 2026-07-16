export function buildRiskColorExpression() {
  return [
    'interpolate',
    ['linear'],
    ['coalesce', ['get', 'score'], 0],
    0.0, '#1A1F2E',
    0.2, '#1E3A2F',
    0.4, '#4A3B1A',
    0.6, '#6B2D10',
    0.8, '#7A1515',
    1.0, '#9B1A1A',
  ]
}
