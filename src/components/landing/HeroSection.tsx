'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="space-y-5"
        >
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-text-primary">
            Climate change is moving disease.
            <br />
            <span className="text-accent-400">Watch it happen.</span>
          </h1>
          <p className="text-base md:text-lg text-text-secondary max-w-xl leading-relaxed">
            Rising temperatures are bringing tropical diseases to new regions. VectorShift shows you where, using real climate and health data.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/explorer"
              className="inline-flex items-center gap-2 bg-accent-400 hover:bg-accent-300 text-background-primary font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Explore the map
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-medium px-4 py-3 transition-colors"
            >
              How does this work?
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-400" />
              <span>Global climate-disease risk intelligence</span>
            </div>
            <div className="hidden md:block h-4 w-px bg-border-default" />
            <div className="hidden md:flex items-center gap-2 font-mono text-text-primary">
              <span className="text-accent-400 font-bold">6</span>
              <span>diseases tracked</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={mounted && isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative"
        >
          <div className="aspect-[4/3] max-w-md mx-auto bg-background-secondary rounded-2xl border border-border-subtle overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 400 300" className="w-full h-full darkreader-ignore" aria-hidden="true" style={{ colorScheme: 'normal' }}>
                <defs>
                  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1A2035" />
                    <stop offset="100%" stopColor="#0F1322" />
                  </linearGradient>
                </defs>
                <rect width="400" height="300" fill="url(#sky)" />
                <circle cx="340" cy="50" r="28" fill="#F5A623" opacity="0.12" />

                <g fill="#8B9CC0" opacity="0.9">
                  <g>
                    <path d="M0 0 Q5 -4, 10 0 Q5 6, 0 0Z" opacity="0.9" />
                    <animateMotion dur="10s" repeatCount="indefinite" path="M-20 40 Q100 10, 220 30 T420 20" />
                  </g>
                  <g>
                    <path d="M0 0 Q4 -3, 8 0 Q4 5, 0 0Z" opacity="0.75" />
                    <animateMotion dur="14s" repeatCount="indefinite" path="M-20 70 Q120 40, 260 60 T420 45" />
                  </g>
                  <g>
                    <path d="M0 0 Q3.5 -2.5, 7 0 Q3.5 4.5, 0 0Z" opacity="0.6" />
                    <animateMotion dur="18s" repeatCount="indefinite" path="M-20 20 Q140 0, 280 15 T420 8" />
                  </g>
                  <g>
                    <path d="M0 0 Q4.5 -3.5, 9 0 Q4.5 6, 0 0Z" opacity="0.7" />
                    <animateMotion dur="12s" repeatCount="indefinite" path="M-20 55 Q100 25, 200 40 T420 30" />
                  </g>
                  <g>
                    <path d="M0 0 Q3 -2, 6 0 Q3 4, 0 0Z" opacity="0.55" />
                    <animateMotion dur="20s" repeatCount="indefinite" path="M-20 85 Q160 60, 300 75 T420 65" />
                  </g>
                </g>

                <g fill="#1E6B4A" opacity="0.9">
                  <path d="M0 300 L12 220 L24 235 L36 210 L48 230 L60 205 L72 225 L84 200 L96 220 L108 195 L120 215 L132 190 L144 210 L156 185 L168 205 L180 180 L192 200 L204 175 L216 195 L228 170 L240 190 L252 165 L264 185 L276 160 L288 180 L300 155 L312 175 L324 150 L336 170 L348 145 L360 165 L372 140 L384 160 L396 135 L400 145 L400 300 Z" />
                </g>

                <g fill="#1E4A3F" opacity="0.8">
                  <path d="M0 300 L8 245 L16 255 L24 240 L32 250 L40 235 L48 245 L56 230 L64 240 L72 225 L80 235 L88 220 L96 230 L104 215 L112 225 L120 210 L128 220 L136 205 L144 215 L152 200 L160 210 L168 195 L176 205 L184 190 L192 200 L200 185 L208 195 L216 180 L224 190 L232 175 L240 185 L248 170 L256 180 L264 165 L272 175 L280 160 L288 170 L296 155 L304 165 L312 150 L320 160 L328 145 L336 155 L344 140 L352 150 L360 135 L368 145 L376 130 L384 140 L392 125 L400 135 L400 300 Z" />
                </g>

                <g fill="#4A3B1A" opacity="0.9">
                  <path d="M0 300 L10 265 L20 272 L30 262 L40 268 L50 258 L60 265 L70 255 L80 262 L90 252 L100 258 L110 248 L120 255 L130 245 L140 252 L150 242 L160 248 L170 238 L180 245 L190 235 L200 242 L210 232 L220 238 L230 228 L240 235 L250 225 L260 232 L270 222 L280 228 L290 218 L300 225 L310 215 L320 222 L330 212 L340 218 L350 208 L360 215 L370 205 L380 212 L390 202 L400 208 L400 300 Z" />
                </g>
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-risk-none via-risk-moderate to-risk-critical opacity-80" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
