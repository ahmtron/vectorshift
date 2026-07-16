import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Providers } from './providers'
import { ChatWidget } from '@/components/assistant/ChatWidget'
import Script from 'next/script'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'VectorShift — Climate-Driven Disease Risk Intelligence',
    template: '%s | VectorShift',
  },
  description: 'Track how climate change is expanding the geographic range of disease-carrying vectors. Interactive global maps powered by NASA and WHO data.',
  keywords: ['climate change', 'disease risk', 'dengue', 'malaria', 'vector-borne disease', 'public health', 'epidemiology'],
  authors: [{ name: 'VectorShift' }],
  openGraph: {
    type: 'website',
    title: 'VectorShift — Climate-Driven Disease Risk Intelligence',
    description: 'Watch how dengue, malaria, and other diseases are spreading into new regions as the climate changes.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'darkreader-schema': 'dark',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0D14',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <Script src="/darkreader-neutralize.js" strategy="beforeInteractive" />
      <body className="bg-background-primary text-text-primary antialiased" suppressHydrationWarning>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
            <ChatWidget />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
