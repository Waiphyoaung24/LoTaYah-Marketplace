'use client';

import { ViewTransition } from 'react';
import { SellerDashboard } from '@/components/SellerDashboard';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SellerPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <ViewTransition>
      <SellerDashboard />
    </ViewTransition>
  );
}

