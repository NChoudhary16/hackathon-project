'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA } from '../../lib/mock-data';
import { MovementType, StockMovement } from '../../types/inventory';
import { 
  History, 
  Search, 
  Filter, 
  ArrowDownRight, 
  ArrowUpRight, 
  RotateCcw, 
  Truck, 
  Warehouse, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar,
  Building2,
  FileText
} from 'lucide-react';

export default function MovementsPage() {
  const { movements, currentGodown } = useStockFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (selectedType !== 'all' && m.movementType !== selectedType) return false;
      if (selectedCommodity !== 'all' && m.commodity !== selectedCommodity) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.id.toLowerCase().includes(q) ||
          m.batchId.toLowerCase().includes(q) ||
          m.referenceId.toLowerCase().includes(q) ||
          m.commodityName.toLowerCase().includes(q) ||
          m.userRole.toLowerCase().includes(q) ||
          (m.reason && m.reason.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [movements, selectedType, selectedCommodity, searchQuery]);

  return (
    <AppShell pageTitle="Stock Movement Audit History" pageBreadcrumb="Movements">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Immutable Stock Movement Ledger
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Complete chronological audit trail of all receipts, FIFO dispatches, exceptions, and quarantine adjustments.
            </p>
          </div>

          <div className="text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
            Ledger Status: <span className="text-emerald-500 font-bold">Synchronized (100% Verified)</span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movement ID, batch, reference receipt/challan, officer..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Movement Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Movement Types</option>
                <option value="RECEIPT">Stock Receipts (Inward)</option>
                <option value="DISPATCH">FIFO Dispatches (Outward)</option>
                <option value="FIFO_EXCEPTION_DISPATCH">FIFO Exception Dispatches</option>
                <option value="QUARANTINE">Quarantine Lockouts</option>
                <option value="RELEASE">Quarantine Releases</option>
              </select>
            </div>

            {/* Commodity Filter */}
            <div>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Commodities</option>
                {Object.entries(COMMODITY_METADATA).map(([k, m]) => (
                  <option key={k} value={k}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Movement Ledger Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Showing {filteredMovements.length} logged stock movements</span>
            <span className="font-mono text-zinc-400">Strict Append-Only Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Movement ID</th>
                  <th className="py-3 px-3">Date & Timestamp</th>
                  <th className="py-3 px-3">Batch ID</th>
                  <th className="py-3 px-3">Commodity</th>
                  <th className="py-3 px-3">Movement Type</th>
                  <th className="py-3 px-3 text-right">Quantity Delta (MT)</th>
                  <th className="py-3 px-3 text-right">Bags Delta</th>
                  <th className="py-3 px-3">Reference (Receipt / Challan)</th>
                  <th className="py-3 px-3">Authorized Role</th>
                  <th className="py-3 px-3">Audit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                {filteredMovements.map((m) => {
                  const isPositive = m.quantityDeltaMt > 0;
                  const isZero = m.quantityDeltaMt === 0;

                  return (
                    <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                      <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">{m.id}</td>

                      <td className="py-3 px-3 text-zinc-500 font-sans text-[11px]">
                        {new Date(m.timestamp).toLocaleDateString()} {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 font-semibold">{m.batchId}</td>

                      <td className="py-3 px-3 font-sans text-zinc-700 dark:text-zinc-300">{m.commodityName}</td>

                      <td className="py-3 px-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.movementType === 'RECEIPT'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : m.movementType === 'FIFO_EXCEPTION_DISPATCH'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                            : m.movementType === 'QUARANTINE'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                        }`}>
                          {m.movementType}
                        </span>
                      </td>

                      <td className={`py-3 px-3 text-right font-bold ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : isZero ? 'text-zinc-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isPositive ? `+${m.quantityDeltaMt} MT` : `${m.quantityDeltaMt} MT`}
                      </td>

                      <td className={`py-3 px-3 text-right ${
                        isPositive ? 'text-emerald-600' : isZero ? 'text-zinc-400' : 'text-rose-600'
                      }`}>
                        {isPositive ? `+${m.bagsDelta}` : `${m.bagsDelta}`}
                      </td>

                      <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200">
                        <div>{m.referenceId}</div>
                        <div className="text-[11px] text-zinc-400 font-sans">{m.sourceOrDestination}</div>
                      </td>

                      <td className="py-3 px-3 font-sans text-zinc-500 text-[11px]">{m.userRole}</td>

                      <td className="py-3 px-3 font-sans text-zinc-500 text-[11px] max-w-xs truncate" title={m.reason}>
                        {m.reason || 'Routine inventory movement'}
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
