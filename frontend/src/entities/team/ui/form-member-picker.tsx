import { useFormContext } from 'react-hook-form'
import { type Membership } from '@/shared/model'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/core/form'
import { TeamMemberPicker } from './team-member-picker'

interface FormMemberPickerProps {
  name: string
  availableMembers: Membership[]
  maxMembers?: number
  label?: string
}

export function FormMemberPicker({
  name,
  availableMembers,
  maxMembers,
  label,
}: FormMemberPickerProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <TeamMemberPicker
              selectedMembers={field.value || []}
              availableMembers={availableMembers}
              onMembersChange={field.onChange}
              maxMembers={maxMembers}
              label={label}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
