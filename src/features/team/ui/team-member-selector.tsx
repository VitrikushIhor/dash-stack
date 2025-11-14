import { useState, useCallback, useMemo, memo } from 'react'
import { Plus, X, UserPlus } from 'lucide-react'
import { cn, getInitials, stringToColor } from '@/shared/lib/utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/components/ui/avatar'
import { Badge } from '@/shared/ui/components/ui/badge'
import { Button } from '@/shared/ui/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/components/ui/dialog'
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'
import { type TeamMember } from '@/entities/team'

interface TeamMemberSelectorProps {
  selectedMembers: TeamMember[]
  availableMembers: TeamMember[]
  onMembersChange: (members: TeamMember[]) => void
  maxMembers?: number
  title?: string
  description?: string
  className?: string
}

export const TeamMemberSelector = memo(function TeamMemberSelector({
  selectedMembers,
  availableMembers,
  onMembersChange,
  maxMembers,
  title = 'Add Members',
  description = 'Select team members',
  className,
}: TeamMemberSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedIds = useMemo(
    () => new Set(selectedMembers.map((m) => m.id)),
    [selectedMembers]
  )

  const filteredAvailableMembers = useMemo(() => {
    return availableMembers.filter(
      (member) =>
        !selectedIds.has(member.id) &&
        (member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [availableMembers, selectedIds, searchQuery])

  const canAddMore = useMemo(() => {
    if (!maxMembers) return true
    return selectedMembers.length < maxMembers
  }, [selectedMembers.length, maxMembers])

  const handleAddMember = useCallback(
    (member: TeamMember) => {
      if (!canAddMore) return
      onMembersChange([...selectedMembers, member])
      setSearchQuery('')
    },
    [selectedMembers, onMembersChange, canAddMore]
  )

  const handleRemoveMember = useCallback(
    (memberId: string) => {
      onMembersChange(selectedMembers.filter((m) => m.id !== memberId))
    },
    [selectedMembers, onMembersChange]
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <label className='text-sm font-medium'>Members</label>
          {selectedMembers.length > 0 && (
            <Badge variant='secondary'>{selectedMembers.length}</Badge>
          )}
          {maxMembers && (
            <span className='text-muted-foreground text-xs'>
              (max. {maxMembers})
            </span>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={!canAddMore}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <Command className='rounded-lg border'>
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
                  <ScrollArea className='h-[300px]'>
                    {filteredAvailableMembers.map((member) => (
                      <CommandItem
                        key={member.id}
                        onSelect={() => handleAddMember(member)}
                        className='cursor-pointer'
                      >
                        <div className='flex w-full items-center gap-3'>
                          <Avatar
                            className='h-8 w-8'
                            style={{
                              backgroundColor: member.avatar
                                ? undefined
                                : stringToColor(member.first_name),
                            }}
                          >
                            <AvatarImage
                              src={member.avatar}
                              alt={member.first_name}
                            />
                            <AvatarFallback className='text-xs text-white'>
                              {getInitials(member.first_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='min-w-0 flex-1'>
                            <p className='truncate text-sm font-medium'>
                              {member.first_name}
                            </p>
                            <p className='text-muted-foreground truncate text-xs'>
                              {member.email}
                            </p>
                          </div>
                          {member.position && (
                            <Badge variant='outline' className='text-xs'>
                              {member.position}
                            </Badge>
                          )}
                          <UserPlus className='text-muted-foreground h-4 w-4' />
                        </div>
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>

            <DialogFooter>
              <Button variant='outline' onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {selectedMembers.length === 0 ? (
        <div className='text-muted-foreground rounded-lg border border-dashed p-8 text-center'>
          <UserPlus className='mx-auto h-8 w-8 opacity-50' />
          <p className='mt-2 text-sm'>No members</p>
          <p className='text-xs'>Add members to the team</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {selectedMembers.map((member) => (
            <div
              key={member.id}
              className='hover:bg-accent group flex items-center justify-between rounded-lg border p-3 transition-colors'
            >
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <Avatar
                  className='h-10 w-10'
                  style={{
                    backgroundColor: member.avatar
                      ? undefined
                      : stringToColor(member.first_name),
                  }}
                >
                  <AvatarImage src={member.avatar} alt={member.first_name} />
                  <AvatarFallback className='text-white'>
                    {getInitials(member.first_name)}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>
                    {member.first_name}
                  </p>
                  <p className='text-muted-foreground truncate text-xs'>
                    {member.email}
                  </p>
                </div>
                {member.position && (
                  <Badge variant='secondary' className='text-xs'>
                    {member.position}
                  </Badge>
                )}
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'
                onClick={() => handleRemoveMember(member.id)}
                aria-label={`Remove ${member.first_name}`}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
