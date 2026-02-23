import { format } from 'date-fns';
import type { StudySession, SyllabusChapter } from '../backend';
import { Clock, BookOpen } from 'lucide-react';

interface SessionHistoryItemProps {
  session: StudySession;
  chapters: SyllabusChapter[];
}

export function SessionHistoryItem({ session, chapters }: SessionHistoryItemProps) {
  const startTime = new Date(Number(session.startTime) / 1000000); // Convert nanoseconds to milliseconds
  const endTime = new Date(Number(session.endTime) / 1000000);
  const durationMinutes = Math.floor((Number(session.endTime) - Number(session.startTime)) / (1000 * 1000 * 1000 * 60));

  const chapter = session.chapterId 
    ? chapters.find((c) => c.id === session.chapterId)
    : null;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/20 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground">
            {format(startTime, 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
          </p>
          {chapter ? (
            <div className="flex items-center gap-1 mt-1">
              <BookOpen className="h-3 w-3 text-secondary" />
              <p className="text-xs text-secondary font-medium truncate">
                {chapter.title} • {chapter.subject}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 mt-1">No chapter</p>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-foreground">{durationMinutes} min</p>
        <p className="text-xs text-muted-foreground">Study session</p>
      </div>
    </div>
  );
}
