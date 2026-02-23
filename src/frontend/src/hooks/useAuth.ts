import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ExtendedBackendInterface } from '../lib/types';

export function useAuth() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { identity, login: iiLogin, clear: iiClear, loginStatus, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async () => {
      console.log('[useAuth] Login mutation started', { actor: !!actor });
      
      if (!actor) {
        console.error('[useAuth] Actor not initialized');
        throw new Error('Backend connection not available');
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      // Check if login method exists
      if (typeof extendedActor.login !== 'function') {
        console.error('[useAuth] Backend login method not found. Backend may be empty.');
        throw new Error('Backend login method not available. The backend may need to be redeployed.');
      }

      try {
        await extendedActor.login();
        console.log('[useAuth] Backend login successful');
      } catch (error) {
        console.error('[useAuth] Backend login failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[useAuth] Login successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      toast.success('Successfully logged in!');
    },
    onError: (error: Error) => {
      console.error('[useAuth] Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      // Clear the Internet Identity session on backend login failure
      iiClear();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('[useAuth] Logout mutation started', { actor: !!actor });
      
      if (!actor) {
        console.error('[useAuth] Actor not initialized');
        throw new Error('Backend connection not available');
      }

      const extendedActor = actor as unknown as ExtendedBackendInterface;

      // Check if logout method exists
      if (typeof extendedActor.logout !== 'function') {
        console.error('[useAuth] Backend logout method not found');
        throw new Error('Backend logout method not available');
      }

      try {
        await extendedActor.logout();
        console.log('[useAuth] Backend logout successful');
      } catch (error) {
        console.error('[useAuth] Backend logout failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[useAuth] Logout successful');
      iiClear();
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
      toast.success('Successfully logged out!');
    },
    onError: (error: Error) => {
      console.error('[useAuth] Logout error:', error);
      toast.error(error.message || 'Logout failed. Please try again.');
    },
  });

  const handleLogin = async () => {
    try {
      console.log('[useAuth] Starting Internet Identity login');
      
      // Show a loading toast
      const loadingToast = toast.loading('Connecting to Internet Identity...');
      
      await iiLogin();
      
      // Wait for identity to be set
      let attempts = 0;
      const maxAttempts = 300; // 30 seconds
      
      const checkIdentity = setInterval(async () => {
        attempts++;
        
        if (attempts > maxAttempts) {
          clearInterval(checkIdentity);
          toast.dismiss(loadingToast);
          toast.error('Login timeout. Please try again.');
          console.error('[useAuth] Login timeout after 30 seconds');
          iiClear();
          return;
        }
        
        if (loginStatus === 'success' && identity && actor) {
          console.log('[useAuth] Identity ready, calling backend login');
          clearInterval(checkIdentity);
          toast.dismiss(loadingToast);
          
          try {
            await loginMutation.mutateAsync();
          } catch (error) {
            console.error('[useAuth] Backend login mutation failed:', error);
            // Error toast is already shown by mutation onError
          }
        } else if (loginStatus === 'loginError') {
          clearInterval(checkIdentity);
          toast.dismiss(loadingToast);
          toast.error('Internet Identity login failed. Please try again.');
          console.error('[useAuth] Internet Identity login failed');
        }
      }, 100);
    } catch (error) {
      console.error('[useAuth] Internet Identity login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // User is authenticated if they have an identity and login was successful
  const isAuthenticated = !!identity && loginStatus === 'success';
  const isLoading = isInitializing || isActorFetching || loginStatus === 'logging-in';

  console.log('[useAuth] Auth state:', {
    isAuthenticated,
    isLoading,
    hasIdentity: !!identity,
    loginStatus,
    hasActor: !!actor
  });

  return {
    isAuthenticated,
    isLoading,
    isLoggingIn: loginStatus === 'logging-in' || loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    login: handleLogin,
    logout: handleLogout,
  };
}
