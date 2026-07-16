'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { DISEASES } from '@/lib/constants/diseases'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type Record = {
  id: string
  country_name: string
  country_slug: string
  disease_slug: string
  year: number
  scenario: string | null
  suitability_score: number
  risk_level: string
  score_change_1yr: number | null
  score_change_since_2000: number | null
}

export default function DataPage() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const perPage = 50
  const [filters, setFilters] = useState({ disease: 'all', search: '' })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
    if (filters.disease !== 'all') params.set('disease', filters.disease)
    fetch(`/api/explorer?${params}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setRecords(json.data.records)
          setTotal(json.data.pagination.total)
        } else {
          setError('Failed to load data')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Network error while loading data')
        setLoading(false)
      })
  }, [page, filters.disease])

  const totalPages = Math.ceil(total / perPage)

  const filteredRecords = records.filter(r =>
    (r.country_name || '').toLowerCase().includes(filters.search.toLowerCase()) ||
    (r.disease_slug || '').toLowerCase().includes(filters.search.toLowerCase())
  )

  function downloadCsv() {
    const header = 'Country,Slug,Disease,Year,Scenario,Score,Risk Level,1yr Change,Since 2000\n'
    const rows = records.map(r =>
      `${r.country_name},${r.country_slug},${r.disease_slug},${r.year},${r.scenario || 'historical'},${r.suitability_score},${r.risk_level},${r.score_change_1yr},${r.score_change_since_2000}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vectorshift-data-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Link href="/explorer" className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Map
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-text-primary mb-2">Data Explorer</h1>
            <p className="text-text-secondary">Filter, explore, and download the underlying data.</p>
          </div>
          <button onClick={downloadCsv} className="h-10 px-4 rounded-md border border-border-default bg-background-secondary text-sm text-text-primary hover:bg-background-hover transition-colors w-full md:w-auto">
            Download CSV
          </button>
        </div>

        <div className="bg-background-secondary border border-border-subtle rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border-subtle flex flex-col md:flex-row gap-3">
            <select
              value={filters.disease}
              onChange={(e) => setFilters(f => ({ ...f, disease: e.target.value }))}
              className="h-9 rounded-md border border-border-default bg-background-primary px-3 text-sm text-text-primary"
            >
              <option value="all">All diseases</option>
              {Object.entries(DISEASES).map(([slug, d]) => (
                <option key={slug} value={slug}>{d.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search countries or diseases..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="h-9 rounded-md border border-border-default bg-background-primary px-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-border-strong"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left text-text-tertiary">
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">Disease</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Scenario</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">1yr</th>
                  <th className="px-4 py-3 font-medium">Since 2000</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-text-tertiary">Loading data...</td></tr>
                ) : error ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-danger text-sm mb-2">{error}</p>
                    <button onClick={() => window.location.reload()} className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                      Retry
                    </button>
                  </td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-text-tertiary">No records match your search.</td></tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="border-b border-border-subtle/50 hover:bg-background-hover/50 transition-colors">
                      <td className="px-4 py-3 text-text-primary">{r.country_name}</td>
                      <td className="px-4 py-3 capitalize text-text-secondary">{r.disease_slug}</td>
                      <td className="px-4 py-3 text-text-secondary font-mono">{r.year}</td>
                      <td className="px-4 py-3 text-text-tertiary">{r.scenario || 'historical'}</td>
                      <td className="px-4 py-3 text-text-primary font-mono">{(r.suitability_score * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3 capitalize text-text-secondary">{r.risk_level}</td>
                      <td className={`px-4 py-3 font-mono ${(r.score_change_1yr ?? 0) > 0 ? 'text-danger' : (r.score_change_1yr ?? 0) < 0 ? 'text-success' : 'text-text-tertiary'}`}>
                        {(r.score_change_1yr ?? 0) > 0 ? '+' : ''}{((r.score_change_1yr ?? 0) * 100).toFixed(0)}%
                      </td>
                      <td className={`px-4 py-3 font-mono ${(r.score_change_since_2000 ?? 0) > 0 ? 'text-danger' : 'text-text-tertiary'}`}>
                        {(r.score_change_since_2000 ?? 0) > 0 ? '+' : ''}{((r.score_change_since_2000 ?? 0) * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border-subtle flex items-center justify-between">
            <div className="text-sm text-text-tertiary">
              Page {page} of {totalPages} · {total.toLocaleString()} records
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 rounded-md border border-border-default bg-background-primary text-sm text-text-primary disabled:opacity-50 hover:bg-background-hover transition-colors">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-3 rounded-md border border-border-default bg-background-primary text-sm text-text-primary disabled:opacity-50 hover:bg-background-hover transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}