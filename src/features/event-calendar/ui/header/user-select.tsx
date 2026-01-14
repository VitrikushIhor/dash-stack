import { AvatarGroup } from "@/shared/ui/components/avatar-group";
import { useCalendar } from "../../model/contexts/calendar-context";
import { useMemberStore } from "@/features/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/ui/select";
import { type TeamMember } from "@/entities/team";

export function UserSelect() {
  const { selectedUserId, setSelectedUserId } = useCalendar();
  const teamMembers = useMemberStore((store) => store.members);

  return (
    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
      <SelectTrigger className="flex-1 md:w-48">
        <SelectValue />
      </SelectTrigger>

      <SelectContent align="end">
        <SelectItem value="all">
          <div className="flex items-center gap-1">
            <AvatarGroup max={2} members={teamMembers} size="m"> 
            </AvatarGroup>
            All
          </div>
        </SelectItem>

        {teamMembers.map(member => (
          <SelectItem key={member.id} value={member.id} className="flex-1">
            <div className="flex items-center gap-2">
              <Avatar key={member.id} className="size-6">
                <AvatarImage src={member.avatar || undefined} alt={`${member.first_name} ${member.last_name}`} />
                <AvatarFallback className="text-xxs">{member.first_name[0]}{member.last_name[0]}</AvatarFallback>
              </Avatar>

              <p className="truncate">{member.first_name} {member.last_name}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
