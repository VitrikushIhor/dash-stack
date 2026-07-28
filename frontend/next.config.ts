import { config } from 'dotenv'
import { resolve } from 'path'
import type { NextConfig } from 'next'
import { env } from './src/shared/config/env'

// Load .env from root monorepo
config({ path: resolve(__dirname, '../.env') })

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: resolve(__dirname, '../'),
  experimental: {
    authInterrupts: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      'recharts',
      'date-fns',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
    ],
  },
  images: {
    remotePatterns: env.AWS_CLOUDFRONT_DOMAIN
      ? [
          {
            protocol: 'https',
            hostname: env.AWS_CLOUDFRONT_DOMAIN,
          },
        ]
      : [],
  },
}

export default nextConfig
