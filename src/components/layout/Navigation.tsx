'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Map, BarChart3, GitCompare, Database, FileText, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Logo } from '@/components/layout/Logo'

const navItems = [
  { href: '/explorer', label: 'Explorer', icon: Map },
  { href: '/trends', label: 'Trends', icon: BarChart3 },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/data', label: 'Data', icon: Database },
  { href: '/methodology', label: 'Methodology', icon: FileText },
  { href: '/about', label: 'About', icon: Info },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border-subtle bg-background-primary/80 backdrop-blur-md" suppressHydrationWarning>
      <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-display font-semibold text-base md:text-lg text-text-primary">VectorShift</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'text-text-primary bg-background-tertiary' : 'text-text-secondary hover:text-text-primary hover:bg-background-hover'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button className="lg:hidden p-2 text-text-secondary hover:text-text-primary" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          <span className="darkreader-ignore">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-border-subtle bg-background-primary"
          >
            <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-hover"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
