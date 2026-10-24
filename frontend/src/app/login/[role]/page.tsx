'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  FlaskConical,
  Truck,
  Store,
  Building2,
  ArrowLeft,
  Shield,
  UserPlus,
} from 'lucide-react';
import { useStockFlow, DEMO_LOGIN_CREDENTIALS, getRoleDashboardPath } from '../../../lib/stockflow-context';
import { Role } from '../../../types/inventory';
import { ThemeToggle } from '../../../components/ThemeToggle';

// Map URL slug → Role
const SLUG_TO_ROLE: Record<string, Role> = {
  admin: 'ADMIN',
  manager: 'GODOWN_MANAGER',
  quality: 'QUALITY_INSPECTOR',
  dispatch: 'DISPATCH_OFFICER',
  fps: 'FPS_DEALER',
};

const ROLE_META: Record<Role, {
  title: string;
  subtitle: string;
  department: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  accentBg: string;
  tag: string;
  bgPattern: string;
}> = {
  ADMIN: {
    title: 'State Administrator Portal',
    subtitle: 'Director-level access to full system governance, RBAC management & national audit trail',
    department: 'Directorate of Food & Civil Supplies — Central HQ',
    icon: ShieldCheck,
    gradient: 'from-rose-600 to-rose-700',
    accentColor: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    tag: 'Executive Authority',
    bgPattern: 'from-rose-50/50 to-transparent dark:from-rose-950/20',
  },
  GODOWN_MANAGER: {
    title: 'Godown Superintendent Portal',
    subtitle: 'Depot in-charge access for inward receipts, stack layouts & stock ageing monitoring',
    department: 'FCI Central Depot Operations — Warehouse Unit',
    icon: SlidersHorizontal,
    gradient: 'from-blue-600 to-blue-700',
    accentColor: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
    tag: 'Depot Operations',
    bgPattern: 'from-blue-50/50 to-transparent dark:from-blue-950/20',
  },
  QUALITY_INSPECTOR: {
    title: 'Quality Inspector Portal',
    subtitle: 'Lab chemist access for AGMARK moisture testing, grading & quarantine control',
    department: 'Agmark Central Grain Inspection Cell — QC Lab',
    icon: FlaskConical,
    gradient: 'from-emerald-600 to-emerald-700',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    tag: 'Moisture & Grading',
    bgPattern: 'from-emerald-50/50 to-transparent dark:from-emerald-950/20',
  },
  DISPATCH_OFFICER: {
    title: 'Dispatch Officer Portal',
    subtitle: 'Logistics supervisor access for FIFO dispatch, weighbridge & delivery challan issuance',
    department: 'Civil Supplies Fleet & Weighbridge — Outward Gate',
    icon: Truck,
    gradient: 'from-amber-500 to-amber-600',
    accentColor: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    tag: 'FIFO & Gate Passes',
    bgPattern: 'from-amber-50/50 to-transparent dark:from-amber-950/20',
  },
  FPS_DEALER: {
    title: 'Fair Price Shop Portal',
    subtitle: 'Authorized dealer access for quota distribution, consignment tracking & QR acknowledgment',
    department: 'NFSA Retail Distribution Network — PDS Branch',
    icon: Store,
    gradient: 'from-purple-600 to-purple-700',
    accentColor: 'text-purple-600 dark:text-purple-400',
    accentBg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
    tag: 'PDS Beneficiary Quota',
    bgPattern: 'from-purple-50/50 to-transparent dark:from-purple-950/20',
  },
};

function RoleLoginContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.role as string;
  const role = SLUG_TO_ROLE[slug];

  const { login, isAuthenticated, isAuthReady, currentRole } = useStockFlow();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Prefill credentials for demo
  useEffect(() => {
    if (role && DEMO_LOGIN_CREDENTIALS[role]) {
      setEmailInput(DEMO_LOGIN_CREDENTIALS[role].email);
      setPasswordInput(DEMO_LOGIN_CREDENTIALS[role].defaultPin);
    }
  }, [role]);

  // Redirect if already logged in as this role
  useEffect(() => {
    if (isAuthReady && isAuthenticated && !loginSuccess) {
      router.replace(getRoleDashboardPath(currentRole));
    }
  }, [isAuthReady, isAuthenticated, currentRole, router, loginSuccess]);

  // Invalid slug fallback
  if (!role || !ROLE_META[role]) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Unknown Role Portal</h1>
          <p className="text-sm text-zinc-500 mb-4">The role &quot;{slug}&quot; does not exist.</p>
          <Link href="/login" className="text-blue-600 text-sm font-semibold hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const meta = ROLE_META[role];
  const creds = DEMO_LOGIN_CREDENTIALS[role];
  const Icon = meta.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMessage('Please enter your Officer Email or Government ID.');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMessage('Please enter your Security PIN or Password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = login({ email: emailInput, password: passwordInput });
      if (res.success && res.user) {
        // Enforce role match
        if (res.user.role !== role) {
          setErrorMessage(`These credentials belong to a ${res.user.role.replace('_', ' ')} account. Please use the correct portal.`);
          setIsSubmitting(false);
          return;
        }
        setLoginSuccess(true);
        router.push(getRoleDashboardPath(role));
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Use the default demo PIN: 123456.');
        setIsSubmitting(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* Top Bar */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5 w-1.5 h-7 rounded-full overflow-hidden">
            <span className="flex-1 bg-amber-500" />
            <span className="flex-1 bg-white border border-zinc-300 dark:border-zinc-700" />
            <span className="flex-1 bg-emerald-600" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                <span>StockFlow</span>
                <span className="text-blue-600 dark:text-blue-400">iPDS</span>
              </div>
              <div className="text-[10px] text-zinc-500 hidden sm:block">
                National Food-Grain Storage & FIFO Compliance Portal
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle variant="segmented" />
          <Link
            href="/login"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Portals
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-lg">
          {/* Role Identity Card */}
          <div className={`rounded-3xl border p-6 mb-6 bg-gradient-to-br ${meta.bgPattern} ${meta.accentBg}`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center shadow-md shrink-0`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${meta.accentColor}`}>
                  {meta.tag}
                </div>
                <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                  {meta.title}
                </h1>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {meta.department}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed border-t border-current/10 pt-4">
              {meta.subtitle}
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="px-6 pt-6 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Officer Authentication
                </span>
              </div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                Sign in to your portal
              </h2>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/80 text-red-700 dark:text-red-300 flex items-start gap-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Officer Email / NIC Official ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="officer@stockflow.gov.in"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Security PIN / Password
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Demo PIN: <strong className="font-mono text-blue-600 dark:text-blue-400">123456</strong>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter security PIN"
                    className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                    title={showPassword ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo officer info */}
              {creds && (
                <div className={`p-3 rounded-xl border text-[11px] ${meta.accentBg} ${meta.accentColor}`}>
                  <div className="font-semibold mb-0.5">Demo Officer Profile</div>
                  <div className="text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{creds.officerName}</span>
                    {' — '}{creds.designation}
                    {creds.godown && <span className="ml-1">• {creds.godown}</span>}
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${meta.gradient} text-white font-semibold text-xs shadow-md transition cursor-pointer disabled:opacity-60 hover:opacity-90`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Verifying Officer Clearance...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Authenticate & Open Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Role Registration Link */}
              <div className="pt-2 text-center">
                <span className="text-xs text-zinc-500">Need an official officer account? </span>
                <Link
                  href={`/signup/${slug}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register as {meta.title.replace(' Portal', '')}</span>
                </Link>
              </div>
            </form>

            {/* Security Footer */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>NIC PDS Gateway Simulation • 256-Bit TLS Audit Active</span>
              </div>
              <Link href="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Switch Role Portal
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-4 px-4 text-center text-xs text-zinc-500 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StockFlow iPDS • Government Food-Grain Godown Management System</span>
          <span className="text-zinc-400 text-[11px]">Authorized Departmental Use Only</span>
        </div>
      </footer>
    </div>
  );
}

export default function RoleLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xs">
        Loading Authentication Portal...
      </div>
    }>
      <RoleLoginContent />
    </Suspense>
  );
}
