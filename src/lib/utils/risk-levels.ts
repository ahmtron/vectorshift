export function classifyRisk(score: number): 'none' | 'low' | 'moderate' | 'high' | 'critical' {
  if (score >= 0.8) return 'critical'
  if (score >= 0.6) return 'high'
  if (score >= 0.4) return 'moderate'
  if (score >= 0.2) return 'low'
  return 'none'
}

export function getRiskColor(level: 'none' | 'low' | 'moderate' | 'high' | 'critical'): string {
  const colors = {
    none: '#1A1F2E',
    low: '#1E3A2F',
    moderate: '#4A3B1A',
    high: '#6B2D10',
    critical: '#7A1515',
  }
  return colors[level]
}

export function getRiskLabel(level: 'none' | 'low' | 'moderate' | 'high' | 'critical'): string {
  const labels = {
    none: 'Minimal',
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    critical: 'Critical',
  }
  return labels[level]
}
