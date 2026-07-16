'use client'

import { useEffect } from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { AlertCircle } from 'lucide-react'

export default function CountryError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24 flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-danger mb-4" />
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Something went wrong!</h2>
        <p className="text-text-secondary mb-6">Failed to load country profile. Please try again.</p>
        <button onClick={reset} className="h-10 px-6 rounded-md bg-accent-400 hover:bg-accent-300 text-background-primary font-medium transition-colors">
          Try again
        </button>
      </div>
    </main>
  )
}
