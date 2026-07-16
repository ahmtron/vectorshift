'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore } from '@/hooks/useMapStore'
import { useMapData } from '@/hooks/useMapData'
import { MAP_CONFIG, MAPLIBRE_FALLBACK_STYLE_URL } from '@/lib/maplibre/config'
import { CountryPanel } from './CountryPanel'
import { DiseaseSelector } from './DiseaseSelector'
import { TimeSlider } from './TimeSlider'
import { MapLegend } from './MapLegend'
import { MapControls } from './MapControls'
import { ScenarioToggle } from './ScenarioToggle'
import { ProjectionToggle } from './ProjectionToggle'

type MapRef = { current: maplibregl.Map | null }

export function GlobalMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<MapRef>({ current: null })
  const isMapLoaded = useRef(false)
  const layersInitialized = useRef(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [worldGeo, setWorldGeo] = useState<GeoJSON.FeatureCollection | null>(null)
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null)

  const { activeDisease, activeYear, activeScenario, isProjected, showNewlyAtRiskLayer, selectCountry, mapProjection } = useMapStore()
  const { data: mapData, isLoading, isError } = useMapData(activeDisease, activeYear, isProjected ? activeScenario : undefined)
  const isDataLoading = isLoading || (!worldGeo && !mapError)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isError) setApiError('Unable to load risk data. Please try again.')
  }, [isError])

  useEffect(() => {
    fetch('/data/world.geojson')
      .then(r => r.json())
      .then(setWorldGeo)
      .catch(e => {
        console.error('Failed to load world geojson', e)
        setMapError('Failed to load world map data.')
      })
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('mapProjection')
    if (saved === 'globe' || saved === 'mercator') {
      useMapStore.getState().setMapProjection(saved)
    }
  }, [])

  useEffect(() => {
    const node = mapContainer.current
    if (!node) return

    const resizeMap = () => {
      const currentMap = map.current.current
      if (currentMap && isMapLoaded.current) {
        currentMap.resize()
      }
    }

    const observer = new ResizeObserver(() => resizeMap())
    observer.observe(node)
    resizeMap()

    return () => observer.disconnect()
  }, [])

  const initializeLayers = useCallback(() => {
    const currentMap = map.current.current
    if (!currentMap || layersInitialized.current) return

    if (currentMap.getSource('countries')) {
      currentMap.removeSource('countries')
    }
    if (currentMap.getLayer('country-fill')) currentMap.removeLayer('country-fill')
    if (currentMap.getLayer('country-border')) currentMap.removeLayer('country-border')
    if (currentMap.getLayer('country-new-risk-border')) currentMap.removeLayer('country-new-risk-border')

    currentMap.addSource('countries', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      generateId: true,
    })

    currentMap.addLayer({
      id: 'country-fill',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': ['interpolate', ['linear'], ['coalesce', ['get', 'score'], 0], 0.0, '#2A3358', 0.2, '#1E6B4A', 0.4, '#8B6914', 0.6, '#B84A10', 0.8, '#A82020', 1.0, '#C62828'],
        'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.85, 0.70],
      },
    })

    currentMap.addLayer({
      id: 'country-border',
      type: 'line',
      source: 'countries',
      paint: { 'line-color': '#3D4F7C', 'line-width': 0.5 },
    })

    currentMap.addLayer({
      id: 'country-new-risk-border',
      type: 'line',
      source: 'countries',
      filter: ['==', ['get', 'is_newly_at_risk'], true],
      paint: { 'line-color': '#F5A623', 'line-width': 1.5, 'line-opacity': 0.7 },
    })

    let hoveredCountryId: string | null = null

    currentMap.on('mousemove', 'country-fill', (e) => {
      if (e.features && e.features.length > 0) {
        if (hoveredCountryId !== null) {
          currentMap.setFeatureState({ source: 'countries', id: hoveredCountryId }, { hover: false })
        }
        hoveredCountryId = e.features[0].id as string
        currentMap.setFeatureState({ source: 'countries', id: hoveredCountryId }, { hover: true })
        currentMap.getCanvas().style.cursor = 'pointer'
      }
    })

    currentMap.on('mouseleave', 'country-fill', () => {
      if (hoveredCountryId !== null) {
        currentMap.setFeatureState({ source: 'countries', id: hoveredCountryId }, { hover: false })
        hoveredCountryId = null
      }
      currentMap.getCanvas().style.cursor = ''
    })

    currentMap.on('click', 'country-fill', (e) => {
      if (e.features && e.features.length > 0) {
        const slug = e.features[0].properties?.slug
        if (slug) selectCountry(slug)
      }
    })

    layersInitialized.current = true
  }, [selectCountry])

  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current.current) return
    setMapError(null)
    layersInitialized.current = false

    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      dragPan: true,
      touchZoomRotate: true,
      touchPitch: false,
      renderWorldCopies: false,
    })

    newMap.on('error', (e) => {
      const error = e.error || {}
      const status = error.status as number | undefined
      const message = error.message as string | undefined
      if (status === 404 || message?.includes('tile') || message?.includes('style')) {
        console.error('Map tile/style error:', message || status)
        setMapError('Map tiles unavailable. Retrying with fallback...')
        newMap.setStyle(MAPLIBRE_FALLBACK_STYLE_URL)
      }
    })

    newMap.on('style.load', () => {
      isMapLoaded.current = true
      initializeLayers()
      newMap.resize()
    })

    newMap.on('load', () => {
      if (!isMapLoaded.current) {
        isMapLoaded.current = true
        initializeLayers()
        newMap.resize()
      }
    })

    newMap.on('ready', () => {
      useMapStore.getState().setMapRef(newMap)
      setMapInstance(newMap)
      try {
        newMap.setProjection({ type: mapProjection })
      } catch {
        // ignore projection errors on older MapLibre versions
      }
    })

    map.current.current = newMap
  }, [initializeLayers, mapProjection])

  useEffect(() => {
    let currentMap: maplibregl.Map | null = null
    initMap()
    return () => {
      currentMap = map.current.current
      if (currentMap) {
        currentMap.remove()
      }
      map.current.current = null
      isMapLoaded.current = false
      layersInitialized.current = false
      useMapStore.getState().setMapRef(null)
    }
  }, [initMap])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mapData && apiError) setApiError(null)
  }, [mapData, apiError])

  useEffect(() => {
    if (!map.current.current || !isMapLoaded.current) return

    if (mapError || apiError) return

    const source = map.current.current.getSource('countries') as maplibregl.GeoJSONSource | undefined
    if (!source) return

    const dataMap = new Map<string, Record<string, unknown>>()
    if (mapData?.data) {
      for (const row of mapData.data) {
        dataMap.set(row.iso3 as string, row)
      }
    }

    const features = worldGeo?.features?.length
      ? worldGeo.features.map((f: GeoJSON.Feature) => {
          const iso3 = ((f.properties as Record<string, unknown> | undefined)?.iso3 || f.id || '') as string
          const row = dataMap.get(iso3)
          return {
            type: 'Feature' as const,
            id: f.id,
            geometry: f.geometry,
            properties: {
              iso3: row?.iso3 || iso3,
              iso2: row?.iso2 || (f.properties as Record<string, unknown> | undefined)?.iso2 || '',
              name: row?.name || (f.properties as Record<string, unknown> | undefined)?.name || '',
              slug: row?.slug || iso3.toLowerCase(),
              score: row?.suitability_score ?? 0,
              risk_level: row?.risk_level || 'none',
              is_newly_at_risk: row?.is_newly_at_risk || false,
              score_change_since_2000: row?.score_change_since_2000 || 0,
              population: row?.total_population || 0,
            },
          }
        })
      : []

    source.setData({
      type: 'FeatureCollection',
      features,
    } as GeoJSON.FeatureCollection)
  }, [mapData, mapError, worldGeo])

  useEffect(() => {
    if (!map.current.current || !isMapLoaded.current) return
    let animFrame: number
    const animate = () => {
      const opacity = 0.6 + 0.4 * Math.sin(Date.now() / 2000 * Math.PI * 2)
      map.current.current?.setPaintProperty('country-new-risk-border', 'line-opacity', showNewlyAtRiskLayer ? opacity : 0)
      animFrame = requestAnimationFrame(animate)
    }
    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [showNewlyAtRiskLayer])

  useEffect(() => {
    const currentMap = map.current.current
    if (!currentMap || !isMapLoaded.current) return
    try {
      currentMap.setProjection({ type: mapProjection })
    } catch {
      // ignore projection errors on older MapLibre versions
    }
  }, [mapProjection])

  const handleRetry = useCallback(() => {
    if (map.current.current) {
      map.current.current.remove()
      map.current.current = null
      isMapLoaded.current = false
      layersInitialized.current = false
    }
    initMap()
  }, [initMap])

  return (
    <div className="relative w-full h-[calc(100vh-64px-48px)] overflow-hidden bg-background-primary">
      <div ref={mapContainer} className="absolute inset-0 z-0 pointer-events-auto" style={{ width: '100%', height: '100%' }} />

      {(mapError || isDataLoading || apiError) && (
        <div className="absolute inset-0 bg-background-primary/40 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-text-secondary text-sm font-mono mb-3">
              {mapError || apiError || `Loading ${activeYear} data...`}
            </div>
            {(mapError || apiError) && (
              <button onClick={handleRetry} className="text-xs text-accent-400 hover:text-accent-300 underline underline-offset-4">
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      <DiseaseSelector />
      <CountryPanel />
      <TimeSlider />
      {isProjected && <ScenarioToggle />}
      <MapLegend />
      <MapControls map={mapInstance} />
      <ProjectionToggle />
    </div>
  )
}
