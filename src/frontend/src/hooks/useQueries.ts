import { useActor } from './useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { StudySession, UserSettings, SyllabusChapter, ExtendedBackendInterface } from '../lib/types';
import { toast } from 'sonner';

// Helper to check if method exists
function checkMethod(actor: any, methodName: string): boolean {
  if (typeof actor[methodName] !== 'function') {
    console.error(`[useQueries] Backend method '${methodName}' not found. Backend may be empty.`);
    return false;
  }
  return true;
}

// Streak tracking
export function useGetCurrentStreak() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['streak'],
    queryFn: async () => {
      console.log('[useGetCurrentStreak] Fetching streak', { actor: !!actor });
      
      if (!actor) {
        console.warn('[useGetCurrentStreak] No actor available');
        return 0;
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'getCurrentStreak')) {
        return 0;
      }

      try {
        const streak = await extendedActor.getCurrentStreak();
        console.log('[useGetCurrentStreak] Streak fetched:', streak);
        return Number(streak);
      } catch (error) {
        console.error('[useGetCurrentStreak] Error:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

// Session history
export function useGetSessions() {
  const { actor, isFetching } = useActor();

  return useQuery<StudySession[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      console.log('[useGetSessions] Fetching sessions', { actor: !!actor });
      
      if (!actor) {
        console.warn('[useGetSessions] No actor available');
        return [];
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'getSessions')) {
        return [];
      }

      try {
        const sessions = await extendedActor.getSessions();
        console.log('[useGetSessions] Sessions fetched:', sessions.length);
        return sessions;
      } catch (error) {
        console.error('[useGetSessions] Error:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

// Timer settings
export function useGetSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<UserSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      console.log('[useGetSettings] Fetching settings', { actor: !!actor });
      
      if (!actor) {
        console.warn('[useGetSettings] No actor available, using defaults');
        return { workDuration: 25n, breakDuration: 5n };
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'getSettings')) {
        return { workDuration: 25n, breakDuration: 5n };
      }

      try {
        const settings = await extendedActor.getSettings();
        console.log('[useGetSettings] Settings fetched:', settings);
        return settings;
      } catch (error) {
        console.error('[useGetSettings] Error:', error);
        return { workDuration: 25n, breakDuration: 5n };
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workDuration, breakDuration }: { workDuration: number; breakDuration: number }) => {
      console.log('[useUpdateSettings] Updating settings', { workDuration, breakDuration, actor: !!actor });
      
      if (!actor) throw new Error('Backend connection not available');

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'updateSettings')) {
        throw new Error('Backend updateSettings method not available');
      }

      try {
        await extendedActor.updateSettings(BigInt(workDuration), BigInt(breakDuration));
        console.log('[useUpdateSettings] Settings updated successfully');
      } catch (error) {
        console.error('[useUpdateSettings] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      console.error('[useUpdateSettings] Mutation error:', error);
      toast.error(error.message || 'Failed to update settings');
    },
  });
}

// Session tracking
export function useStartSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ startTime, chapterId }: { startTime: bigint; chapterId: string | null }) => {
      console.log('[useStartSession] Starting session', { startTime, chapterId, actor: !!actor });
      
      if (!actor) throw new Error('Backend connection not available');

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'startSession')) {
        throw new Error('Backend startSession method not available');
      }

      try {
        await extendedActor.startSession(startTime, chapterId);
        console.log('[useStartSession] Session started successfully');
      } catch (error) {
        console.error('[useStartSession] Error:', error);
        throw error;
      }
    },
    onError: (error: Error) => {
      console.error('[useStartSession] Mutation error:', error);
      toast.error(error.message || 'Failed to start session');
    },
  });
}

export function useEndSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (endTime: bigint) => {
      console.log('[useEndSession] Ending session', { endTime, actor: !!actor });
      
      if (!actor) throw new Error('Backend connection not available');

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'endSession')) {
        throw new Error('Backend endSession method not available');
      }

      try {
        await extendedActor.endSession(endTime);
        console.log('[useEndSession] Session ended successfully');
      } catch (error) {
        console.error('[useEndSession] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Session completed!');
    },
    onError: (error: Error) => {
      console.error('[useEndSession] Mutation error:', error);
      toast.error(error.message || 'Failed to end session');
    },
  });
}

// Statistics
export function useGetStatistics() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      console.log('[useGetStatistics] Fetching statistics', { actor: !!actor });
      
      if (!actor) {
        console.warn('[useGetStatistics] No actor available');
        return { dailyStudyTime: [], weeklyTrends: [], sessionDistribution: [] };
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'getStatistics')) {
        return { dailyStudyTime: [], weeklyTrends: [], sessionDistribution: [] };
      }

      try {
        const stats = await extendedActor.getStatistics();
        console.log('[useGetStatistics] Statistics fetched');
        return stats;
      } catch (error) {
        console.error('[useGetStatistics] Error:', error);
        return { dailyStudyTime: [], weeklyTrends: [], sessionDistribution: [] };
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

// Chapters
export function useChapters() {
  const { actor, isFetching } = useActor();

  return useQuery<SyllabusChapter[]>({
    queryKey: ['chapters'],
    queryFn: async () => {
      console.log('[useChapters] Fetching chapters', { actor: !!actor });
      
      if (!actor) {
        console.warn('[useChapters] No actor available');
        return [];
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'getChapters')) {
        return [];
      }

      try {
        const chapters = await extendedActor.getChapters();
        console.log('[useChapters] Chapters fetched:', chapters.length);
        return chapters;
      } catch (error) {
        console.error('[useChapters] Error:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useCreateChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, subject }: { title: string; subject: string; notes?: string }) => {
      console.log('[useCreateChapter] Creating chapter', { title, subject, actor: !!actor });
      
      if (!actor) throw new Error('Backend connection not available');
      
      // Validate inputs before calling backend
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!subject.trim()) {
        throw new Error('Subject is required');
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'addChapter')) {
        throw new Error('Backend addChapter method not available');
      }
      
      try {
        await extendedActor.addChapter(title, subject);
        console.log('[useCreateChapter] Chapter created successfully');
      } catch (error) {
        console.error('[useCreateChapter] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      toast.success('Chapter created successfully');
    },
    onError: (error) => {
      console.error('[useCreateChapter] Mutation error:', error);
      toast.error(`Failed to create chapter: ${error instanceof Error ? error.message : 'Please try again.'}`);
    },
  });
}

export function useEditChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterId, title, subject, notes }: { chapterId: string; title: string; subject: string; notes?: string }) => {
      console.log('[useEditChapter] Editing chapter', { chapterId, title, subject, actor: !!actor });
      
      if (!actor) throw new Error('Backend connection not available');
      
      // Validate inputs before calling backend
      if (!title.trim()) {
        throw new Error('Title is required');
      }
      if (!subject.trim()) {
        throw new Error('Subject is required');
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      if (!checkMethod(extendedActor, 'editChapter')) {
        throw new Error('Backend editChapter method not available');
      }
      
      try {
        await extendedActor.editChapter(chapterId, title, subject, notes || null);
        console.log('[useEditChapter] Chapter edited successfully');
      } catch (error) {
        console.error('[useEditChapter] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Chapter updated successfully');
    },
    onError: (error) => {
      console.error('[useEditChapter] Mutation error:', error);
      toast.error(`Failed to update chapter: ${error instanceof Error ? error.message : 'Please try again.'}`);
    },
  });
}

export function useDeleteChapter() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: string) => {
      console.log('[useDeleteChapter] Deleting chapter', { chapterId, actor: !!actor });
      
      if (!actor) throw new Error('Backend connection not available');

      const extendedActor = actor as unknown as ExtendedBackendInterface;
      
      if (!checkMethod(extendedActor, 'deleteChapter')) {
        throw new Error('Backend deleteChapter method not available');
      }

      try {
        await extendedActor.deleteChapter(chapterId);
        console.log('[useDeleteChapter] Chapter deleted successfully');
      } catch (error) {
        console.error('[useDeleteChapter] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Chapter deleted successfully');
    },
    onError: (error) => {
      console.error('[useDeleteChapter] Mutation error:', error);
      toast.error(error.message || 'Failed to delete chapter. Please try again.');
    },
  });
}

export function useMarkChapterAsCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: string) => {
      console.log('[useMarkChapterAsCompleted] Marking chapter as completed', { chapterId, actor: !!actor });
      
      if (!actor) throw new Error('Backend connection not available');

      const extendedActor = actor as unknown as ExtendedBackendInterface;
      
      if (!checkMethod(extendedActor, 'markChapterAsCompleted')) {
        throw new Error('Backend markChapterAsCompleted method not available');
      }

      try {
        await extendedActor.markChapterAsCompleted(chapterId);
        console.log('[useMarkChapterAsCompleted] Chapter marked as completed');
      } catch (error) {
        console.error('[useMarkChapterAsCompleted] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error) => {
      console.error('[useMarkChapterAsCompleted] Mutation error:', error);
      toast.error(error.message || 'Failed to mark chapter as completed. Please try again.');
    },
  });
}

export function useMarkChapterAsIncomplete() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chapterId: string) => {
      console.log('[useMarkChapterAsIncomplete] Marking chapter as incomplete', { chapterId, actor: !!actor });
      
      if (!actor) throw new Error('Backend connection not available');

      const extendedActor = actor as unknown as ExtendedBackendInterface;
      
      if (!checkMethod(extendedActor, 'markChapterAsIncomplete')) {
        throw new Error('Backend markChapterAsIncomplete method not available');
      }

      try {
        await extendedActor.markChapterAsIncomplete(chapterId);
        console.log('[useMarkChapterAsIncomplete] Chapter marked as incomplete');
      } catch (error) {
        console.error('[useMarkChapterAsIncomplete] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error) => {
      console.error('[useMarkChapterAsIncomplete] Mutation error:', error);
      toast.error(error.message || 'Failed to mark chapter as incomplete. Please try again.');
    },
  });
}
