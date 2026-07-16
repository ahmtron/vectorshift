'use client'

import { useMapStore } from '@/hooks/useMapStore'

export function ProjectionToggle() {
  const { mapProjection, toggleProjection } = useMapStore()

  return (
    <button
      onClick={toggleProjection}
      className="absolute right-2 top-4 z-20 w-8 h-8 rounded-md bg-background-secondary/90 border border-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center backdrop-blur-md md:left-auto md:right-4 pointer-events-auto"
      aria-label="Toggle projection"
      title={mapProjection === 'globe' ? 'Switch to flat map' : 'Switch to globe'}
      suppressHydrationWarning
    >
      {mapProjection === 'globe' ? '🌍' : '🗺️'}
    </button>
  )
}
