import { useMemo } from "react";
import type { Task } from "../../model/interfaces";
import { useCalendar } from "../../model/contexts/calendar-context";
import { calculateMonthEventPositions, getCalendarCells } from "../../model/helpers";
import { DayCell } from "./day-cell";

interface IProps {
  singleDayEvents: Task[];
  multiDayEvents: Task[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar();

  const allEvents = [...multiDayEvents, ...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const eventPositions = useMemo(
    () => calculateMonthEventPositions(multiDayEvents, singleDayEvents, selectedDate),
    [multiDayEvents, singleDayEvents, selectedDate]
  );

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map(day => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map(cell => {
          const cellKey = cell.date && !isNaN(cell.date.getTime()) 
            ? cell.date.toISOString() 
            : `cell-${cell.day}-${cell.currentMonth}`;
          return (
            <DayCell key={cellKey} cell={cell} events={allEvents} eventPositions={eventPositions} />
          );
        })}
      </div>
    </div>
  );
}
