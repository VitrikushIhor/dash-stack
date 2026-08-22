'use client'

import React from 'react'
import { ExternalLink, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/core/dialog'
import { SearchInput } from '@/shared/ui/search-input'
import { useSearchUnsplashQuery } from '../model/use-search-unsplash-query'
import { QUICK_SEARCHES, useUnsplashPicker } from '../model/use-unsplash-picker'
import { UnsplashResultsGrid } from './unsplash-results-grid'

interface UnsplashPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuery?: string
  onSelectImage: (imageUrl: string) => void
}

export function UnsplashPickerDialog({
  open,
  onOpenChange,
  initialQuery = '',
  onSelectImage,
}: UnsplashPickerDialogProps) {
  const {
    searchQuery,
    setSearchQuery,
    activeQuery,
    handleSearchSubmit,
    handleQuickSearch,
    handleSelect,
  } = useUnsplashPicker(open, initialQuery, onOpenChange, onSelectImage)

  const { data, isLoading, isError } = useSearchUnsplashQuery(activeQuery, open)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='border-border/80 bg-card/95 max-h-[85vh] max-w-2xl overflow-y-auto backdrop-blur-xl sm:max-w-3xl'>
        <DialogHeader>
          <div className='text-primary flex items-center gap-2'>
            <ImageIcon className='h-5 w-5' />
            <DialogTitle className='text-xl font-bold'>
              Choose Photo from Unsplash
            </DialogTitle>
          </div>
          <DialogDescription className='text-xs'>
            Search millions of high-resolution, royalty-free photos to enhance
            memory retention.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className='flex gap-2 pt-2'>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search images (e.g. coffee, mountain, dialogue)...'
            className='flex-1'
          />
          <Button type='submit'>Search</Button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className='flex flex-wrap gap-1.5 py-1'>
          {QUICK_SEARCHES.map((keyword) => (
            <button
              key={keyword}
              type='button'
              onClick={() => handleQuickSearch(keyword)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                activeQuery.toLowerCase() === keyword.toLowerCase()
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        <div className='min-h-75 py-3'>
          <UnsplashResultsGrid
            isLoading={isLoading}
            isError={isError}
            data={data}
            activeQuery={activeQuery}
            onSelect={handleSelect}
          />
        </div>

        {/* Unsplash Attribution Footer */}
        <div className='border-border/40 border-t pt-2 text-right'>
          <a
            href='https://unsplash.com?utm_source=dash_stack&utm_medium=referral'
            target='_blank'
            rel='noopener noreferrer'
            className='text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] transition-colors'
          >
            <span>Photos provided by Unsplash</span>
            <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
