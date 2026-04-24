import { AvatarGroup } from '@/shared/ui/components/avatar-group'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/ui/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/components/ui/select'
import { useCalendar } from '../../model/contexts/calendar-context'

export function UserSelect() {
  const { users, selectedUserId, setSelectedUserId } = useCalendar()

  return (
    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
      <SelectTrigger className='flex-1 md:w-48'>
        <SelectValue />
      </SelectTrigger>

      <SelectContent align='end'>
        <SelectItem value='all'>
          <div className='flex items-center gap-1'>
            <AvatarGroup
              max={2}
              members={users.map((user) => ({
                id: user.id,
                first_name: user.name,
                last_name: user.name,
                avatar: user.picturePath,
              }))}
              size='m'
            ></AvatarGroup>
            All
          </div>
        </SelectItem>

        {users.map((user) => (
          <SelectItem key={user.id} value={user.id} className='flex-1'>
            <div className='flex items-center gap-2'>
              <Avatar key={user.id} className='size-6'>
                <AvatarImage
                  src={user.picturePath ?? undefined}
                  alt={user.name}
                />
                <AvatarFallback className='text-xxs'>
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>

              <p className='truncate'>{user.name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
