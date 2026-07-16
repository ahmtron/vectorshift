import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const disease = searchParams.get('disease')

  const supabase = createServerClient()
  let query = supabase.from('global_stats_cache').select('*').order('year')
  if (disease) {
    const { data: diseaseRow } = await supabase.from('diseases').select('id').eq('slug', disease).single()
    if (diseaseRow) {
      query = query.eq('disease_id', diseaseRow.id)
    }
  }
  const { data, error } = await query

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}
