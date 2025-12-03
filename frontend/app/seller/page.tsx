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
      return;
    }
    
    // Only allow verified store owners to access seller dashboard
    if (!user.storeVerified) {
      router.push('/seller/setup');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  // Don't show seller dashboard if not verified
  if (!user.storeVerified) {
    return null;
  }

  return (
    <ViewTransition>
      <SellerDashboard />
    </ViewTransition>
  );
}

