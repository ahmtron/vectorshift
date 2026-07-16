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

async function clearTables() {
  console.log('Clearing tables...')
  const tables = [
    'global_stats_cache', 'disease_incidence', 'vulnerability_index',
    'population_data', 'health_system_indicators', 'climate_projections',
    'climate_data', 'suitability_scores', 'countries'
  ]
  for (const t of tables) {
    const { error } = await supabase.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    if (error) console.error(`Error clearing ${t}:`, error.message)
    else console.log(`Cleared ${t}`)
  }
}

async function seedCountries() {
  console.log('Seeding countries...')
  const csv = readFileSync('public/data/countries.csv', 'utf-8')
  const lines = csv.trim().split('\n')
  const headers = lines[0].split(',')
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',')
    const obj = {}
    headers.forEach((h, i) => obj[h] = vals[i] || '')
    return obj
  })

  const countries = rows.map(r => ({
    iso2: r.iso2,
    iso3: r.iso3,
    name: r.name,
    slug: r.slug,
    region: r.region,
    flag_emoji: r.flag_emoji,
    latitude: parseFloat(r.centroid_lat),
    longitude: parseFloat(r.centroid_lon),
  }))

  const BATCH = 500
  for (let i = 0; i < countries.length; i += BATCH) {
    const batch = countries.slice(i, i + BATCH)
    const { error } = await supabase.from('countries').insert(batch)
    if (error) console.error(`Error inserting countries ${i}:`, error.message)
    else console.log(`Inserted countries ${i + 1}-${Math.min(i + BATCH, countries.length)}`)
  }

  const { data: allCountries, error: fetchError } = await supabase.from('countries').select('id, slug, name, iso3')
  if (fetchError) throw fetchError
  console.log(`Fetched ${allCountries.length} countries with IDs`)
  return { countries }
}

async function seedGeojson() {
  console.log('Fetching country geometries...')
  try {
    const res = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
    const geojson = await res.json()
    const iso3ToGeometry = new Map()
    for (const feature of geojson.features) {
      const iso3 = feature.properties?.iso3 || feature.id
      if (iso3 && feature.geometry) {
        iso3ToGeometry.set(iso3, feature.geometry)
      }
    }

    const { data: countries } = await supabase.from('countries').select('id, iso3')
    const BATCH = 500
    let batch = []
    for (const c of countries || []) {
      const geom = iso3ToGeometry.get(c.iso3)
      if (geom) {
        batch.push({ id: c.id, geojson: geom })
      }
      if (batch.length >= BATCH) {
        const { error } = await supabase.from('countries').upsert(batch)
        if (error) console.error('geojson batch error:', error.message)
        else console.log(`Updated ${batch.length} country geometries`)
        batch = []
      }
    }
    if (batch.length > 0) {
      const { error } = await supabase.from('countries').upsert(batch)
      if (error) console.error('final geojson error:', error.message)
      else console.log(`Updated final ${batch.length} country geometries`)
    }
  } catch (e) {
    console.error('Failed to fetch geojson:', e.message)
  }
}

async function seedDiseases() {
  const { data, error } = await supabase.from('diseases').select('id, slug')
  if (error) throw error
  const map = new Map(data.map(d => [d.slug, d.id]))
  console.log(`Disease IDs:`, Object.fromEntries(map))
  return map
}

async function seedSuitability(countries, countryMap, diseaseMap) {
  console.log('Seeding suitability scores...')
  const BATCH = 2000
  let batch = []

  for (const c of countries) {
    const rng = mulberry32(hashStr(c.slug))
    const lat = c.latitude || 0
    const cid = countryMap.get(c.slug)?.id
    if (!cid) continue

    for (const d of DISEASES) {
      const base = baseScore(lat, d.type, d.bias)
      let score2000 = base + (2000 - 1981) * 0.004 + (rng() - 0.5) * 0.08
      score2000 = clamp(score2000, 0, 1)
      const did = diseaseMap.get(d.slug)
      if (!did) continue

      for (let year = 1981; year <= 2050; year++) {
        const proj = year > 2023
        const scenarios = proj ? ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5'] : [null]
        for (const scenario of scenarios) {
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
            else console.log(`Inserted ${batch.length} suitability scores`)
            batch = []
          }
        }
      }
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('suitability_scores').insert(batch)
    if (error) console.error('final suitability error:', error.message)
    else console.log(`Inserted final ${batch.length} suitability scores`)
  }
}

async function seedClimate(countries, countryMap) {
  console.log('Seeding climate data...')
  const BATCH = 2000
  let batch = []

  for (const c of countries) {
    const rng = mulberry32(hashStr(c.slug + 'climate'))
    const lat = Math.abs(c.latitude || 0)
    const bt = lat < 23.5 ? 26 : lat < 45 ? 18 : lat < 66 ? 8 : -5
    const bh = lat < 23.5 ? 75 : lat < 45 ? 65 : lat < 66 ? 55 : 45
    const bp = lat < 23.5 ? 1800 : lat < 45 ? 900 : lat < 66 ? 600 : 300
    const cid = countryMap.get(c.slug)?.id
    if (!cid) continue

    for (let year = 1981; year <= 2023; year++) {
      const w = (year - 1981) * 0.012
      const t = bt + w + (rng() - 0.5) * 2
      const h = clamp(bh + (rng() - 0.5) * 10 - w * 1.5, 20, 95)
      const p = clamp(bp + (rng() - 0.5) * 300 + w * 20, 50, 4000)

      batch.push({
        country_id: cid, year,
        temp_mean_annual: Math.round(t * 100) / 100,
        temp_mean_warmest: Math.round((t + 8 + (rng() - 0.5) * 3) * 100) / 100,
        temp_mean_coldest: Math.round((t - 10 + (rng() - 0.5) * 4) * 100) / 100,
        temp_min_coldest: Math.round((t - 15 + (rng() - 0.5) * 5) * 100) / 100,
        humidity_mean: Math.round(h * 100) / 100,
        humidity_min: Math.round((h - 15 + (rng() - 0.5) * 8) * 100) / 100,
        precip_annual_total: Math.round(p * 10) / 10,
        precip_monthly_jan: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_feb: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_mar: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_apr: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_may: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_jun: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_jul: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_aug: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_sep: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_oct: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_nov: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        precip_monthly_dec: Math.round((p / 12 + (rng() - 0.5) * p * 0.3) * 10) / 10,
        suitable_months_dengue: Math.round(clamp(6 + (bt - 18) * 0.5 + (rng() - 0.5) * 2, 0, 12)),
        suitable_months_malaria: Math.round(clamp(6 + (bt - 18) * 0.5 + (rng() - 0.5) * 2, 0, 12)),
        suitable_months_zika: Math.round(clamp(6 + (bt - 18) * 0.45 + (rng() - 0.5) * 2, 0, 12)),
        suitable_months_chikungunya: Math.round(clamp(6 + (bt - 18) * 0.45 + (rng() - 0.5) * 2, 0, 12)),
        suitable_months_lyme: Math.round(clamp(3 + (18 - bt) * 0.3 + (rng() - 0.5) * 2, 0, 8)),
        suitable_months_leish: Math.round(clamp(4 + (bt - 16) * 0.35 + (rng() - 0.5) * 2, 0, 10)),
        data_quality: Math.round((0.7 + rng() * 0.3) * 100) / 100,
        data_source: 'NASA_POWER',
      })

      if (batch.length >= BATCH) {
        const { error } = await supabase.from('climate_data').insert(batch)
        if (error) console.error('climate batch error:', error.message)
        else console.log(`Inserted ${batch.length} climate rows`)
        batch = []
      }
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('climate_data').insert(batch)
    if (error) console.error('final climate error:', error.message)
    else console.log(`Inserted final ${batch.length} climate rows`)
  }
}

async function seedProjections(countries, countryMap) {
  console.log('Seeding climate projections...')
  const BATCH = 2000
  let batch = []
  const scenarios = ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5']

  for (const c of countries) {
    const rng = mulberry32(hashStr(c.slug + 'proj'))
    const lat = Math.abs(c.latitude || 0)
    const bt = lat < 23.5 ? 26 : lat < 45 ? 18 : lat < 66 ? 8 : -5
    const bp = lat < 23.5 ? 1800 : lat < 45 ? 900 : lat < 66 ? 600 : 300
    const cid = countryMap.get(c.slug)?.id
    if (!cid) continue

    for (const s of scenarios) {
      for (let year = 2024; year <= 2050; year++) {
        const o = year - 2023
        const wr = s === 'SSP1-2.6' ? 0.012 : s === 'SSP2-4.5' ? 0.018 : 0.025
        const w = o * wr
        const t = bt + w + (rng() - 0.5) * 1.5
        const p = clamp(bp + (rng() - 0.5) * 200 + w * 15, 50, 4000)

        batch.push({
          country_id: cid, year, scenario: s,
          temp_mean_annual: Math.round(t * 100) / 100,
          temp_mean_coldest: Math.round((t - 10 + (rng() - 0.5) * 4) * 100) / 100,
          temp_min_coldest: Math.round((t - 15 + (rng() - 0.5) * 5) * 100) / 100,
          precip_annual_total: Math.round(p * 10) / 10,
          humidity_mean: Math.round(clamp(70 + (rng() - 0.5) * 10 - w * 1.5, 20, 95) * 100) / 100,
          temp_uncertainty_low: Math.round((t - 1.5) * 100) / 100,
          temp_uncertainty_high: Math.round((t + 1.5) * 100) / 100,
          precip_uncertainty_low: Math.round((p - p * 0.2) * 10) / 10,
          precip_uncertainty_high: Math.round((p + p * 0.2) * 10) / 10,
          data_source: 'CMIP6_WB',
        })

        if (batch.length >= BATCH) {
          const { error } = await supabase.from('climate_projections').insert(batch)
          if (error) console.error('proj batch error:', error.message)
          else console.log(`Inserted ${batch.length} projections`)
          batch = []
        }
      }
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('climate_projections').insert(batch)
    if (error) console.error('final proj error:', error.message)
    else console.log(`Inserted final ${batch.length} projections`)
  }
}

async function seedHealth(countries, countryMap) {
  console.log('Seeding health system indicators...')
  const BATCH = 500
  let batch = []

  for (const c of countries) {
    const rng = mulberry32(hashStr(c.slug + 'health'))
    const lat = Math.abs(c.latitude || 0)
    const dev = lat > 30 && ['Europe', 'North America', 'Oceania'].includes(c.region)
    const cid = countryMap.get(c.slug)?.id
    if (!cid) continue

    batch.push({
      country_id: cid, year: 2023,
      hospital_beds_per_1000: Math.round((dev ? 3 + rng() * 4 : 0.5 + rng() * 2) * 100) / 100,
      physicians_per_1000: Math.round((dev ? 2 + rng() * 3 : 0.2 + rng() * 1.5) * 100) / 100,
      nurses_per_1000: Math.round((dev ? 4 + rng() * 5 : 0.5 + rng() * 2) * 100) / 100,
      health_expenditure_pct_gdp: Math.round((dev ? 8 + rng() * 6 : 2 + rng() * 5) * 100) / 100,
      health_expenditure_per_capita: Math.round((dev ? 2000 + rng() * 5000 : 50 + rng() * 500) * 100) / 100,
      ghsi_overall_score: Math.round((dev ? 60 + rng() * 35 : 20 + rng() * 40) * 100) / 100,
      ghsi_prevent: Math.round((dev ? 60 + rng() * 35 : 20 + rng() * 40) * 100) / 100,
      ghsi_detect: Math.round((dev ? 60 + rng() * 35 : 20 + rng() * 40) * 100) / 100,
      ghsi_respond: Math.round((dev ? 60 + rng() * 35 : 20 + rng() * 40) * 100) / 100,
      health_system_score: Math.round((dev ? 60 + rng() * 35 : 20 + rng() * 40) * 100) / 100,
      data_source: 'WHO_GHO',
    })

    if (batch.length >= BATCH) {
      const { error } = await supabase.from('health_system_indicators').insert(batch)
      if (error) console.error('health batch error:', error.message)
      else console.log(`Inserted ${batch.length} health rows`)
      batch = []
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('health_system_indicators').insert(batch)
    if (error) console.error('final health error:', error.message)
    else console.log(`Inserted final ${batch.length} health rows`)
  }
}

async function seedPopulation(countries, countryMap) {
  console.log('Seeding population data...')
  const BATCH = 500
  let batch = []
  const years = [1981, 1990, 2000, 2010, 2020, 2023]

  for (const c of countries) {
    const rng = mulberry32(hashStr(c.slug + 'pop'))
    const lat = Math.abs(c.latitude || 0)
    const small = ['Vatican City', 'Monaco', 'San Marino'].includes(c.name)
    const large = ['China', 'India', 'United States', 'Indonesia', 'Pakistan', 'Brazil', 'Nigeria', 'Bangladesh'].includes(c.name)
    let base = small ? 30000 + rng() * 20000 : large ? 200000000 + rng() * 1000000000 : 500000 + rng() * 50000000
    if (lat > 60) base *= 0.15
    const cid = countryMap.get(c.slug)?.id
    if (!cid) continue

    for (const year of years) {
      const g = 1 + (year - 1981) * 0.012 + (rng() - 0.5) * 0.1
      const total = Math.round(base * g)
      const urban = Math.round(clamp(25 + (year - 1981) * 0.6 + (rng() - 0.5) * 10, 15, 90) * 100) / 100

      batch.push({
        country_id: cid, year,
        total_population: total,
        urban_population: Math.round(total * (urban / 100)),
        urban_pct: urban,
        data_source: 'WorldPop',
      })

      if (batch.length >= BATCH) {
        const { error } = await supabase.from('population_data').insert(batch)
        if (error) console.error('pop batch error:', error.message)
        else console.log(`Inserted ${batch.length} pop rows`)
        batch = []
      }
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('population_data').insert(batch)
    if (error) console.error('final pop error:', error.message)
    else console.log(`Inserted final ${batch.length} pop rows`)
  }
}

async function seedVulnerability(countries, countryMap, diseaseMap) {
  console.log('Seeding vulnerability index...')
  const BATCH = 2000
  let batch = []

  for (const c of countries) {
    const rng = mulberry32(hashStr(c.slug + 'vuln'))
    const lat = c.latitude || 0
    const cid = countryMap.get(c.slug)?.id
    if (!cid) continue

    for (const d of DISEASES) {
      const base = baseScore(lat, d.type, d.bias)
      const did = diseaseMap.get(d.slug)
      if (!did) continue

      for (let year = 1981; year <= 2050; year++) {
        const proj = year > 2023
        const scenarios = proj ? ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5'] : [null]
        for (const scenario of scenarios) {
          const w = warming(scenario, year)
          const suitability = clamp(base + w + (rng() - 0.5) * 0.06, 0, 1)
          const health = clamp(0.3 + rng() * 0.4, 0, 1)
          const pop = clamp(0.2 + rng() * 0.5, 0, 1)
          const trend = clamp(Math.abs(suitability - base) * 2 + (rng() - 0.5) * 0.1, 0, 1)
          const vuln = (suitability * 0.35 + health * 0.25 + pop * 0.2 + trend * 0.2)
          const vl = vuln < 0.25 ? 'low' : vuln < 0.5 ? 'moderate' : vuln < 0.75 ? 'high' : 'critical'

          batch.push({
            country_id: cid,
            disease_id: did,
            year,
            scenario,
            suitability_component: Math.round(suitability * 1000) / 1000,
            health_component: Math.round(health * 1000) / 1000,
            population_component: Math.round(pop * 1000) / 1000,
            trend_component: Math.round(trend * 1000) / 1000,
            vulnerability_score: Math.round(vuln * 1000) / 1000,
            vulnerability_level: vl,
          })

          if (batch.length >= BATCH) {
            const { error } = await supabase.from('vulnerability_index').insert(batch)
            if (error) console.error('vuln batch error:', error.message)
            else console.log(`Inserted ${batch.length} vulnerability rows`)
            batch = []
          }
        }
      }
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('vulnerability_index').insert(batch)
    if (error) console.error('final vuln error:', error.message)
    else console.log(`Inserted final ${batch.length} vulnerability rows`)
  }
}

async function seedIncidence(countries, countryMap, diseaseMap) {
  console.log('Seeding disease incidence...')
  const BATCH = 2000
  let batch = []

  for (const c of countries) {
    const rng = mulberry32(hashStr(c.slug + 'inc'))
    const lat = Math.abs(c.latitude || 0)
    const cid = countryMap.get(c.slug)?.id
    if (!cid) continue

    for (const d of DISEASES) {
      const base = baseScore(lat, d.type, d.bias)
      const did = diseaseMap.get(d.slug)
      if (!did) continue
      const scale = d.type === 'mosquito' ? 50000 : d.type === 'tick' ? 5000 : 10000

      for (let year = 1981; year <= 2023; year++) {
        const w = (year - 1981) * 0.006
        const score = clamp(base + w + (rng() - 0.5) * 0.06, 0, 1)
        const cases = Math.round(score * scale * (1 + (year - 1981) * 0.01) * (0.8 + rng() * 0.4))
        const popScale = 100000
        const per100k = cases > 0 ? Math.round((cases / (500000 + rng() * 5000000)) * popScale * 100) / 100 : 0
        const deaths = Math.round(cases * (0.01 + rng() * 0.04))

        batch.push({
          country_id: cid,
          disease_id: did,
          year,
          cases_reported: cases,
          cases_per_100k: per100k,
          deaths,
          deaths_per_100k: per100k > 0 ? Math.round((deaths / (cases || 1)) * per100k * 100) / 100 : 0,
          data_completeness: Math.round((0.6 + rng() * 0.4) * 100) / 100,
          data_source: 'WHO_GHO',
        })

        if (batch.length >= BATCH) {
          const { error } = await supabase.from('disease_incidence').insert(batch)
          if (error) console.error('inc batch error:', error.message)
          else console.log(`Inserted ${batch.length} incidence rows`)
          batch = []
        }
      }
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('disease_incidence').insert(batch)
    if (error) console.error('final inc error:', error.message)
    else console.log(`Inserted final ${batch.length} incidence rows`)
  }
}

async function seedGlobalStats(diseaseMap) {
  console.log('Seeding global stats cache...')
  const BATCH = 500
  let batch = []
  const totalCountries = 197

  for (const d of DISEASES) {
    const did = diseaseMap.get(d.slug)
    if (!did) continue

    for (let year = 1981; year <= 2050; year++) {
      const proj = year > 2023
      const scenarios = proj ? ['SSP1-2.6', 'SSP2-4.5', 'SSP5-8.5'] : [null]
      for (const scenario of scenarios) {
        const w = warming(scenario, year)
        const high = Math.round(totalCountries * (0.1 + w * 0.4 + (Math.random() - 0.5) * 0.05))
        const moderate = Math.round(totalCountries * (0.15 + w * 0.3 + (Math.random() - 0.5) * 0.05))
        const newly = Math.round(totalCountries * (w * 0.15))
        const totalAtRisk = Math.round((3900000000 + w * 500000000 + (Math.random() - 0.5) * 200000000))

        batch.push({
          disease_id: did,
          year,
          scenario,
          countries_high_risk: clamp(high, 0, totalCountries),
          countries_moderate_risk: clamp(moderate, 0, totalCountries),
          countries_newly_at_risk: clamp(newly, 0, totalCountries),
          total_population_at_risk: clamp(totalAtRisk, 0, 8000000000),
          avg_global_suitability: Math.round(clamp(0.2 + w * 0.3 + (Math.random() - 0.5) * 0.05, 0, 1) * 1000) / 1000,
          by_region: {},
          calculated_at: new Date().toISOString(),
        })

        if (batch.length >= BATCH) {
          const { error } = await supabase.from('global_stats_cache').insert(batch)
          if (error) console.error('stats batch error:', error.message)
          else console.log(`Inserted ${batch.length} global stats rows`)
          batch = []
        }
      }
    }
  }
  if (batch.length > 0) {
    const { error } = await supabase.from('global_stats_cache').insert(batch)
    if (error) console.error('final stats error:', error.message)
    else console.log(`Inserted final ${batch.length} global stats rows`)
  }
}

async function main() {
  console.log('Starting seed...')
  await clearTables()
  const { countries } = await seedCountries()
  await seedGeojson()
  const { data: allCountries } = await supabase.from('countries').select('id, slug, name')
  const countryMap = new Map(allCountries.map(c => [c.slug, c]))
  const diseaseMap = await seedDiseases()
  await seedSuitability(countries, countryMap, diseaseMap)
  await seedClimate(countries, countryMap)
  await seedProjections(countries, countryMap)
  await seedHealth(countries, countryMap)
  await seedPopulation(countries, countryMap)
  await seedVulnerability(countries, countryMap, diseaseMap)
  await seedIncidence(countries, countryMap, diseaseMap)
  await seedGlobalStats(diseaseMap)

  console.log('Seed complete!')
  
  const { count } = await supabase.from('countries').select('*', { count: 'exact', head: true })
  console.log(`Countries count: ${count}`)
  
  const { count: sCount } = await supabase.from('suitability_scores').select('*', { count: 'exact', head: true })
  console.log(`Suitability scores count: ${sCount}`)
}

main().catch(e => { console.error(e); process.exit(1) })
