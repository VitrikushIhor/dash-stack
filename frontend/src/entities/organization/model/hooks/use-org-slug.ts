'use client'

import { useParams } from 'next/navigation'

export function useOrgSlug(): string | undefined {
  const params = useParams<{ slug?: string }>()
  return params?.slug
}
