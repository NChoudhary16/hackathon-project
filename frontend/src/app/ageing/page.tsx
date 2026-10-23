'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA } from '../../lib/mock-data';
import { Batch, CommodityType } from '../../types/inventory';
import { 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Filter, 
  ArrowRight, 
  Calendar, 
  Boxes, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function StockAgeingPage() {
  const { batches, ageingConfig, setAgeingConfig } = useStockFlow();

  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [filterThreshold, setFilterThreshold] = useState<'all' | 'critical' | 'tier4' | 'tier3'>('all');

  // Configurable demonstration threshold sliders
  const [band1Days, setBand1Days] = useState(ageingConfig.band1MaxDays);
  const [band2Days, setBand2Days] = useState(ageingConfig.band2MaxDays);
  const [band3Days, setBand3Days] = useState(ageingConfig.band3MaxDays);
  const [criticalDays, setCriticalDays] = useState(ageingConfig.criticalAlertDays);
  const [isConfigChanged, setIsConfigChanged] = useState(false);

  const handleApplyThresholds = () => {
    setAgeingConfig({
      band1MaxDays: band1Days,
      band2MaxDays: band2Days,
      band3MaxDays: band3Days,
      criticalAlertDays: criticalDays,
    });
    setIsConfigChanged(false);
  };

  // Filtered active batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (b.status !== 'active' || b.currentQuantityMt <= 0.01) return false;
      if (selectedCommodity !== 'all' && b.commodity !== selectedCommodity) return false;

      if (filterThreshold === 'critical' && b.ageDays < criticalDays) return false;
      if (filterThreshold === 'tier4' && b.ageDays <= band3Days) return false;
      if (filterThreshold === 'tier3' && (b.ageDays <= band2Days || b.ageDays > band3Days)) return false;

      return true;
    }).sort((a, b) => b.ageDays - a.ageDays); // Oldest first!
  }, [batches, selectedCommodity, filterThreshold, band2Days, band3Days, criticalDays]);

  // Aggregate Age Groups
  const ageBands = useMemo(() => {
    const active = batches.filter((b) => b.status === 'active' && b.currentQuantityMt > 0);
    const b1 = active.filter((b) => b.ageDays <= band1Days);
    const b2 = active.filter((b) => b.ageDays > band1Days && b.ageDays <= band2Days);
    const b3 = active.filter((b) => b.ageDays > band2Days && b.ageDays <= band3Days);
    const b4 = active.filter((b) => b.ageDays > band3Days);
    const critical = active.filter((b) => b.ageDays >= criticalDays);

    return {
      band1: { label: `0–${band1Days} Days (Fresh)`, batches: b1, mt: b1.reduce((sum, b) => sum + b.currentQuantityMt, 0), color: 'bg-emerald-500' },
      band2: { label: `${band1Days + 1}–${band2Days} Days (Normal)`, batches: b2, mt: b2.reduce((sum, b) => sum + b.currentQuantityMt, 0), color: 'bg-blue-500' },
      band3: { label: `${band2Days + 1}–${band3Days} Days (Attention)`, batches: b3, mt: b3.reduce((sum, b) => sum + b.currentQuantityMt, 0), color: 'bg-amber-500' },
      band4: { label: `>${band3Days} Days (High Priority)`, batches: b4, mt: b4.reduce((sum, b) => sum + b.currentQuantityMt, 0), color: 'bg-orange-500' },
      critical: { label: `Critical (>${criticalDays}d)`, batches: critical, mt: critical.reduce((sum, b) => sum + b.currentQuantityMt, 0), color: 'bg-rose-500' },
    };
  }, [batches, band1Days, band2Days, band3Days, criticalDays]);

  const totalActiveStockMt = batches
    .filter((b) => b.status === 'active')
    .reduce((sum, b) => sum + b.currentQuantityMt, 0);

  return (
    <AppShell pageTitle="Stock Ageing & Spoilage Prevention" pageBreadcrumb="Stock Ageing">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Stock-Ageing Monitoring & Alert Bands
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enforce FIFO rotation before grains approach critical ageing and shelf-life thresholds.
            </p>
          </div>

          <Link
            href="/fifo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Launch FIFO Rotation</span>
          </Link>
        </div>

        {/* Configurable Thresholds Demonstration Card (Section 12) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-zinc-900 dark:text-white">
                Configurable Demonstration Ageing Thresholds
              </span>
            </div>
            <span className="text-[11px] text-zinc-500">
              Customizable simulation parameters for godown superintendents
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
            <div>
              <label className="block text-zinc-500 mb-1">Tier 1 Max: <strong>{band1Days} days</strong></label>
              <input
                type="range"
                min="15"
                max="45"
                value={band1Days}
                onChange={(e) => { setBand1Days(Number(e.target.value)); setIsConfigChanged(true); }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-1">Tier 2 Max: <strong>{band2Days} days</strong></label>
              <input
                type="range"
                min="45"
                max="90"
                value={band2Days}
                onChange={(e) => { setBand2Days(Number(e.target.value)); setIsConfigChanged(true); }}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-1">Tier 3 Max: <strong>{band3Days} days</strong></label>
              <input
                type="range"
                min="90"
                max="150"
                value={band3Days}
                onChange={(e) => { setBand3Days(Number(e.target.value)); setIsConfigChanged(true); }}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-rose-500 font-semibold mb-1">Critical Alert: <strong>{criticalDays} days</strong></label>
              <input
                type="range"
                min="150"
                max="240"
                value={criticalDays}
                onChange={(e) => { setCriticalDays(Number(e.target.value)); setIsConfigChanged(true); }}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
          </div>

          {isConfigChanged && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleApplyThresholds}
                className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs"
              >
                Apply Custom Thresholds
              </button>
            </div>
          )}
        </div>

        {/* Ageing Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              {ageBands.band1.label}
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              {ageBands.band1.mt.toFixed(1)} MT
            </div>
            <div className="text-[11px] text-zinc-500">{ageBands.band1.batches.length} Batches Active</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              {ageBands.band2.label}
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              {ageBands.band2.mt.toFixed(1)} MT
            </div>
            <div className="text-[11px] text-zinc-500">{ageBands.band2.batches.length} Batches Active</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/80 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
              {ageBands.band3.label}
            </div>
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
              {ageBands.band3.mt.toFixed(1)} MT
            </div>
            <div className="text-[11px] text-zinc-500">{ageBands.band3.batches.length} Batches Active</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800 shadow-2xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              Critical (&gt;{criticalDays}d)
            </div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {ageBands.critical.mt.toFixed(1)} MT
            </div>
            <div className="text-[11px] text-rose-500 font-semibold">{ageBands.critical.batches.length} Batches Require Dispatch</div>
          </div>
        </div>

        {/* Visual Ageing Bar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-900 dark:text-white">Godown Silo Stock Ageing Distribution</span>
            <span className="font-mono text-zinc-500">Total: {totalActiveStockMt.toFixed(1)} MT</span>
          </div>

          <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex shadow-inner">
            {totalActiveStockMt > 0 && (
              <>
                <div
                  style={{ width: `${(ageBands.band1.mt / totalActiveStockMt) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`0-30d: ${ageBands.band1.mt} MT`}
                />
                <div
                  style={{ width: `${(ageBands.band2.mt / totalActiveStockMt) * 100}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`31-60d: ${ageBands.band2.mt} MT`}
                />
                <div
                  style={{ width: `${(ageBands.band3.mt / totalActiveStockMt) * 100}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`61-90d: ${ageBands.band3.mt} MT`}
                />
                <div
                  style={{ width: `${(ageBands.band4.mt / totalActiveStockMt) * 100}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`>90d: ${ageBands.band4.mt} MT`}
                />
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tier 1 (&lt;30d)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Tier 2 (31-60d)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Tier 3 (61-90d)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Tier 4 (&gt;90d Critical)</span>
          </div>
        </div>

        {/* Oldest Batches Ranking Table (Section 12) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Oldest Active Batches (FIFO Dispatch Priority)
              </h3>
              <p className="text-xs text-zinc-500">Sorted strictly by storage age to prevent stock deterioration</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
              >
                <option value="all">All Commodities</option>
                {Object.entries(COMMODITY_METADATA).map(([k, m]) => (
                  <option key={k} value={k}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">FIFO Priority</th>
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Commodity & Variety</th>
                  <th className="py-3 px-3">Receipt Date</th>
                  <th className="py-3 px-3">Stock Age</th>
                  <th className="py-3 px-3">Official Expiry</th>
                  <th className="py-3 px-3 text-right">Available Qty</th>
                  <th className="py-3 px-3">Stack Location</th>
                  <th className="py-3 px-3">Alert Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {filteredBatches.map((b, idx) => {
                  const isCritical = b.ageDays >= criticalDays;
                  return (
                    <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                        }`}>
                          Rank #{idx + 1}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">{b.id}</td>

                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{b.commodityName}</div>
                        <div className="text-[11px] text-zinc-400">{b.variety}</div>
                      </td>

                      <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">{b.receiptDate}</td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCritical
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                            : b.ageDays > 90
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                        }`}>
                          {b.ageDays} days
                        </span>
                      </td>

                      {/* Expiry displayed separately from stock age (Section 12 requirement) */}
                      <td className="py-3 px-3 text-zinc-500 font-sans text-[11px]">{b.expiryDate}</td>

                      <td className="py-3 px-3 text-right font-bold text-zinc-900 dark:text-white">
                        {b.currentQuantityMt} MT
                      </td>

                      <td className="py-3 px-3 text-zinc-500">{b.stackLocation}</td>

                      <td className="py-3 px-3 font-sans">
                        {isCritical ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300">
                            Critical Alert
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                            Normal
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-sans">
                        <Link
                          href="/fifo"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                        >
                          <span>Allocate</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
