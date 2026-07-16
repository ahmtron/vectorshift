'use client'

import { useEffect, useState } from 'react'
import { useExplorerStore } from '@/hooks/useExplorerStore'

interface SearchResult {
  iso3: string
  name: string
  slug: string
}

export function CountrySelector() {
  const { a, b, setFilter } = useExplorerStore()
  const [countries, setCountries] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/countries')
      .then(r => r.json())
      .then(json => {
        if (json.success) setCountries(json.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <select
          value={a}
          onChange={(e) => setFilter('a', e.target.value)}
          className="h-10 rounded-md border border-border-default bg-background-secondary px-3 text-sm text-text-primary w-full sm:w-auto"
        >
          <option value="">Select country A</option>
          {countries.map((r) => (
            <option key={r.iso3} value={r.slug}>{r.name}</option>
          ))}
        </select>
        <span className="text-text-tertiary font-medium sm:self-center">vs</span>
        <select
          value={b}
          onChange={(e) => setFilter('b', e.target.value)}
          className="h-10 rounded-md border border-border-default bg-background-secondary px-3 text-sm text-text-primary w-full sm:w-auto"
        >
          <option value="">Select country B</option>
          {countries.map((r) => (
            <option key={r.iso3} value={r.slug}>{r.name}</option>
          ))}
        </select>
      </div>
      {loading && <span className="text-text-tertiary text-sm">Loading countries...</span>}
    </div>
  )
}
