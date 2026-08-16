'use client'

import { type UrlTabProps, UrlTabsNav } from '@/shared/ui/core/url-tabs-nav'

interface OrganizationTabsNavProps {
  orgId: string
}

const getTabs = (orgId: string): UrlTabProps[] => [
  {
    value: null,
    label: 'Overview',
    href: `/organizations/${orgId}`,
  },
  {
    value: 'members',
    label: 'Members',
    href: `/organizations/${orgId}/members`,
  },
  {
    value: 'settings',
    label: 'Settings',
    href: `/organizations/${orgId}/settings`,
  },
  {
    value: 'labels',
    label: 'Labels',
    href: `/organizations/${orgId}/labels`,
  },
]

export function OrganizationTabsNav({ orgId }: OrganizationTabsNavProps) {
  return <UrlTabsNav tabs={getTabs(orgId)} ariaLabel='Organization sections' />
}
