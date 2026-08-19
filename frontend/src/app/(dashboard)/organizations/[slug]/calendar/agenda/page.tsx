import { CalendarAgendaPage } from '@/views/calendar'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationCalendarAgendaRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  return <CalendarAgendaPage slug={slug} searchParams={searchParams} />
}
