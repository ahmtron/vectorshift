import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createServerClient } from '@/lib/supabase/server'
import { VALID_DISEASES } from '@/lib/constants/diseases'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `You are VectorShift Assistant, a specialized AI that answers questions about climate-driven disease vector risk using data from the VectorShift research platform.

CAPABILITIES:
- Answer questions about dengue, malaria, zika, chikungunya, lyme disease, and leishmaniasis habitat suitability
- Compare disease risk between countries
- Explain trends in disease risk over time
- Describe how climate factors drive vector risk

RULES:
1. Only answer questions related to climate and disease vector risk
2. Always base answers on the DATABASE CONTEXT provided
3. Always cite the data source at the end of your response
4. Never provide medical advice or personal health recommendations
5. Always include a disclaimer that this is research intelligence, not clinical guidance
6. When data is incomplete or uncertain, say so explicitly
7. Keep responses concise (3-5 sentences for simple questions, up to 8 for complex)
8. Suggest relevant page links where appropriate
9. If a question is outside your scope, say so and suggest what the user can explore

TONE: Scientific but accessible. Clear, direct, honest.

DISCLAIMER TO INCLUDE IN EVERY RESPONSE:
Add at end: "Source: VectorShift data (NASA POWER + WHO GHO). This is research intelligence only, not medical advice."`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, session_id } = body

    if (!query || query.length > 500) {
      return NextResponse.json({ success: false, error: { code: 'INVALID_QUERY', message: 'Query must be 1-500 characters' } }, { status: 400 })
    }

    const supabase = createServerClient()
    const diseaseSlug = VALID_DISEASES.find(d => query.toLowerCase().includes(d))
    let dbContext = "No specific data available for this query."

    if (diseaseSlug) {
      const { data: disease } = await supabase.from('diseases').select('*').eq('slug', diseaseSlug).single()
      const { data: scores } = await supabase.from('suitability_scores').select('*, countries(name), diseases(name)').eq('diseases.slug', diseaseSlug).limit(5)
      if (scores && scores.length > 0) {
        dbContext = `Recent ${diseaseSlug} suitability data:\n` + scores.map(s => `- ${s.countries?.name}: score=${s.suitability_score}, risk=${s.risk_level}, year=${s.year}`).join('\n')
      }
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `DATABASE CONTEXT:\n${dbContext}\n\nUSER QUESTION:\n${query}` },
      ],
      max_tokens: 600,
      temperature: 0.3,
    })

    const answer = completion.choices[0]?.message?.content || 'No response generated.'

    return NextResponse.json({
      success: true,
      data: { answer, sources: ['NASA POWER climate data', 'WHO Global Health Observatory'] },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'AI_ERROR', message: 'Failed to generate response' } }, { status: 500 })
  }
}
