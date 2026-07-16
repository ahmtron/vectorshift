import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold text-text-primary mb-4">404</h2>
        <p className="text-text-secondary mb-6">Page not found</p>
        <Link href="/" className="text-accent-400 hover:text-accent-300 font-medium">
          Return home
        </Link>
      </div>
    </div>
  )
}
