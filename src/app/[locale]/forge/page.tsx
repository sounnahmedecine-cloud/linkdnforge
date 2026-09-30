'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

export default function ForgePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/#demo');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-500 font-medium text-sm">
        Redirection vers l&apos;Atelier...
      </div>
    </div>
  );
}
