import { Navigation } from '@/components/layout/Navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { DISEASES } from '@/lib/constants/diseases'
import { createServerClient } from '@/lib/supabase/server'

type Props = { params: Promise<{ slug: string }> }

async function getCountryData(slug: string) {
  const supabase = createServerClient()
  const { data: country, error: countryError } = await supabase.from('countries').select('*').eq('slug', slug).single()
  if (countryError || !country) return null

  const [scores, projections, climate, health, population, vulnerability, incidence] = await Promise.all([
    supabase.from('suitability_scores').select('*').eq('country_id', country.id).eq('scenario', null).order('year'),
    supabase.from('climate_projections').select('*').eq('country_id', country.id).order('year'),
    supabase.from('climate_data').select('*').eq('country_id', country.id).order('year'),
    supabase.from('health_system_indicators').select('*').eq('country_id', country.id).order('year', { ascending: false }),
    supabase.from('population_data').select('*').eq('country_id', country.id).order('year', { ascending: false }),
    supabase.from('vulnerability_index').select('*').eq('country_id', country.id).eq('scenario', null).order('year'),
    supabase.from('disease_incidence').select('*').eq('country_id', country.id).order('year'),
  ])

  return {
    country,
    scores: scores.data || [],
    projections: projections.data || [],
    climate: climate.data || [],
    health: health.data?.[0] || null,
    population: population.data?.[0] || null,
    vulnerability: vulnerability.data || [],
    incidence: incidence.data || [],
  }
}

export default async function CountryProfilePage({ params }: Props) {
  const { slug } = await params
  const data = await getCountryData(slug)

  if (!data) return notFound()

  const { country, scores, projections, climate, health, population, vulnerability, incidence } = data // eslint-disable-line @typescript-eslint/no-unused-vars
  const latestScore = scores.filter(s => !s.scenario || s.scenario === null).slice(-1)[0]
  const latestVuln = vulnerability.slice(-1)[0]
  const latestPop = population
  const latestHealth = health

  const riskColor = latestScore ? (latestScore.risk_level === 'critical' ? 'text-danger' : latestScore.risk_level === 'high' ? 'text-warning' : latestScore.risk_level === 'moderate' ? 'text-accent-400' : 'text-success') : 'text-text-tertiary'

  const dengueScores = scores
    .filter(s => s.diseases?.slug === 'dengue')
    .map(s => ({ year: s.year, value: s.suitability_score }))

  const latestByDisease = scores
    .filter(s => !s.scenario || s.scenario === null)
    .reduce((acc, s) => {
      const slug = s.diseases?.slug
      if (!slug) return acc
      if (!acc[slug] || s.year > acc[slug].year) {
        acc[slug] = s
      }
      return acc
    }, {} as Record<string, typeof scores[0]>)

  const diseaseBarData = Object.entries(DISEASES).map(([slug, d]) => ({
    slug,
    name: d.name,
    score: latestByDisease[slug]?.suitability_score || 0,
    color: d.color_hex,
  }))

  const climateTrend = climate.map(c => ({ year: c.year, value: c.temp_mean_annual || 0 }))

  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Link href="/explorer" className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Map
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <span className="text-4xl">{country.flag_emoji}</span>
          <div>
            <h1 className="font-display text-4xl font-bold text-text-primary">{country.name}</h1>
            <div className="text-text-tertiary font-mono text-sm mt-1">{country.iso3} · {country.region}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {latestScore && (
            <div className="bg-background-secondary border border-border-subtle rounded-xl p-5">
              <div className="text-xs text-text-tertiary mb-1">Current Risk Score</div>
              <div className={`text-3xl font-mono font-bold ${riskColor}`}>{(latestScore.suitability_score * 100).toFixed(0)}%</div>
              <div className="text-xs text-text-secondary capitalize">{latestScore.risk_level} risk</div>
            </div>
          )}
          {latestVuln && (
            <div className="bg-background-secondary border border-border-subtle rounded-xl p-5">
              <div className="text-xs text-text-tertiary mb-1">Vulnerability</div>
              <div className="text-3xl font-mono font-bold text-text-primary">{(latestVuln.vulnerability_score * 100).toFixed(0)}%</div>
              <div className="text-xs text-text-secondary capitalize">{latestVuln.vulnerability_level}</div>
            </div>
          )}
          {latestPop && (
            <div className="bg-background-secondary border border-border-subtle rounded-xl p-5">
              <div className="text-xs text-text-tertiary mb-1">Population</div>
              <div className="text-3xl font-mono font-bold text-text-primary">{(latestPop.total_population / 1e6).toFixed(0)}M</div>
              <div className="text-xs text-text-secondary">{latestPop.urban_pct}% urban</div>
            </div>
          )}
          {latestHealth && (
            <div className="bg-background-secondary border border-border-subtle rounded-xl p-5">
              <div className="text-xs text-text-tertiary mb-1">Health System</div>
              <div className="text-3xl font-mono font-bold text-text-primary">{latestHealth.ghsi_overall_score?.toFixed(0)}</div>
              <div className="text-xs text-text-secondary">{latestHealth.physicians_per_1000} physicians/1k</div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-background-secondary border border-border-subtle rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Historical Risk Score (Dengue)</h3>
            <TrendAreaChart data={dengueScores} height={260} />
          </div>
          <div className="bg-background-secondary border border-border-subtle rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Latest Risk by Disease</h3>
            <div className="space-y-3">
              {diseaseBarData.map((d) => (
                <div key={d.slug} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-text-secondary truncate">{d.name}</div>
                  <div className="flex-1 h-2 bg-border-default rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.score * 100}%`, backgroundColor: d.color }} />
                  </div>
                  <div className="w-12 text-right text-xs font-mono text-text-primary">{(d.score * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-background-secondary border border-border-subtle rounded-xl p-6 mb-8">
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Historical Temperature</h3>
          <TrendAreaChart data={climateTrend} color="#8B9CC0" unit="°C" height={220} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-background-secondary border border-border-subtle rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Vulnerability Index</h3>
            <TrendAreaChart data={vulnerability.filter(v => !v.scenario || v.scenario === null).map(v => ({ year: v.year, value: v.vulnerability_score }))} color="#B86D06" height={220} />
          </div>
          <div className="bg-background-secondary border border-border-subtle rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Disease Incidence</h3>
            <TrendAreaChart data={incidence.filter(i => !i.scenario || i.scenario === null).map(i => ({ year: i.year, value: i.cases_reported }))} color="#F9BE42" height={220} />
          </div>
        </div>
      </div>
    </main>
  )
}