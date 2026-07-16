'use client'

import { Navigation } from '@/components/layout/Navigation'
import { CountrySelector } from '@/components/compare/CountrySelector'
import { ComparisonColumn } from '@/components/compare/ComparisonColumn'
import { useExplorerStore } from '@/hooks/useExplorerStore'
import { DISEASES } from '@/lib/constants/diseases'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ComparePage() {
  const { disease, setFilter } = useExplorerStore()

  useEffect(() => {
    setFilter('a', 'egypt')
    setFilter('b', 'italy')
  }, [setFilter])

  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Link href="/explorer" className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back to Map
        </Link>

        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">Compare Countries</h1>
        <p className="text-text-secondary mb-8">Side-by-side climate-driven disease risk analysis.</p>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
          <CountrySelector />
          <select
            value={disease}
            onChange={(e) => setFilter('disease', e.target.value)}
            className="h-10 rounded-md border border-border-default bg-background-secondary px-3 text-sm text-text-primary w-full md:w-auto"
          >
            <option value="all">All diseases</option>
            {Object.entries(DISEASES).map(([slug, d]) => (
              <option key={slug} value={slug}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <ComparisonColumn side="a" />
          <ComparisonColumn side="b" />
        </div>
      </div>
    </main>
  )
}
