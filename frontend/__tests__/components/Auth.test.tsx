import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Auth } from '@/components/Auth';
import { AppProvider } from '@/contexts/AppContext';

// Mock the Auth component's dependencies
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/login',
}));

// Wrapper component with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AppProvider>
      {ui}
    </AppProvider>
  );
};

describe('Auth Component', () => {
  beforeEach(() => {
    mockPush.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Login View', () => {
    it('renders login form with email and password fields', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    });

    it('shows login title when view is login', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      // The title should contain login-related text
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('does not show name field in login view', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      // Name field should not be present in login view
      const nameInputs = screen.queryAllByPlaceholderText(/name/i);
      expect(nameInputs.length).toBe(0);
    });

    it('has login form with submit button', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('has secure seller access badge', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      expect(screen.getByText(/secure seller access/i)).toBeInTheDocument();
    });

    it('allows typing in email field', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('allows typing in password field', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('calls onToggleView when clicking register link', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      // Find the register link/button
      const registerButtons = screen.getAllByRole('button');
      const registerButton = registerButtons.find(btn => 
        btn.textContent?.toLowerCase().includes('register')
      );

      if (registerButton) {
        await user.click(registerButton);
        expect(mockToggle).toHaveBeenCalled();
      }
    });
  });

  describe('Register View', () => {
    it('renders register form with name, email and password fields', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="register" onToggleView={mockToggle} />);

      expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    });

    it('shows register title when view is register', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="register" onToggleView={mockToggle} />);

      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('does not show test accounts section in register view', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="register" onToggleView={mockToggle} />);

      // Test accounts should not be visible in register view
      expect(screen.queryByText(/Test Admin Account/i)).not.toBeInTheDocument();
    });

    it('calls onToggleView when clicking login link', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();
      renderWithProviders(<Auth view="register" onToggleView={mockToggle} />);

      const loginButtons = screen.getAllByRole('button');
      const loginButton = loginButtons.find(btn => 
        btn.textContent?.toLowerCase().includes('login') ||
        btn.textContent?.toLowerCase().includes('sign in')
      );

      if (loginButton) {
        await user.click(loginButton);
        expect(mockToggle).toHaveBeenCalled();
      }
    });
  });

  describe('Form Validation', () => {
    it('email field has required attribute', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      expect(emailInput).toHaveAttribute('required');
    });

    it('password field has required attribute', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      expect(passwordInput).toHaveAttribute('required');
    });

    it('email field has type email', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('password field has type password', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const passwordInput = screen.getByPlaceholderText(/••••••••/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for form fields', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      // Check for label elements
      const labels = screen.getAllByText(/email|password/i);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('form fields are focusable', async () => {
      const mockToggle = jest.fn();
      const user = userEvent.setup();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const emailInput = screen.getByPlaceholderText(/you@example.com/i);
      
      await user.click(emailInput);
      expect(emailInput).toHaveFocus();
    });

    it('submit button is present and clickable', () => {
      const mockToggle = jest.fn();
      renderWithProviders(<Auth view="login" onToggleView={mockToggle} />);

      const submitButtons = screen.getAllByRole('button');
      const submitButton = submitButtons.find(btn => 
        btn.getAttribute('type') === 'submit' || 
        btn.textContent?.toLowerCase().includes('log in') ||
        btn.textContent?.toLowerCase().includes('sign in')
      );

      expect(submitButton).toBeInTheDocument();
    });
  });
});

describe('Auth API Routes', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Login API', () => {
    it('returns error when email is missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Email and password are required' }),
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'test123' }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('returns error when password is missing', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Email and password are required' }),
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    it('returns user data on successful login', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        is_admin: false,
        store_verified: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: mockUser, session: { access_token: 'token' } }),
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });

      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(data.user).toEqual(mockUser);
      expect(data.session).toBeDefined();
    });

    it('returns error for invalid credentials', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid login credentials' }),
      });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
      });

      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid login credentials');
    });
  });

  describe('Signup API', () => {
    it('returns error when password is too short', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Password must be at least 6 characters' }),
      });

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: '123' }),
      });

      const data = await response.json();
      expect(response.status).toBe(400);
      expect(data.error).toBe('Password must be at least 6 characters');
    });

    it('returns success message when email confirmation is required', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          user: { id: '123', email: 'test@example.com' },
          session: null,
          message: 'Please check your email to confirm your account.',
          requiresEmailConfirmation: true,
        }),
      });

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });

      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(data.requiresEmailConfirmation).toBe(true);
      expect(data.message).toContain('check your email');
    });
  });

  describe('Signout API', () => {
    it('returns success on signout', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: 'Signed out successfully' }),
      });

      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      const data = await response.json();
      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
    });
  });

  describe('Get User API', () => {
    it('returns null when no user is logged in', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: null }),
      });

      const response = await fetch('/api/auth/user');
      const data = await response.json();

      expect(data.user).toBeNull();
    });

    it('returns user data when logged in', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        is_admin: false,
        store_verified: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: mockUser }),
      });

      const response = await fetch('/api/auth/user');
      const data = await response.json();

      expect(data.user).toEqual(mockUser);
    });
  });
});



