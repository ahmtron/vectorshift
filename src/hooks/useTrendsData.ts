import { useQuery } from '@tanstack/react-query'

export function useTrendsData(disease?: string) {
  return useQuery({
    queryKey: ['trends', disease],
    queryFn: async () => {
      const url = disease ? `/api/trends?disease=${disease}` : '/api/trends'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch trends')
      return res.json()
    },
    staleTime: 1000 * 60 * 60,
  })
}
