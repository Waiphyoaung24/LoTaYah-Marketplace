'use client';

import { Suspense } from 'react';
import { Storefront } from '@/components/Storefront';

function BrowseContent() {
  return <Storefront />;
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}

