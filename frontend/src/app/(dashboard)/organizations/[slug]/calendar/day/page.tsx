import { CalendarDayPage } from '@/views/calendar'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function OrganizationCalendarDayRoute({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  return <CalendarDayPage slug={slug} searchParams={searchParams} />
}
