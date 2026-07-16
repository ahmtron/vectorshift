import { Navigation } from '@/components/layout/Navigation'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { FeaturedInsight } from '@/components/landing/FeaturedInsight'
import { DiseaseCards } from '@/components/landing/DiseaseCards'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />

        <section id="how-it-works" className="py-24 bg-background-secondary/30 border-t border-border-subtle">
          <HowItWorks />
        </section>

        <section className="py-24 border-t border-border-subtle">
          <FeaturedInsight />
        </section>

        <section className="py-24 bg-background-secondary/30 border-t border-border-subtle">
          <DiseaseCards />
        </section>

        <section className="py-24 border-t border-border-subtle">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">Ready to explore?</h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-8">
              Open the interactive map and see how climate change is reshaping disease risk across the world.
            </p>
            <Link href="/explorer" className="inline-flex items-center gap-2 bg-accent-400 hover:bg-accent-300 text-background-primary font-semibold px-8 py-3 rounded-lg transition-colors">
              Open the Explorer
            </Link>
          </div>
        </section>

        <footer className="border-t border-border-subtle bg-background-secondary/30 relative overflow-hidden" suppressHydrationWarning>
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] darkreader-ignore" aria-hidden="true">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="footer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#footer-grid)" />
            </svg>
          </div>
          <div className="mx-auto max-w-7xl px-4 py-16 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Logo />
                  <span className="font-display font-semibold text-lg text-text-primary">VectorShift</span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Climate-driven disease risk intelligence for a warming world.
                </p>
              </div>
              <div>
                <h4 className="font-display font-semibold text-text-primary mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><Link href="/explorer" className="hover:text-text-primary transition-colors">Explorer</Link></li>
                  <li><Link href="/compare" className="hover:text-text-primary transition-colors">Compare</Link></li>
                  <li><Link href="/data" className="hover:text-text-primary transition-colors">Data</Link></li>
                  <li><Link href="/trends" className="hover:text-text-primary transition-colors">Trends</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display font-semibold text-text-primary mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li><Link href="/methodology" className="hover:text-text-primary transition-colors">Methodology</Link></li>
                  <li><Link href="/about" className="hover:text-text-primary transition-colors">About</Link></li>
                  <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">GitHub</a></li>
                  <li><a href="mailto:contact@vectorshift.org" className="hover:text-text-primary transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-display font-semibold text-text-primary mb-4">Data Sources</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>NASA POWER</li>
                  <li>WHO GHO</li>
                  <li>CMIP6</li>
                  <li>WorldPop</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border-subtle pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-text-tertiary">
                VectorShift. Research intelligence only, not medical advice.
              </p>
              <p className="text-xs text-text-tertiary">
                Data sourced from NASA POWER, WHO GHO, CMIP6, GBIF, WorldPop
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
