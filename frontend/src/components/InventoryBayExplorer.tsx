'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Wheat, 
  Search, 
  Filter, 
  Droplet, 
  ArrowUpRight,
  Flame,
  BadgeAlert,
  Calendar,
  Lock,
  Plus
} from 'lucide-react';
import { Batch, CommodityType } from '../types/inventory';
import { COMMODITY_METADATA } from '../lib/mock-data';

interface InventoryBayExplorerProps {
  batches: Batch[];
  onSelectBatchForDispatch: (commodity: CommodityType) => void;
  onOpenInwardModal: () => void;
}

export function InventoryBayExplorer({
  batches,
  onSelectBatchForDispatch,
  onOpenInwardModal,
}: InventoryBayExplorerProps) {
  const [selectedCommodityFilter, setSelectedCommodityFilter] = useState<string>('all');
  const [selectedAgeFilter, setSelectedAgeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter batches
  const filteredBatches = batches.filter((batch) => {
    if (selectedCommodityFilter !== 'all' && batch.commodity !== selectedCommodityFilter) {
      return false;
    }
    if (selectedAgeFilter === 'critical' && batch.ageDays <= 180) return false;
    if (selectedAgeFilter === 'priority' && (batch.ageDays <= 90 || batch.ageDays > 180)) return false;
    if (selectedAgeFilter === 'fresh' && batch.ageDays > 30) return false;
    if (selectedAgeFilter === 'quarantine' && batch.qualityGrade !== 'Quarantine') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        batch.id.toLowerCase().includes(q) ||
        batch.stackLocation.toLowerCase().includes(q) ||
        batch.supplier.toLowerCase().includes(q) ||
        batch.variety.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate sorted rank for eligible active batches per commodity
  const getFifoRank = (batch: Batch): number | null => {
    if (batch.status !== 'active' || batch.qualityGrade === 'Quarantine' || batch.currentQuantityMt <= 0) {
      return null;
    }
    const sameCommodityBatches = batches
      .filter((b) => b.commodity === batch.commodity && b.status === 'active' && b.currentQuantityMt > 0)
      .sort((a, b) => new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime());
    const rank = sameCommodityBatches.findIndex((b) => b.id === batch.id);
    return rank !== -1 ? rank + 1 : null;
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stack, batch code, supplier or variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Commodity Filter */}
          <select
            value={selectedCommodityFilter}
            onChange={(e) => setSelectedCommodityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">All Commodities</option>
            {Object.entries(COMMODITY_METADATA).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.name}
              </option>
            ))}
          </select>

          {/* Age Tier Filter */}
          <select
            value={selectedAgeFilter}
            onChange={(e) => setSelectedAgeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">All Age Tiers</option>
            <option value="critical">Critical Ageing (&gt;180 Days)</option>
            <option value="priority">Priority Dispatch (91-180 Days)</option>
            <option value="fresh">Fresh Receipt (&lt;30 Days)</option>
            <option value="quarantine">Quarantine Vault Only</option>
          </select>

          <button
            onClick={onOpenInwardModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Inward Batch</span>
          </button>
        </div>
      </div>

      {/* Godown Bay Map / Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBatches.map((batch) => {
          const fifoRank = getFifoRank(batch);
          const meta = COMMODITY_METADATA[batch.commodity];
          const isQuarantine = batch.qualityGrade === 'Quarantine';
          const isCriticalAge = batch.ageDays > 180;
          const isPriorityAge = batch.ageDays > 90 && batch.ageDays <= 180;

          return (
            <div
              key={batch.id}
              className={`relative rounded-2xl border p-5 transition-all hover:shadow-md ${
                isQuarantine
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : fifoRank === 1
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {/* Stack Bay Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {batch.id}
                    </span>
                    {fifoRank !== null && (
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          fifoRank === 1
                            ? 'bg-emerald-500 text-white ring-2 ring-emerald-200 dark:ring-emerald-900'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        FIFO Rank #{fifoRank} {fifoRank === 1 ? '• Oldest' : ''}
                      </span>
                    )}
                    {isQuarantine && (
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                        Quarantine Lock
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {batch.stackLocation}
                  </p>
                </div>

                <div className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${meta.accentBg}`}>
                  {meta.name}
                </div>
              </div>

              {/* Grain details */}
              <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                <p>
                  <strong className="text-zinc-800 dark:text-zinc-200">Variety:</strong> {batch.variety}
                </p>
                <p className="truncate" title={batch.supplier}>
                  <strong className="text-zinc-800 dark:text-zinc-200">Supplier:</strong> {batch.supplier}
                </p>
                {batch.quarantineReason && (
                  <p className="text-rose-700 dark:text-rose-400 font-medium bg-rose-100/60 dark:bg-rose-950/60 p-2 rounded-lg mt-1">
                    ⚠ {batch.quarantineReason}
                  </p>
                )}
              </div>

              {/* Metric Indicators Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-center mb-4">
                {/* Age */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                    Age
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      isCriticalAge
                        ? 'text-rose-600 dark:text-rose-400'
                        : isPriorityAge
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {batch.ageDays}d
                  </span>
                </div>

                {/* Moisture */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                    Moisture
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      batch.moistureContentPercent > 13.0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {batch.moistureContentPercent}%
                  </span>
                </div>

                {/* Spoilage Risk */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block">
                    Risk
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      batch.spoilageRiskScore > 70
                        ? 'text-rose-600 dark:text-rose-400'
                        : batch.spoilageRiskScore > 35
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {batch.spoilageRiskScore}/100
                  </span>
                </div>
              </div>

              {/* Stock Capacity & Allocation action */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                    {batch.currentQuantityMt.toFixed(1)} MT
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {batch.bagCount.toLocaleString()} standard bags
                  </div>
                </div>

                {!isQuarantine && batch.currentQuantityMt > 0 && (
                  <button
                    onClick={() => onSelectBatchForDispatch(batch.commodity)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition cursor-pointer"
                  >
                    <span>Allocate FIFO</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
