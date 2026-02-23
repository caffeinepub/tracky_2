import { useState } from 'react';
import { useGetSessions, useChapters } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Clock, Calendar } from 'lucide-react';
import { SessionHistoryItem } from './SessionHistoryItem';

export function SessionHistory() {
  const { data: sessions, isLoading, error } = useGetSessions();
  const { data: chapters } = useChapters();
  const [filterChapterId, setFilterChapterId] = useState<string>('all');

  const completedSessions = sessions?.filter((s) => s.completed) || [];
  
  // Filter sessions by chapter
  const filteredSessions = filterChapterId === 'all' 
    ? completedSessions 
    : completedSessions.filter((s) => s.chapterId === filterChapterId);
  
  const sortedSessions = [...filteredSessions].sort(
    (a, b) => Number(b.endTime) - Number(a.endTime)
  );

  const totalMinutes = filteredSessions.reduce((acc, session) => {
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
        {chapters && chapters.length > 0 && (
          <div className="space-y-2">
            <Select value={filterChapterId} onValueChange={setFilterChapterId}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All chapters</SelectItem>
                <SelectItem value="unassociated">Unassociated</SelectItem>
                {chapters.map((chapter) => (
                  <SelectItem key={chapter.id} value={chapter.id}>
                    {chapter.title} - {chapter.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 bg-accent/30 rounded-lg">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold text-foreground">{filteredSessions.length}</p>
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
            <p className="text-muted-foreground">
              {filterChapterId === 'all' ? 'No sessions yet' : 'No sessions for this filter'}
            </p>
            <p className="text-sm text-muted-foreground">
              {filterChapterId === 'all' 
                ? 'Complete your first study session to see it here'
                : 'Try selecting a different chapter or view all sessions'}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {sortedSessions.map((session, index) => (
                <SessionHistoryItem key={index} session={session} chapters={chapters || []} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
