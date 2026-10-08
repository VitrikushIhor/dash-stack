'use client'

import { Skeleton } from '@/shared/ui/core/skeleton'
import { UrlConfirmDialog } from '@/shared/ui/url-confirm-dialog'

export function DeleteDeckModalLoading() {
  return (
    <UrlConfirmDialog.Root
      queryKey='delete-deck'
      handleConfirm={() => undefined}
      disabled
      confirmText='Delete'
      destructive
      className='max-w-md'
    >
      <UrlConfirmDialog.Header>
        <UrlConfirmDialog.Title>Delete deck</UrlConfirmDialog.Title>
        <UrlConfirmDialog.Description>
          Loading confirmation...
        </UrlConfirmDialog.Description>
      </UrlConfirmDialog.Header>
      <output className='sr-only'>Loading confirmation</output>
      <div aria-hidden='true' className='space-y-4'>
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-9 w-full' />
        <Skeleton className='h-24 w-full' />
      </div>
    </UrlConfirmDialog.Root>
  )
}
