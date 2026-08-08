'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { cn } from '@/shared/lib/utils'

interface OrganizationTabsNavProps {
  orgId: string
}

const tabs = [
  {
    value: null,
    label: 'Overview',
    href: (orgId: string) => `/organizations/${orgId}`,
  },
  {
    value: 'members',
    label: 'Members',
    href: (orgId: string) => `/organizations/${orgId}/members`,
  },
  {
    value: 'settings',
    label: 'Settings',
    href: (orgId: string) => `/organizations/${orgId}/settings`,
  },
] as const

export function OrganizationTabsNav({ orgId }: OrganizationTabsNavProps) {
  const activeSegment = useSelectedLayoutSegment()

  return (
    <nav
      aria-label='Organization sections'
      className='border-border flex w-full gap-1 border-b sm:w-fit'
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeSegment

        return (
          <Link
            key={tab.label}
            href={tab.href(orgId)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'text-muted-foreground relative px-4 py-2.5 text-sm font-medium transition-colors',
              'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5',
              'hover:text-foreground',
              isActive && 'text-primary after:bg-primary'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
