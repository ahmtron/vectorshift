'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary" suppressHydrationWarning>
      <div className="text-center">
        <div className="darkreader-ignore">
          <svg viewBox="0 0 120 120" className="w-12 h-12 mx-auto mb-4 text-danger opacity-80" aria-hidden="true">
          <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M44 44 L76 76 M76 44 L44 76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        </div>
        <h2 className="font-display text-2xl font-bold text-text-primary mb-3">Something went wrong</h2>
        <p className="text-text-secondary mb-6 text-sm">{error.message}</p>
        <button onClick={reset} className="bg-accent-400 hover:bg-accent-300 text-background-primary font-semibold px-6 py-3 rounded-lg transition-colors">
          Try again
        </button>
      </div>
    </div>
  )
}
