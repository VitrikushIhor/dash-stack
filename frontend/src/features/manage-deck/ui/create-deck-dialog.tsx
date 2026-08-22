'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/core/dialog'
import { useDeckSearchParams } from '../model/deck-search-params'

const CreateDeckForm = dynamic(
  () => import('./create-deck-form').then((mod) => mod.CreateDeckForm),
  {
    loading: () => (
      <div className='flex h-64 items-center justify-center'>
        <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
      </div>
    ),
  }
)

interface CreateDeckDialogProps {
  children?: React.ReactNode
  triggerButton?: boolean
}

export function CreateDeckDialog({
  children,
  triggerButton = true,
}: CreateDeckDialogProps) {
  const [params, setParams] = useDeckSearchParams()

  const isOpen = params['create-deck'] || false

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setParams({ 'create-deck': open })}
    >
      <DialogTrigger asChild>
        {children ? (
          children
        ) : triggerButton ? (
          <Button className='gap-2 shadow-md'>
            <Plus className='h-4 w-4' />
            <span>Create New Deck</span>
          </Button>
        ) : null}
      </DialogTrigger>

      <DialogContent className='border-border/70 bg-card/95 max-w-lg backdrop-blur-xl sm:max-w-xl'>
        <DialogHeader>
          <div className='text-primary flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            <DialogTitle className='text-xl font-bold'>
              Create Vocabulary Deck
            </DialogTitle>
          </div>
          <DialogDescription className='text-sm'>
            Give your deck a title, choose the proficiency level, and configure
            visibility.
          </DialogDescription>
        </DialogHeader>

        <CreateDeckForm />
      </DialogContent>
    </Dialog>
  )
}
