'use client'

import { useMapStore } from '@/hooks/useMapStore'
import { VALID_DISEASES } from '@/lib/constants/diseases'
import { DISEASES } from '@/lib/constants/diseases'
import { cn } from '@/lib/utils/cn'

const FILTERS = [
  { value: 'all', label: 'All countries' },
  { value: 'high', label: 'High risk' },
  { value: 'newly_at_risk', label: 'Newly at risk' },
  { value: 'declining', label: 'Declining' },
] as const

export function DiseaseSelector() {
  const { activeDisease, setDisease, isLeftPanelOpen, toggleLeftPanel, riskFilter, setRiskFilter } = useMapStore()

  return (
    <div
      className={cn(
        'absolute top-4 left-4 z-30 bg-background-secondary/90 backdrop-blur-md border border-border-subtle rounded-lg transition-all duration-200 pointer-events-none',
        isLeftPanelOpen ? 'w-60 p-4' : 'w-12 p-2'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        {isLeftPanelOpen && <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Diseases</span>}
        <button onClick={toggleLeftPanel} className="p-1.5 text-text-tertiary hover:text-text-primary pointer-events-auto" aria-label="Toggle panel">
          <span className="text-xs">{isLeftPanelOpen ? '◀' : '▶'}</span>
        </button>
      </div>
      {isLeftPanelOpen && (
        <>
          <div className="space-y-1 mb-4">
            {VALID_DISEASES.map((slug) => {
              const disease = DISEASES[slug]
              const isActive = activeDisease === slug
              return (
                <button
                  key={slug}
                  onClick={() => setDisease(slug)}
                  title={disease.description}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors pointer-events-auto',
                    isActive ? 'bg-background-hover text-text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                  )}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: disease.color_hex }} />
                  <span className="truncate">{disease.name}</span>
                </button>
              )
            })}
          </div>

          <div className="border-t border-border-subtle pt-3">
            <div className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Filter by risk</div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setRiskFilter(f.value)}
                  className={cn(
                    'text-xs px-2 py-1.5 rounded-md transition-colors pointer-events-auto',
                    riskFilter === f.value
                      ? 'bg-accent-400 text-background-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
