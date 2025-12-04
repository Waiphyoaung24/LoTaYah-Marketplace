'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Lock, Mail, User as UserIcon, Shield, Store, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/auth/auth-service';

interface AuthProps {
  view: 'login' | 'register';
  onToggleView: () => void;
}

export const Auth: React.FC<AuthProps> = ({ view, onToggleView }) => {
  const { t, setUser } = useApp();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (view === 'login') {
        // Call the login API endpoint
        const result = await authService.login(formData.email, formData.password);
        
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }

        if (result.user) {
          // Update the app context with the user data
          setUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            isAdmin: result.user.is_admin,
            role: result.user.is_admin ? 'admin' : 'user',
            storeVerified: result.user.store_verified,
          });
          
          // Redirect to landing page
          router.push('/');
        }
      } else {
        // Call the signup API endpoint
        const result = await authService.signup(
          formData.email, 
          formData.password, 
          formData.name
        );
        
        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }

        if (result.requiresEmailConfirmation) {
          setSuccessMessage(result.message || 'Please check your email to confirm your account.');
          setIsLoading(false);
          return;
        }

        if (result.user) {
          // Update the app context with the user data
          setUser({
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            isAdmin: result.user.is_admin,
            role: result.user.is_admin ? 'admin' : 'user',
            storeVerified: result.user.store_verified,
          });
          
          // Redirect to landing page
          router.push('/');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mt-16 w-full max-w-md space-y-8 rounded-2xl border border-amber-100 bg-white/95 p-8 shadow-[0_18px_40px_rgba(214,158,46,0.18)] backdrop-blur">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 ring-1 ring-amber-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            <span>Secure seller access</span>
          </div>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
            {view === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
          <p className="text-sm text-stone-600">
            {t.auth.sellerRequired}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Quick Test Accounts - Only show on login view */}
        {view === 'login' && (
          <div className="space-y-3">
            {/* Admin Account */}
           

            
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">{t.auth.name}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <UserIcon className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    required={view === 'register'}
                    className="pl-12 w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all duration-200"
                    placeholder={t.auth.name}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">{t.auth.email}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  className="pl-12 w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all duration-200"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">{t.auth.password}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="pl-12 w-full px-4 py-3 rounded-xl border-2 border-stone-200 bg-stone-50 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              {view === 'register' && (
                <p className="mt-1 text-xs text-stone-500">Password must be at least 6 characters</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
            >
              {view === 'login' ? t.auth.submitLogin : t.auth.submitRegister}
            </Button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-stone-600">
            {view === 'login' ? t.auth.noAccount : t.auth.haveAccount}{' '}
            <button
              onClick={onToggleView}
              className="font-medium text-amber-600 hover:text-amber-500"
            >
              {view === 'login' ? t.auth.register : t.auth.login}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
