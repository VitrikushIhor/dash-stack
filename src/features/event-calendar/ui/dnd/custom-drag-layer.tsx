"use client";

import { DragOverlay, useDndContext } from "@dnd-kit/core";
import { MonthEventBadge } from "../month-view/month-event-badge";
import { type Task } from "../../model/interfaces";
import { parseDeadline } from "../../model/helpers";

export function CustomDragLayer() {
  const { active } = useDndContext();

  if (!active || active.data.current?.type !== "event") {
    return null;
  }

  const event = active.data.current.event as Task;

  const deadlineDate = event.deadline ? parseDeadline(event.deadline) : null;
  
  return (
    <DragOverlay dropAnimation={null}>
      <div className="pointer-events-none opacity-80">
        <MonthEventBadge event={event} cellDate={deadlineDate || new Date()} position="none" />
      </div>
    </DragOverlay>
  );
}
