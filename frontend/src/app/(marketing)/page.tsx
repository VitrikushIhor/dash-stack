import type { Metadata } from 'next'
import { HomePage } from '@/views/home'

export const metadata: Metadata = {
  title: 'Dash Stack — Real-time Business Intelligence Dashboard',
  description:
    'Get a live view of revenue, sales, and growth in one place. Stop guessing and start deciding with Dash Stack.',
  openGraph: {
    title: 'Dash Stack — Real-time Business Intelligence Dashboard',
    description: 'Get a live view of revenue, sales, and growth in one place.',
    type: 'website',
  },
}

export default function HomeRoute() {
  return <HomePage />
}
