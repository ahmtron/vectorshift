'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'

export function useSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setQuery(query), 300)
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [query])

  const { data } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.length < 1) return []
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!res.ok) return []
      const json = await res.json()
      return json.data?.results || []
    },
    enabled: query.length >= 1,
  })

  return { results: data || [], query }
}
