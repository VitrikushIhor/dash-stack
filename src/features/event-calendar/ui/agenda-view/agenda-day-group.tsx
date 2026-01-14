import { format } from "date-fns";
import { AgendaEventCard } from "./agenda-event-card";
import type { Task } from "../../model/interfaces";

interface IProps {
  date: Date;
  events: Task[];
  multiDayEvents: Task[]; 
}

export function AgendaDayGroup({ date, events }: IProps) {
  // We can ignore multiDayEvents for now as we treat everything as single day or merge them
  
  return (
    <div className="space-y-4">
      <div className="sticky top-0 flex items-center gap-4 bg-background py-2">
        <p className="text-sm font-semibold">{format(date, "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="space-y-2">
        {events.length > 0 && events.map(event => <AgendaEventCard key={event.id} event={event} />)}
      </div>
    </div>
  );
}
