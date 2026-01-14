"use client";

import { useDroppable } from "@dnd-kit/core";
import { type ICalendarCell } from "../../model/interfaces";
import { cn } from "@/shared/lib/utils";

interface DroppableDayCellProps {
  cell: ICalendarCell;
  children: React.ReactNode;
}

export function DroppableDayCell({ cell, children }: DroppableDayCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: cell.date && !isNaN(cell.date.getTime()) 
      ? `day-${cell.date.toISOString()}` 
      : `day-${cell.day}-${cell.currentMonth}`,
    data: {
      type: "day",
      date: cell.date,
    },
  });

  return (
    <div ref={setNodeRef} className={cn("h-full w-full", isOver && "bg-accent/50")}>
      {children}
    </div>
  );
}
