import { useCallback } from 'react'
import { FileUp } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/ui/core/form'
import { Textarea } from '@/shared/ui/core/textarea'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
} from '@/shared/ui/file-upload'
import { IMPORT_MAX_BYTES } from '../model/import-preview'
import type { ImportViewModel } from '../model/use-import-preview'

export function ImportInputs({ model }: { model: ImportViewModel }) {
  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      model.changeText(event.target.value)
    },
    [model]
  )

  const handleFileAccept = useCallback(
    (file: File) => void model.readFile(file),
    [model]
  )

  return (
    <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]'>
      <FormField
        control={model.form.control}
        name='text'
        render={({ field }) => (
          <FormItem className='grid gap-2 space-y-0'>
            <FormLabel className='text-sm font-medium'>
              Paste terms and definitions
            </FormLabel>
            <FormControl>
              <Textarea
                aria-label='Paste text'
                value={field.value}
                onChange={handleTextChange}
                placeholder={'term,definition\nhello,привіт'}
                className='bg-muted/20 min-h-40 resize-y rounded-xl font-mono text-sm'
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FileUpload
        accept='.csv,.tsv,.txt,.json'
        maxFiles={1}
        maxSize={IMPORT_MAX_BYTES}
        disabled={model.reading || model.pending}
        onFileAccept={handleFileAccept}
      >
        <FileUploadDropzone className='border-muted-foreground/30 hover:border-primary hover:bg-primary/5 flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-4 text-center transition-colors'>
          <FileUp className='text-primary size-7' />
          <span className='text-sm font-medium'>Choose a file</span>
          <span className='text-muted-foreground text-xs'>
            CSV, TSV, TXT or JSON
            <br />
            UTF-8 · up to 4 MiB
          </span>
          <FileUploadTrigger asChild>
            <Button type='button' variant='outline' size='sm'>
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
      </FileUpload>
    </div>
  )
}
