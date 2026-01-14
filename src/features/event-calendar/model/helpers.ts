import {
  addDays,
  addMonths,
  addWeeks,
  subDays,
  subMonths,
  subWeeks,
  isSameWeek,
  isSameDay,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  parse,
  eachDayOfInterval,
  startOfDay,
  endOfYear,
  startOfYear,
  subYears,
  addYears,
  isSameYear,
  isValid,
} from "date-fns";
import { type TCalendarView } from "./types";
import { type ICalendarCell, type Task } from "./interfaces";

// Helper function to parse deadline string in various formats
export function parseDeadline(deadline: string): Date | null {
  if (!deadline) return null;

  // Try ISO format first (e.g., "2026-01-08")
  try {
    const isoDate = parseISO(deadline);
    if (isValid(isoDate)) {
      return isoDate;
    }
  } catch {
    // Continue to try other formats
  }

  // Try format "dd MMM yyyy" (e.g., "08 Jan 2026")
  try {
    const parsedDate = parse(deadline, "dd MMM yyyy", new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  } catch {
    // Continue to try other formats
  }

  // Try format "d MMM yyyy" (e.g., "8 Jan 2026")
  try {
    const parsedDate = parse(deadline, "d MMM yyyy", new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  } catch {
    // Continue to try other formats
  }

  // Try format "MMM d, yyyy" (e.g., "Jan 8, 2026")
  try {
    const parsedDate = parse(deadline, "MMM d, yyyy", new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  } catch {
    // Continue to try other formats
  }

  // Try native Date parsing as last resort
  try {
    const nativeDate = new Date(deadline);
    if (isValid(nativeDate)) {
      return nativeDate;
    }
  } catch {
    // All parsing attempts failed
  }

  return null;
}


// ================ Header helper functions ================ //

export function rangeText(view: TCalendarView, date: Date) {
  const formatString = "MMM d, yyyy";
  let start: Date;
  let end: Date;

  switch (view) {
    case "agenda":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "year":
      start = startOfYear(date);
      end = endOfYear(date);
      break;
    case "month":
      start = startOfMonth(date);
      end = endOfMonth(date);
      break;
    case "week":
      start = startOfWeek(date);
      end = endOfWeek(date);
      break;
    case "day":
      return format(date, formatString);
    default:
      return "Error while formatting ";
  }

  return `${format(start, formatString)} - ${format(end, formatString)}`;
}

export function navigateDate(date: Date, view: TCalendarView, direction: "previous" | "next"): Date {
  const operations = {
    agenda: direction === "next" ? addMonths : subMonths,
    year: direction === "next" ? addYears : subYears,
    month: direction === "next" ? addMonths : subMonths,
    week: direction === "next" ? addWeeks : subWeeks,
    day: direction === "next" ? addDays : subDays,
  };

  return operations[view](date, 1);
}

export function getEventsCount(events: Task[], date: Date, view: TCalendarView): number {
  const compareFns = {
    agenda: isSameMonth,
    year: isSameYear,
    day: isSameDay,
    week: isSameWeek,
    month: isSameMonth,
  };

  return events.filter(event => {
    if (!event.deadline) return false;
    const eventDate = parseDeadline(event.deadline);
    return eventDate && compareFns[view](eventDate, date);
  }).length;
}

// ================ Week and day view helper functions ================ //

export function getCurrentEvents(events: Task[]) {
  const now = new Date();
  return events.filter(event => {
    if (!event.deadline) return false;
    const eventDate = parseDeadline(event.deadline);
    return eventDate && isSameDay(eventDate, now);
  }) || null;
}

export function groupEvents(dayEvents: Task[]) {
    // Basic grouping, just returning explicit array wrapper if needed for compatibility,
    // or we can remove if components don't use it.
    // CalendarWeekView no longer uses it. CalendarDayView no longer uses it.
    // So we can remove it?
    // Keeping it for now as safe measure or simple passthrough if referenced.
  return [dayEvents];
}


// ================ Month view helper functions ================ //

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const daysInPrevMonth = getDaysInMonth(currentYear, currentMonth - 1);
  const totalDays = firstDayOfMonth + daysInMonth;

  const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
    day: daysInPrevMonth - firstDayOfMonth + i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
  }));

  const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    currentMonth: true,
    date: new Date(currentYear, currentMonth, i + 1),
  }));

  const nextMonthCells = Array.from({ length: (7 - (totalDays % 7)) % 7 }, (_, i) => ({
    day: i + 1,
    currentMonth: false,
    date: new Date(currentYear, currentMonth + 1, i + 1),
  }));

  return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthEventPositions(multiDayEvents: Task[], singleDayEvents: Task[], selectedDate: Date) {
  // Assuming tasks are single day (deadline).

  // Validate selectedDate
  if (!selectedDate || isNaN(selectedDate.getTime())) {
    return {};
  }

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);

  const eventPositions: { [key: string]: number } = {};
  const occupiedPositions: { [key: string]: boolean[] } = {};

  // Initialize occupied positions for all days in the month
  eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach(day => {
    if (!day || isNaN(day.getTime())) return;
    const normalizedDay = startOfDay(day);
    if (isNaN(normalizedDay.getTime())) return;
    try {
      const dayKey = normalizedDay.toISOString();
      occupiedPositions[dayKey] = [false, false, false];
    } catch (error) {
      // Skip invalid dates
      console.warn('Invalid date in calculateMonthEventPositions:', day);
    }
  });

  // Treat all tasks as single day events for now
  const allEvents = [...multiDayEvents, ...singleDayEvents].filter(e => e.deadline);

  const sortedEvents = allEvents
    .map(event => {
      if (!event.deadline) return null;
      const eventDate = parseDeadline(event.deadline);
      if (!eventDate || isNaN(eventDate.getTime())) return null;
      return { event, eventDate };
    })
    .filter((item): item is { event: Task; eventDate: Date } => item !== null)
    .sort((a, b) => {
      // Sort by deadline
      return a.eventDate.getTime() - b.eventDate.getTime();
    });

  sortedEvents.forEach(({ event, eventDate }) => {
    const normalizedEventDate = startOfDay(eventDate);
    
    // Validate normalized date
    if (isNaN(normalizedEventDate.getTime())) return;
    
    // Check if event is in this month view
    if (normalizedEventDate < monthStart || normalizedEventDate > monthEnd) return;

    try {
      const dayKey = normalizedEventDate.toISOString();
      if (!occupiedPositions[dayKey]) {
        // Initialize if somehow missing
        occupiedPositions[dayKey] = [false, false, false];
      }

      let position = -1;

      // Find first empty slot (limit 3)
      for (let i = 0; i < 3; i++) {
        if (!occupiedPositions[dayKey][i]) {
          position = i;
          break;
        }
      }

      if (position !== -1) {
        occupiedPositions[dayKey][position] = true;
        eventPositions[event.id] = position;
      }
    } catch (error) {
      // Skip invalid dates
      console.warn('Invalid date for event:', event.id, event.deadline);
    }
  });

  return eventPositions;
}

export function getMonthCellEvents(date: Date, events: Task[], eventPositions: Record<string, number>) {
  const eventsForDate = events.filter(event => {
    if (!event.deadline) return false;
    const eventDate = parseDeadline(event.deadline);
    return eventDate && isSameDay(date, eventDate);
  });

  return eventsForDate
    .map(event => ({
      ...event,
      position: eventPositions[event.id] ?? -1,
      isMultiDay: false, 
    }))
    .sort((a, b) => {
      // Sort by position? or just keep order
      return (a.position - b.position);
    });
}
