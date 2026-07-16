import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: country, error: countryError } = await supabase
    .from('countries')
    .select('*')
    .eq('slug', slug)
    .single()

  if (countryError || !country) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Country not found' } }, { status: 404 })
  }

  const [scores, projections, climate, health, population, vulnerability, incidence] = await Promise.all([
    supabase.from('suitability_scores').select('*, diseases(slug, name)').eq('country_id', country.id).is('scenario', null).order('year'),
    supabase.from('climate_projections').select('*').eq('country_id', country.id).order('year'),
    supabase.from('climate_data').select('*').eq('country_id', country.id).order('year'),
    supabase.from('health_system_indicators').select('*').eq('country_id', country.id).order('year', { ascending: false }),
    supabase.from('population_data').select('*').eq('country_id', country.id).order('year', { ascending: false }),
    supabase.from('vulnerability_index').select('*').eq('country_id', country.id).is('scenario', null).order('year'),
    supabase.from('disease_incidence').select('*').eq('country_id', country.id).order('year'),
  ])

  return NextResponse.json(
    {
      success: true,
      data: {
        country,
        scores: scores.data || [],
        projections: projections.data || [],
        climate: climate.data || [],
        health: health.data?.[0] || null,
        population: population.data?.[0] || null,
        vulnerability: vulnerability.data || [],
        incidence: incidence.data || [],
      },
    },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
  )
}
