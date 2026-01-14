"use client";

import { Button } from "@/shared/ui/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/components/ui/dialog";
import { format } from "date-fns";
import { parseDeadline } from "../model/helpers";
import { Calendar, Text, User } from "lucide-react";
import { type Task } from "../model/interfaces";

interface IProps {
  event: Task;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const deadlineDate = event.deadline ? parseDeadline(event.deadline) : null;

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <User className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Assigned Members</p>
                {event.assignedMembers && event.assignedMembers.length > 0 ? (
                    <div className="flex flex-col gap-1">
                        {event.assignedMembers.map(member => (
                            <p key={member.id} className="text-sm text-muted-foreground">{member.first_name} {member.last_name}</p>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0" />
              <div>
                <p className="text-sm font-medium">Deadline</p>
                <p className="text-sm text-muted-foreground">{deadlineDate ? format(deadlineDate, "MMM d, yyyy") : "No deadline"}</p>
              </div>
            </div>

            {/* Status (optional, if user wants to see it) */}
             <div className="flex items-start gap-2">
              <div className="mt-1 size-4 shrink-0 rounded-full bg-primary/20" /> 
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground">{event.status}</p>
              </div>
            </div>

            {event.description && (
                <div className="flex items-start gap-2">
                <Text className="mt-1 size-4 shrink-0" />
                <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
                </div>
            )}
          </div>

          <DialogFooter>
            {/* <EditEventDialog event={event}> */}
              <Button type="button" variant="outline">
                Edit
              </Button>
            {/* </EditEventDialog> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
