import { authService, AppUser, AuthResponse } from '@/lib/auth/auth-service';

describe('AuthService', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('login', () => {
    it('returns user on successful login', async () => {
      const mockUser: AppUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        is_admin: false,
        store_verified: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
        }),
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        credentials: 'include',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });

    it('returns error on failed login', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      const result = await authService.login('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Invalid credentials');
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Network error. Please try again.');
    });
  });

  describe('signup', () => {
    it('returns user on successful signup', async () => {
      const mockUser: AppUser = {
        id: '456',
        email: 'newuser@example.com',
        name: 'New User',
        is_admin: false,
        store_verified: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: mockUser,
        }),
      });

      const result = await authService.signup('newuser@example.com', 'password123', 'New User');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'newuser@example.com', password: 'password123', name: 'New User' }),
        credentials: 'include',
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });

    it('returns message when email confirmation is required', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: '456', email: 'newuser@example.com' },
          message: 'Please check your email to confirm your account.',
          requiresEmailConfirmation: true,
        }),
      });

      const result = await authService.signup('newuser@example.com', 'password123');

      expect(result.requiresEmailConfirmation).toBe(true);
      expect(result.message).toContain('check your email');
    });

    it('returns error on signup failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      });

      const result = await authService.signup('existing@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('signout', () => {
    it('returns success on successful signout', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await authService.signout();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns error on signout failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Signout failed' }),
      });

      const result = await authService.signout();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Signout failed');
    });
  });

  describe('checkSession', () => {
    it('returns authenticated user when session exists', async () => {
      const mockUser: AppUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        is_admin: false,
        store_verified: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: true, user: mockUser }),
      });

      const result = await authService.checkSession();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      expect(result.authenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('returns unauthenticated when no session', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: false, user: null }),
      });

      const result = await authService.checkSession();

      expect(result.authenticated).toBe(false);
      expect(result.user).toBeNull();
    });

    it('returns unauthenticated on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.checkSession();

      expect(result.authenticated).toBe(false);
      expect(result.user).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('returns success on successful password reset request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Password reset email sent.',
        }),
      });

      const result = await authService.resetPassword('test@example.com');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
        credentials: 'include',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Password reset');
    });

    it('returns error on password reset failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'User not found' }),
      });

      const result = await authService.resetPassword('nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('initialize', () => {
    it('returns session and starts refresh on authenticated', async () => {
      const mockUser: AppUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        is_admin: false,
        store_verified: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: true, user: mockUser }),
      });

      const result = await authService.initialize();

      expect(result.authenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('returns unauthenticated when no session', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: false, user: null }),
      });

      const result = await authService.initialize();

      expect(result.authenticated).toBe(false);
      expect(result.user).toBeNull();
    });
  });
});

describe('AuthService - Admin User', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('returns admin user with is_admin true', async () => {
    const mockAdminUser: AppUser = {
      id: 'admin-1',
      email: 'admin@lotayah.com',
      name: 'Admin User',
      is_admin: true,
      store_verified: false,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockAdminUser,
      }),
    });

    const result = await authService.login('admin@lotayah.com', 'admin123');

    expect(result.user?.is_admin).toBe(true);
  });
});

describe('AuthService - Store Owner', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('returns store owner with store_verified true', async () => {
    const mockStoreOwner: AppUser = {
      id: 'store-owner-1',
      email: 'storeowner@lotayah.com',
      name: 'Store Owner',
      is_admin: false,
      store_verified: true,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: mockStoreOwner,
      }),
    });

    const result = await authService.login('storeowner@lotayah.com', 'store123');

    expect(result.user?.store_verified).toBe(true);
    expect(result.user?.is_admin).toBe(false);
  });
});
