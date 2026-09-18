'use client'

import { Sparkles, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/ui/core/alert'
import { Button } from '@/shared/ui/core/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/core/dialog'
import { Form } from '@/shared/ui/core/form'
import { GradientHeading } from '@/shared/ui/gradient-heading'
import { Skeleton } from '@/shared/ui/core/skeleton'
import type { ImportDialogProps } from '../model/import-dialog.types'
import { useImportPreview } from '../model/use-import-preview'
import { ImportInputs } from './import-inputs'
import { ImportMappingFields } from './import-mapping'
import { ImportOptionsFields } from './import-options'
import { ImportPreviewTable } from './import-preview-table'

export function ImportDialog(props: ImportDialogProps) {
  const model = useImportPreview(props)

  return (
    <Dialog open={model.open} onOpenChange={model.changeOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-1.5'>
          <Upload className='h-3.5 w-3.5' />
          <span>Import cards</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='border-border/70 bg-card/95 max-h-[90vh] overflow-y-auto p-0 backdrop-blur-xl sm:max-w-5xl'>
        <GradientHeading className='border-b px-6 py-5 sm:px-8'>
          <DialogHeader className='text-left sm:text-left'>
            <div className='bg-primary text-primary-foreground mb-3 flex size-10 items-center justify-center rounded-xl shadow-sm'>
              <Sparkles className='size-5' />
            </div>
            <DialogTitle className='text-xl'>Import flashcards</DialogTitle>
            <DialogDescription className='max-w-2xl leading-6'>
              Paste text or choose UTF-8 CSV, TSV, TXT or Dash Stack JSON. Up to
              2000 rows and 4 MiB. Existing cards stay in this deck; duplicate
              rows are added as separate cards.
            </DialogDescription>
          </DialogHeader>
        </GradientHeading>
        <Form {...model.form}>
          <fieldset
            disabled={
              model.pending || model.reading || model.hasUnresolvedConfirmation
            }
            className='space-y-5 px-6 py-5 sm:px-8'
          >
            <ImportOptionsFields model={model} />
            <ImportInputs model={model} />
            <ImportMappingFields model={model} />

            <Button
              type='button'
              className='w-full sm:w-auto'
              variant='secondary'
              onClick={model.createPreview}
            >
              Preview
            </Button>

            <ImportPreviewTable model={model} />
          </fieldset>
        </Form>
        {model.error && (
          <Alert
            role='alert'
            className='border-destructive/30 bg-destructive/10 text-destructive mx-6 rounded-lg border px-3 py-2 text-sm sm:mx-8'
          >
            <AlertDescription>{model.error}</AlertDescription>
          </Alert>
        )}
        {model.reading && (
          <div
            role='status'
            aria-label='Reading file'
            className='mx-6 flex items-center gap-3 sm:mx-8'
          >
            <Skeleton className='size-4 rounded-full' />
            <Skeleton className='h-4 w-40' />
          </div>
        )}
        <div className='bg-muted/20 flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end sm:px-8'>
          <Button
            variant='ghost'
            disabled={model.pending}
            onClick={() => model.changeOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!model.canConfirm}
            onClick={() => void model.confirm()}
          >
            {model.pending
              ? 'Importing…'
              : `Import ${model.includedCount} cards`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
