'use client'

import { motion, useInView } from 'motion/react'
import { useRef, useState, useEffect } from 'react'
import { Thermometer, Bug, Map } from 'lucide-react'

const STEPS = [
  { icon: Thermometer, title: '40 years of climate data', description: 'We combine NASA temperature, rainfall, and humidity records with WHO disease surveillance data.' },
  { icon: Bug, title: 'Scientific suitability rules', description: 'Published research tells us the exact climate conditions each disease vector needs to survive.' },
  { icon: Map, title: 'Interactive risk map', description: 'We calculate a suitability score for every country and year, then show how risk is growing, shrinking, or newly emerging.' },
]

export function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section id="how-it-works" ref={ref} className="py-24 bg-background-secondary/30" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">How It Works</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            From raw satellite data to an interactive map in three steps.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={mounted ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-400/10 border border-accent-400/20 flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:border-accent-400/40">
                <span className="darkreader-ignore">
                  <step.icon size={24} className="text-accent-400" />
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
