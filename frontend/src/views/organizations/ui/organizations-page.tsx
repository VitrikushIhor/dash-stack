'use client'

import { Plus, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/core/button'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { useGetOrganizations } from '@/entities/organization'
import { OrganizationCard } from '@/features/organization'
import { Header, Main } from '@/widgets/layout'

export function OrganizationsPage() {
  const { data: memberships, isLoading, isError } = useGetOrganizations()

  return (
    <>
      <Header>
        <div className='flex w-full items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Building2 className='h-6 w-6' />
            <h1 className='text-xl font-bold'>Organizations</h1>
          </div>
          <Button asChild size='sm'>
            <Link href='/create-organization'>
              <Plus className='mr-2 h-4 w-4' />
              Create Organization
            </Link>
          </Button>
        </div>
      </Header>
      <Main>
        {isLoading ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-32 w-full rounded-xl' />
            ))}
          </div>
        ) : isError ? (
          <div className='flex flex-col items-center justify-center p-8 text-center'>
            <p className='text-destructive text-sm'>
              Failed to load organizations.
            </p>
          </div>
        ) : memberships?.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center'>
            <Building2 className='text-muted-foreground mb-4 h-12 w-12' />
            <h3 className='text-lg font-semibold'>No organizations found</h3>
            <p className='text-muted-foreground mt-1 mb-4 text-sm'>
              Get started by creating your first organization.
            </p>
            <Button asChild>
              <Link href='/create-organization'>
                <Plus className='mr-2 h-4 w-4' />
                Create Organization
              </Link>
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {memberships?.map((item) => (
              <OrganizationCard
                key={item.organization.id}
                organization={item.organization}
                role={item.role}
              />
            ))}
          </div>
        )}
      </Main>
    </>
  )
}
