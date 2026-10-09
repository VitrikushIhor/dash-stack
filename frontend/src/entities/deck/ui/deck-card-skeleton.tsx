import React from 'react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/shared/ui/core/card'
import { Skeleton } from '@/shared/ui/core/skeleton'

export function DeckCardSkeleton() {
  return (
    <Card className='border-border/60 bg-card/60 flex h-55 flex-col justify-between overflow-hidden backdrop-blur-sm'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <Skeleton className='h-5 w-16 rounded-full' />
            <Skeleton className='h-5 w-20 rounded-full' />
          </div>
          <Skeleton className='h-8 w-8 rounded-md' />
        </div>
        <div className='pt-2'>
          <Skeleton className='h-6 w-3/4' />
        </div>
        <div className='mt-2 space-y-1.5'>
          <Skeleton className='h-3.5 w-full' />
          <Skeleton className='h-3.5 w-4/5' />
        </div>
      </CardHeader>

      <CardContent className='pt-0 pb-3'>
        <div className='flex gap-1.5'>
          <Skeleton className='h-5 w-12 rounded-md' />
          <Skeleton className='h-5 w-16 rounded-md' />
        </div>
      </CardContent>

      <CardFooter className='border-border/40 bg-muted/10 flex items-center justify-between border-t px-6 py-3'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-8 w-20 rounded-md' />
      </CardFooter>
    </Card>
  )
}
