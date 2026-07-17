import { User } from 'lucide-react'
import { MAX_FILE_SIZE_2_MB } from '@/shared/config'
import { ImageUpload, type ImageUploadProps } from './image-upload'

export interface AvatarUploadProps extends Omit<
  ImageUploadProps,
  'shape' | 'placeholderIcon' | 'title'
> {
  title?: string
}

export function AvatarUpload({
  maxSize = MAX_FILE_SIZE_2_MB,
  title = 'Upload avatar',
  ...props
}: AvatarUploadProps) {
  return (
    <ImageUpload
      {...props}
      maxSize={maxSize}
      shape='circle'
      title={title}
      placeholderIcon={<User className='text-muted-foreground size-12' />}
    />
  )
}
