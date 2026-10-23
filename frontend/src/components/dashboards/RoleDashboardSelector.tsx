'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Warehouse, 
  FlaskConical, 
  Truck, 
  Store, 
  ChevronRight, 
  KeyRound, 
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Role } from '../../types/inventory';
import { useStockFlow } from '../../lib/stockflow-context';

export interface RoleDashboardMeta {
  role: Role;
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  href: string;
  themeColor: string;
  activeBorder: string;
  activeBg: string;
  textAccent: string;
  primaryMetricLabel: string;
  primaryMetricValue: (ctx: ReturnType<typeof useStockFlow>) => string | number;
}

export const ROLE_DASHBOARDS_CONFIG: Record<Role, RoleDashboardMeta> = {
  ADMIN: {
    role: 'ADMIN',
    title: 'State Administrator Command',
    shortTitle: 'State Admin',
    subtitle: 'State-wide master governance, staff RBAC, entity configurations & compliance audits',
    badge: 'Superuser Full Access',
    icon: ShieldCheck,
    href: '/dashboard/admin',
    themeColor: 'rose',
    activeBorder: 'border-rose-500 dark:border-rose-400',
    activeBg: 'bg-rose-50/80 dark:bg-rose-950/40',
    textAccent: 'text-rose-600 dark:text-rose-400',
    primaryMetricLabel: 'Managed Entities',
    primaryMetricValue: () => '12 Core Entities',
  },
  GODOWN_MANAGER: {
    role: 'GODOWN_MANAGER',
    title: 'Godown Superintendent Depot',
    shortTitle: 'Godown Manager',
    subtitle: 'Depot floor operations, stack layouts, silo utilization, inward rakes & stock ageing',
    badge: 'Depot Operations',
    icon: Warehouse,
    href: '/dashboard/manager',
    themeColor: 'blue',
    activeBorder: 'border-blue-500 dark:border-blue-400',
    activeBg: 'bg-blue-50/80 dark:bg-blue-950/40',
    textAccent: 'text-blue-600 dark:text-blue-400',
    primaryMetricLabel: 'Active Stacks',
    primaryMetricValue: (ctx) => `${ctx.batches.filter((b) => b.status === 'active').length} Stacks`,
  },
  QUALITY_INSPECTOR: {
    role: 'QUALITY_INSPECTOR',
    title: 'Quality & AGMARK Lab Inspector',
    shortTitle: 'Quality Inspector',
    subtitle: 'Laboratory moisture testing, grain grading, AGMARK certification & quarantine lockouts',
    badge: 'Laboratory & QC',
    icon: FlaskConical,
    href: '/dashboard/quality',
    themeColor: 'emerald',
    activeBorder: 'border-emerald-500 dark:border-emerald-400',
    activeBg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
    textAccent: 'text-emerald-600 dark:text-emerald-400',
    primaryMetricLabel: 'Quarantine Batches',
    primaryMetricValue: (ctx) => `${ctx.batches.filter((b) => b.status === 'quarantine').length} Quarantined`,
  },
  DISPATCH_OFFICER: {
    role: 'DISPATCH_OFFICER',
    title: 'Dispatch & Fleet Weighbridge',
    shortTitle: 'Dispatch Officer',
    subtitle: 'FIFO allocation engine, weighbridge gross/tare ticketing & Form-IV gate pass issuance',
    badge: 'Fleet & Weighbridge',
    icon: Truck,
    href: '/dashboard/dispatch',
    themeColor: 'amber',
    activeBorder: 'border-amber-500 dark:border-amber-400',
    activeBg: 'bg-amber-50/80 dark:bg-amber-950/40',
    textAccent: 'text-amber-600 dark:text-amber-400',
    primaryMetricLabel: 'Challans Issued',
    primaryMetricValue: (ctx) => `${ctx.challans.length} Challans`,
  },
  FPS_DEALER: {
    role: 'FPS_DEALER',
    title: 'Fair Price Shop (FPS) Dealer',
    shortTitle: 'FPS Dealer',
    subtitle: 'Ration quota distribution, inbound truck tracking & QR code delivery acknowledgment',
    badge: 'NFSA Retail Dealer',
    icon: Store,
    href: '/dashboard/fps',
    themeColor: 'purple',
    activeBorder: 'border-purple-500 dark:border-purple-400',
    activeBg: 'bg-purple-50/80 dark:bg-purple-950/40',
    textAccent: 'text-purple-600 dark:text-purple-400',
    primaryMetricLabel: 'Remaining Quota',
    primaryMetricValue: (ctx) => `${ctx.fairPriceShops[0]?.activeQuotaRemainingMt || 120} MT`,
  },
};

interface RoleDashboardSelectorProps {
  selectedDashboardRole: Role;
  onSelectRole?: (role: Role) => void;
  showSwitchSessionPrompt?: boolean;
}

export function RoleDashboardSelector({
  selectedDashboardRole,
  onSelectRole,
  showSwitchSessionPrompt = true,
}: RoleDashboardSelectorProps) {
  const stockflow = useStockFlow();
  const { currentRole, currentUser, switchRole } = stockflow;

  const rolesList: Role[] = ['ADMIN', 'GODOWN_MANAGER', 'QUALITY_INSPECTOR', 'DISPATCH_OFFICER', 'FPS_DEALER'];

  return (
    <div className="space-y-4">
      {/* Role Navigation Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2 shadow-xs">
        <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Role-Specific Dashboards
            </span>
            <span className="text-[11px] text-zinc-500 hidden sm:inline">
              Each administrative role has a bespoke dashboard tailored to their statutory entity responsibilities.
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 hidden md:inline">Current Session Role:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>{currentRole}</span>
            </span>
          </div>
        </div>

        {/* 5 Distinct Role Cards/Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {rolesList.map((r) => {
            const config = ROLE_DASHBOARDS_CONFIG[r];
            const Icon = config.icon;
            const isSelected = selectedDashboardRole === r;
            const isUserCurrentRole = currentRole === r;

            return (
              <button
                key={r}
                type="button"
                onClick={() => onSelectRole && onSelectRole(r)}
                className={`relative flex flex-col p-3 rounded-xl text-left transition-all cursor-pointer border ${
                  isSelected
                    ? `${config.activeBg} ${config.activeBorder} shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10`
                    : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? `${config.textAccent} bg-white dark:bg-zinc-900 shadow-2xs`
                        : 'text-zinc-500 bg-white dark:bg-zinc-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {isUserCurrentRole && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white tracking-tight shadow-2xs">
                      Active Role
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                    {config.shortTitle}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">
                    {config.primaryMetricLabel}: <strong className="text-zinc-700 dark:text-zinc-300">{config.primaryMetricValue(stockflow)}</strong>
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-800/60 flex items-center justify-between text-[10px]">
                  <span className={`font-semibold ${isSelected ? config.textAccent : 'text-zinc-500'}`}>
                    {isSelected ? 'Viewing Dashboard' : 'Switch View'}
                  </span>
                  <ChevronRight className={`w-3 h-3 ${isSelected ? config.textAccent : 'text-zinc-400'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sync Warning / Role Switch Helper */}
      {showSwitchSessionPrompt && selectedDashboardRole !== currentRole && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
              <KeyRound className="w-4 h-4" />
            </span>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Viewing {ROLE_DASHBOARDS_CONFIG[selectedDashboardRole].title} in Preview Mode
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Your active session role is <strong className="font-mono text-zinc-800 dark:text-zinc-200">{currentRole}</strong>. 
                To execute live writes or approvals for this role, synchronize your session.
              </p>
            </div>
          </div>

          <button
            onClick={() => switchRole(selectedDashboardRole)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            <span>Set Session Role to {selectedDashboardRole}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
