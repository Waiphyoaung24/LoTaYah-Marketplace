'use client';

import { useEffect, useState, useCallback } from 'react';
import { authService, AppUser } from '@/lib/auth/auth-service';

interface UseAuthReturn {
  user: AppUser | null;
  loading: boolean;
  authenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<{ success: boolean }>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check session on mount
  const checkSession = useCallback(async () => {
    try {
      const { authenticated, user } = await authService.checkSession();
      setAuthenticated(authenticated);
      setUser(user);
      setError(null);
    } catch (err) {
      setError('Failed to check session');
      setAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    setLoading(true);
    await checkSession();
  }, [checkSession]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const result = await authService.login(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }

    if (result.user) {
      setUser(result.user);
      setAuthenticated(true);
    }

    setLoading(false);
    return { success: true };
  }, []);

  // Signup
  const signup = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);

    const result = await authService.signup(email, password, name);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }

    if (result.requiresEmailConfirmation) {
      setLoading(false);
      return { 
        success: true, 
        message: result.message || 'Please check your email to confirm your account.' 
      };
    }

    if (result.user) {
      setUser(result.user);
      setAuthenticated(true);
    }

    setLoading(false);
    return { success: true };
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);

    const result = await authService.signout();

    if (result.success) {
      setUser(null);
      setAuthenticated(false);
      authService.stopSessionRefresh();
    }

    setLoading(false);
    return result;
  }, []);

  // Initial session check and setup session refresh
  useEffect(() => {
    checkSession();

    // Start automatic session refresh (every 4 minutes)
    authService.startSessionRefresh();

    return () => {
      authService.stopSessionRefresh();
    };
  }, [checkSession]);

  return {
    user,
    loading,
    authenticated,
    error,
    login,
    signup,
    logout,
    refreshUser,
  };
}

// Navigation helper that can be mocked in tests
export const navigate = (url: string) => {
  if (typeof window !== 'undefined') {
    window.location.href = url;
  }
};

// Hook for protected routes - redirects if not authenticated
export function useRequireAuth(
  redirectTo: string = '/login',
  onRedirect?: (url: string) => void
): UseAuthReturn & { isReady: boolean } {
  const auth = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.authenticated) {
        // Redirect to login if not authenticated
        (onRedirect || navigate)(redirectTo);
      } else {
        setIsReady(true);
      }
    }
  }, [auth.loading, auth.authenticated, redirectTo, onRedirect]);

  return { ...auth, isReady };
}

// Hook for admin-only routes
export function useRequireAdmin(
  redirectTo: string = '/',
  onRedirect?: (url: string) => void
): UseAuthReturn & { isReady: boolean } {
  const auth = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.authenticated) {
        (onRedirect || navigate)('/login');
      } else if (!auth.user?.is_admin) {
        (onRedirect || navigate)(redirectTo);
      } else {
        setIsReady(true);
      }
    }
  }, [auth.loading, auth.authenticated, auth.user, redirectTo, onRedirect]);

  return { ...auth, isReady };
}

// Hook for verified seller routes
export function useRequireVerifiedSeller(
  redirectTo: string = '/seller/setup',
  onRedirect?: (url: string) => void
): UseAuthReturn & { isReady: boolean } {
  const auth = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.authenticated) {
        (onRedirect || navigate)('/login');
      } else if (!auth.user?.store_verified) {
        (onRedirect || navigate)(redirectTo);
      } else {
        setIsReady(true);
      }
    }
  }, [auth.loading, auth.authenticated, auth.user, redirectTo, onRedirect]);

  return { ...auth, isReady };
}

