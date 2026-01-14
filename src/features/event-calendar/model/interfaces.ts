import { type Task } from "@/entities/task";
import { type TeamMember } from "@/entities/team";

export type { Task, TeamMember };

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}
