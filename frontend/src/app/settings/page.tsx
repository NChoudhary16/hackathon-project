'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useTheme } from '../../lib/theme-context';
import { useStockFlow } from '../../lib/stockflow-context';
import { ThemeToggle } from '../../components/ThemeToggle';
import { 
  Sun, 
  Moon, 
  Laptop, 
  ShieldCheck, 
  Building2, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Bell, 
  Boxes, 
  Clock, 
  Info,
  Save,
  Check
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { currentGodown, allGodowns, setSelectedGodownId, resetAllData, metrics } = useStockFlow();

  const [fifoEnforcement, setFifoEnforcement] = useState<'strict' | 'flexible'>('strict');
  const [criticalAgeingDays, setCriticalAgeingDays] = useState<number>(180);
  const [maxMoisturePercent, setMaxMoisturePercent] = useState<number>(14.0);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState<boolean>(true);
  const [savedNotification, setSavedNotification] = useState<boolean>(false);

  const handleSavePreferences = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <AppShell pageTitle="System Settings & Preferences" pageBreadcrumb="Settings">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Saved Toast */}
        {savedNotification && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2.5 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>System preferences saved successfully.</span>
            </div>
            <button
              onClick={() => setSavedNotification(false)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SECTION 1: THEME & APPEARANCE */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <span>Theme & Appearance</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Customize display mode for optimal readability in outdoor depot sunlight or low-light office conditions.
              </p>
            </div>
            <ThemeToggle variant="segmented" />
          </div>

          {/* Theme Selection Visual Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                theme === 'light'
                  ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                {theme === 'light' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Light Mode</div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Clean, crisp white and high-contrast dark text designed for bright environments.
              </p>
              {/* Mini UI Mockup */}
              <div className="mt-3 p-2 rounded-lg bg-zinc-100 border border-zinc-200 space-y-1">
                <div className="h-2 w-12 bg-zinc-300 rounded" />
                <div className="h-1.5 w-full bg-zinc-200 rounded" />
              </div>
            </button>

            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                theme === 'dark'
                  ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                {theme === 'dark' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Dark Mode</div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Deep zinc aesthetics and soft glowing accents that minimize eye fatigue during shifts.
              </p>
              {/* Mini UI Mockup */}
              <div className="mt-3 p-2 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="h-2 w-12 bg-zinc-700 rounded" />
                <div className="h-1.5 w-full bg-zinc-800 rounded" />
              </div>
            </button>

            {/* System Mode Card */}
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                theme === 'system'
                  ? 'border-blue-600 ring-2 ring-blue-600/30 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                {theme === 'system' && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active ({resolvedTheme})</span>
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">System Preference</div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Automatically synchronizes with your operating system light and dark schedule.
              </p>
              {/* Mini UI Mockup */}
              <div className="mt-3 p-2 rounded-lg bg-linear-to-r from-zinc-200 to-zinc-900 border border-zinc-400/30 space-y-1">
                <div className="h-2 w-12 bg-zinc-500 rounded" />
                <div className="h-1.5 w-full bg-zinc-600 rounded" />
              </div>
            </button>
          </div>
        </section>

        {/* SECTION 2: DEPOT & GODOWN CONFIGURATION */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Depot & Godown Defaults</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Select the default operational depot profile for stock allocation and challan generation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Active Operational Depot
              </label>
              <select
                value={currentGodown.id}
                onChange={(e) => setSelectedGodownId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {allGodowns.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.state}) • {g.capacityMt} MT
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                Designated Godown Manager
              </label>
              <input
                type="text"
                value={currentGodown.managerName}
                readOnly
                className="w-full text-xs p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: FIFO ALGORITHM PARAMETERS */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>FIFO Allocation Rules & Tolerance</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Configure deterministic stock exhaustion rules and safety triggers under NFSA guidelines.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
              <div className="space-y-1">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">Strict FIFO Enforcement</div>
                <div className="text-[11px] text-zinc-500">
                  Block outward challan creation if older lots in the same commodity class are available.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFifoEnforcement('strict')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    fifoEnforcement === 'strict'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Strict
                </button>
                <button
                  type="button"
                  onClick={() => setFifoEnforcement('flexible')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    fifoEnforcement === 'flexible'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Supervised Exception
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Critical Ageing Trigger (Days)
                </label>
                <input
                  type="number"
                  value={criticalAgeingDays}
                  onChange={(e) => setCriticalAgeingDays(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Batches exceeding this age are flagged red and prioritized for rotation.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Max Grain Moisture Standard (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={maxMoisturePercent}
                  onChange={(e) => setMaxMoisturePercent(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Procurement rejection threshold according to FCI Food Standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: DATA DEMO STATE */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              <span>Demonstration State & Cache</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Reset interactive simulated dispatches, challans, and stock receipts back to the default demonstration dataset.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Reset All Local Storage Demo Data
              </div>
              <div className="text-[11px] text-amber-800 dark:text-amber-400">
                Restores initial 8 consignments, sample challans, and 100% compliant demo state.
              </div>
            </div>
            <button
              type="button"
              onClick={resetAllData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </AppShell>
  );
}
