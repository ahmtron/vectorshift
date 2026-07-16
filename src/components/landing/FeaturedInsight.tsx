'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { DISEASES } from '@/lib/constants/diseases'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { AnimatePresence } from 'motion/react'

function DengueIllustration() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full darkreader-ignore" aria-hidden="true" style={{ colorScheme: 'normal' }}>
      <defs>
        <radialGradient id="dengue-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="110" r="90" fill="url(#dengue-glow)" />

      <g stroke="#F5A623" strokeWidth="0.8" fill="none" opacity="0.35">
        <path d="M60 60 L140 80 L200 50 L280 90 L340 70" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M50 150 L120 130 L180 160 L260 120 L320 140 L370 110" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="4s" repeatCount="indefinite" />
        </path>
      </g>

      <g fill="#F5A623">
        <circle cx="140" cy="80" r="3">
          <animate attributeName="r" values="2;4;2" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="50" r="2.5">
          <animate attributeName="r" values="2;3.5;2" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.85;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="280" cy="90" r="3.5">
          <animate attributeName="r" values="2.5;4.5;2.5" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="130" r="2">
          <animate attributeName="r" values="1.5;3;1.5" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="260" cy="120" r="3">
          <animate attributeName="r" values="2;4;2" dur="2.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="320" cy="140" r="2.5">
          <animate attributeName="r" values="2;3.5;2" dur="3.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.85;0.4" dur="3.4s" repeatCount="indefinite" />
        </circle>
      </g>

      <g stroke="#8B9CC0" strokeWidth="0.8" fill="none" opacity="0.5">
        <path d="M140 80 L200 50 L280 90" />
        <path d="M120 130 L180 160 L260 120 L320 140" />
        <path d="M200 50 L180 160" strokeDasharray="2 3" opacity="0.4" />
      </g>

      <g fill="#F5A623" opacity="0.12">
        <path d="M135 75 L145 75 L140 85 Z" />
        <path d="M195 45 L205 45 L200 55 Z" />
        <path d="M275 85 L285 85 L280 95 Z" />
        <path d="M115 125 L125 125 L120 135 Z" />
        <path d="M255 115 L265 115 L260 125 Z" />
        <path d="M315 135 L325 135 L320 145 Z" />
      </g>

      <g stroke="#F5A623" strokeWidth="1.5" fill="none" opacity="0.7">
        <path d="M80 180 Q140 140 200 160 T320 130">
          <animate attributeName="stroke-dasharray" from="0 260" to="260 0" dur="2.2s" fill="freeze" />
        </path>
        <path d="M40 200 Q120 170 180 190 T300 160" strokeDasharray="4 2" opacity="0.5">
          <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2.8s" repeatCount="indefinite" />
        </path>
      </g>

      <circle cx="200" cy="110" r="18" fill="none" stroke="#F5A623" strokeWidth="1" opacity="0.35" strokeDasharray="2 3">
        <animateTransform attributeName="transform" type="rotate" from="0 200 110" to="360 200 110" dur="35s" repeatCount="indefinite" />
      </circle>

      <g transform="translate(192 102)">
        <path d="M4 4 Q8 0, 12 4 Q8 12, 4 4Z" fill="#F5A623" opacity="0.9">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M4 4 L4 14 M4 8 L2 6 M4 8 L6 6" stroke="#F5A623" strokeWidth="0.8" opacity="0.7" />
      </g>
    </svg>
  )
}

function MalariaIllustration() {
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full darkreader-ignore" aria-hidden="true" style={{ colorScheme: 'normal' }}>
      <defs>
        <linearGradient id="malaria-bar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E08B0A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B86D06" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <g stroke="#2A3358" strokeWidth="0.8" fill="none" opacity="0.6">
        <path d="M50 180 L350 180" strokeDasharray="3 3" />
        <path d="M50 140 L350 140" strokeDasharray="2 4" opacity="0.4" />
        <path d="M50 100 L350 100" strokeDasharray="2 4" opacity="0.4" />
        <path d="M50 60 L350 60" strokeDasharray="2 4" opacity="0.4" />
      </g>

      <g opacity="0.9">
        <rect x="70" y="140" width="18" height="40" rx="3" fill="url(#malaria-bar)" opacity="0.5">
          <animate attributeName="height" from="10" to="40" dur="1.2s" fill="freeze" />
          <animate attributeName="y" from="170" to="140" dur="1.2s" fill="freeze" />
        </rect>
        <rect x="120" y="110" width="18" height="70" rx="3" fill="url(#malaria-bar)" opacity="0.6">
          <animate attributeName="height" from="10" to="70" dur="1.4s" fill="freeze" />
          <animate attributeName="y" from="170" to="110" dur="1.4s" fill="freeze" />
        </rect>
        <rect x="170" y="90" width="18" height="90" rx="3" fill="url(#malaria-bar)" opacity="0.7">
          <animate attributeName="height" from="10" to="90" dur="1.6s" fill="freeze" />
          <animate attributeName="y" from="170" to="90" dur="1.6s" fill="freeze" />
        </rect>
        <rect x="220" y="60" width="18" height="120" rx="3" fill="url(#malaria-bar)" opacity="0.85">
          <animate attributeName="height" from="10" to="120" dur="1.8s" fill="freeze" />
          <animate attributeName="y" from="170" to="60" dur="1.8s" fill="freeze" />
        </rect>
        <rect x="270" y="80" width="18" height="100" rx="3" fill="url(#malaria-bar)" opacity="0.75">
          <animate attributeName="height" from="10" to="100" dur="1.5s" fill="freeze" />
          <animate attributeName="y" from="170" to="80" dur="1.5s" fill="freeze" />
        </rect>
        <rect x="320" y="50" width="18" height="130" rx="3" fill="url(#malaria-bar)" opacity="0.95">
          <animate attributeName="height" from="10" to="130" dur="2s" fill="freeze" />
          <animate attributeName="y" from="170" to="50" dur="2s" fill="freeze" />
        </rect>
      </g>

      <g stroke="#E08B0A" strokeWidth="1.5" fill="none" opacity="0.7">
        <path d="M70 140 L120 110 L170 90 L220 60 L270 80 L320 50">
          <animate attributeName="stroke-dasharray" from="0 400" to="400 0" dur="2.5s" fill="freeze" />
        </path>
      </g>

      <g fill="#E08B0A" opacity="0.9">
        <circle cx="220" cy="60" r="3.5">
          <animate attributeName="r" values="2.5;4.5;2.5" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="320" cy="50" r="3">
          <animate attributeName="r" values="2;4;2" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.95;0.5" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="170" cy="90" r="2.5">
          <animate attributeName="r" values="2;3.5;2" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="3.2s" repeatCount="indefinite" />
        </circle>
      </g>

      <g stroke="#8B9CC0" strokeWidth="0.8" fill="none" opacity="0.4">
        <path d="M40 60 L60 40 L100 55" strokeDasharray="2 2">
          <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M340 45 L360 35 L380 50" strokeDasharray="2 2">
          <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="2.5s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  )
}

export function FeaturedInsight() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  const insights = [
    { title: "Europe's dengue risk has grown 340% since 2000", body: 'Rising temperatures across the Mediterranean have created suitable conditions for the tiger mosquito to survive year-round in regions where it previously could not.', disease: 'dengue' },
    { title: 'Malaria is reappearing in parts of Europe', body: 'Warmer winters have allowed malaria-carrying mosquitoes to survive in countries that were previously malaria-free, including local transmission in Italy and Spain.', disease: 'malaria' },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setCurrent((c) => (c + 1) % insights.length), 8000)
    return () => clearInterval(interval)
  }, [insights.length])

  const insight = insights[current]
  const diseaseData = DISEASES[insight.disease as keyof typeof DISEASES]

  return (
    <section ref={ref} className="py-24" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-xs font-medium text-accent-400 uppercase tracking-wider">Featured Insight</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={mounted && isInView ? { opacity: 1, y: 0 } : {}} className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-400/10 border border-accent-400/20 text-accent-400 text-xs font-medium mb-4">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: diseaseData.color_hex }} />
              {diseaseData.name}
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">{insight.title}</h2>
            <p className="text-text-secondary leading-relaxed mb-6">{insight.body}</p>
            <Link href="/explorer" className="inline-flex items-center gap-2 text-accent-400 hover:text-accent-300 font-medium transition-colors">
              View on the map <ArrowRight size={16} />
            </Link>
          </div>
          <div className="aspect-video bg-background-secondary rounded-2xl border border-border-subtle flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full"
              >
                {current === 0 ? <DengueIllustration /> : <MalariaIllustration />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        <div className="flex items-center justify-center gap-2 mt-8">
          {insights.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={cn('w-2 h-2 rounded-full transition-colors', i === current ? 'bg-accent-400' : 'bg-border-default hover:bg-border-strong')} aria-label={`Go to insight ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}