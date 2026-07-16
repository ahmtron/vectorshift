'use client'

import { useMapStore } from '@/hooks/useMapStore'
import { SCENARIOS } from '@/lib/constants/scenarios'
import { cn } from '@/lib/utils/cn'

type ScenarioItem = typeof SCENARIOS[keyof typeof SCENARIOS]

export function ScenarioToggle() {
  const { activeScenario, setScenario, isProjected } = useMapStore()
  if (!isProjected) return null

  const scenarios = Object.values(SCENARIOS) as ScenarioItem[]

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-background-secondary/90 backdrop-blur-md border border-border-subtle rounded-lg p-1 pointer-events-none">
      {scenarios.map((s) => (
        <button
          key={s.slug}
          onClick={() => setScenario(s.slug)}
          className={cn(
            'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors pointer-events-auto',
            activeScenario === s.slug ? 'bg-accent-400 text-background-primary' : 'text-text-secondary hover:text-text-primary'
          )}
          title={s.description}
        >
          {s.short}
        </button>
      ))}
    </div>
  )
}
