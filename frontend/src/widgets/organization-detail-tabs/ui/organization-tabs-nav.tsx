'use client'

import { ROUTES } from '@/shared/config'
import { type UrlTabProps, UrlTabsNav } from '@/shared/ui/core/url-tabs-nav'

interface OrganizationTabsNavProps {
  slug: string
}

export function OrganizationTabsNav({ slug }: OrganizationTabsNavProps) {
  const tabs: UrlTabProps[] = [
    {
      value: null,
      label: 'Overview',
      href: ROUTES.orgOverview(slug),
    },
    {
      value: 'members',
      label: 'Members',
      href: ROUTES.orgMembers(slug),
    },
    {
      value: 'settings',
      label: 'Settings',
      href: ROUTES.orgSettings(slug),
    },
    {
      value: 'labels',
      label: 'Labels',
      href: ROUTES.orgLabels(slug),
    },
  ]

  return <UrlTabsNav tabs={tabs} ariaLabel='Organization sections' />
}
