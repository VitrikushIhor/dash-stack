import { useCallback } from 'react'
import { Checkbox } from '@/shared/ui/core/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/ui/core/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/core/select'
import {
  ImportSource,
  type ImportSource as ImportSourceValue,
} from '../model/import-preview'
import type { ImportViewModel } from '../model/use-import-preview'

const importSources = [
  { value: ImportSource.GENERIC, label: 'Generic delimited text' },
  { value: ImportSource.QUIZLET, label: 'Quizlet copied text' },
  { value: ImportSource.ANKI, label: 'Anki text export' },
  { value: ImportSource.QUENTI, label: 'Quenti-style tab text (unverified)' },
  { value: ImportSource.SPREADSHEET, label: 'Spreadsheet CSV or TSV' },
  { value: ImportSource.DASH_STACK_JSON, label: 'Dash Stack JSON backup' },
] as const satisfies ReadonlyArray<{ value: ImportSourceValue; label: string }>

function isImportSource(value: string): value is ImportSourceValue {
  return importSources.some((source) => source.value === value)
}

export function ImportOptionsFields({ model }: { model: ImportViewModel }) {
  const handleSourceChange = useCallback(
    (value: string) => {
      if (!isImportSource(value)) return

      model.changeOptions({
        ...model.options,
        source: value,
        delimiter:
          value === ImportSource.QUIZLET || value === ImportSource.QUENTI
            ? '\t'
            : 'auto',
      })
    },
    [model]
  )

  const handleDelimiterChange = useCallback(
    (value: string) => {
      if (
        value === 'auto' ||
        value === '\t' ||
        value === ',' ||
        value === ';'
      ) {
        model.changeOptions({ ...model.options, delimiter: value })
      }
    },
    [model]
  )

  const handleHeaderChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      model.changeOptions({ ...model.options, hasHeader: checked === true })
    },
    [model]
  )

  return (
    <div className='bg-muted/25 grid gap-4 rounded-xl border p-4 sm:grid-cols-3'>
      <FormField
        control={model.form.control}
        name='source'
        render={({ field }) => (
          <FormItem className='grid gap-1.5 space-y-0'>
            <FormLabel className='text-sm font-medium'>Source format</FormLabel>
            <Select value={field.value} onValueChange={handleSourceChange}>
              <FormControl>
                <SelectTrigger
                  aria-label='Source'
                  className='bg-background h-10 w-full font-normal'
                >
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {importSources.map((source) => (
                  <SelectItem key={source.value} value={source.value}>
                    {source.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      {model.options.source !== ImportSource.DASH_STACK_JSON ? (
        <FormField
          control={model.form.control}
          name='delimiter'
          render={({ field }) => (
            <FormItem className='grid gap-1.5 space-y-0'>
              <FormLabel className='text-sm font-medium'>Separator</FormLabel>
              <Select value={field.value} onValueChange={handleDelimiterChange}>
                <FormControl>
                  <SelectTrigger
                    aria-label='Separator'
                    className='bg-background h-10 w-full font-normal'
                  >
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='auto'>Detect</SelectItem>
                  <SelectItem value={'\t'}>Tab</SelectItem>
                  <SelectItem value=','>Comma</SelectItem>
                  <SelectItem value=';'>Semicolon</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      ) : (
        <div className='text-muted-foreground flex h-10 items-center self-end px-3 text-sm'>
          Versioned JSON backup
        </div>
      )}
      {model.options.source !== ImportSource.DASH_STACK_JSON ? (
        <FormField
          control={model.form.control}
          name='hasHeader'
          render={({ field }) => (
            <FormItem className='flex h-10 items-center gap-2 space-y-0 self-end px-3'>
              <FormControl>
                <Checkbox
                  aria-label='First row is a header'
                  checked={field.value}
                  onCheckedChange={handleHeaderChange}
                />
              </FormControl>
              <FormLabel className='text-sm font-medium'>
                First row is a header
              </FormLabel>
            </FormItem>
          )}
        />
      ) : (
        <div />
      )}
    </div>
  )
}
