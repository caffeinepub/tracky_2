import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAuth() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { identity, login: iiLogin, clear: iiClear, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.login();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Successfully logged in!');
    },
    onError: (error: Error) => {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.logout();
    },
    onSuccess: () => {
      iiClear();
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('Successfully logged out!');
    },
    onError: (error: Error) => {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    },
  });

  const handleLogin = async () => {
    try {
      await iiLogin();
      // Wait for identity to be set
      const checkIdentity = setInterval(async () => {
        if (loginStatus === 'success' && identity && actor) {
          clearInterval(checkIdentity);
          await loginMutation.mutateAsync();
        }
      }, 100);

      // Clear interval after 30 seconds to prevent memory leak
      setTimeout(() => clearInterval(checkIdentity), 30000);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // User is authenticated if they have an identity and login was successful
  const isAuthenticated = !!identity && loginStatus === 'success';
  const isLoading = isInitializing || isActorFetching || loginStatus === 'logging-in';

  return {
    isAuthenticated,
    isLoading,
    isLoggingIn: loginStatus === 'logging-in' || loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    login: handleLogin,
    logout: handleLogout,
  };
}
