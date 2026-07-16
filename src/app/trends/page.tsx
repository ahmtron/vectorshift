'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { DISEASES } from '@/lib/constants/diseases'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type StatsRow = {
  year: number
  scenario: string | null
  countries_high_risk: number
  countries_moderate_risk: number
  countries_newly_at_risk: number
  total_population_at_risk: number
  avg_global_suitability: number
}

export default function TrendsPage() {
  const [data, setData] = useState<StatsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disease, setDisease] = useState('dengue')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    fetch(`/api/trends?disease=${disease}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data)
        else setError('Failed to load trends data')
        setLoading(false)
      })
      .catch(() => {
        setError('Network error while loading trends')
        setLoading(false)
      })
  }, [disease])

  const latest = data.filter(d => !d.scenario || d.scenario === null).slice(-1)[0]
  const highRiskData = data.filter(d => !d.scenario || d.scenario === null).map(d => ({ year: d.year, value: d.countries_high_risk }))
  const popAtRiskData = data.filter(d => !d.scenario || d.scenario === null).map(d => ({ year: d.year, value: d.total_population_at_risk / 1e9 }))
  const suitabilityData = data.filter(d => !d.scenario || d.scenario === null).map(d => ({ year: d.year, value: d.avg_global_suitability }))

  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Link href="/explorer" className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Map
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-text-primary mb-2">Global Trends</h1>
            <p className="text-text-secondary">How total at-risk population and suitability scores have changed globally over time.</p>
          </div>
          <select
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
            className="h-10 rounded-md border border-border-default bg-background-secondary px-3 text-sm text-text-primary w-full md:w-auto"
          >
            {Object.entries(DISEASES).map(([slug, d]) => (
              <option key={slug} value={slug}>{d.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="bg-background-secondary border border-border-subtle rounded-xl p-8">
            <p className="text-text-tertiary">Loading trends...</p>
          </div>
        ) : error ? (
          <div className="bg-background-secondary border border-border-subtle rounded-xl p-8 text-center">
            <p className="text-danger text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-accent-400 hover:text-accent-300 text-sm font-medium">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background-secondary border border-border-subtle rounded-xl p-5">
                <div className="text-xs text-text-tertiary mb-1">High Risk Countries</div>
                <div className="text-3xl font-mono font-bold text-text-primary">{latest?.countries_high_risk || 0}</div>
              </div>
              <div className="bg-background-secondary border border-border-subtle rounded-xl p-5">
                <div className="text-xs text-text-tertiary mb-1">Population at Risk</div>
                <div className="text-3xl font-mono font-bold text-accent-400">{(latest?.total_population_at_risk || 0) > 1e9 ? `${((latest?.total_population_at_risk || 0) / 1e9).toFixed(1)}B` : `${((latest?.total_population_at_risk || 0) / 1e6).toFixed(0)}M`}</div>
              </div>
              <div className="bg-background-secondary border border-border-subtle rounded-xl p-5">
                <div className="text-xs text-text-tertiary mb-1">Avg Global Suitability</div>
                <div className="text-3xl font-mono font-bold text-text-primary">{((latest?.avg_global_suitability || 0) * 100).toFixed(0)}%</div>
              </div>
              <div className="bg-background-secondary border border-border-subtle rounded-xl p-5">
                <div className="text-xs text-text-tertiary mb-1">Newly At Risk</div>
                <div className="text-3xl font-mono font-bold text-danger">{latest?.countries_newly_at_risk || 0}</div>
              </div>
            </div>

            <div className="bg-background-secondary border border-border-subtle rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">High-Risk Countries Over Time</h3>
              <TrendAreaChart data={highRiskData} unit=" countries" height={280} />
            </div>

            <div className="bg-background-secondary border border-border-subtle rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Population at Risk (Billions)</h3>
              <TrendAreaChart data={popAtRiskData} unit="B" height={280} />
            </div>

            <div className="bg-background-secondary border border-border-subtle rounded-xl p-6">
              <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Average Global Suitability Score</h3>
              <TrendAreaChart data={suitabilityData} unit="" height={280} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}