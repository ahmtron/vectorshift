import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

function loadEnv() {
  try {
    const content = readFileSync('.env.local', 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
      process.env[key] = val
    }
  } catch (e) {
    console.error('Could not load .env.local:', e.message)
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return h
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

const DISEASES = [
  { slug: 'dengue', type: 'mosquito', bias: 1.0 },
  { slug: 'malaria', type: 'mosquito', bias: 0.95 },
  { slug: 'zika', type: 'mosquito', bias: 0.9 },
  { slug: 'chikungunya', type: 'mosquito', bias: 0.85 },
  { slug: 'lyme', type: 'tick', bias: -0.6 },
  { slug: 'leishmaniasis', type: 'sandfly', bias: 0.3 },
]

const DISEASE_IDS = {
  dengue: '450d4e25-92e4-453b-a595-65e396ca0745',
  malaria: '6e0bd82a-e044-4c0f-b3f6-d7dabcc97425',
  zika: 'ab3538ec-ed0f-43eb-96a4-a24933de3d0a',
  chikungunya: '1ae10e34-683b-4fc9-9809-3b1a1685f411',
  lyme: 'b5bb9d9f-0bfc-4e61-9712-a0bffc50392a',
  leishmaniasis: '6a81b613-8495-46e5-9f71-9a58c84f35dd',
}

function baseScore(lat, type, bias) {
  const a = Math.abs(lat)
  if (type === 'mosquito') {
    if (a < 23.5) return 0.55 + Math.random() * 0.2
    if (a < 40) return 0.25 + Math.random() * 0.2
    return 0.05 + Math.random() * 0.15
  }
  if (type === 'tick') {
    if (a >= 35 && a <= 60) return 0.45 + Math.random() * 0.25
    return 0.05 + Math.random() * 0.2
  }
  if (type === 'sandfly') {
    if (a < 35) return 0.4 + Math.random() * 0.25
    return 0.05 + Math.random() * 0.15
  }
  return 0.1 + Math.random() * 0.2
}

function risk(score) {
  if (score < 0.2) return 'none'
  if (score < 0.4) return 'low'
  if (score < 0.6) return 'moderate'
  if (score < 0.8) return 'high'
  return 'critical'
}

function warming(scenario, year) {
  if (year <= 2023) return (year - 1981) * 0.006
  const o = year - 2023
  if (scenario === 'SSP1-2.6') return (2023 - 1981) * 0.006 + o * 0.012
  if (scenario === 'SSP2-4.5') return (2023 - 1981) * 0.006 + o * 0.018
  if (scenario === 'SSP5-8.5') return (2023 - 1981) * 0.006 + o * 0.025
  return (year - 1981) * 0.006
}

async function main() {
  console.log('Fetching countries...')
  const { data: countries } = await supabase.from('countries').select('id, slug, name, latitude, longitude, region')
  const countryMap = new Map(countries.map(c => [c.slug, c]))

  console.log('Fetching existing suitability scores...')
  const { data: existingScores } = await supabase.from('suitability_scores').select('country_id, disease_id, year, scenario')
  const existingSet = new Set(existingScores.map(s => `${s.country_id}-${s.disease_id}-${s.year}-${s.scenario || 'null'}`))
  console.log(`Existing scores: ${existingSet.size}`)

  console.log('Seeding missing suitability scores...')
  const BATCH = 2000
  let batch = []
  let inserted = 0

  for (const c of countries) {
    const rng = mulberry32(hashStr(c.slug))
    const lat = c.latitude || 0
    const cid = c.id

    for (const d of DISEASES) {
      const base = baseScore(lat, d.type, d.bias)
      const did = DISEASE_IDS[d.slug]
      let score2000 = base + (2000 - 1981) * 0.004 + (rng() - 0.5) * 0.08
      score2000 = clamp(score2000, 0, 1)

      for (let year = 1981; year <= 2050; year++) {
        const proj = year > 2023
        const scenarios = proj ? ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5'] : [null]
        for (const scenario of scenarios) {
          const key = `${cid}-${did}-${year}-${scenario || 'null'}`
          if (existingSet.has(key)) continue

          const w = warming(scenario, year)
          let score = base + w + (rng() - 0.5) * 0.06
          score = clamp(score, 0, 1)

          const s1yr = year > 1981 ? clamp(score - (base + warming(scenario, year - 1) + (rng() - 0.5) * 0.06), -0.15, 0.15) : 0
          const s5yr = year > 1985 ? clamp(score - (base + warming(scenario, year - 5) + (rng() - 0.5) * 0.06), -0.4, 0.4) : 0
          const since2000 = score - score2000
          const newly = score >= 0.2 && score2000 < 0.2

          batch.push({
            country_id: cid,
            disease_id: did,
            year,
            scenario,
            temp_score: clamp(score + (rng() - 0.5) * 0.1, 0, 1),
            winter_score: clamp(score + (rng() - 0.5) * 0.12, 0, 1),
            humidity_score: clamp(score + (rng() - 0.5) * 0.08, 0, 1),
            rain_score: clamp(score + (rng() - 0.5) * 0.09, 0, 1),
            altitude_score: clamp(score + (rng() - 0.5) * 0.07, 0, 1),
            suitability_score: score,
            risk_level: risk(score),
            score_change_1yr: Math.round(s1yr * 1000) / 1000,
            score_change_5yr: Math.round(s5yr * 1000) / 1000,
            score_change_since_2000: Math.round(since2000 * 1000) / 1000,
            is_newly_at_risk: newly,
          })

          if (batch.length >= BATCH) {
            const { error } = await supabase.from('suitability_scores').insert(batch)
            if (error) console.error('suitability batch error:', error.message)
            else {
              inserted += batch.length
              console.log(`Inserted ${batch.length} suitability scores (total: ${inserted})`)
            }
            batch = []
          }
        }
      }
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('suitability_scores').insert(batch)
    if (error) console.error('final suitability error:', error.message)
    else {
      inserted += batch.length
      console.log(`Inserted final ${batch.length} suitability scores (total: ${inserted})`)
    }
  }

  console.log('Done!')
}

main().catch(e => { console.error(e); process.exit(1) })
