import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth, useRequireAuth, useRequireAdmin, useRequireVerifiedSeller } from '@/lib/hooks/use-auth';
import { authService } from '@/lib/auth/auth-service';

// Mock authService
jest.mock('@/lib/auth/auth-service', () => ({
  authService: {
    checkSession: jest.fn(),
    login: jest.fn(),
    signup: jest.fn(),
    signout: jest.fn(),
    startSessionRefresh: jest.fn(),
    stopSessionRefresh: jest.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks session on mount', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      is_admin: false,
      store_verified: false,
    };

    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for session check
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.authenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(authService.startSessionRefresh).toHaveBeenCalled();
  });

  it('handles unauthenticated session', async () => {
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.authenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('handles successful login', async () => {
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      is_admin: false,
      store_verified: false,
    };

    (authService.login as jest.Mock).mockResolvedValue({
      user: mockUser,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'password');
      expect(loginResult.success).toBe(true);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.authenticated).toBe(true);
  });

  it('handles failed login', async () => {
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    (authService.login as jest.Mock).mockResolvedValue({
      user: null,
      error: 'Invalid credentials',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'wrongpassword');
      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid credentials');
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.authenticated).toBe(false);
  });

  it('handles successful signup', async () => {
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    const mockUser = {
      id: '456',
      email: 'new@example.com',
      name: 'New User',
      is_admin: false,
      store_verified: false,
    };

    (authService.signup as jest.Mock).mockResolvedValue({
      user: mockUser,
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const signupResult = await result.current.signup('new@example.com', 'password', 'New User');
      expect(signupResult.success).toBe(true);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.authenticated).toBe(true);
  });

  it('handles signup requiring email confirmation', async () => {
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    (authService.signup as jest.Mock).mockResolvedValue({
      user: null,
      requiresEmailConfirmation: true,
      message: 'Please check your email',
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const signupResult = await result.current.signup('new@example.com', 'password');
      expect(signupResult.success).toBe(true);
      expect(signupResult.message).toContain('email');
    });
  });

  it('handles logout', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      is_admin: false,
      store_verified: false,
    };

    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockUser,
    });

    (authService.signout as jest.Mock).mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.authenticated).toBe(true);
    });

    await act(async () => {
      const logoutResult = await result.current.logout();
      expect(logoutResult.success).toBe(true);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.authenticated).toBe(false);
    expect(authService.stopSessionRefresh).toHaveBeenCalled();
  });

  it('stops session refresh on unmount', async () => {
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    const { unmount } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(authService.startSessionRefresh).toHaveBeenCalled();
    });

    unmount();

    expect(authService.stopSessionRefresh).toHaveBeenCalled();
  });
});

describe('useRequireAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if not authenticated', async () => {
    const mockRedirect = jest.fn();
    
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    renderHook(() => useRequireAuth('/login', mockRedirect));

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });

  it('sets isReady when authenticated', async () => {
    const mockRedirect = jest.fn();
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      is_admin: false,
      store_verified: false,
    };

    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockUser,
    });

    const { result } = renderHook(() => useRequireAuth('/login', mockRedirect));

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe('useRequireAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login if not authenticated', async () => {
    const mockRedirect = jest.fn();
    
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    renderHook(() => useRequireAdmin('/', mockRedirect));

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects non-admin users to home', async () => {
    const mockRedirect = jest.fn();
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      is_admin: false,
      store_verified: false,
    };

    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockUser,
    });

    renderHook(() => useRequireAdmin('/', mockRedirect));

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/');
    });
  });

  it('sets isReady for admin users', async () => {
    const mockRedirect = jest.fn();
    const mockAdmin = {
      id: '123',
      email: 'admin@example.com',
      name: 'Admin User',
      is_admin: true,
      store_verified: false,
    };

    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockAdmin,
    });

    const { result } = renderHook(() => useRequireAdmin('/', mockRedirect));

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

describe('useRequireVerifiedSeller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects unverified users to setup', async () => {
    const mockRedirect = jest.fn();
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      is_admin: false,
      store_verified: false,
    };

    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockUser,
    });

    renderHook(() => useRequireVerifiedSeller('/seller/setup', mockRedirect));

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/seller/setup');
    });
  });

  it('sets isReady for verified sellers', async () => {
    const mockRedirect = jest.fn();
    const mockSeller = {
      id: '123',
      email: 'seller@example.com',
      name: 'Seller User',
      is_admin: false,
      store_verified: true,
    };

    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: true,
      user: mockSeller,
    });

    const { result } = renderHook(() => useRequireVerifiedSeller('/seller/setup', mockRedirect));

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to login if not authenticated', async () => {
    const mockRedirect = jest.fn();
    
    (authService.checkSession as jest.Mock).mockResolvedValue({
      authenticated: false,
      user: null,
    });

    renderHook(() => useRequireVerifiedSeller('/seller/setup', mockRedirect));

    await waitFor(() => {
      expect(mockRedirect).toHaveBeenCalledWith('/login');
    });
  });
});
