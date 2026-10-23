'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Building2, 
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
  Sparkles,
  Info,
  Shield,
  HelpCircle,
  LogIn
} from 'lucide-react';
import { useStockFlow, DEMO_LOGIN_CREDENTIALS, getRoleDashboardPath } from '../../lib/stockflow-context';
import { Role } from '../../types/inventory';
import { ThemeToggle } from '../../components/ThemeToggle';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const { 
    login, 
    isAuthenticated, 
    isAuthReady, 
    currentRole, 
    currentUser 
  } = useStockFlow();

  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');
  const [selectedRole, setSelectedRole] = useState<Role>('ADMIN');
  const [emailInput, setEmailInput] = useState('admin@stockflow.gov.in');
  const [passwordInput, setPasswordInput] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccessRole, setLoginSuccessRole] = useState<Role | null>(null);

  // If already logged in, redirect to intended target or user's role dashboard
  useEffect(() => {
    if (isAuthReady && isAuthenticated && !loginSuccessRole) {
      const target = redirectParam || getRoleDashboardPath(currentRole);
      router.replace(target);
    }
  }, [isAuthReady, isAuthenticated, currentRole, redirectParam, router, loginSuccessRole]);

  // Handle Quick 1-Click Role Login
  const handleQuickLogin = (role: Role) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setLoginSuccessRole(role);

    setTimeout(() => {
      const res = login({ role });
      if (res.success && res.user) {
        const target = redirectParam || getRoleDashboardPath(role);
        router.push(target);
      } else {
        setErrorMessage(res.error || 'Authentication failed. Please try again.');
        setIsSubmitting(false);
        setLoginSuccessRole(null);
      }
    }, 450);
  };

  // Handle Manual Form Submission
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
      const res = login({
        email: emailInput,
        password: passwordInput,
      });

      if (res.success && res.user) {
        setLoginSuccessRole(res.user.role);
        const target = redirectParam || getRoleDashboardPath(res.user.role);
        router.push(target);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Enter demo PIN 123456.');
        setIsSubmitting(false);
      }
    }, 500);
  };

  // Preset role selection helper for Credentials Tab
  const selectRoleCredentials = (role: Role) => {
    setSelectedRole(role);
    const creds = DEMO_LOGIN_CREDENTIALS[role];
    if (creds) {
      setEmailInput(creds.email);
      setPasswordInput(creds.defaultPin);
    }
  };

  const roleCards: {
    role: Role;
    title: string;
    officer: string;
    designation: string;
    department: string;
    icon: React.ElementType;
    badgeColor: string;
    cardBorder: string;
    accentBg: string;
    tag: string;
  }[] = [
    {
      role: 'ADMIN',
      title: 'State Director / Admin',
      officer: 'Rajesh Kumar Sharma',
      designation: 'Director (State Food & Civil Supplies)',
      department: 'Central HQ Command & Cross-Godown Allocation',
      icon: Building2,
      badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      cardBorder: 'hover:border-rose-500/60 dark:hover:border-rose-500/60',
      accentBg: 'from-rose-500/10 to-transparent',
      tag: 'Executive Authority',
    },
    {
      role: 'GODOWN_MANAGER',
      title: 'Depot Superintendent',
      officer: 'S. K. Verma',
      designation: 'Godown Manager / Depot In-Charge',
      department: 'FCI Central Depot Okhla (Unit-4)',
      icon: SlidersHorizontal,
      badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      cardBorder: 'hover:border-blue-500/60 dark:hover:border-blue-500/60',
      accentBg: 'from-blue-500/10 to-transparent',
      tag: 'Depot Operations',
    },
    {
      role: 'QUALITY_INSPECTOR',
      title: 'Quality & AGMARK Chemist',
      officer: 'Anjali Gupta',
      designation: 'Chief Quality Inspector & Lab Chemist',
      department: 'Agmark Central Grain Inspection Cell',
      icon: FlaskConical,
      badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      cardBorder: 'hover:border-emerald-500/60 dark:hover:border-emerald-500/60',
      accentBg: 'from-emerald-500/10 to-transparent',
      tag: 'Moisture & Grading',
    },
    {
      role: 'DISPATCH_OFFICER',
      title: 'Dispatch & Fleet Officer',
      officer: 'Harpreet Singh',
      designation: 'Logistics & Weighbridge Supervisor',
      department: 'Civil Supplies Fleet & Outward Dispatch',
      icon: Truck,
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      cardBorder: 'hover:border-amber-500/60 dark:hover:border-amber-500/60',
      accentBg: 'from-amber-500/10 to-transparent',
      tag: 'FIFO & Gate Passes',
    },
    {
      role: 'FPS_DEALER',
      title: 'Fair Price Shop Dealer',
      officer: 'Ramesh Chaurasia',
      designation: 'Ration Shop Authorized Dealer #412',
      department: 'National Food Security Act (NFSA) Retail Branch',
      icon: Store,
      badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      cardBorder: 'hover:border-purple-500/60 dark:hover:border-purple-500/60',
      accentBg: 'from-purple-500/10 to-transparent',
      tag: 'PDS Beneficiary Quota',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Government Portal Branding Bar */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Subtle Indian Tricolor emblem motif */}
          <div className="flex flex-col gap-0.5 w-1.5 h-7 rounded-full overflow-hidden">
            <span className="flex-1 bg-amber-500" />
            <span className="flex-1 bg-white border border-zinc-300 dark:border-zinc-700" />
            <span className="flex-1 bg-emerald-600" />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight flex items-center gap-1.5">
                <span>StockFlow</span>
                <span className="text-blue-600 dark:text-blue-400">iPDS</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  NFSA 2013
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 hidden sm:block">
                National Food-Grain Storage & Deterministic FIFO Compliance Portal
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle variant="segmented" />
          <Link
            href="/"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition"
          >
            Public Site
          </Link>
        </div>
      </header>

      {/* Main Login Stage */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-4xl">
          {/* Header Announcement */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3 shadow-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Departmental Single Sign-On (SSO) & Role-Based Access Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Officer Authentication Gateway
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xl mx-auto">
              Select your departmental role persona for 1-click evaluation access, or authenticate with your official NIC Security PIN.
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-950/50">
              <button
                type="button"
                onClick={() => { setActiveTab('quick'); setErrorMessage(null); }}
                className={`py-3.5 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
                  activeTab === 'quick'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Quick Role Personas (1-Click Demo)</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Recommended
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('credentials'); setErrorMessage(null); }}
                className={`py-3.5 px-4 flex items-center justify-center gap-2 transition cursor-pointer border-b-2 ${
                  activeTab === 'credentials'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <KeyRound className="w-4 h-4 text-zinc-500" />
                <span>Official NIC Credentials / PIN</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="m-6 mb-0 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/80 text-red-700 dark:text-red-300 flex items-start gap-3 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* TAB 1: QUICK ROLE PERSONAS (1-CLICK EVALUATION ACCESS) */}
            {activeTab === 'quick' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Choose Authorized Operational Role
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Auto-redirects to dedicated role dashboard
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {roleCards.map((c) => {
                    const Icon = c.icon;
                    const isSelected = loginSuccessRole === c.role;
                    return (
                      <div
                        key={c.role}
                        className={`group relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800/80 ${c.cardBorder} hover:shadow-md ${
                          isSelected ? 'ring-2 ring-blue-600 bg-blue-50/20' : ''
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${c.badgeColor}`}>
                              {c.tag}
                            </span>
                            <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition">
                              <Icon className="w-4 h-4" />
                            </div>
                          </div>

                          <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {c.title}
                          </h3>

                          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                            {c.officer}
                          </div>

                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                            {c.department}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-200/70 dark:border-zinc-800/70">
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleQuickLogin(c.role)}
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-60"
                          >
                            {isSelected ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                <span>Authenticating...</span>
                              </>
                            ) : (
                              <>
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Sign In as {c.role.replace('_', ' ')}</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Role-Based Dashboard Routing:</span> Each persona lands on their respective command center — from State Director master allocation, Depot Superintendent inward receipts, AGMARK laboratory assays, to Fair Price Shop allocation logs.
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OFFICIAL NIC CREDENTIALS / PIN */}
            {activeTab === 'credentials' && (
              <div className="p-6 sm:p-8">
                {/* Fast Role Pre-loader Chips */}
                <div className="mb-6">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                    Quick-Fill Profile Credentials
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['ADMIN', 'GODOWN_MANAGER', 'QUALITY_INSPECTOR', 'DISPATCH_OFFICER', 'FPS_DEALER'] as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => selectRoleCredentials(r)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                          selectedRole === r
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        <span>{r.replace('_', ' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
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
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Security PIN / Password
                      </label>
                      <span className="text-[11px] text-zinc-400">
                        Demo PIN: <strong className="font-mono text-blue-600">123456</strong>
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter 6-digit security PIN"
                        className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
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

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-400">
                      <input
                        type="checkbox"
                        checked={rememberTerminal}
                        onChange={(e) => setRememberTerminal(e.target.checked)}
                        className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Remember this terminal session</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setPasswordInput('123456')}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Reset to Default PIN (123456)
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          <span>Verifying Officer Clearance...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Authenticate & Open Role Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Verification Bar */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>NIC PDS Gateway Simulation • 256-Bit TLS Audit Active</span>
              </div>
              <div>
                <span>National Food Security Act (NFSA) 2013</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Portal Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-4 px-4 text-center text-xs text-zinc-500 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StockFlow iPDS • Government Food-Grain Godown Management System</span>
          <span className="text-zinc-400 text-[11px]">Authorized Departmental Use Only</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xs">
        Loading Authentication Portal...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
