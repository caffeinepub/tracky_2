import { usePomodoro } from '../hooks/usePomodoro';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function PomodoroTimer() {
  const { minutes, seconds, isRunning, mode, start, pause, reset, progress, workDuration, breakDuration } = usePomodoro();

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getModeText = () => {
    return mode === 'work' ? 'Focus Time' : 'Break Time';
  };

  const getModeDescription = () => {
    return mode === 'work'
      ? 'Stay focused and work on your tasks'
      : 'Take a break and relax';
  };

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="text-center space-y-2 pb-4">
        <CardTitle className="text-3xl font-bold tracking-tight">{getModeText()}</CardTitle>
        <CardDescription className="text-base">{getModeDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center">
          <div className="text-8xl font-bold tracking-tighter tabular-nums text-foreground mb-6">
            {formatTime(minutes, seconds)}
          </div>
          <Progress value={progress} className="h-2 mb-8" />
        </div>

        <div className="flex items-center justify-center gap-3">
          {!isRunning ? (
            <Button onClick={start} size="lg" className="min-w-32">
              <Play className="h-5 w-5 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={pause} size="lg" variant="secondary" className="min-w-32">
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={reset} size="lg" variant="outline">
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/40">
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Work Duration</p>
            <p className="text-2xl font-semibold text-foreground">{workDuration} min</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">Break Duration</p>
            <p className="text-2xl font-semibold text-foreground">{breakDuration} min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
