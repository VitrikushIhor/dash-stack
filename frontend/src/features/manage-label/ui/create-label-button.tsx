'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { useLabelSearchParams } from '../model/label-search-params'

interface CreateLabelButtonProps {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children?: React.ReactNode
}

export const CreateLabelButton = ({
  variant = 'default',
  size = 'sm',
  children,
}: CreateLabelButtonProps) => {
  const [, setParams] = useLabelSearchParams()

  const openCreate = () => {
    setParams({ 'create-label': true })
  }

  return (
    <Button
      variant={variant}
      size={size}
      className='gap-2'
      onClick={openCreate}
    >
      <Plus className='h-4 w-4' />
      {children || <span>New Label</span>}
    </Button>
  )
}
