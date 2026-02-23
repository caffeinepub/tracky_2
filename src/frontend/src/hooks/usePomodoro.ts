import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useGetSettings, useStartSession, useEndSession } from './useQueries';

type PomodoroMode = 'work' | 'break';

export function usePomodoro() {
  const { data: settings } = useGetSettings();
  const startSessionMutation = useStartSession();
  const endSessionMutation = useEndSession();
  
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<bigint | null>(null);

  const workDuration = settings ? Number(settings.workDuration) * 60 : 25 * 60;
  const breakDuration = settings ? Number(settings.breakDuration) * 60 : 5 * 60;

  const getDuration = useCallback((currentMode: PomodoroMode) => {
    return currentMode === 'work' ? workDuration : breakDuration;
  }, [workDuration, breakDuration]);

  // Update timeLeft when settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDuration(mode));
    }
  }, [settings, mode, isRunning, getDuration]);

  const switchMode = useCallback(async () => {
    // End the current session if it was a work session
    if (mode === 'work' && sessionStartTimeRef.current) {
      const endTime = BigInt(Date.now()) * 1000000n; // Convert to nanoseconds
      await endSessionMutation.mutateAsync(endTime);
      sessionStartTimeRef.current = null;
    }

    const newMode: PomodoroMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsRunning(false);
    
    // Clear chapter selection after completing a work session
    if (mode === 'work') {
      setSelectedChapterId(null);
    }

    if (newMode === 'break') {
      toast.success('Great work! Time for a break 🎉', {
        description: 'Take a few minutes to relax and recharge.',
      });
    } else {
      toast.success('Break is over! Ready to focus? 💪', {
        description: 'Let\'s get back to work.',
      });
    }
  }, [mode, getDuration, endSessionMutation]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            switchMode();
            return getDuration(mode === 'work' ? 'break' : 'work');
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, switchMode, getDuration]);

  const start = async () => {
    // Start a new session when starting a work timer
    if (mode === 'work' && !sessionStartTimeRef.current) {
      const startTime = BigInt(Date.now()) * 1000000n; // Convert to nanoseconds
      sessionStartTimeRef.current = startTime;
      await startSessionMutation.mutateAsync({ startTime, chapterId: selectedChapterId });
    }
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
  };

  const reset = async () => {
    // If resetting during a work session, end it
    if (mode === 'work' && sessionStartTimeRef.current && isRunning) {
      const endTime = BigInt(Date.now()) * 1000000n;
      await endSessionMutation.mutateAsync(endTime);
      sessionStartTimeRef.current = null;
    }
    setIsRunning(false);
    setTimeLeft(getDuration(mode));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((getDuration(mode) - timeLeft) / getDuration(mode)) * 100;

  return {
    minutes,
    seconds,
    isRunning,
    mode,
    start,
    pause,
    reset,
    progress,
    workDuration: Math.floor(workDuration / 60),
    breakDuration: Math.floor(breakDuration / 60),
    selectedChapterId,
    setSelectedChapterId,
  };
}
