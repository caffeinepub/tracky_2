import { useState } from 'react';
import { useGetSessions } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Clock, Calendar } from 'lucide-react';
import { SessionHistoryItem } from './SessionHistoryItem';
import type { StudySession } from '../backend';

export function SessionHistory() {
  const { data: sessions, isLoading, error } = useGetSessions();
  const [filter] = useState<'all' | 'work' | 'break'>('all');

  const completedSessions = sessions?.filter((s) => s.completed) || [];
  const sortedSessions = [...completedSessions].sort(
    (a, b) => Number(b.endTime) - Number(a.endTime)
  );

  const totalMinutes = completedSessions.reduce((acc, session) => {
    const duration = Number(session.endTime) - Number(session.startTime);
    return acc + duration / (1000 * 1000 * 1000 * 60); // Convert nanoseconds to minutes
  }, 0);

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = Math.floor(totalMinutes % 60);

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Failed to load session history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session History
        </CardTitle>
        <CardDescription>
          Track your study sessions and progress over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 p-4 bg-accent/30 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold text-foreground">{completedSessions.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold text-foreground">
              {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${remainingMinutes}m`}
            </p>
          </div>
        </div>

        {sortedSessions.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No sessions yet</p>
            <p className="text-sm text-muted-foreground">
              Complete your first study session to see it here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {sortedSessions.map((session, index) => (
                <SessionHistoryItem key={index} session={session} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
