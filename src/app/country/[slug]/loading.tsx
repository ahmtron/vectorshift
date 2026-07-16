import { Navigation } from '@/components/layout/Navigation'

export default function Loading() {
  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-background-secondary rounded w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-background-secondary rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 bg-background-secondary rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-background-secondary rounded-xl" />
          <div className="grid lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-48 bg-background-secondary rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}