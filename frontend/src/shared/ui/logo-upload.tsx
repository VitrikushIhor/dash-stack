import { Building2 } from 'lucide-react'
import { MAX_FILE_SIZE_2_MB } from '@/shared/config'
import { ImageUpload, type ImageUploadProps } from './image-upload'

export interface LogoUploadProps extends Omit<
  ImageUploadProps,
  'shape' | 'placeholderIcon' | 'title'
> {
  title?: string
}

export function LogoUpload({
  maxSize = MAX_FILE_SIZE_2_MB,
  title = 'Upload logo',
  ...props
}: LogoUploadProps) {
  return (
    <ImageUpload
      {...props}
      maxSize={maxSize}
      shape='square'
      title={title}
      placeholderIcon={<Building2 className='text-muted-foreground size-12' />}
    />
  )
}
