'use client'

import { ROUTES } from '@/shared/config'
import { type UrlTabProps, UrlTabsNav } from '@/shared/ui/core/url-tabs-nav'

interface TaskTabsNavProps {
  slug: string
}

export function TaskTabsNav({ slug }: TaskTabsNavProps) {
  const tabs: UrlTabProps[] = [
    {
      value: null,
      label: 'Kanban',
      href: ROUTES.orgTasks(slug),
    },
    {
      value: 'list',
      label: 'List',
      href: ROUTES.orgTasksList(slug),
    },
    {
      value: 'table',
      label: 'Table',
      href: ROUTES.orgTasksTable(slug),
    },
  ]

  return <UrlTabsNav tabs={tabs} ariaLabel='Task views' />
}
