'use client';

import { useState } from 'react';
import { Auth } from '@/components/Auth';

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'register'>('login');

  return (
    <Auth 
      view={view} 
      onToggleView={() => setView(view === 'login' ? 'register' : 'login')}
    />
  );
}

