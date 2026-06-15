import { useState, useMemo, memo } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { getInitials, stringToColor } from '@/shared/lib/utils'
import { type Membership } from '@/shared/model/types/membership'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/components/ui/avatar'
import { Badge } from '@/shared/ui/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/components/ui/command'

interface TeamMemberSelectorProps {
  selectedMembers: Membership[]
  availableMembers: Membership[]
  onMembersChange: (members: Membership[]) => void
  maxMembers?: number
}

export const TeamMemberSelector = memo(function TeamMemberSelector({
  selectedMembers,
  availableMembers,
  onMembersChange,
  maxMembers,
}: TeamMemberSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const selectedIds = useMemo(
    () => new Set(selectedMembers.map((m) => m.id)),
    [selectedMembers]
  )

  const filteredAvailableMembers = useMemo(() => {
    return availableMembers
      .filter(
        (member) =>
          (member.user?.firstName || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          member.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const aSelected = selectedIds.has(a.id)
        const bSelected = selectedIds.has(b.id)
        if (aSelected && !bSelected) return -1
        if (!aSelected && bSelected) return 1
        return 0
      })
  }, [availableMembers, searchQuery, selectedIds])

  const toggleMember = (member: Membership) => {
    if (selectedIds.has(member.id)) {
      onMembersChange(selectedMembers.filter((m) => m.id !== member.id))
    } else {
      if (maxMembers && selectedMembers.length >= maxMembers) {
        toast.info(`Maximum ${maxMembers} members allowed`)
        return
      }
      onMembersChange([...selectedMembers, member])
    }
  }

  return (
    <Command className='w-full'>
      <CommandInput
        placeholder='Search by name or email...'
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className='text-muted-foreground py-6 text-center text-sm'>
            Nothing found
          </div>
        </CommandEmpty>
        <CommandGroup>
          {filteredAvailableMembers.map((member) => {
            const isSelected = selectedIds.has(member.id)
            return (
              <CommandItem
                key={member.id}
                onSelect={() => toggleMember(member)}
                className='cursor-pointer'
              >
                <div className='flex w-full items-center gap-3'>
                  <div className='flex h-4 w-4 items-center justify-center'>
                    {isSelected && <Check className='h-4 w-4' />}
                  </div>
                  <Avatar
                    className='h-8 w-8'
                    style={{
                      backgroundColor: stringToColor(
                        member.user?.firstName || 'User'
                      ),
                    }}
                  >
                    <AvatarImage
                      src={member.user?.avatar}
                      alt={member.user?.firstName}
                    />
                    <AvatarFallback className='text-xs text-white'>
                      {getInitials(member.user?.firstName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>
                      {member.user?.firstName || 'User'}
                    </p>
                    <p className='text-muted-foreground truncate text-xs'>
                      {member.user?.email}
                    </p>
                  </div>
                  {member.position && (
                    <Badge variant='outline' className='text-xs'>
                      {member.position}
                    </Badge>
                  )}
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
})
