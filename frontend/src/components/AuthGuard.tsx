'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  KeyRound, 
  LogIn,
  ExternalLink
} from 'lucide-react';
import { useStockFlow, getRoleDashboardPath } from '../lib/stockflow-context';
import { Role, Permission } from '../types/inventory';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
  pageTitle?: string;
}

export function AuthGuard({ 
  children, 
  allowedRoles, 
  requiredPermission,
  pageTitle 
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    isAuthenticated, 
    isAuthReady, 
    currentUser, 
    currentRole, 
    hasPermission, 
  } = useStockFlow();

  // Redirect to login if auth is ready but user is not authenticated
  useEffect(() => {
    if (isAuthReady && !isAuthenticated) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`;
      router.replace(redirectUrl);
    }
  }, [isAuthReady, isAuthenticated, pathname, router]);

  // Loading state while checking authentication from client storage
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white selection:bg-blue-600">
        <div className="relative flex flex-col items-center max-w-sm text-center">
          {/* Animated decorative pulses */}
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-full blur-xl opacity-75 animate-pulse" />
          
          <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl mb-5">
            <ShieldCheck className="w-8 h-8 text-blue-500 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>NIC National Food Security Portal</span>
          </div>

          <h3 className="text-base font-bold tracking-tight text-white mb-1.5">
            Verifying Officer Clearance
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Establishing secure encrypted session with Government of India PDS Central Node...
          </p>

          <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="h-full bg-linear-to-r from-blue-600 via-indigo-500 to-blue-600 w-1/2 animate-[shimmer_1.5s_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated screen (shown briefly before redirect completes)
  if (!isAuthenticated) {
    const loginLink = `/login?redirect=${encodeURIComponent(pathname || '/dashboard')}`;
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 p-8 rounded-3xl shadow-2xl text-center backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>

          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wider">
            Protected Portal Route
          </span>

          <h2 className="text-lg font-bold text-white mt-3">
            Officer Authentication Required
          </h2>

          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Access to this departmental food-grain inventory section requires an authenticated NFSA officer credential.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href={loginLink}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Sign In with Officer Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="text-xs text-zinc-500 hover:text-zinc-300 py-1 transition"
            >
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Role restriction check
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    const userRoleDashboard = getRoleDashboardPath(currentRole);

    // Map Role → login slug
    const roleToSlug: Record<string, string> = {
      ADMIN: 'admin',
      GODOWN_MANAGER: 'manager',
      QUALITY_INSPECTOR: 'quality',
      DISPATCH_OFFICER: 'dispatch',
      FPS_DEALER: 'fps',
    };
    const requiredSlug = roleToSlug[allowedRoles[0]] || 'admin';

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/80 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold uppercase tracking-wider mb-2">
            <span>Role-Based Clearance Boundary</span>
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            Access Restricted to {allowedRoles.map(r => r.replace('_', ' ')).join(' or ')}
          </h2>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed max-w-md mx-auto">
            You are authenticated as <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{currentUser.name}</strong> (<span className="font-mono text-blue-600 dark:text-blue-400">{currentRole}</span>). 
            This section requires a different role. Please sign out and log in with the appropriate portal.
          </p>

          <div className="p-4 my-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-1.5">
            <div className="flex justify-between text-zinc-500">
              <span>Your Active Session:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentUser.designation}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Current Role Clearance:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{currentRole}</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Required Role:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{allowedRoles.join(' / ')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={userRoleDashboard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              <span>Go to My Dashboard ({currentRole.replace('_', ' ')})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href={`/login/${requiredSlug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Sign in as {allowedRoles[0].replace('_', ' ')}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Permission check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/60 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
            <Lock className="w-7 h-7" />
          </div>

          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 tracking-wider">
            Permission Clearance Denied
          </span>

          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-3">
            Unauthorized Action
          </h3>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            Your role (<strong className="text-zinc-900 dark:text-white font-mono">{currentRole}</strong>) does not have authorization code: <code className="font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded">{requiredPermission}</code>.
          </p>

          <div className="mt-6">
            <button
              onClick={() => router.push(getRoleDashboardPath(currentRole))}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-semibold text-xs shadow-md transition cursor-pointer"
            >
              <span>Return to Safe Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
