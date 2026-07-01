'use client';

import { Suspense } from 'react';
import { PrepareMonthModal } from '@/components/upload/PrepareMonthModal';

function PrepararContent() {
  return <PrepareMonthModal />;
}

export default function PrepararPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]" />
        </div>
      }
    >
      <PrepararContent />
    </Suspense>
  );
}
