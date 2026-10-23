'use client';

import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Warehouse, 
  FileText, 
  Search, 
  BarChart3, 
  PlusCircle, 
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { DEMO_GODOWNS } from '../lib/mock-data';
import { ThemeToggle } from './ThemeToggle';

export type NavTab = 'overview' | 'fifo-simulator' | 'bays' | 'challans' | 'traceability' | 'analytics';

interface HeaderNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  selectedGodownId: string;
  onSelectGodown: (id: string) => void;
  onOpenInwardModal: () => void;
  onOpenFifoModal: () => void;
}

export function HeaderNav({
  activeTab,
  onSelectTab,
  selectedGodownId,
  onSelectGodown,
  onOpenInwardModal,
  onOpenFifoModal,
}: HeaderNavProps) {
  const currentGodown = DEMO_GODOWNS.find((g) => g.id === selectedGodownId) || DEMO_GODOWNS[0];

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Command Center', icon: <Warehouse className="w-4 h-4" /> },
    { id: 'fifo-simulator', label: 'FIFO Allocation Engine', icon: <ShieldCheck className="w-4 h-4" />, badge: 'Deterministic' },
    { id: 'bays', label: 'Godown Bays & Stacks', icon: <Layers className="w-4 h-4" /> },
    { id: 'challans', label: 'Delivery Challans', icon: <FileText className="w-4 h-4" /> },
    { id: 'traceability', label: 'Batch Traceability', icon: <Search className="w-4 h-4" /> },
    { id: 'analytics', label: 'PDS Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      {/* Top tier: Official Header & Godown Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">
                StockFlow <span className="text-blue-600 dark:text-blue-400">iPDS</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                PDS FIFO Engine
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Smart Food-Grain Inventory & FIFO Compliance Platform
            </p>
          </div>
        </div>

        {/* Center: Godown Depot Selector */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm">
          <Building2 className="w-4 h-4 text-zinc-500" />
          <span className="text-zinc-500 text-xs font-medium">Depot:</span>
          <select
            value={selectedGodownId}
            onChange={(e) => onSelectGodown(e.target.value)}
            className="bg-transparent font-medium text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none cursor-pointer pr-1"
          >
            {DEMO_GODOWNS.map((godown) => (
              <option key={godown.id} value={godown.id} className="dark:bg-zinc-900">
                {godown.name} ({godown.capacityMt} MT)
              </option>
            ))}
          </select>
        </div>

        {/* Right side CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenInwardModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200/90 transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Inward Stock</span>
          </button>

          <button
            onClick={onOpenFifoModal}
            className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-950 hover:bg-black text-white shadow-xs transition hover:scale-[1.02] cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dispatch Allocation</span>
          </button>
        </div>
      </div>

      {/* Bottom tier: Clean Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-200/80 dark:border-zinc-800/80 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-2 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 font-semibold shadow-2xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
