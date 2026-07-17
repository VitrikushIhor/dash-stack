import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { LogoUpload } from '../logo-upload'

interface FormLogoUploadProps {
  name: string
  label?: string
  className?: string
  maxSize?: number
}

export function FormLogoUpload({
  name,
  label,
  className,
  maxSize,
}: FormLogoUploadProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className='block text-center'>{label}</FormLabel>
          )}
          <FormControl>
            <LogoUpload
              value={field.value}
              onValueChange={field.onChange}
              maxSize={maxSize}
              className='mx-auto'
            />
          </FormControl>
          <FormMessage className='text-center' />
        </FormItem>
      )}
    />
  )
}
