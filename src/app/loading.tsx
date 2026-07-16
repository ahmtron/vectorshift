export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary" suppressHydrationWarning>
      <div className="text-center">
        <div className="darkreader-ignore">
          <svg viewBox="0 0 120 120" className="w-16 h-16 mx-auto mb-4 text-accent-400 opacity-80" aria-hidden="true">
          <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" className="animate-spin" style={{ animationDuration: '3s' }} />
          <circle cx="60" cy="60" r="24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" className="animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <circle cx="60" cy="60" r="8" fill="currentColor" opacity="0.3" />
        </svg>
        </div>
        <div className="text-text-secondary font-mono text-sm">Loading...</div>
      </div>
    </div>
  )
}
