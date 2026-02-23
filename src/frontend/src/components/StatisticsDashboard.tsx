import { useGetStatistics } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { StudyChart } from './StudyChart';

export function StatisticsDashboard() {
  const { data: statistics, isLoading, error } = useGetStatistics();

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

        <StudyChart statistics={statistics} />
      </CardContent>
    </Card>
  );
}
