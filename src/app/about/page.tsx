import { Navigation } from '@/components/layout/Navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Link href="/" className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>

        <h1 className="font-display text-4xl font-bold text-text-primary mb-6">About VectorShift</h1>
        <div className="max-w-3xl space-y-6 text-text-secondary leading-relaxed">
          <p>
            VectorShift is a global climate-health intelligence platform. It transforms raw NASA climate data, WHO disease surveillance records, and published vector biology research into an interactive, visual, decision-support tool.
          </p>
          <p>
            Our mission is to democratize access to climate-health intelligence. We combine freely available scientific data into a single, beautiful, actionable platform that helps the world prepare for tomorrow&rsquo;s disease threats today.
          </p>
          <p>
            The platform is designed for public health officials, researchers, journalists, students, and policy analysts — anyone who needs to understand how climate change is reshaping the global disease landscape.
          </p>
        </div>
      </div>
    </main>
  )
}
