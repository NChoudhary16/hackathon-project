'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Warehouse, 
  Boxes, 
  Layers, 
  Truck, 
  PackagePlus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  PlusCircle, 
  ArrowRight, 
  Building2, 
  SlidersHorizontal,
  Flame,
  Activity,
  FileText,
  Search
} from 'lucide-react';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA } from '../../lib/mock-data';

interface ManagerDashboardViewProps {
  onOpenInwardModal?: () => void;
  onOpenDispatchModal?: () => void;
}

export function ManagerDashboardView({
  onOpenInwardModal,
  onOpenDispatchModal,
}: ManagerDashboardViewProps) {
  const {
    currentGodown,
    batches,
    challans,
    receipts,
    metrics,
    selectedGodownId,
    setSelectedGodownId,
    allGodowns,
  } = useStockFlow();

  const [activeBayFilter, setActiveBayFilter] = useState<string>('all');

  // Depot metrics
  const activeBatches = batches.filter((b) => b.status === 'active');
  const depotTotalMt = activeBatches.reduce((sum, b) => sum + b.currentQuantityMt, 0);
  const utilizationPercent = currentGodown.capacityMt > 0 
    ? Math.round((depotTotalMt / currentGodown.capacityMt) * 100) 
    : 0;

  // Stacks by Bay
  const bayMap: Record<string, { count: number; totalMt: number; highMoisture: boolean; criticalAge: boolean }> = {};
  for (const b of activeBatches) {
    const bay = b.bayId || 'Bay A-1';
    if (!bayMap[bay]) {
      bayMap[bay] = { count: 0, totalMt: 0, highMoisture: false, criticalAge: false };
    }
    bayMap[bay].count += 1;
    bayMap[bay].totalMt += b.currentQuantityMt;
    if (b.moistureContentPercent > 13) bayMap[bay].highMoisture = true;
    if (b.ageDays > 120) bayMap[bay].criticalAge = true;
  }

  // Critical Ageing lots needing urgent FIFO dispatch
  const criticalBatches = [...activeBatches]
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, 5);

  const pendingChallans = challans.filter((c) => c.status === 'Draft' || c.status === 'Allocated');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Godown Manager Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-950 via-zinc-900 to-blue-950 text-white p-6 sm:p-8 border border-blue-900/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
              <Warehouse className="w-3.5 h-3.5" />
              <span>Depot Superintendent Operations • {currentGodown.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Warehouse Storage, Stacks & Silo Logistics
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Supervising daily inward rail rake unloading, physical stack allocations, silo moisture limits, and priority FIFO outward dispatch queues for {currentGodown.district} district.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenInwardModal && (
              <button
                onClick={onOpenInwardModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <PackagePlus className="w-4 h-4" />
                <span>Log Inward Rake Receipt</span>
              </button>
            )}

            {onOpenDispatchModal && (
              <button
                onClick={onOpenDispatchModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition cursor-pointer"
              >
                <Truck className="w-4 h-4 text-blue-400" />
                <span>Initiate FIFO Dispatch</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Depot Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Depot Capacity</span>
            <Warehouse className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {currentGodown.capacityMt.toLocaleString()} <span className="text-xs font-normal text-zinc-500">MT</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">{currentGodown.siloCount} grain storage silos</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock On Hand</span>
            <Boxes className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {depotTotalMt.toFixed(1)} <span className="text-xs font-normal text-zinc-500">MT</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full" 
                style={{ width: `${Math.min(100, utilizationPercent)}%` }} 
              />
            </div>
            <span className="text-[10px] font-bold text-blue-600">{utilizationPercent}%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Stacks</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {activeBatches.length} <span className="text-xs font-normal text-zinc-500">Batches</span>
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">Mapped to physical bays</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical Ageing</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {activeBatches.filter(b => b.ageDays > 120).length} <span className="text-xs font-normal text-zinc-500">Lots</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">&gt;120 days since arrival</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inward Receipts</span>
            <PackagePlus className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {receipts.length} <span className="text-xs font-normal text-zinc-500">Recorded</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">This operational cycle</p>
        </div>
      </div>

      {/* WAREHOUSE STORAGE BAYS & STACK EXPLORER */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <Layers className="w-3.5 h-3.5" />
              <span>Physical Warehouse Layout</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
              Depot Silos & Storage Bays Utilization
            </h3>
            <p className="text-xs text-zinc-500">
              Live floor map of designated grain bays in {currentGodown.name}. Monitors stack occupancy and high moisture alerts.
            </p>
          </div>

          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition"
          >
            <span>Open Inventory Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
          {Object.entries(bayMap).map(([bay, data]) => (
            <div
              key={bay}
              className={`p-3.5 rounded-2xl border transition-all ${
                data.criticalAge
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : data.highMoisture
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  : 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-900 dark:text-white">{bay}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                  {data.count} lots
                </span>
              </div>

              <div className="mt-2">
                <div className="text-lg font-black text-zinc-900 dark:text-white">
                  {data.totalMt.toFixed(1)} <span className="text-[11px] font-normal text-zinc-500">MT</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[10px]">
                {data.criticalAge ? (
                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Ageing Alert</span>
                  </span>
                ) : data.highMoisture ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Moisture &gt;13%</span>
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Optimal</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OPERATIONAL FIFO DISPATCH RADAR & INWARD RAKES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent FIFO Dispatch Radar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  FIFO Priority Dispatch Queue (Oldest Grain First)
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Statutory FIFO protocol mandates dispatching these oldest lots first
                </p>
              </div>
            </div>

            <Link
              href="/fifo"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Run Allocator
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 mt-2">
            {criticalBatches.map((batch, idx) => (
              <div key={batch.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {batch.id}
                    </span>
                    {idx === 0 && (
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        Priority #1
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    {batch.commodityName} • Location: <strong className="text-zinc-700 dark:text-zinc-300">{batch.stackLocation}</strong>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-zinc-900 dark:text-white">
                    {batch.currentQuantityMt} MT ({batch.bagCount} bags)
                  </div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                    Age: {batch.ageDays} days
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inward Receipts Queue */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                <PackagePlus className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Recent Inward Consignments & Rail Rakes
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Procurement stock unloaded and taken on depot inventory books
                </p>
              </div>
            </div>

            <Link
              href="/receipts"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              All Receipts
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 mt-2">
            {receipts.slice(0, 5).map((r) => (
              <div key={r.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {r.receiptNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {r.receiptDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate max-w-xs">
                    {r.supplier} • {r.variety}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-zinc-900 dark:text-white">
                    {r.receivedQuantityMt} MT
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {r.qualityGrade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
