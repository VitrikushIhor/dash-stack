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
  defaultPreview?: string
}

export function FormLogoUpload({
  name,
  label,
  className,
  maxSize,
  defaultPreview,
}: FormLogoUploadProps) {
  const { control, setError, clearErrors } = useFormContext()

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
              onValueChange={(file) => {
                clearErrors(name)
                field.onChange(file)
              }}
              onFileReject={(_, message) => {
                setError(name, {
                  type: 'manual',
                  message,
                })
              }}
              maxSize={maxSize}
              defaultPreview={defaultPreview}
              className='mx-auto'
            />
          </FormControl>
          <FormMessage className='text-center' />
        </FormItem>
      )}
    />
  )
}
