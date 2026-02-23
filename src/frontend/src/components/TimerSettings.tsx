import { useState, useEffect } from 'react';
import { useGetSettings, useUpdateSettings } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';

export function TimerSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      setWorkDuration(Number(settings.workDuration));
      setBreakDuration(Number(settings.breakDuration));
    }
  }, [settings]);

  const handleSave = async () => {
    if (workDuration < 1 || workDuration > 90) {
      toast.error('Work duration must be between 1 and 90 minutes');
      return;
    }
    if (breakDuration < 1 || breakDuration > 90) {
      toast.error('Break duration must be between 1 and 90 minutes');
      return;
    }

    try {
      await updateSettings.mutateAsync({ workDuration, breakDuration });
      toast.success('Settings saved successfully!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Timer Settings
        </CardTitle>
        <CardDescription>
          Customize your work and break durations (1-90 minutes)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="work-duration">Work Duration (minutes)</Label>
              <Input
                id="work-duration"
                type="number"
                min="1"
                max="90"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break-duration">Break Duration (minutes)</Label>
              <Input
                id="break-duration"
                type="number"
                min="1"
                max="90"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="flex-1"
              >
                {updateSettings.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Save Settings
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                disabled={updateSettings.isPending}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
