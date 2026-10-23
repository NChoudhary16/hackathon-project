'use client';

import React from 'react';
import { ShieldAlert, ArrowRight, Lock, KeyRound } from 'lucide-react';
import { useStockFlow } from '../lib/stockflow-context';
import { Permission, Role } from '../types/inventory';

interface RbacGuardProps {
  permission: Permission;
  requiredRoleLabel?: string;
  recommendedRole?: Role;
  children: React.ReactNode;
}

export function RbacGuard({ 
  permission, 
  requiredRoleLabel = 'Administrator', 
  recommendedRole = 'ADMIN', 
  children 
}: RbacGuardProps) {
  const { hasPermission, currentRole, switchRole } = useStockFlow();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return (
    <div className="p-8 my-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-zinc-900 dark:to-zinc-900 border border-amber-200/80 dark:border-amber-800/60 shadow-lg text-center max-w-2xl mx-auto animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-700">
        <Lock className="w-7 h-7" />
      </div>

      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 tracking-wider">
        Role-Based Access Control Notice
      </span>

      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-3">
        Restricted Administrative Action
      </h3>

      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 max-w-lg mx-auto leading-relaxed">
        Your current session role is <strong className="text-zinc-900 dark:text-white font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{currentRole}</strong>. 
        Under the National Food Security Act (NFSA) inventory governance protocol, this operation requires the <strong className="text-amber-700 dark:text-amber-400 font-semibold">{requiredRoleLabel}</strong> role.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => switchRole(recommendedRole)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-600/20 transition cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Switch to {recommendedRole} to Access</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[11px] text-zinc-400 mt-4">
        Permission required: <code className="font-mono text-zinc-500">{permission}</code>
      </p>
    </div>
  );
}
