import { useGetStatistics, useGetSessions, useChapters } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3, TrendingUp, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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

  // Calculate chapter completion statistics
  const totalChapters = chapters?.length || 0;
  const completedChapters = chapters?.filter(c => c.completed).length || 0;
  const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <p className="text-2xl font-bold text-foreground">{sessions?.length || 0}</p>
          </div>
          <div className="space-y-1 p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm">Completion</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{completionPercentage}%</p>
          </div>
        </div>

        {/* Chapter Completion Progress */}
        {totalChapters > 0 && (
          <div className="p-4 border border-border/50 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Chapter Progress
              </h3>
              <span className="text-sm text-muted-foreground">
                {completedChapters} / {totalChapters} completed
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}

        {/* Top Chapters by Study Time */}
        {chapterStats.size > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Top Chapters by Study Time</h3>
            <div className="grid gap-3">
              {Array.from(chapterStats.entries())
                .sort((a, b) => b[1].time - a[1].time)
                .slice(0, 5)
                .map(([chapterId, stats]) => {
                  const chapter = chapters?.find((c) => c.id === chapterId);
                  if (!chapter) return null;
                  
                  return (
                    <div
                      key={chapterId}
                      className="p-3 border border-border/50 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{chapter.title}</h4>
                            {chapter.completed && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{chapter.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">
                            {Math.floor(stats.time)} min
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats.count} {stats.count === 1 ? 'session' : 'sessions'}
                          </p>
                        </div>
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
