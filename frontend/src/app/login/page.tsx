'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  FlaskConical,
  Truck,
  Store,
  ArrowRight,
  Lock,
  Shield,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { useStockFlow, getRoleDashboardPath } from '../../lib/stockflow-context';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Role } from '../../types/inventory';

const ROLE_PORTALS: {
  role: Role;
  slug: string;
  title: string;
  subtitle: string;
  officer: string;
  designation: string;
  department: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  tag: string;
  features: string[];
}[] = [
  {
    role: 'ADMIN',
    slug: 'admin',
    title: 'State Administrator',
    subtitle: 'Master governance, RBAC management & audit trails',
    officer: 'Rajesh Kumar Sharma',
    designation: 'Director (State Food & Civil Supplies)',
    department: 'Central HQ Command & Cross-Godown Allocation',
    icon: ShieldCheck,
    gradient: 'from-rose-600 to-rose-700',
    borderColor: 'border-rose-200 dark:border-rose-800 hover:border-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    tag: 'Executive Authority',
    features: ['Full system access', 'User RBAC management', 'Cross-godown visibility', 'Audit logs'],
  },
  {
    role: 'GODOWN_MANAGER',
    slug: 'manager',
    title: 'Godown Superintendent',
    subtitle: 'Depot operations, inward receipts & stack management',
    officer: 'S. K. Verma',
    designation: 'Godown Manager / Depot In-Charge',
    department: 'FCI Central Depot Okhla (Unit-4)',
    icon: SlidersHorizontal,
    gradient: 'from-blue-600 to-blue-700',
    borderColor: 'border-blue-200 dark:border-blue-800 hover:border-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    tag: 'Depot Operations',
    features: ['Inward stock receipts', 'Stack & silo management', 'Stock ageing monitor', 'Bay explorer'],
  },
  {
    role: 'QUALITY_INSPECTOR',
    slug: 'quality',
    title: 'Quality & AGMARK Inspector',
    subtitle: 'Lab moisture testing, grading & quarantine control',
    officer: 'Anjali Gupta',
    designation: 'Chief Quality Inspector & Lab Chemist',
    department: 'Agmark Central Grain Inspection Cell',
    icon: FlaskConical,
    gradient: 'from-emerald-600 to-emerald-700',
    borderColor: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    tag: 'Moisture & Grading',
    features: ['AGMARK certification', 'Moisture testing', 'Quarantine lockouts', 'Lab assay reports'],
  },
  {
    role: 'DISPATCH_OFFICER',
    slug: 'dispatch',
    title: 'Dispatch & Fleet Officer',
    subtitle: 'FIFO allocation, weighbridge & gate pass issuance',
    officer: 'Harpreet Singh',
    designation: 'Logistics & Weighbridge Supervisor',
    department: 'Civil Supplies Fleet & Outward Dispatch',
    icon: Truck,
    gradient: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-200 dark:border-amber-800 hover:border-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    tag: 'FIFO & Gate Passes',
    features: ['FIFO dispatch engine', 'Delivery challans', 'Weighbridge gate passes', 'FPS allocation'],
  },
  {
    role: 'FPS_DEALER',
    slug: 'fps',
    title: 'Fair Price Shop Dealer',
    subtitle: 'Ration quota distribution & delivery acknowledgment',
    officer: 'Ramesh Chaurasia',
    designation: 'Ration Shop Authorized Dealer #412',
    department: 'National Food Security Act (NFSA) Retail Branch',
    icon: Store,
    gradient: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-200 dark:border-purple-800 hover:border-purple-400',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    tag: 'PDS Beneficiary Quota',
    features: ['Quota tracking', 'Delivery acknowledgment', 'QR code scanner', 'Stock receipts'],
  },
];

export default function LoginPortalSelector() {
  const router = useRouter();
  const { isAuthenticated, isAuthReady, currentRole } = useStockFlow();

  // If already logged in, redirect to their dashboard
  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      router.replace(getRoleDashboardPath(currentRole));
    }
  }, [isAuthReady, isAuthenticated, currentRole, router]);

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
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
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
          <Link
            href="/signup"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Officer Registration</span>
          </Link>
          <ThemeToggle variant="segmented" />
          <Link href="/" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition">
            Public Site
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-12">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4 shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              <span>Departmental Single Sign-On — Role-Based Access Control (RBAC)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Officer Authentication Gateway
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 max-w-xl mx-auto leading-relaxed">
              Select your departmental role to access your dedicated command portal. Each role has a secure, isolated login.
            </p>
          </div>

          {/* Role Portal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLE_PORTALS.map((portal) => {
              const Icon = portal.icon;
              return (
                <Link
                  key={portal.role}
                  href={`/login/${portal.slug}`}
                  className={`group relative bg-white dark:bg-zinc-900 rounded-2xl border ${portal.borderColor} dark:border-zinc-800 p-5 flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${portal.gradient} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${portal.badgeBg} ${portal.badgeText} border-current/20`}>
                      {portal.tag}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition mb-0.5">
                    {portal.title}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                    {portal.subtitle}
                  </p>

                  {/* Feature list */}
                  <ul className="space-y-1 mb-4 flex-1">
                    {portal.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Footer */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{portal.officer}</div>
                      <div className="text-[10px] text-zinc-400">{portal.designation}</div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Info & Registration Banner */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Demo Officer Accounts:</span> All roles come preloaded with official demo credentials and PIN{' '}
                <code className="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">123456</code>.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-zinc-900 dark:text-white">Need a new officer or dealer account?</div>
                <div className="text-[11px] text-zinc-500">Register under your specific operational role.</div>
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs hover:opacity-90 transition shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Role</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-4 px-4 text-center text-xs text-zinc-500 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StockFlow iPDS • Government Food-Grain Godown Management System</span>
          <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <Lock className="w-3 h-3" />
            Authorized Departmental Use Only
          </span>
        </div>
      </footer>
    </div>
  );
}
