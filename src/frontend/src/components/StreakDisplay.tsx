import { useGetCurrentStreak } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Loader2 } from 'lucide-react';

export function StreakDisplay() {
  const { data: streak, isLoading, error } = useGetCurrentStreak();

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading streak...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null;
  }

  return (
    <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-primary/5">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-center gap-4">
          <Flame className="h-10 w-10 text-primary" />
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground tabular-nums">
              {streak || 0}
            </div>
            <div className="text-sm text-muted-foreground font-medium mt-1">
              {streak === 1 ? 'day streak' : 'day streak'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
