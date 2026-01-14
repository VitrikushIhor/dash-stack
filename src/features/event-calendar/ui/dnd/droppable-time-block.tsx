"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/shared/lib/utils";

interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: React.ReactNode;
}

export function DroppableTimeBlock({ date, hour, minute, children }: DroppableTimeBlockProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `time-${date.toISOString()}-${hour}-${minute}`,
    data: {
      type: "time-block",
      date,
      hour,
      minute,
    },
  });

  return (
    <div ref={setNodeRef} className={cn("h-[24px]", isOver && "bg-accent/50")}>
      {children}
    </div>
  );
}
