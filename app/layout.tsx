import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'
import { auth } from '@/auth'
import { SessionProvider } from '@/components/providers/session-provider'
import { CartProvider } from '@/components/providers/cart-provider'
import { AnalyticsProvider, GoogleAnalyticsScript, GoogleTagManagerScript, GoogleTagManagerNoScript } from '@/components/analytics/analytics-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Noor AlTayseer - Premium Lighting & Bathroom Solutions',
  description: 'Premium bathroom fixtures and professional LED lighting solutions in Dubai, UAE',
  icons: {
    icon: '/images/NoorAlTayseer_logo.png',
    apple: '/images/NoorAlTayseer_logo.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang='en'>
      <head>
        <GoogleAnalyticsScript />
        <GoogleTagManagerScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleTagManagerNoScript />
        <SessionProvider session={session}>
          <CartProvider>
            <AnalyticsProvider>
              {children}
              <Toaster />
            </AnalyticsProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
