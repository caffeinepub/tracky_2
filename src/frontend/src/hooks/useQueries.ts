import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StudySession, UserSettings } from '../backend';

// Streak tracking
export function useGetCurrentStreak() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['streak'],
    queryFn: async () => {
      if (!actor) return 0;
      const streak = await actor.getCurrentStreak();
      return Number(streak);
    },
    enabled: !!actor && !isFetching,
  });
}

// Session history
export function useGetSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<StudySession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

// Timer settings
export function useGetSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<UserSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      if (!actor) return { workDuration: 25n, breakDuration: 5n };
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workDuration, breakDuration }: { workDuration: number; breakDuration: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateSettings(BigInt(workDuration), BigInt(breakDuration));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// Session tracking
export function useStartSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (startTime: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.startSession(startTime);
    },
  });
}

export function useEndSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (endTime: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.endSession(endTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
    },
  });
}

// Statistics
export function useGetStatistics() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      if (!actor) return { dailyStudyTime: [], weeklyTrends: [], sessionDistribution: [] };
      return actor.getStatistics();
    },
    enabled: !!actor && !isFetching,
  });
}
