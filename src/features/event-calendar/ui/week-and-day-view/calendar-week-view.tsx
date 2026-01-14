import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { parseDeadline } from "../../model/helpers";
import { useCalendar } from "../../model/contexts/calendar-context";
import { ScrollArea } from "@/shared/ui/components/ui/scroll-area";
import { EventBlock } from "./event-block";
import type { Task } from "../../model/interfaces";

interface IProps {
  singleDayEvents: Task[];
  multiDayEvents: Task[];
}

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar();

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const allEvents = [...singleDayEvents, ...multiDayEvents];

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
        <p>Weekly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </div>

      <div className="hidden flex-col sm:flex">
        {/* Week header */}
        <div className="relative z-20 flex border-b">
          <div className="grid flex-1 grid-cols-7 divide-x border-l">
            {weekDays.map((day, index) => (
              <span key={index} className="py-2 text-center text-xs font-medium text-muted-foreground">
                {format(day, "EE")} <span className="ml-1 font-semibold text-foreground">{format(day, "d")}</span>
              </span>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[736px]" type="always">
          <div className="flex overflow-hidden">
            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = allEvents.filter(event => {
                    if (!event.deadline) return false;
                    const eventDate = parseDeadline(event.deadline);
                    return eventDate && isSameDay(eventDate, day);
                  });

                  return (
                    <div key={dayIndex} className="relative min-h-[500px] bg-background p-2">
                      <div className="flex flex-col gap-2">
                        {dayEvents.map(event => (
                           <div key={event.id}>
                             <EventBlock event={event} />
                           </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
