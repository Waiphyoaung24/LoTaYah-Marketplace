'use client';

import { ViewTransition } from 'react';
import { Community } from '@/components/Community';

export default function CommunityPage() {
  return (
    <ViewTransition>
      <Community />
    </ViewTransition>
  );
}

