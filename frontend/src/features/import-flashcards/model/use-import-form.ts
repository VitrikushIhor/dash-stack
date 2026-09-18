import { useForm, useWatch } from 'react-hook-form'
import type { ImportOptions } from './import-preview'

const defaultImportOptions: ImportOptions = {
  source: 'generic',
  delimiter: 'auto',
  hasHeader: false,
  mapping: { term: 0, definition: 1, example: null, imageUrl: null },
}

export type ImportFormValues = ImportOptions & { text: string }

export const importFormDefaults: ImportFormValues = {
  ...defaultImportOptions,
  text: '',
}

export function useImportForm() {
  const form = useForm<ImportFormValues>({
    defaultValues: importFormDefaults,
  })

  const formValues = useWatch({ control: form.control })
  const text = formValues.text ?? ''

  const options: ImportOptions = {
    source: formValues.source ?? defaultImportOptions.source,
    delimiter: formValues.delimiter ?? defaultImportOptions.delimiter,
    hasHeader: formValues.hasHeader ?? defaultImportOptions.hasHeader,
    mapping: {
      term: formValues.mapping?.term ?? defaultImportOptions.mapping.term,
      definition:
        formValues.mapping?.definition ??
        defaultImportOptions.mapping.definition,
      example:
        formValues.mapping?.example ?? defaultImportOptions.mapping.example,
      imageUrl:
        formValues.mapping?.imageUrl ?? defaultImportOptions.mapping.imageUrl,
    },
  }

  return { form, text, options }
}
