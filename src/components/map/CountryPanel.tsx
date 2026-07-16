'use client'

import { useMapStore } from '@/hooks/useMapStore'
import { useEffect, useState } from 'react'
import { X, ExternalLink, GitCompare } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

type CountryData = {
  country: { name: string; slug: string; flag_emoji: string; iso3: string; longitude?: number; latitude?: number }
  scores: Array<{ year: number; scenario: string | null; suitability_score: number; risk_level: string }>
  projections: Array<{ year: number; scenario: string; temp_mean_annual: number }>
  climate: Array<{ year: number; temp_mean_annual: number; precip_annual_total: number }>
  health: { hospital_beds_per_1000: number; physicians_per_1000: number; health_expenditure_pct_gdp: number; ghsi_overall_score: number } | null
  population: { total_population: number; urban_pct: number } | null
  vulnerability: Array<{ year: number; scenario: string | null; vulnerability_score: number; vulnerability_level: string }>
  incidence: Array<{ year: number; cases_reported: number; deaths: number }>
}

export function CountryPanel() {
  const { isPanelOpen, selectedCountrySlug, togglePanel, activeYear, activeScenario, isProjected, mapRef } = useMapStore()
  const [data, setData] = useState<CountryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedCountrySlug) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    setData(null)
    fetch(`/api/country/${selectedCountrySlug}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(json => {
        if (!cancelled) {
          if (json.success) setData(json.data)
          else setError(json.error?.message || 'Failed to load')
        }
      })
      .catch(e => {
        if (!cancelled) setError(e.message || 'Network error')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [selectedCountrySlug])

  const handleZoomToCountry = () => {
    if (!mapRef || !selectedCountrySlug) return
    const countryData = data?.country
    if (!countryData) return
    mapRef.flyTo({
      center: [
        countryData.longitude || 0,
        countryData.latitude || 20
      ],
      zoom: 4,
      duration: 1500,
    })
  }

  const latestScore = data?.scores?.filter(s => {
    if (isProjected) return s.scenario === activeScenario && s.year === activeYear
    return !s.scenario || s.scenario === null
  }).slice(-1)[0]
  const latestProj = data?.projections?.filter(p => p.scenario === 'SSP2-4.5').slice(-1)[0]
  const latestVuln = data?.vulnerability?.filter(v => {
    if (isProjected) return v.scenario === activeScenario && v.year === activeYear
    return !v.scenario || v.scenario === null
  }).slice(-1)[0]
  const latestPop = data?.population
  const latestHealth = data?.health

  return (
    <AnimatePresence>
      {isPanelOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-4 right-4 bottom-24 z-30 w-[calc(100vw-32px)] max-w-80 bg-background-secondary/90 backdrop-blur-md border border-border-subtle rounded-lg overflow-hidden flex flex-col pointer-events-none"
        >
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-border-subtle pointer-events-auto">
            <h3 className="font-display font-semibold text-text-primary capitalize text-sm md:text-base">{selectedCountrySlug?.replace(/-/g, ' ') || 'Country'}</h3>
            <button onClick={togglePanel} className="p-1.5 md:p-1 text-text-tertiary hover:text-text-primary pointer-events-auto" aria-label="Close panel">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 pointer-events-auto">
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-background-primary/50 rounded-md border border-border-subtle animate-pulse" />
                ))}
              </div>
            )}
            {error && <p className="text-danger text-sm">{error}</p>}
            {data && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{data.country.flag_emoji}</span>
                  <div>
                    <div className="font-display font-semibold text-text-primary">{data.country.name}</div>
                    <div className="text-xs text-text-tertiary font-mono">{data.country.iso3}</div>
                  </div>
                </div>

                {latestScore && (
                  <div className="bg-background-primary/50 rounded-md p-3 border border-border-subtle">
                    <div className="text-xs text-text-tertiary mb-1">Current Risk Score</div>
                    <div className="text-2xl font-mono font-bold text-text-primary">{(latestScore.suitability_score * 100).toFixed(0)}%</div>
                    <div className="text-xs text-text-secondary capitalize">{latestScore.risk_level} risk</div>
                  </div>
                )}

                {latestProj && (
                  <div className="bg-background-primary/50 rounded-md p-3 border border-border-subtle">
                    <div className="text-xs text-text-tertiary mb-1">2050 Projected Warming ({activeScenario})</div>
                    <div className="text-2xl font-mono font-bold text-accent-400">+{((latestProj.temp_mean_annual - (data.climate[0]?.temp_mean_annual || 20))).toFixed(1)}°C</div>
                    <div className="text-xs text-text-secondary">From historical baseline</div>
                  </div>
                )}

                {latestVuln && (
                  <div className="bg-background-primary/50 rounded-md p-3 border border-border-subtle">
                    <div className="text-xs text-text-tertiary mb-1">Vulnerability Index</div>
                    <div className="text-2xl font-mono font-bold text-text-primary">{(latestVuln.vulnerability_score * 100).toFixed(0)}%</div>
                    <div className="text-xs text-text-secondary capitalize">{latestVuln.vulnerability_level}</div>
                  </div>
                )}

                {latestPop && (
                  <div className="bg-background-primary/50 rounded-md p-3 border border-border-subtle">
                    <div className="text-xs text-text-tertiary mb-1">Population (2023)</div>
                    <div className="text-lg font-mono font-bold text-text-primary">{Math.round(latestPop.total_population / 1000000)}M</div>
                    <div className="text-xs text-text-secondary">{latestPop.urban_pct}% urban</div>
                  </div>
                )}

                {latestHealth && (
                  <div className="bg-background-primary/50 rounded-md p-3 border border-border-subtle">
                    <div className="text-xs text-text-tertiary mb-1">Health System Score</div>
                    <div className="text-2xl font-mono font-bold text-text-primary">{latestHealth.ghsi_overall_score?.toFixed(0)}</div>
                    <div className="text-xs text-text-secondary">{latestHealth.physicians_per_1000} physicians/1k</div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button onClick={handleZoomToCountry} className="flex-1 inline-flex items-center justify-center gap-1 bg-background-primary border border-border-default hover:bg-background-hover text-text-primary text-xs font-medium px-3 py-2 rounded-md transition-colors pointer-events-auto">
                    Zoom to country
                  </button>
                  <a href={`/country/${selectedCountrySlug}`} className="flex-1 inline-flex items-center justify-center gap-1 bg-accent-400 hover:bg-accent-300 text-background-primary text-xs font-semibold px-3 py-2 rounded-md transition-colors pointer-events-auto">
                    View Profile <ExternalLink size={12} />
                  </a>
                  <a href={`/compare?a=${selectedCountrySlug}&b=italy`} className="flex-1 inline-flex items-center justify-center gap-1 border border-border-default hover:bg-background-hover text-text-primary text-xs font-medium px-3 py-2 rounded-md transition-colors pointer-events-auto">
                    Compare <GitCompare size={12} />
                  </a>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
