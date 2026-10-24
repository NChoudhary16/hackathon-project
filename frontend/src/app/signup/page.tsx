'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  FlaskConical,
  Truck,
  Store,
  ArrowRight,
  UserPlus,
  Shield,
  Sparkles,
  CheckCircle2,
  LogIn,
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Role } from '../../types/inventory';

const ROLE_SIGNUP_PORTALS: {
  role: Role;
  slug: string;
  title: string;
  subtitle: string;
  department: string;
  authorityLevel: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  requirements: string[];
}[] = [
  {
    role: 'ADMIN',
    slug: 'admin',
    title: 'State Administrator',
    subtitle: 'Register state-level administrative clearance for policy, audits and godown command',
    department: 'Directorate of Food & Civil Supplies — Central HQ',
    authorityLevel: 'Executive Level 1',
    icon: ShieldCheck,
    gradient: 'from-rose-600 to-rose-700',
    borderColor: 'border-rose-200 dark:border-rose-800 hover:border-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    requirements: ['Govt Official Email', 'HQ Gazetted ID', 'State Master Access PIN'],
  },
  {
    role: 'GODOWN_MANAGER',
    slug: 'manager',
    title: 'Godown Superintendent',
    subtitle: 'Register depot in-charge credentials for inward receipts, stack monitoring & capacity',
    department: 'FCI Central Depot Operations — Warehouse Unit',
    authorityLevel: 'Depot Superintendent',
    icon: SlidersHorizontal,
    gradient: 'from-blue-600 to-blue-700',
    borderColor: 'border-blue-200 dark:border-blue-800 hover:border-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    requirements: ['Assigned Godown / Depot', 'Depot In-Charge Code', 'Stack Master Clearance'],
  },
  {
    role: 'QUALITY_INSPECTOR',
    slug: 'quality',
    title: 'Quality & AGMARK Inspector',
    subtitle: 'Register laboratory chemist & inspection officer credentials for moisture assay & grading',
    department: 'Agmark Central Grain Inspection Cell — QC Lab',
    authorityLevel: 'Field QC Inspector',
    icon: FlaskConical,
    gradient: 'from-emerald-600 to-emerald-700',
    borderColor: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    requirements: ['AGMARK Chemist Reg No.', 'Testing Lab Assignment', 'Moisture Meter Device ID'],
  },
  {
    role: 'DISPATCH_OFFICER',
    slug: 'dispatch',
    title: 'Dispatch & Fleet Officer',
    subtitle: 'Register weighbridge & outward logistics supervisor credentials for FIFO challan issuance',
    department: 'Civil Supplies Fleet & Weighbridge — Outward Gate',
    authorityLevel: 'Logistics Supervisor',
    icon: Truck,
    gradient: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-200 dark:border-amber-800 hover:border-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    requirements: ['Weighbridge Terminal ID', 'Depot Gate Pass Key', 'Fleet Dispatch Token'],
  },
  {
    role: 'FPS_DEALER',
    slug: 'fps',
    title: 'Fair Price Shop (FPS) Dealer',
    subtitle: 'Register authorized ration dealer account for PDS distribution, beneficiary quota & receipt QR',
    department: 'NFSA Retail Distribution Network — PDS Branch',
    authorityLevel: 'Licensed Dealer',
    icon: Store,
    gradient: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-200 dark:border-purple-800 hover:border-purple-400',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    requirements: ['FPS Dealer License No.', 'Assigned Fair Price Shop', 'e-POS Terminal ID'],
  },
];

export default function SignupPortalSelectorPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">StockFlow iPDS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Officer Registration
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">Government of India • Ministry of Consumer Affairs, Food & Public Distribution</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Already registered? Sign In</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Departmental Officer & FPS Dealer Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Create Your Official Role Account
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Each role in the StockFlow iPDS network maintains strict operational segregation. Choose your official designation below to register with role-tailored security clearances.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              Direct Role Assignment
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              <Shield className="w-3 h-3" />
              Audit-Ready Logging
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
              <Sparkles className="w-3 h-3" />
              Instant Dashboard Activation
            </div>
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROLE_SIGNUP_PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.role}
                className={`relative flex flex-col justify-between rounded-2xl bg-white dark:bg-zinc-900 border p-6 shadow-sm hover:shadow-lg transition-all duration-200 group ${portal.borderColor}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.gradient} text-white flex items-center justify-center shadow-md shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${portal.badgeBg} ${portal.badgeText}`}>
                      {portal.authorityLevel}
                    </span>
                  </div>

                  {/* Title & Department */}
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {portal.title}
                  </h3>
                  <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {portal.department}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2.5 leading-relaxed">
                    {portal.subtitle}
                  </p>

                  {/* Requirements List */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                      Required Onboarding Data
                    </div>
                    <div className="space-y-1.5">
                      {portal.requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    href={`/signup/${portal.slug}`}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r ${portal.gradient} text-white font-semibold text-xs shadow-sm hover:opacity-95 transition cursor-pointer`}
                  >
                    <span>Register as {portal.title.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <div className="text-center mt-2">
                    <Link
                      href={`/login/${portal.slug}`}
                      className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition"
                    >
                      Already have credentials? Sign in &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">
                Official Government PDS Security Standards
              </div>
              <div className="text-[11px] text-zinc-500">
                All registered accounts are auditable by the Central Directorate of Food & Civil Supplies.
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Go to Official Login Portals</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 px-4 text-center text-xs text-zinc-500 bg-white/50 dark:bg-zinc-900/50 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">StockFlow iPDS</span>
            <span>• Government Food-Grain Godown Management System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>NIC E-Governance</span>
            <span>•</span>
            <span>256-Bit SSL Enforced</span>
            <span>•</span>
            <span>NFSA Compliance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
