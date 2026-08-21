import { CalendarWeekPage } from '@/views/calendar'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationCalendarWeekRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  return <CalendarWeekPage slug={slug} searchParams={searchParams} />
}
