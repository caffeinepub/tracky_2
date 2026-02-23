import { format } from 'date-fns';
import type { StudySession } from '../backend';
import { Clock } from 'lucide-react';

interface SessionHistoryItemProps {
  session: StudySession;
}

export function SessionHistoryItem({ session }: SessionHistoryItemProps) {
  const startTime = new Date(Number(session.startTime) / 1000000); // Convert nanoseconds to milliseconds
  const endTime = new Date(Number(session.endTime) / 1000000);
  const durationMinutes = Math.floor((Number(session.endTime) - Number(session.startTime)) / (1000 * 1000 * 1000 * 60));

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">
            {format(startTime, 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-foreground">{durationMinutes} min</p>
        <p className="text-xs text-muted-foreground">Study session</p>
      </div>
    </div>
  );
}
