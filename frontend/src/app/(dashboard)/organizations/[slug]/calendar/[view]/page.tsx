import { notFound } from 'next/navigation'
import { isCalendarView } from '@/features/task-calendar/server'
import { renderCalendarPage } from '@/views/calendar'

interface PageProps {
  params: Promise<{
    slug: string
    view: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationCalendarViewRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug, view } = await params

  if (!isCalendarView(view)) notFound()

  return renderCalendarPage({ slug, searchParams, view })
}
