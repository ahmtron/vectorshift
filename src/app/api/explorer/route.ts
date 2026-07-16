import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const perPage = Math.min(parseInt(searchParams.get('per_page') || '50'), 200)
  const disease = searchParams.get('disease') || 'all'

  const supabase = createServerClient()
  let query = supabase.from('suitability_scores').select('*, countries(name, slug), diseases(slug)').order('year', { ascending: false })
  if (disease !== 'all') {
    const { data: diseaseRow } = await supabase.from('diseases').select('id').eq('slug', disease).single()
    if (diseaseRow) query = query.eq('disease_id', diseaseRow.id)
  }
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, count, error } = await query.range(from, to)

  const records = (data || []).map(row => ({
    id: row.id,
    country_name: row.countries?.name || 'Unknown',
    country_slug: row.countries?.slug || 'unknown',
    disease_slug: row.diseases?.slug || 'unknown',
    year: row.year,
    scenario: row.scenario,
    suitability_score: row.suitability_score,
    risk_level: row.risk_level,
    score_change_1yr: row.score_change_1yr,
    score_change_since_2000: row.score_change_since_2000,
  }))

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    data: { records, pagination: { total: count || 0, page, per_page: perPage, total_pages: Math.ceil((count || 0) / perPage) } },
  })
}
