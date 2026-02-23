import { useAuth } from './hooks/useAuth';
import { AuthButton } from './components/AuthButton';
import { PomodoroTimer } from './components/PomodoroTimer';
import { DailyQuote } from './components/DailyQuote';
import { StreakDisplay } from './components/StreakDisplay';
import { TimerSettings } from './components/TimerSettings';
import { ChapterManager } from './components/ChapterManager';
import { SessionHistory } from './components/SessionHistory';
import { StatisticsDashboard } from './components/StatisticsDashboard';
import { Loader2, Heart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useActor } from './hooks/useActor';
import { useEffect } from 'react';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { actor } = useActor();

  // Log app state on mount and when it changes
  useEffect(() => {
    console.log('[App] State:', {
      isAuthenticated,
      isLoading,
      hasActor: !!actor
    });
  }, [isAuthenticated, isLoading, actor]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tracky</h1>
          <div className="flex items-center gap-3">
            {isAuthenticated && <TimerSettings />}
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        {!actor && !isLoading && (
          <div className="container mx-auto max-w-6xl mb-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Backend Not Available</AlertTitle>
              <AlertDescription>
                The backend is not responding. The application may have limited functionality. Check the browser console for more information.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isAuthenticated ? (
          <div className="container mx-auto max-w-6xl space-y-6">
            <DailyQuote />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PomodoroTimer />
              </div>
              <div>
                <StreakDisplay />
              </div>
            </div>

            <ChapterManager />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SessionHistory />
              <StatisticsDashboard />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="text-center space-y-6 max-w-md">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Welcome to Tracky
                </h2>
                <p className="text-muted-foreground text-lg">
                  A minimal study timer to help you stay focused and productive.
                </p>
              </div>
              <div className="pt-4">
                <AuthButton />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            © {new Date().getFullYear()} Built with <Heart className="h-4 w-4 text-primary fill-primary" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'tracky-app'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
