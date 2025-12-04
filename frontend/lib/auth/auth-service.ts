'use client';

/**
 * Client-side Auth Service
 * Handles authentication state on the client
 */

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_admin: boolean;
  store_verified: boolean;
  phone?: string;
  created_at?: string;
}

export interface AuthResponse {
  user: AppUser | null;
  error?: string;
  message?: string;
  requiresEmailConfirmation?: boolean;
}

class AuthService {
  private baseUrl = '/api/auth';
  private refreshInterval: NodeJS.Timeout | null = null;

  /**
   * Check if user is authenticated
   */
  async checkSession(): Promise<{ authenticated: boolean; user: AppUser | null }> {
    try {
      const res = await fetch(`${this.baseUrl}/session`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      return {
        authenticated: data.authenticated || false,
        user: data.user || null,
      };
    } catch {
      return { authenticated: false, user: null };
    }
  }

  /**
   * Start automatic session refresh (every 4 minutes)
   */
  startSessionRefresh() {
    this.stopSessionRefresh();
    this.refreshInterval = setInterval(async () => {
      const { authenticated } = await this.checkSession();
      if (!authenticated) this.stopSessionRefresh();
    }, 4 * 60 * 1000);
  }

  /**
   * Stop session refresh
   */
  stopSessionRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Login
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        return { user: null, error: data.error || 'Login failed' };
      }

      this.startSessionRefresh();
      return { user: data.user };
    } catch {
      return { user: null, error: 'Network error. Please try again.' };
    }
  }

  /**
   * Sign up
   */
  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        return { user: null, error: data.error || 'Signup failed' };
      }

      if (!data.requiresEmailConfirmation) {
        this.startSessionRefresh();
      }

      return {
        user: data.user,
        message: data.message,
        requiresEmailConfirmation: data.requiresEmailConfirmation,
      };
    } catch {
      return { user: null, error: 'Network error. Please try again.' };
    }
  }

  /**
   * Sign out
   */
  async signout(): Promise<{ success: boolean; error?: string }> {
    try {
      this.stopSessionRefresh();
      const res = await fetch(`${this.baseUrl}/signout`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }

  /**
   * Initialize - call on app start
   */
  async initialize(): Promise<{ authenticated: boolean; user: AppUser | null }> {
    const session = await this.checkSession();
    if (session.authenticated) {
      this.startSessionRefresh();
    }
    return session;
  }

  /**
   * Cleanup - call on app unmount
   */
  cleanup() {
    this.stopSessionRefresh();
  }
}

export const authService = new AuthService();
