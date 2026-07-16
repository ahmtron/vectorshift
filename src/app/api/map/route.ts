import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { VALID_DISEASES } from '@/lib/constants/diseases'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const disease = searchParams.get('disease')
  const year = searchParams.get('year')
  const scenario = searchParams.get('scenario')

  const diseaseSlug = disease as typeof VALID_DISEASES[number] | undefined
  if (!diseaseSlug || !VALID_DISEASES.includes(diseaseSlug)) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_DISEASE', message: 'Invalid disease parameter' } }, { status: 400 })
  }
  const yearNum = parseInt(year || '2024')
  if (isNaN(yearNum) || yearNum < 1981 || yearNum > 2050) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_YEAR', message: 'Year must be between 1981 and 2050' } }, { status: 400 })
  }
  if (yearNum > 2023 && !scenario) {
    return NextResponse.json({ success: false, error: { code: 'SCENARIO_REQUIRED', message: 'scenario required for projected years' } }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase.rpc('get_map_data', {
    p_disease: diseaseSlug,
    p_year: yearNum,
    p_scenario: scenario || null,
  })

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json(
    { success: true, data, meta: { disease: diseaseSlug, year: yearNum, scenario: scenario || null, is_projected: yearNum > 2023 } },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
  )
}
