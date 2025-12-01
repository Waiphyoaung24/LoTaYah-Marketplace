'use client';

import { Auth } from '@/components/Auth';

export default function RegisterPage() {
  return (
    <Auth 
      view="register" 
      onToggleView={() => window.location.href = '/login'}
    />
  );
}

