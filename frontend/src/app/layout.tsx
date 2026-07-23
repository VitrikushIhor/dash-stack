import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import {
  DirectionProvider,
  FontProvider,
  QueryProvider,
  ThemeProvider,
} from '@/shared/lib/context'
import '@/shared/styles/index.css'
import { Toaster } from '@/shared/ui/core/sonner'
import { TooltipProvider } from '@/shared/ui/core/tooltip'

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
        <QueryProvider>
          <NuqsAdapter>
            <ThemeProvider>
              <FontProvider>
                <DirectionProvider>
                  <TooltipProvider>
                    {children}
                    <Toaster duration={5000} />
                  </TooltipProvider>
                </DirectionProvider>
              </FontProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  )
}
