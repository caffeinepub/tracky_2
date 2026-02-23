import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export function AuthButton() {
  const { isAuthenticated, login, logout, isLoggingIn, isLoggingOut } = useAuth();

  console.log('[AuthButton] Render state:', { isAuthenticated, isLoggingIn, isLoggingOut });

  if (isLoggingIn || isLoggingOut) {
    return (
      <Button disabled variant="outline" size="default">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        {isLoggingIn ? 'Logging in...' : 'Logging out...'}
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <Button onClick={logout} variant="outline" size="default">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    );
  }

  return (
    <Button 
      onClick={() => {
        console.log('[AuthButton] Login button clicked');
        login();
      }} 
      size="default"
    >
      <LogIn className="h-4 w-4 mr-2" />
      Login
    </Button>
  );
}
