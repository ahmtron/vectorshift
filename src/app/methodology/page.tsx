import { Navigation } from '@/components/layout/Navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-background-primary">
      <Navigation />
      <div className="mx-auto max-w-7xl px-4 py-24">
        <Link href="/" className="inline-flex items-center gap-1 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back
        </Link>

        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Methodology</h1>
        <p className="text-text-secondary max-w-3xl mb-12">
          How VectorShift calculates disease vector habitat suitability using climate data and published biological thresholds.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">How we measure risk</h2>
            <p className="text-text-secondary leading-relaxed max-w-3xl mb-4">
              VectorShift calculates a &ldquo;habitat suitability score&rdquo; for each disease vector in each country for each year. This score represents how suitable the climate conditions are for that vector to survive and reproduce.
            </p>
            <p className="text-text-secondary leading-relaxed max-w-3xl">
              A score of 1.0 means conditions are perfect for the vector. A score of 0.0 means conditions cannot support the vector at all. The score is calculated using temperature, humidity, and rainfall data from NASA satellites, compared against published biological thresholds from peer-reviewed research.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">Data sources</h2>
            <ul className="text-text-secondary space-y-3 max-w-3xl list-disc list-inside">
              <li><span className="text-text-primary font-medium">NASA POWER</span> — Climate data (temperature, humidity, rainfall)</li>
              <li><span className="text-text-primary font-medium">WHO Global Health Observatory</span> — Disease surveillance records</li>
              <li><span className="text-text-primary font-medium">World Bank CMIP6</span> — Climate projections through 2050</li>
              <li><span className="text-text-primary font-medium">GBIF</span> — Vector occurrence records</li>
              <li><span className="text-text-primary font-medium">WorldPop</span> — Population data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">Limitations</h2>
            <p className="text-text-secondary leading-relaxed max-w-3xl mb-4">
              Suitability scores do not guarantee outbreaks. They indicate where climate conditions are favorable for vectors. Actual disease transmission depends on many other factors, including local healthcare capacity, mosquito control programs, and human behavior.
            </p>
            <p className="text-text-secondary leading-relaxed max-w-3xl">
              Country-level data also misses within-country variation. A high national score does not mean every region is equally at risk.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
