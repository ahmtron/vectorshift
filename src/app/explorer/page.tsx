import { Navigation } from '@/components/layout/Navigation'
import { GlobalMap } from '@/components/map/GlobalMap'

export default function ExplorerPage() {
  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-semibold text-text-primary">Explorer</h1>
            <p className="text-sm text-text-secondary">
              Select a disease, then click any country to see its risk profile.
            </p>
          </div>
        </div>
      </div>
      <GlobalMap />
    </main>
  )
}
