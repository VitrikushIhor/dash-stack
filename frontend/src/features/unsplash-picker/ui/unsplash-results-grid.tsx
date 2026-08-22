import React from 'react'
import Image from 'next/image'
import { Image as ImageIcon } from 'lucide-react'
import { Skeleton } from '@/shared/ui/core/skeleton'
import { ErrorFallback } from '@/shared/ui/error-state'
import { type UnsplashSearchResult } from '@/entities/deck'

interface UnsplashResultsGridProps {
  isLoading: boolean
  isError: boolean
  data?: UnsplashSearchResult
  activeQuery: string
  onSelect: (imageUrl: string) => void
}

export function UnsplashResultsGrid({
  isLoading,
  isError,
  data,
  activeQuery,
  onSelect,
}: UnsplashResultsGridProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className='aspect-4/3 w-full rounded-lg' />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex h-64 items-center justify-center p-6'>
        <ErrorFallback
          title='Failed to load photos'
          message='There was an error connecting to Unsplash. Please try another search keyword or try again later.'
        />
      </div>
    )
  }

  if (data?.results && data.results.length > 0) {
    return (
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {data.results.map((photo) => (
          <button
            key={photo.id}
            type='button'
            onClick={() => onSelect(photo.regularUrl || photo.thumbUrl)}
            aria-label={`Select photo by ${photo.photographerName}: ${photo.altDescription || 'image'}`}
            className='group border-border/60 bg-muted/40 hover:border-primary focus-visible:ring-primary relative aspect-4/3 cursor-pointer overflow-hidden rounded-lg border text-left transition-all hover:shadow-md focus-visible:ring-2 focus-visible:outline-none'
          >
            <Image
              src={photo.thumbUrl || photo.regularUrl}
              alt={photo.altDescription || 'Unsplash image'}
              fill
              sizes='(max-width: 768px) 50vw, 250px'
              className='object-cover transition-transform duration-300 group-hover:scale-105'
            />
            <div className='absolute inset-0 flex items-end bg-linear-to-t from-black/70 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100'>
              <p className='line-clamp-1 text-[11px] font-medium text-white/90'>
                Photo by {photo.photographerName}
              </p>
            </div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className='text-muted-foreground flex h-64 flex-col items-center justify-center gap-2'>
      <ImageIcon className='text-muted-foreground/50 h-8 w-8' />
      <p className='text-sm font-medium'>
        No photos found for &quot;{activeQuery}&quot;
      </p>
      <p className='text-xs'>
        Try searching for a simpler or related English term.
      </p>
    </div>
  )
}
