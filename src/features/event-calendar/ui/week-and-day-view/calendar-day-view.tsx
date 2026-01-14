import { Calendar, User } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { parseDeadline } from "../../model/helpers";

import { useCalendar } from "../../model/contexts/calendar-context";
import { ScrollArea } from "@/shared/ui/components/ui/scroll-area";
import { EventBlock } from "./event-block";
import type { Task } from "../../model/interfaces";

interface IProps {
  singleDayEvents: Task[];
  multiDayEvents: Task[];
}

export function CalendarDayView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar();

  const allEvents = [...singleDayEvents, ...multiDayEvents];
  
  const dayEvents = allEvents.filter(event => {
    if (!event.deadline) return false;
    const eventDate = parseDeadline(event.deadline);
    return eventDate && isSameDay(eventDate, selectedDate);
  });

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col">
        <div>
          {/* Day header */}
          <div className="relative z-20 flex border-b">
            <span className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground">
              {format(selectedDate, "EE")} <span className="font-semibold text-foreground">{format(selectedDate, "d")}</span>
            </span>
          </div>
        </div>

        <ScrollArea className="h-[800px]" type="always">
          <div className="flex">
            {/* Day grid */}
            <div className="relative flex-1 border-l p-4">
               <div className="flex flex-col gap-2">
                 {dayEvents.length === 0 && (
                     <div className="text-center text-sm text-muted-foreground py-10">No tasks for this day.</div>
                 )}
                 {dayEvents.map(event => (
                   <div key={event.id}>
                     <EventBlock event={event} />
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="hidden w-64 divide-y border-l md:block">
        <div className="flex-1 space-y-3">
          {dayEvents.length > 0 ? (
            <div className="flex items-start gap-2 px-4 pt-4">
              <span className="relative mt-[5px] flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-green-600"></span>
              </span>

              <p className="text-sm font-semibold text-foreground">Today's Tasks</p>
            </div>
          ) : (
            <p className="p-4 text-center text-sm italic text-muted-foreground">No tasks for today</p>
          )}

          {dayEvents.length > 0 && (
            <ScrollArea className="h-[422px] px-4" type="always">
              <div className="space-y-6 pb-4">
                {dayEvents.map(event => (
                    <div key={event.id} className="space-y-1.5">
                      <p className="line-clamp-2 text-sm font-semibold">{event.title}</p>

                      {event.assignedMembers && event.assignedMembers.length > 0 && (
                        <div className="flex flex-col gap-1 text-muted-foreground">
                            {event.assignedMembers.map(member => (
                                <div key={member.id} className="flex items-center gap-1.5">
                                    <User className="size-3.5" />
                                    <span className="text-sm">{member.first_name} {member.last_name}</span>
                                </div>
                            ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span className="text-sm">{event.deadline ? (() => { const d = parseDeadline(event.deadline); return d ? format(d, "MMM d, yyyy") : event.deadline; })() : "No deadline"}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
