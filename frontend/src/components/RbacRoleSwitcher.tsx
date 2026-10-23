'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  KeyRound, 
  CheckCircle2, 
  Building2, 
  UserCog, 
  BadgeCheck, 
  Lock, 
  Eye, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useStockFlow } from '../lib/stockflow-context';
import { Role, Permission } from '../types/inventory';
import { ROLE_PERMISSIONS } from '../lib/mock-data';

const ROLE_INFO: Record<Role, {
  label: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  description: string;
  department: string;
}> = {
  ADMIN: {
    label: 'State Administrator',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    description: 'Master Superuser. Full governance across all 12 entities, depots, user roles & audit trails.',
    department: 'Directorate of Food & Civil Supplies',
  },
  GODOWN_MANAGER: {
    label: 'Godown Superintendent',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
    badgeText: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    description: 'Depot In-Charge. Manages godown stock, inward rail rakes, stacks & supervised dispatches.',
    department: 'Depot Warehouse Operations',
  },
  QUALITY_INSPECTOR: {
    label: 'Quality & Lab Inspector',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    description: 'Central Lab Chemist. Verifies AGMARK moisture, assigns quality grades & quarantine lockouts.',
    department: 'Grain Quality Assurance & Lab',
  },
  DISPATCH_OFFICER: {
    label: 'Dispatch & Gate Supervisor',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
    badgeText: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    description: 'Logistics Supervisor. Issues delivery challans, weighbridge gate passes & FPS allocations.',
    department: 'Civil Supplies Fleet & Weighbridge',
  },
  FPS_DEALER: {
    label: 'Fair Price Shop Dealer',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
    badgeText: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    description: 'Ration Dealer. Receives consignments, monitors remaining quota & prints delivery receipts.',
    department: 'NFSA Retail Distribution Network',
  },
};

const ALL_PERMISSIONS_LIST: { key: Permission; label: string; desc: string }[] = [
  { key: 'CAN_ACCESS_MASTER_DASHBOARD', label: 'Master Command Dashboard', desc: 'Manage all 12 entities, cross-godown network & audit logs' },
  { key: 'CAN_MANAGE_USERS', label: 'Manage User RBAC Roles', desc: 'Promote, demote and reassign depot staff credentials' },
  { key: 'CAN_MANAGE_GODOWNS', label: 'Manage Godowns & Silos', desc: 'Create and configure physical warehouse depots' },
  { key: 'CAN_MANAGE_COMMODITIES', label: 'Configure Commodities', desc: 'Edit bag weights, safe moisture & shelf-life days' },
  { key: 'CAN_MANAGE_SUPPLIERS', label: 'Manage Procurement Suppliers', desc: 'Onboard FCI hubs, state civil agencies and millers' },
  { key: 'CAN_MANAGE_FPS', label: 'Manage Fair Price Shops', desc: 'Manage ration shop dealers and beneficiary quotas' },
  { key: 'CAN_CREATE_RECEIPT', label: 'Record Inward Receipts', desc: 'Verify rakes, weighbridge and add to inventory' },
  { key: 'CAN_INSPECT_QUALITY', label: 'Quality & Quarantine Control', desc: 'Set Grade-A/B, moisture % and quarantine lockouts' },
  { key: 'CAN_DISPATCH_STOCK', label: 'Issue Delivery Challans', desc: 'Allocate stock and generate weighbridge gate passes' },
  { key: 'CAN_OVERRIDE_FIFO', label: 'Authorize FIFO Exception', desc: 'Bypass oldest lot with documented justification' },
  { key: 'CAN_VIEW_AUDIT_LOGS', label: 'Audit Trail Ledger', desc: 'Inspect immutable cryptographic system movements' },
  { key: 'CAN_VIEW_ALL_GODOWNS', label: 'Multi-Godown Visibility', desc: 'Switch depots and view state-wide stockpiles' },
];

export function RbacRoleSwitcher() {
  const { currentUser, currentRole, users, switchRole, switchUser } = useStockFlow();
  const [isOpen, setIsOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentInfo = ROLE_INFO[currentRole];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition shadow-xs cursor-pointer ${currentInfo.border} ${currentInfo.badgeBg} hover:opacity-90`}
        title="Click to switch RBAC role"
      >
        <div className={`w-6 h-6 rounded-lg ${currentUser.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs`}>
          {currentUser.avatarLetter}
        </div>
        
        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
              {currentUser.name.split(' ')[0]}
            </span>
            <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${currentInfo.badgeBg} ${currentInfo.badgeText} border ${currentInfo.border}`}>
              {currentRole.replace('_', ' ')}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-none truncate max-w-[130px]">
            {currentInfo.label}
          </p>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {/* Role Switcher Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 px-1">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  RBAC Role Switcher
                </h4>
                <p className="text-[11px] text-zinc-500">Test platform views under simulated roles</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMatrixOpen(true);
              }}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Matrix</span>
            </button>
          </div>

          <div className="space-y-1.5">
            {users.map((u) => {
              const info = ROLE_INFO[u.role];
              const isSelected = u.id === currentUser.id;

              return (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? `${info.badgeBg} ${info.border} shadow-2xs`
                      : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5`}>
                    {u.avatarLetter}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {u.name}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${info.badgeBg} ${info.badgeText} border ${info.border}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">
                      {info.label} &bull; <span className="text-zinc-500">{u.department}</span>
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                      {info.description}
                    </p>
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Info Footer */}
          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 px-1 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Depot: <strong>{currentUser.godownName || 'All Depots (Statewide)'}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" />
              Active Session
            </span>
          </div>
        </div>
      )}

      {/* RBAC Permissions Matrix Modal */}
      {isMatrixOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Role-Based Access Control (RBAC) Permissions Matrix
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Active Role: <strong className="text-blue-600 dark:text-blue-400">{currentInfo.label}</strong> ({currentRole})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMatrixOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Table */}
            <div className="p-4 overflow-y-auto space-y-3">
              <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 p-3 rounded-xl flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  Permissions are deterministically enforced across UI actions, route guards, and backend transaction handlers.
                </span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                {ALL_PERMISSIONS_LIST.map((perm) => {
                  const allowed = (ROLE_PERMISSIONS[currentRole] || []).includes(perm.key);
                  return (
                    <div key={perm.key} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                          <span>{perm.label}</span>
                          <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">
                            {perm.key}
                          </code>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{perm.desc}</p>
                      </div>

                      <div className="shrink-0 pl-3">
                        {allowed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            <Lock className="w-3 h-3" />
                            Restricted
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Switch role above to preview permissions dynamically.
              </span>
              <button
                onClick={() => setIsMatrixOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
