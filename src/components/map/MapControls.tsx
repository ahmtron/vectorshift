'use client'

import maplibregl from 'maplibre-gl'

type MapControlsProps = {
  map: maplibregl.Map | null
}

export function MapControls({ map }: MapControlsProps) {
  const handleZoomIn = () => {
    if (map) map.zoomIn()
  }

  const handleZoomOut = () => {
    if (map) map.zoomOut()
  }

  const handleReset = () => {
    if (map) map.flyTo({ center: [20, 20], zoom: 1.2 })
  }

  return (
    <div className="absolute right-2 bottom-20 md:bottom-24 z-20 flex flex-col gap-1.5 md:left-4 md:top-48 md:bottom-auto">
      <button onClick={handleZoomIn} className="w-8 h-8 rounded-md bg-background-secondary/90 border border-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center backdrop-blur-md pointer-events-auto" aria-label="Zoom in">+</button>
      <button onClick={handleZoomOut} className="w-8 h-8 rounded-md bg-background-secondary/90 border border-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center backdrop-blur-md pointer-events-auto" aria-label="Zoom out">−</button>
      <button onClick={handleReset} className="w-8 h-8 rounded-md bg-background-secondary/90 border border-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center backdrop-blur-md pointer-events-auto" aria-label="Reset view">⟲</button>
    </div>
  )
}
