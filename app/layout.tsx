import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Sora } from 'next/font/google'
import { profile } from '@/lib/site-config'
import './globals.css'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: `${profile.name} — ${profile.title}`,
  description: profile.bio,
  generator: 'v0.app',
  authors: [{ name: profile.name }],
  verification: {
    google: 'W3W1xVa_DxRc_w8vpCeXrVcvHik9MuxkiahIzWG0bH8',
  },
  openGraph: {
    title: `${profile.name} — Portfolio`,
    description: profile.bio,
    type: 'profile',
    images: ['/images/ishfaq-gul.png'],
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#efede9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
