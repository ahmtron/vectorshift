'use client'

import { useQuery } from '@tanstack/react-query'

export function useMapData(disease: string, year: number, scenario?: string) {
  const isProjected = year > 2023
  return useQuery({
    queryKey: ['map', disease, year, scenario],
    queryFn: async () => {
      const params = new URLSearchParams({ disease, year: String(year) })
      if (isProjected && scenario) params.set('scenario', scenario)
      const res = await fetch(`/api/map?${params}`)
      if (!res.ok) throw new Error('Failed to fetch map data')
      return res.json()
    },
    enabled: !!disease && !!year,
    staleTime: 1000 * 60 * 60,
  })
}
