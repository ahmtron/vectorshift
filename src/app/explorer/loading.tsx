'use client'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary" suppressHydrationWarning>
      <div className="text-center">
        <div className="darkreader-ignore">
          <svg viewBox="0 0 120 120" className="w-12 h-12 mx-auto mb-3 text-accent-400 opacity-70" aria-hidden="true">
          <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="animate-spin" style={{ animationDuration: '2.5s' }} />
        </svg>
        </div>
        <p className="text-text-secondary font-mono text-sm">Loading climate data...</p>
      </div>
    </div>
  )
}
