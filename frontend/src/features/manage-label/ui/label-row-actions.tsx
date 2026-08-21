'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import type { LabelDto } from '@/entities/label'
import { useLabelSearchParams } from '../model/label-search-params'

interface LabelRowActionsProps {
  label: LabelDto
}

export const LabelRowActions = ({ label }: LabelRowActionsProps) => {
  const [, setParams] = useLabelSearchParams()

  const openUpdate = () => setParams({ 'update-label': label.id })
  const openDelete = () => setParams({ 'delete-label': label.id })

  return (
    <div className='flex items-center gap-1'>
      <Button
        variant='ghost'
        size='icon'
        className='text-muted-foreground hover:text-foreground h-8 w-8'
        onClick={openUpdate}
      >
        <Pencil className='h-4 w-4' />
        <span className='sr-only'>Edit</span>
      </Button>
      <Button
        variant='ghost'
        size='icon'
        className='text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8'
        onClick={openDelete}
      >
        <Trash2 className='h-4 w-4' />
        <span className='sr-only'>Delete</span>
      </Button>
    </div>
  )
}
