import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  if (!q || q.length < 1) {
    return NextResponse.json({ success: false, error: { code: 'INVALID_QUERY', message: 'Query must be at least 1 character' } }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('countries')
    .select('name, iso3, slug, flag_emoji, region')
    .ilike('name', `%${q}%`)
    .limit(10)

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: { results: data || [] } })
}
