import { useMemo } from "react";
import { CalendarX2 } from "lucide-react";
import { format, startOfDay, isSameMonth } from "date-fns";
import { parseDeadline } from "../../model/helpers";

import { useCalendar } from "../../model/contexts/calendar-context";
import { ScrollArea } from "@/shared/ui/components/ui/scroll-area";
import { AgendaDayGroup } from "./agenda-day-group";
import type { Task } from "../../model/interfaces";

interface IProps {
  singleDayEvents: Task[];
  multiDayEvents: Task[];
}

export function CalendarAgendaView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar();

  const eventsByDay = useMemo(() => {
    const allDates = new Map<string, { date: Date; events: Task[]; multiDayEvents: Task[] }>();
    const allEvents = [...singleDayEvents, ...multiDayEvents];

    allEvents.forEach(event => {
      if (!event.deadline) return;
      const eventDate = parseDeadline(event.deadline);
      if (!eventDate || !isSameMonth(eventDate, selectedDate)) return;

      const dateKey = format(eventDate, "yyyy-MM-dd");

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, { date: startOfDay(eventDate), events: [], multiDayEvents: [] });
      }

      allDates.get(dateKey)?.events.push(event);
    });

    return Array.from(allDates.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [singleDayEvents, multiDayEvents, selectedDate]);

  const hasAnyEvents = eventsByDay.length > 0;

  return (
    <div className="h-[800px]">
      <ScrollArea className="h-full" type="always">
        <div className="space-y-6 p-4">
          {eventsByDay.map(dayGroup => (
            <AgendaDayGroup key={format(dayGroup.date, "yyyy-MM-dd")} date={dayGroup.date} events={dayGroup.events} multiDayEvents={dayGroup.multiDayEvents} />
          ))}

          {!hasAnyEvents && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <CalendarX2 className="size-10" />
              <p className="text-sm md:text-base">No events scheduled for the selected month</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
