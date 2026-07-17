import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { AvatarUpload } from '../avatar-upload'

interface FormAvatarUploadProps {
  name: string
  label?: string
  className?: string
  maxSize?: number
}

export function FormAvatarUpload({
  name,
  label,
  className,
  maxSize,
}: FormAvatarUploadProps) {
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
            <AvatarUpload
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
              className='mx-auto'
            />
          </FormControl>
          <FormMessage className='text-center' />
        </FormItem>
      )}
    />
  )
}
