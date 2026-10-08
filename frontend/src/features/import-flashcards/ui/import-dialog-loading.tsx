'use client'

import { Upload } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/core/dialog'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { useImportSearchParams } from '../model/dialog/import-search-params'

export function ImportDialogLoading() {
  const [params, setParams] = useImportSearchParams()

  return (
    <Dialog
      open={params['import-cards']}
      onOpenChange={(open) => {
        void setParams({ 'import-cards': open })
      }}
    >
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-1.5'>
          <Upload className='h-3.5 w-3.5' />
          <span>Import cards</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='border-border/70 bg-card/95 max-h-[90vh] overflow-y-auto p-0 backdrop-blur-xl sm:max-w-5xl'>
        <DialogHeader className='border-b px-6 py-5 text-left sm:px-8'>
          <DialogTitle className='text-xl'>Import flashcards</DialogTitle>
          <DialogDescription>Loading import form...</DialogDescription>
        </DialogHeader>
        <output className='sr-only'>Loading import form</output>
        <div aria-hidden='true' className='space-y-5 px-6 py-5 sm:px-8'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <Skeleton className='h-9 w-full' />
            <Skeleton className='h-9 w-full' />
          </div>
          <Skeleton className='h-40 w-full' />
          <Skeleton className='h-9 w-28' />
        </div>
        <div
          aria-hidden='true'
          className='flex justify-end gap-2 border-t px-6 py-4 sm:px-8'
        >
          <Skeleton className='h-9 w-20' />
          <Skeleton className='h-9 w-32' />
        </div>
      </DialogContent>
    </Dialog>
  )
}
