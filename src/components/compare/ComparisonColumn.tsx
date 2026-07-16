'use client'

import { useEffect, useState } from 'react'
import { useExplorerStore } from '@/hooks/useExplorerStore'
import { motion } from 'motion/react'

type CompareData = {
  country_a: { name: string; slug: string; flag_emoji: string }
  country_b: { name: string; slug: string; flag_emoji: string }
  scores_a: Array<{ year: number; scenario: string | null; suitability_score: number; risk_level: string; score_change_since_2000: number; score_change_1yr: number }>
  scores_b: Array<{ year: number; scenario: string | null; suitability_score: number; risk_level: string; score_change_since_2000: number; score_change_1yr: number }>
  comparison: { score_difference: number; risk_a: string | null; risk_b: string | null }
}

export function ComparisonColumn({ side }: { side: 'a' | 'b' }) {
  const store = useExplorerStore()
  const [data, setData] = useState<CompareData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!store.a || !store.b) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ a: store.a, b: store.b })
    if (store.disease && store.disease !== 'all') params.set('disease', store.disease)
    fetch(`/api/compare?${params}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(json => {
        if (json.success) setData(json.data)
        else setError('Failed to load comparison')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [store.a, store.b, store.disease])

  const isA = side === 'a'
  const countryData = data ? (isA ? data.country_a : data.country_b) : null
  const scores = data ? (isA ? data.scores_a : data.scores_b) : []
  const latest = scores.filter(s => !s.scenario || s.scenario === null).slice(-1)[0]
  const projected = scores.filter(s => s.scenario === 'SSP2-4.5' && s.year === 2050)[0]
  const scorePct = latest ? Math.round(latest.suitability_score * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background-secondary border border-border-subtle rounded-xl p-6"
    >
      <h3 className="font-display text-xl font-semibold text-text-primary mb-1">
        {countryData ? countryData.name : (isA ? 'Country A' : 'Country B')}
      </h3>
      {countryData && <div className="text-sm text-text-tertiary mb-4">{countryData.flag_emoji} {countryData.slug}</div>}

      {!store.a || !store.b ? (
        <p className="text-text-tertiary text-sm">Select two countries to compare</p>
      ) : loading ? (
        <p className="text-text-secondary text-sm">Loading comparison...</p>
      ) : error ? (
        <p className="text-danger text-sm">{error}</p>
      ) : data ? (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-text-tertiary mb-1">
              <span>Risk Score</span>
              <span>{scorePct}%</span>
            </div>
            <div className="h-2 bg-border-default rounded-full overflow-hidden">
              <div className="h-full bg-accent-400 rounded-full transition-all duration-500" style={{ width: `${scorePct}%` }} />
            </div>
            {latest && <div className="text-xs text-text-secondary mt-1 capitalize">{latest.risk_level} risk (2023)</div>}
          </div>

          {projected && (
            <div className="bg-background-primary/50 rounded-md p-3 border border-border-subtle">
              <div className="text-xs text-text-tertiary mb-1">2050 Projected Score (SSP2-4.5)</div>
              <div className="text-xl font-mono font-bold text-accent-400">{(projected.suitability_score * 100).toFixed(0)}%</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-background-primary/50 rounded-md p-3 border border-border-subtle">
              <div className="text-xs text-text-tertiary">Trend since 2000</div>
              <div className="font-mono font-bold text-text-primary">
                {latest ? (latest.score_change_since_2000 > 0 ? '+' : '') + (latest.score_change_since_2000 * 100).toFixed(0) + '%' : '—'}
              </div>
            </div>
            <div className="bg-background-primary/50 rounded-md p-3 border border-border-subtiary">
              <div className="text-xs text-text-tertiary">1yr Change</div>
              <div className="font-mono font-bold text-text-primary">
                {latest ? (latest.score_change_1yr > 0 ? '+' : '') + (latest.score_change_1yr * 100).toFixed(0) + '%' : '—'}
              </div>
            </div>
          </div>

          {data.comparison && (
            <div className="text-xs text-text-secondary border-t border-border-subtle pt-3">
              <span className="font-medium">Difference: </span>
              {data.comparison.score_difference > 0 ? (
                <span>{isA ? 'A' : 'B'} is higher by {(data.comparison.score_difference * 100).toFixed(0)}%</span>
              ) : data.comparison.score_difference < 0 ? (
                <span>{isA ? 'B' : 'A'} is higher by {(Math.abs(data.comparison.score_difference) * 100).toFixed(0)}%</span>
              ) : (
                <span>Equal risk</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-text-tertiary text-sm">Select a country to compare</p>
      )}
    </motion.div>
  )
}
