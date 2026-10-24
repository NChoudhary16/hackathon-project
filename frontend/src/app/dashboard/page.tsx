'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStockFlow, getRoleDashboardPath } from '../../lib/stockflow-context';
import { Loader2 } from 'lucide-react';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { currentRole, isAuthReady, isAuthenticated } = useStockFlow();

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      router.replace(getRoleDashboardPath(currentRole));
    }
  }, [currentRole, isAuthReady, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-xl">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        <span className="text-sm font-medium text-zinc-300">
          Routing to authorized role terminal...
        </span>
      </div>
    </div>
  );
}
