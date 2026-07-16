'use client'

import { useState } from 'react'
import { useMapStore } from '@/hooks/useMapStore'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function MapLegend() {
  const { activeDisease } = useMapStore()
  const [isOpen, setIsOpen] = useState(true)

  const levels = [
    { label: 'Minimal', color: '#2A3358' },
    { label: 'Low', color: '#1E6B4A' },
    { label: 'Moderate', color: '#8B6914' },
    { label: 'High', color: '#B84A10' },
    { label: 'Critical', color: '#A82020' },
  ]

  return (
    <div className="absolute top-24 right-2 z-20 pointer-events-auto">
      {isOpen ? (
        <div className="bg-background-secondary/90 backdrop-blur-md border border-border-subtle rounded-lg p-2.5 md:bottom-24 md:top-auto">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <div className="text-[10px] md:text-xs font-medium text-text-secondary uppercase tracking-wider">
              {activeDisease} suitability
            </div>
            <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text-primary pointer-events-auto">
              <ChevronUp size={14} />
            </button>
          </div>
          <div className="space-y-1 md:space-y-1.5">
            {levels.map((level) => (
              <div key={level.label} className="flex items-center gap-1.5 md:gap-2">
                <div className="w-3 h-2 md:w-4 md:h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: level.color }} />
                <span className="text-[10px] md:text-xs text-text-secondary">{level.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 md:gap-2 pt-1 border-t border-border-subtle mt-1">
              <div className="w-3 h-2 md:w-4 md:h-3 rounded-sm flex-shrink-0 border-2 border-accent-400" style={{ backgroundColor: 'transparent' }} />
              <span className="text-[10px] md:text-xs text-text-secondary">Newly at risk</span>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 rounded-md bg-background-secondary/90 backdrop-blur-md border border-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center"
          aria-label="Show legend"
        >
          <ChevronDown size={16} />
        </button>
      )}
    </div>
  )
}
