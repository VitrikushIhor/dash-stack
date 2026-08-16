import { type NavLink, type PricingTier } from './types'

export const NAV_LINKS: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Demo', href: '#demo' },
]

export const PRICING: PricingTier[] = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for solo founders and small teams getting started.',
    features: [
      '1 user',
      'Core metrics dashboard',
      '30-day data history',
      'Community support',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'Everything you need to run a growing business.',
    features: [
      'Up to 10 users',
      'Full analytics suite',
      '1-year data history',
      'Priority support',
      'Custom alerts',
    ],
    cta: 'Start free trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large teams with advanced integration needs.',
    features: [
      'Unlimited users',
      'Custom integrations',
      'Unlimited history',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    cta: 'Contact us',
    highlighted: false,
  },
]
