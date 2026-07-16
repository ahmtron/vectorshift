import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { VALID_DISEASES, type DiseaseSlug } from '@/lib/constants/diseases'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const a = searchParams.get('a')
  const b = searchParams.get('b')
  const disease = searchParams.get('disease')

  if (!a || !b) {
    return NextResponse.json({ success: false, error: { code: 'MISSING_PARAMS', message: 'a and b country slugs required' } }, { status: 400 })
  }

  const supabase = createServerClient()
  const [countryA, countryB] = await Promise.all([
    supabase.from('countries').select('*').eq('slug', a).single(),
    supabase.from('countries').select('*').eq('slug', b).single(),
  ])

  if (countryA.error || !countryA.data || countryB.error || !countryB.data) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'One or both countries not found' } }, { status: 404 })
  }

  let diseaseId: number | null = null
  const diseaseSlug = disease as DiseaseSlug | null
  if (diseaseSlug && VALID_DISEASES.includes(diseaseSlug)) {
    const { data: diseaseRow } = await supabase.from('diseases').select('id').eq('slug', diseaseSlug).single()
    if (diseaseRow) diseaseId = diseaseRow.id
  }

  const scoresQueryA = supabase.from('suitability_scores').select('*').eq('country_id', countryA.data.id).is('scenario', null).order('year')
  const scoresQueryB = supabase.from('suitability_scores').select('*').eq('country_id', countryB.data.id).is('scenario', null).order('year')
  if (diseaseId) {
    scoresQueryA.eq('disease_id', diseaseId)
    scoresQueryB.eq('disease_id', diseaseId)
  }
  const [scoresA, scoresB] = await Promise.all([scoresQueryA, scoresQueryB])

  const scoreA = scoresA.data?.[0]
  const scoreB = scoresB.data?.[0]

  return NextResponse.json({
    success: true,
    data: {
      country_a: countryA.data,
      country_b: countryB.data,
      scores_a: scoresA.data || [],
      scores_b: scoresB.data || [],
      comparison: {
        score_difference: (scoreA?.suitability_score || 0) - (scoreB?.suitability_score || 0),
        risk_a: scoreA?.risk_level,
        risk_b: scoreB?.risk_level,
      },
    },
  })
}
