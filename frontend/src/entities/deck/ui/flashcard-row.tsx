'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  GripVertical,
  Image as ImageIcon,
  MessageSquare,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { Input } from '@/shared/ui/core/input'
import { Textarea } from '@/shared/ui/core/textarea'
import type { Flashcard } from '../model/types'

interface FlashcardRowProps {
  card: Partial<Flashcard> & { id: string }
  index: number
  dragHandleProps?: Record<string, unknown>
  onChange: (field: keyof Flashcard, value: string | null) => void
  onDelete: () => void
  onOpenImagePicker: () => void
}

export function FlashcardRow({
  card,
  index,
  dragHandleProps,
  onChange,
  onDelete,
  onOpenImagePicker,
}: FlashcardRowProps) {
  const [showExample, setShowExample] = useState(!!card.example)

  return (
    <div className='group border-border/70 bg-card/70 hover:border-border relative rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md'>
      <div className='border-border/40 mb-3 flex items-center justify-between border-b pb-2'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='text-muted-foreground hover:text-foreground cursor-grab transition-colors active:cursor-grabbing'
            {...dragHandleProps}
          >
            <GripVertical className='h-4 w-4' />
          </button>
          <span className='text-muted-foreground text-xs font-semibold'>
            #{index + 1}
          </span>
        </div>

        <div className='flex items-center gap-1'>
          {!showExample && !card.example && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setShowExample(true)}
              className='text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs'
            >
              <MessageSquare className='h-3 w-3' />
              <span>Add Example</span>
            </Button>
          )}

          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onDelete}
            className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-7 w-7'
          >
            <Trash2 className='h-3.5 w-3.5' />
            <span className='sr-only'>Delete card</span>
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
        {/* Term & Definition */}
        <div className='space-y-3 md:col-span-8'>
          <div>
            <label className='text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase'>
              Term / Word <span className='text-destructive'>*</span>
            </label>
            <Input
              value={card.term || ''}
              onChange={(e) => onChange('term', e.target.value)}
              placeholder='e.g. Serendipity'
              className='bg-background/80 font-medium'
            />
          </div>

          <div>
            <label className='text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase'>
              Definition / Translation{' '}
              <span className='text-destructive'>*</span>
            </label>
            <Textarea
              value={card.definition || ''}
              onChange={(e) => onChange('definition', e.target.value)}
              placeholder='e.g. Finding good things without looking for them'
              rows={2}
              className='bg-background/80 resize-none text-sm'
            />
          </div>

          {(showExample || card.example) && (
            <div>
              <label className='text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase'>
                Example Sentence (Optional)
              </label>
              <Input
                value={card.example || ''}
                onChange={(e) => onChange('example', e.target.value || null)}
                placeholder='e.g. Finding my favorite book at the thrift shop was pure serendipity.'
                className='bg-background/80 text-xs'
              />
            </div>
          )}
        </div>

        {/* Image Attachment / Picker */}
        <div className='flex flex-col justify-start md:col-span-4'>
          <label className='text-muted-foreground mb-1 block text-xs font-medium tracking-wider uppercase'>
            Visual Aid
          </label>

          {card.imageUrl ? (
            <div className='border-border/80 bg-muted/30 relative aspect-video w-full overflow-hidden rounded-lg border'>
              <Image
                src={card.imageUrl}
                alt={card.term || 'Flashcard image'}
                fill
                sizes='(max-width: 768px) 100vw, 250px'
                className='object-cover'
                unoptimized
              />
              <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity hover:opacity-100'>
                <Button
                  type='button'
                  size='sm'
                  variant='secondary'
                  onClick={onOpenImagePicker}
                  className='h-7 text-xs'
                >
                  Change
                </Button>
                <Button
                  type='button'
                  size='icon'
                  variant='destructive'
                  onClick={() => onChange('imageUrl', null)}
                  className='h-7 w-7'
                >
                  <X className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type='button'
              onClick={onOpenImagePicker}
              className='border-border/80 bg-muted/10 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed transition-all'
            >
              <ImageIcon className='h-5 w-5' />
              <span className='text-xs font-medium'>Add Photo (Unsplash)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
