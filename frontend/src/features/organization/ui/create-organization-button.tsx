'use client'

import type * as React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { useCreateOrganizationModalStore } from '../model/use-create-organization-modal-store'

interface CreateOrganizationButtonProps extends React.ComponentProps<
  typeof Button
> {
  label?: string
}

export function CreateOrganizationButton({
  label = 'Create Organization',
  size = 'sm',
  className = 'gap-2 shadow-xs',
  children,
  ...props
}: CreateOrganizationButtonProps) {
  const { open } = useCreateOrganizationModalStore()

  return (
    <Button size={size} className={className} onClick={open} {...props}>
      <Plus className='h-4 w-4' />
      {children ?? label}
    </Button>
  )
}
