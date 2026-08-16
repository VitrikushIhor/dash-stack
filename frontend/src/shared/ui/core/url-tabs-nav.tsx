'use client'

import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import { cn } from '@/shared/lib/utils'

export interface UrlTabProps {
  value: string | null
  label: string
  href: string
}

export interface UrlTabsNavProps {
  tabs: readonly UrlTabProps[]
  className?: string
  ariaLabel?: string
}

export function UrlTabsNav({
  tabs,
  className,
  ariaLabel = 'Navigation tabs',
}: UrlTabsNavProps) {
  const activeSegment = useSelectedLayoutSegment()

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'border-border flex w-full gap-1 border-b sm:w-fit',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === activeSegment

        return (
          <Link
            key={tab.label}
            href={tab.href}
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
