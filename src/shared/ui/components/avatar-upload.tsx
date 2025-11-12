'use client'

import * as React from 'react'
import { User, X } from 'lucide-react'
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE_2_MB,
} from '@/shared/constants/constants'
import { cn } from '@/shared/lib/utils'
import { Button } from './ui/button'

interface AvatarUploadProps {
  value?: File | null
  onValueChange?: (file: File | null) => void
  onFileReject?: (file: File, message: string) => void
  maxSize?: number
  className?: string
  disabled?: boolean
  defaultPreview?: string
}

export function AvatarUpload({
  value,
  onValueChange,
  onFileReject,
  maxSize = MAX_FILE_SIZE_2_MB,
  className,
  disabled = false,
  defaultPreview,
}: AvatarUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(
    defaultPreview ?? null
  )
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!value) {
      setPreview(defaultPreview ?? null)
      return
    }

    const objectUrl = URL.createObjectURL(value)
    setPreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [value, defaultPreview])

  const validateAndSetFile = (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onFileReject?.(file, 'File must be an image')
      return
    }

    if (file.size > maxSize) {
      onFileReject?.(
        file,
        `File size must be less than ${maxSize / 1024 / 1024}MB`
      )
      return
    }

    onValueChange?.(file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    validateAndSetFile(file ?? null)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    validateAndSetFile(file)
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className='relative'>
        <button
          type='button'
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          disabled={disabled}
          aria-label='Upload avatar'
          className={cn(
            'relative flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all',
            preview
              ? 'border-transparent'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            isDragging && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt='Avatar preview'
              className='size-full object-cover'
            />
          ) : (
            <User className='text-muted-foreground size-12' />
          )}
        </button>

        {preview && !disabled && (
          <Button
            type='button'
            variant='destructive'
            size='icon'
            className='absolute -top-2 -right-2 size-8 rounded-full shadow-md'
            onClick={handleRemove}
            aria-label='Remove avatar'
          >
            <X className='size-4' />
          </Button>
        )}

        <input
          ref={inputRef}
          type='file'
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={handleFileChange}
          disabled={disabled}
          className='sr-only'
          aria-label='Avatar file input'
        />
      </div>

      <div className='flex flex-col items-center gap-1 text-center'>
        <p className='text-sm font-medium'>Upload avatar</p>
        <p className='text-muted-foreground text-xs'>
          PNG, JPG up to {maxSize / 1024 / 1024}MB
        </p>
      </div>
    </div>
  )
}
