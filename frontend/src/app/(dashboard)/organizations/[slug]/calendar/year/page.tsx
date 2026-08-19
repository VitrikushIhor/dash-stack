import { CalendarYearPage } from '@/views/calendar'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationCalendarYearRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  return <CalendarYearPage slug={slug} searchParams={searchParams} />
}
