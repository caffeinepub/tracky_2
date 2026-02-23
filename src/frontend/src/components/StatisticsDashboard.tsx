import { useGetStatistics, useGetSessions, useChapters } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { StudyChart } from './StudyChart';

export function StatisticsDashboard() {
  const { data: statistics, isLoading, error } = useGetStatistics();
  const { data: sessions } = useGetSessions();
  const { data: chapters } = useChapters();

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Study Statistics
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
            <BarChart3 className="h-5 w-5" />
            Study Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Failed to load statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate basic statistics
  const totalDailyMinutes = statistics?.dailyStudyTime.reduce((acc, [_, minutes]) => acc + Number(minutes), 0) || 0;
  const avgSessionLength = statistics?.dailyStudyTime.length 
    ? Math.floor(totalDailyMinutes / statistics.dailyStudyTime.length)
    : 0;

  // Calculate chapter statistics
  const chapterStats = new Map<string, { time: number; count: number }>();
  
  sessions?.filter((s) => s.completed && s.chapterId).forEach((session) => {
    const chapterId = session.chapterId!;
    const duration = Number(session.endTime) - Number(session.startTime);
    const minutes = duration / (1000 * 1000 * 1000 * 60);
    
    const existing = chapterStats.get(chapterId) || { time: 0, count: 0 };
    chapterStats.set(chapterId, {
      time: existing.time + minutes,
      count: existing.count + 1,
    });
  });

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Study Statistics
        </CardTitle>
        <CardDescription>
          Visualize your study patterns and progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1 p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <p className="text-sm">Total Time</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Math.floor(totalDailyMinutes / 60)}h {totalDailyMinutes % 60}m
            </p>
          </div>
          <div className="space-y-1 p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm">Avg Session</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{avgSessionLength} min</p>
          </div>
          <div className="space-y-1 p-4 bg-accent/30 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <p className="text-sm">Sessions</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {statistics?.dailyStudyTime.length || 0}
            </p>
          </div>
        </div>

        {chapterStats.size > 0 && chapters && chapters.length > 0 && (
          <div className="space-y-3 p-4 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Chapter Statistics</h3>
            </div>
            <div className="space-y-2">
              {Array.from(chapterStats.entries())
                .sort((a, b) => b[1].time - a[1].time)
                .slice(0, 5)
                .map(([chapterId, stats]) => {
                  const chapter = chapters.find((c) => c.id === chapterId);
                  if (!chapter) return null;
                  
                  const hours = Math.floor(stats.time / 60);
                  const minutes = Math.floor(stats.time % 60);
                  
                  return (
                    <div key={chapterId} className="flex items-center justify-between p-3 bg-card/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{chapter.title}</p>
                        <p className="text-xs text-muted-foreground">{chapter.subject}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-sm font-semibold text-foreground">
                          {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
                        </p>
                        <p className="text-xs text-muted-foreground">{stats.count} sessions</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <StudyChart statistics={statistics} sessions={sessions} chapters={chapters} />
      </CardContent>
    </Card>
  );
}
