import { create } from 'zustand'

interface ExplorerState {
  a: string
  b: string
  disease: string
  region: string
  country: string
  yearFrom: number
  yearTo: number
  riskLevel: string
  page: number
  perPage: number
  sortBy: string
  sortDir: 'asc' | 'desc'
  setFilter: (key: keyof ExplorerState, value: string | number) => void
  resetFilters: () => void
  setPage: (page: number) => void
  setSort: (column: string) => void
}

const DEFAULT_FILTERS = {
  a: '',
  b: '',
  disease: 'all',
  region: 'all',
  country: 'all',
  yearFrom: 1981,
  yearTo: 2023,
  riskLevel: 'all',
  page: 1,
  perPage: 50,
  sortBy: 'score',
  sortDir: 'desc' as const,
}

export const useExplorerStore = create<ExplorerState>((set) => ({
  ...DEFAULT_FILTERS,
  setFilter: (key, value) => set({ [key]: value, page: 1 }),
  resetFilters: () => set(DEFAULT_FILTERS),
  setPage: (page) => set({ page }),
  setSort: (column) => set((state) => ({
    sortBy: column,
    sortDir: state.sortBy === column && state.sortDir === 'desc' ? 'asc' : 'desc',
  })),
}))
