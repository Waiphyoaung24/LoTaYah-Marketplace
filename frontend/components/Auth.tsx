'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { User } from '@/lib/types';
import { Lock, Mail, User as UserIcon } from 'lucide-react';
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
      const user: User = {
        id: crypto.randomUUID(),
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
      };
      setUser(user);
      setIsLoading(false);
      router.push('/seller');
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-stone-900">
            {view === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {t.auth.sellerRequired}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">{t.auth.name}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    type="text"
                    required={view === 'register'}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-stone-300 rounded-lg placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    placeholder={t.auth.name}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t.auth.email}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-stone-300 rounded-lg placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">{t.auth.password}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-stone-300 rounded-lg placeholder-stone-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
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

