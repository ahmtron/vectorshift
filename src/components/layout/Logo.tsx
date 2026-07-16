export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={`w-8 h-8 darkreader-ignore ${className || ''}`} aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="#F5A623" />
      <path d="M8 22V10L16 16L24 10V22" stroke="#080c14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
