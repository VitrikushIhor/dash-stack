'use client'

import { type UrlTabProps, UrlTabsNav } from '@/shared/ui/core/url-tabs-nav'

const tabs: UrlTabProps[] = [
  {
    value: null,
    label: 'Kanban',
    href: '/task',
  },
  {
    value: 'list',
    label: 'List',
    href: '/task/list',
  },
  {
    value: 'table',
    label: 'Table',
    href: '/task/table',
  },
]

export function TaskTabsNav() {
  return <UrlTabsNav tabs={tabs} ariaLabel='Task views' />
}
