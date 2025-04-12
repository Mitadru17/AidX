import { useUser, useClerk } from '@clerk/nextjs';
import { useCallback } from 'react';

export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  // Wrap Clerk's signOut in a callback
  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return {
    user: isSignedIn ? user : null,
    isLoaded,
    isAuthenticated: isSignedIn,
    signOut: logout,
    logout // Alias for backward compatibility
  };
}; 