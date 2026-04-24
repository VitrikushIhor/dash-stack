import { useState, memo } from 'react'
import { Plus, Users } from 'lucide-react'
import { type Membership } from '@/shared/model/types/membership'
import { AvatarGroup } from '@/shared/ui/components/avatar-group'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/components/ui/popover'
import { TeamMemberSelector } from './team-member-selector'

interface TeamMemberPickerProps {
  selectedMembers: Membership[]
  availableMembers: Membership[]
  onMembersChange: (members: Membership[]) => void
  maxMembers?: number
  label?: string
}

export const TeamMemberPicker = memo(function TeamMemberPicker({
  selectedMembers,
  availableMembers,
  onMembersChange,
  maxMembers,
  label = 'Member',
}: TeamMemberPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <label className='text-sm font-medium'>{label}</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
            >
              <Plus className='h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-96 p-0' align='start'>
            <div className='p-4'>
              <TeamMemberSelector
                selectedMembers={selectedMembers}
                availableMembers={availableMembers}
                onMembersChange={onMembersChange}
                maxMembers={maxMembers}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {selectedMembers.length === 0 ? (
        <div className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Users className='h-4 w-4' />
          <span>No members</span>
        </div>
      ) : (
        <div>
          {selectedMembers.length > 0 && (
            <AvatarGroup members={selectedMembers} max={4} size='md' />
          )}
        </div>
      )}
    </div>
  )
})
