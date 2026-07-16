'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { DISEASES } from '@/lib/constants/diseases'
import Link from 'next/link'

const DISEASE_ICONS: Record<string, { primary: string; secondary: string }> = {
  dengue: { primary: '#F5A623', secondary: '#FCD97A' },
  malaria: { primary: '#E08B0A', secondary: '#B86D06' },
  zika: { primary: '#F9BE42', secondary: '#F5A623' },
  chikungunya: { primary: '#FCD97A', secondary: '#FEEFC3' },
  lyme: { primary: '#8B9CC0', secondary: '#3D4F7C' },
  leishmaniasis: { primary: '#B86D06', secondary: '#7A5A0A' },
}

function DiseaseIcon({ slug }: { slug: string }) {
  const icon = DISEASE_ICONS[slug] || { primary: '#F5A623', secondary: '#FCD97A' }

  if (slug === 'lyme') {
    return (
      <svg viewBox="0 0 40 40" className="w-6 h-6 darkreader-ignore" aria-hidden="true" style={{ colorScheme: 'normal' }}>
        <g fill="none" stroke={icon.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20 C12 14, 18 10, 24 14 C30 18, 28 26, 22 28 C16 30, 12 26, 12 20Z" opacity="0.9" />
          <path d="M18 16 L22 18 M20 14 L22 20 M16 20 L20 22" strokeWidth="1" opacity="0.6" />
          <circle cx="24" cy="14" r="1.5" fill={icon.primary} stroke="none" opacity="0.8" />
        </g>
      </svg>
    )
  }

  if (slug === 'leishmaniasis') {
    return (
      <svg viewBox="0 0 40 40" className="w-6 h-6 darkreader-ignore" aria-hidden="true" style={{ colorScheme: 'normal' }}>
        <g fill="none" stroke={icon.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 20 Q16 10, 24 14 T32 18" opacity="0.8" />
          <path d="M10 24 Q16 14, 24 18 T32 22" opacity="0.6" />
          <path d="M14 18 C14 14, 18 12, 22 14 C26 16, 24 22, 20 22 C16 22, 14 22, 14 18Z" strokeWidth="1.2" opacity="0.9" />
          <circle cx="22" cy="14" r="1.2" fill={icon.primary} stroke="none" />
        </g>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 40 40" className="w-6 h-6 darkreader-ignore" aria-hidden="true" style={{ colorScheme: 'normal' }}>
      <g fill="none" stroke={icon.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="16" cy="16" rx="6" ry="4" transform="rotate(-20 16 16)" opacity="0.9" />
        <ellipse cx="24" cy="24" rx="6" ry="4" transform="rotate(20 24 24)" opacity="0.9" />
        <path d="M20 12 L20 28 M12 20 L28 20" strokeWidth="0.8" opacity="0.4" />
        <path d="M14 14 L18 18 M26 14 L22 18 M14 26 L18 22 M26 26 L22 22" strokeWidth="0.8" opacity="0.35" />
        <circle cx="16" cy="16" r="1" fill={icon.primary} stroke="none" opacity="0.8" />
        <circle cx="24" cy="24" r="1" fill={icon.secondary} stroke="none" opacity="0.8" />
      </g>
    </svg>
  )
}

export function DiseaseCards() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section ref={ref} className="py-24" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4 text-center">Six diseases. One platform.</h2>
        <p className="text-text-secondary text-center max-w-2xl mx-auto mb-12">
          VectorShift covers the six most significant climate-sensitive vector-borne diseases, with data spanning decades and continents.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(DISEASES).map((disease, i) => (
            <motion.div
              key={disease.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={mounted ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-background-secondary border border-border-subtle rounded-xl p-6 hover:border-border-strong transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent-400/10 border border-accent-400/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:border-accent-400/40">
                  <DiseaseIcon slug={disease.slug} />
                </div>
                <span className="text-xs text-text-tertiary font-mono">{disease.vector_type}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-text-primary mb-1">{disease.name}</h3>
              <p className="text-text-tertiary text-xs font-mono mb-3">{disease.vector_name}</p>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">{disease.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-tertiary">
                  At risk: <span className="text-text-secondary font-mono">{(disease.global_at_risk / 1e9).toFixed(1)}B</span>
                </span>
                <Link href={`/explorer?disease=${disease.slug}`} className="text-accent-400 hover:text-accent-300 font-medium group-hover:underline underline-offset-4">
                  Explore →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
