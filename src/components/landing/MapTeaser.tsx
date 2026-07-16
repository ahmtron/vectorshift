'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function MapTeaser() {
  const ref = useRef(null)

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-background-secondary">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-400/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
              See the full picture.
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-8">
              Open the interactive explorer to zoom into any country, compare diseases, and watch risk evolve from 1981 to 2050.
            </p>
            <Link href="/explorer" className="inline-flex items-center gap-2 bg-accent-400 hover:bg-accent-300 text-background-primary font-semibold px-8 py-3 rounded-lg transition-colors">
              Open the Explorer
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
