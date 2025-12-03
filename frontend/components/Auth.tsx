'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { User } from '@/lib/types';
import { Lock, Mail, User as UserIcon, Shield, Zap, Store } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Check if logging in as admin
      const isAdmin = formData.email.toLowerCase() === 'admin@lotayah.com';
      // Check if logging in as verified store owner
      const isStoreOwner = formData.email.toLowerCase() === 'storeowner@lotayah.com';
      
      const user: User = {
        id: isAdmin ? 'admin-1' : isStoreOwner ? 'store-owner-1' : crypto.randomUUID(),
        name: isAdmin ? 'Admin User' : isStoreOwner ? 'Store Owner' : (formData.name || formData.email.split('@')[0]),
        email: formData.email,
        isAdmin: isAdmin,
        role: isAdmin ? 'admin' : 'user',
        storeVerified: isStoreOwner, // Store owner is pre-verified for testing
      };
      setUser(user);
      setIsLoading(false);
      
      // Redirect all users to landing page after login/register
      router.push('/');
    }, 1000);
  };

  const handleQuickAdminLogin = () => {
    setFormData({
      name: 'Admin User',
      email: 'admin@lotayah.com',
      password: 'admin123'
    });
    // Auto submit after setting the form
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }, 100);
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

        {/* Quick Test Accounts - Only show on login view */}
        {view === 'login' && (
          <div className="space-y-3">
            {/* Admin Account */}
            <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-semibold text-purple-900">Test Admin Account</p>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                Email: <span className="font-mono font-semibold">admin@lotayah.com</span>
                <br />
                Password: <span className="font-mono font-semibold">admin123</span>
              </p>
              
            </div>

            {/* Store Owner Account */}
            <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-semibold text-amber-900">Test Store Owner Account</p>
              </div>
              <p className="text-xs text-amber-700">
                Email: <span className="font-mono font-semibold">storeowner@lotayah.com</span>
                <br />
                Password: <span className="font-mono font-semibold">store123</span>
              </p>
            </div>
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
                    className="pl-12"
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
                  className="pl-12"
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
                  className="pl-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
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

