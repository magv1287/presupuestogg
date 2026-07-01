'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/preparar');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10B981]" />
    </div>
  );
}
