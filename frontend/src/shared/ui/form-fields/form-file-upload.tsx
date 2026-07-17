import { useFormContext } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/core/form'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from '../file-upload'

interface FormFileUploadProps extends React.ComponentProps<typeof FileUpload> {
  name: string
  label?: string
}

export function FormFileUpload({ name, label, ...props }: FormFileUploadProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const files: File[] = field.value || []

        return (
          <FormItem>
            {label && <label className='text-sm font-medium'>{label}</label>}
            <FormControl>
              <FileUpload
                value={files}
                onValueChange={field.onChange}
                {...props}
              >
                <FileUploadDropzone>
                  <div className='flex flex-col items-center gap-1 text-center'>
                    <div className='flex items-center justify-center rounded-full border p-2.5'>
                      <Upload className='text-muted-foreground size-6' />
                    </div>
                    <p className='text-sm font-medium'>
                      Drag & drop files here
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      Or click to browse
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant='outline' size='sm' className='mt-2 w-fit'>
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadList>
                  {files.map((file, index) => (
                    <FileUploadItem
                      key={index}
                      value={file}
                      className='flex-col'
                    >
                      <div className='flex w-full items-center gap-2'>
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='size-7'
                          >
                            <X />
                          </Button>
                        </FileUploadItemDelete>
                      </div>
                      <FileUploadItemProgress />
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              </FileUpload>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
