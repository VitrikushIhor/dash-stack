'use client'

import * as React from 'react'
import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from 'react-hook-form'
import { Building2, User } from 'lucide-react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/core/form'
import { ImageUpload, type ImageUploadProps } from '../image-upload'

export type FormImageUploadPreset = 'avatar' | 'logo' | 'custom'

export interface FormImageUploadProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<
  ImageUploadProps,
  'value' | 'onValueChange' | 'onFileReject' | 'description'
> {
  name: TName
  label?: React.ReactNode
  description?: React.ReactNode
  preset?: FormImageUploadPreset
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >
  className?: string
  labelClassName?: string
  descriptionClassName?: string
  messageClassName?: string
  onFileReject?: (file: File, message: string) => void
}

const PRESET_CONFIGS: Record<
  FormImageUploadPreset,
  {
    shape: 'circle' | 'square'
    placeholderIcon: React.ReactElement
    title: string
  }
> = {
  avatar: {
    shape: 'circle',
    placeholderIcon: <User className='text-muted-foreground size-12' />,
    title: 'Upload avatar',
  },
  logo: {
    shape: 'square',
    placeholderIcon: <Building2 className='text-muted-foreground size-12' />,
    title: 'Upload logo',
  },
  custom: {
    shape: 'square',
    placeholderIcon: <User className='text-muted-foreground size-12' />,
    title: 'Upload image',
  },
}

export function FormImageUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  description,
  preset = 'custom',
  rules,
  className,
  labelClassName = 'block text-center',
  descriptionClassName = 'text-center text-xs text-muted-foreground',
  messageClassName = 'text-center',
  maxSize,
  defaultPreview,
  shape,
  title,
  placeholderIcon,
  disabled,
  onFileReject: customOnFileReject,
  ...props
}: FormImageUploadProps<TFieldValues, TName>) {
  const { control, setError, clearErrors } = useFormContext<TFieldValues>()

  const defaultConfig = PRESET_CONFIGS[preset]
  const computedShape = shape ?? defaultConfig.shape
  const computedPlaceholder = placeholderIcon ?? defaultConfig.placeholderIcon
  const computedTitle = title ?? defaultConfig.title

  const handleFileReject = React.useCallback(
    (file: File, message: string) => {
      setError(name, {
        type: 'manual',
        message,
      })
      customOnFileReject?.(file, message)
    },
    [name, setError, customOnFileReject]
  )

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        const handleValueChange = (file: File | null) => {
          clearErrors(name)
          field.onChange(file)
        }

        return (
          <FormItem className={className}>
            {label && <FormLabel className={labelClassName}>{label}</FormLabel>}
            <FormControl>
              <ImageUpload
                value={field.value}
                onValueChange={handleValueChange}
                onFileReject={handleFileReject}
                maxSize={maxSize}
                disabled={disabled}
                defaultPreview={defaultPreview}
                shape={computedShape}
                placeholderIcon={computedPlaceholder}
                title={computedTitle}
                className='mx-auto'
                {...props}
              />
            </FormControl>
            {description && (
              <FormDescription className={descriptionClassName}>
                {description}
              </FormDescription>
            )}
            <FormMessage className={messageClassName} />
          </FormItem>
        )
      }}
    />
  )
}
