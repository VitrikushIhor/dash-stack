import { config } from 'dotenv'
import { resolve } from 'path'
import type { NextConfig } from 'next'

// Load .env from root monorepo
config({ path: resolve(__dirname, '../.env') })

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { hostname: process.env.AWS_CLOUDFRONT_DOMAIN ?? 'localhost' },
    ],
  },
}

export default nextConfig
