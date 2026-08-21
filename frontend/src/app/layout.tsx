import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import {
  DirectionProvider,
  DirectionScript,
  QueryProvider,
  ThemeProvider,
} from '@/shared/lib/providers'
import '@/shared/styles/index.css'
import { Toaster } from '@/shared/ui/core/sonner'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: 'DashStack',
  description: 'Modern dashboard application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        <DirectionScript />
        <QueryProvider>
          <NuqsAdapter>
            <ThemeProvider>
              <DirectionProvider>
                {children}
                <Toaster duration={5000} />
              </DirectionProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  )
}
