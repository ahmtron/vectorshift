export const MAPLIBRE_STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
export const MAPLIBRE_FALLBACK_STYLE_URL = 'https://demotiles.maplibre.org/style.json'

export const MAP_CONFIG = {
  style: MAPLIBRE_STYLE_URL,
  fallbackStyle: MAPLIBRE_FALLBACK_STYLE_URL,
  center: [20, 20] as [number, number],
  zoom: 1.2,
  minZoom: 0,
  maxZoom: 8,
  attribution: '© OpenStreetMap contributors, © CARTO',
}
