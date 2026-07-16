import { create } from 'zustand'
import maplibregl from 'maplibre-gl'

type DiseaseSlug = 'dengue' | 'malaria' | 'zika' | 'chikungunya' | 'lyme' | 'leishmaniasis'
type Scenario = 'SSP1-2.6' | 'SSP2-4.5' | 'SSP5-8.5'

interface MapState {
  activeDisease: DiseaseSlug
  activeYear: number
  activeScenario: Scenario
  selectedCountrySlug: string | null
  isPanelOpen: boolean
  isLeftPanelOpen: boolean
  showHealthSystemLayer: boolean
  showPopulationLayer: boolean
  showNewlyAtRiskLayer: boolean
  riskFilter: 'all' | 'high' | 'newly_at_risk' | 'declining'
  isPlaying: boolean
  playSpeed: 'slow' | 'normal' | 'fast'
  isProjected: boolean
  mapProjection: 'mercator' | 'globe'
  mapRef: maplibregl.Map | null
  setDisease: (disease: DiseaseSlug) => void
  setYear: (year: number) => void
  setScenario: (scenario: Scenario) => void
  selectCountry: (slug: string | null) => void
  togglePanel: () => void
  toggleLeftPanel: () => void
  toggleLayer: (layer: 'HealthSystem' | 'Population' | 'NewlyAtRisk') => void
  setRiskFilter: (filter: 'all' | 'high' | 'newly_at_risk' | 'declining') => void
  startPlaying: () => void
  stopPlaying: () => void
  setPlaySpeed: (speed: 'slow' | 'normal' | 'fast') => void
  advanceYear: () => void
  setMapRef: (map: maplibregl.Map | null) => void
  setMapProjection: (projection: 'mercator' | 'globe') => void
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  toggleProjection: () => void
}

export const useMapStore = create<MapState>()((set, get) => {
  return {
    activeDisease: 'dengue',
    activeYear: 2024,
    activeScenario: 'SSP2-4.5',
    selectedCountrySlug: null,
    isPanelOpen: false,
    isLeftPanelOpen: true,
    showHealthSystemLayer: false,
    showPopulationLayer: false,
    showNewlyAtRiskLayer: true,
    riskFilter: 'all',
    isPlaying: false,
    playSpeed: 'normal',
    isProjected: false,
    mapProjection: 'mercator',
    mapRef: null,
    setDisease: (disease) => set({ activeDisease: disease }),
    setYear: (year) => set({ activeYear: year, isProjected: year > 2023 }),
    setScenario: (scenario) => set({ activeScenario: scenario }),
    selectCountry: (slug) => set({ selectedCountrySlug: slug, isPanelOpen: slug !== null }),
    togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
    toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
    toggleLayer: (layer: string) => {
      const layerKey = `show${layer.charAt(0).toUpperCase() + layer.slice(1)}Layer` as 'showHealthSystemLayer' | 'showPopulationLayer' | 'showNewlyAtRiskLayer'
      set(state => ({ [layerKey]: !(state[layerKey] as boolean) } as Partial<MapState>))
    },
    setRiskFilter: (filter: 'all' | 'high' | 'newly_at_risk' | 'declining') => set({ riskFilter: filter }),
    startPlaying: () => set({ isPlaying: true }),
    stopPlaying: () => set({ isPlaying: false }),
    setPlaySpeed: (speed) => set({ playSpeed: speed }),
    advanceYear: () => {
      const { activeYear, stopPlaying } = get()
      if (activeYear >= 2050) { stopPlaying(); return }
      set({ activeYear: activeYear + 1, isProjected: activeYear + 1 > 2023 })
    },
    setMapRef: (map) => set({ mapRef: map }),
    setMapProjection: (projection) => {
      set({ mapProjection: projection })
      if (typeof window !== 'undefined') {
        localStorage.setItem('mapProjection', projection)
      }
    },
    zoomIn: () => {
      const map = get().mapRef
      if (map) map.zoomIn()
    },
    zoomOut: () => {
      const map = get().mapRef
      if (map) map.zoomOut()
    },
    resetView: () => {
      const map = get().mapRef
      if (map) map.flyTo({ center: [20, 20], zoom: 1.2 })
    },
    toggleProjection: () => {
      const next = get().mapProjection === 'mercator' ? 'globe' : 'mercator'
      set({ mapProjection: next })
      if (typeof window !== 'undefined') {
        localStorage.setItem('mapProjection', next)
      }
      const map = get().mapRef
      if (map) {
        try {
          map.setProjection({ type: next })
        } catch {
          // older MapLibre versions may not support projection changes after load
        }
      }
    },
  }
})
