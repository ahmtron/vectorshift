import { useQuery } from '@tanstack/react-query'

export function useCountryData(slug: string) {
  return useQuery({
    queryKey: ['country', slug],
    queryFn: async () => {
      const res = await fetch(`/api/country/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch country data')
      return res.json()
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 60,
  })
}
