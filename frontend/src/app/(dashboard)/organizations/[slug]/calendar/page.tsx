import { CalendarMonthPage } from '@/views/calendar'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationCalendarMonthRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  return <CalendarMonthPage slug={slug} searchParams={searchParams} />
}
