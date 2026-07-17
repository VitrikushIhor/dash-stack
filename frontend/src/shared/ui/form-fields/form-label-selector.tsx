import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/core/form'
import { LabelSelector } from '../label/label-selector'
import { type Label } from '../label/types.label'

interface FormLabelSelectorProps {
  name: string
  availableLabels: Label[]
  onCreateLabel?: (name: string, color: string) => void
  className?: string
}

export function FormLabelSelector({
  name,
  availableLabels,
  onCreateLabel,
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
              onCreateLabel={onCreateLabel}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
