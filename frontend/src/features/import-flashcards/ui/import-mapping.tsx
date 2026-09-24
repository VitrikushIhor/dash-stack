import { useCallback } from 'react'
import { TableProperties } from 'lucide-react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/ui/core/form'
import { Input } from '@/shared/ui/core/input'
import type { ImportMapping } from '../model/import-preview'
import type { ImportViewModel } from '../model/use-import-preview'

const fields = ['term', 'definition', 'example', 'imageUrl'] as const
const labels = {
  term: 'Term',
  definition: 'Definition',
  example: 'Example',
  imageUrl: 'Image URL',
}

export function ImportMappingFields({ model }: { model: ImportViewModel }) {
  const handleMappingChange = useCallback(
    (field: keyof ImportMapping, value: string) => {
      const column = value === '' ? null : Number(value) - 1

      if (column === null && (field === 'term' || field === 'definition'))
        return
      if (column !== null && (!Number.isInteger(column) || column < 0)) return
      model.changeOptions({
        ...model.options,
        mapping: { ...model.options.mapping, [field]: column },
      })
    },
    [model]
  )

  return (
    <div className='rounded-xl border p-4'>
      <div className='mb-3 flex items-center gap-2 text-sm font-semibold'>
        <TableProperties className='text-primary size-4' /> Column mapping
      </div>
      <div className='flex flex-wrap gap-3'>
        {fields.map((fieldKey) => (
          <FormField
            key={fieldKey}
            control={model.form.control}
            name={`mapping.${fieldKey}`}
            render={({ field }) => (
              <FormItem className='grid gap-1 space-y-0'>
                <FormLabel className='text-xs font-medium'>
                  {labels[fieldKey]} column
                </FormLabel>
                <FormControl>
                  <Input
                    aria-label={`${labels[fieldKey]} column`}
                    type='number'
                    min='1'
                    value={field.value === null ? '' : field.value + 1}
                    placeholder={
                      fieldKey === 'example' || fieldKey === 'imageUrl'
                        ? 'Not mapped'
                        : undefined
                    }
                    onChange={(event) =>
                      handleMappingChange(fieldKey, event.target.value)
                    }
                    className='mt-1 h-9 w-28 rounded-lg'
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}
