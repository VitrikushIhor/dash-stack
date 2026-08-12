'use client'

import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/core/form'
import { LabelSelector, type Label } from '@/entities/label'

interface FormLabelSelectorProps {
  name: string
  availableLabels: Label[]
  className?: string
}

export function FormLabelSelector({
  name,
  availableLabels,
  className,
}: FormLabelSelectorProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <LabelSelector
              selectedLabel={field.value}
              availableLabels={availableLabels}
              onLabelChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
