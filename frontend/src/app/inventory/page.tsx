'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA } from '../../lib/mock-data';
import { Batch, CommodityType, BatchStatus } from '../../types/inventory';
import { InwardStockModal } from '../../components/InwardStockModal';
import { 
  Boxes, 
  Search, 
  Filter, 
  ArrowUpDown, 
  PlusCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Eye, 
  X, 
  ChevronRight, 
  Building2, 
  Calendar,
  Layers,
  FileText,
  Sparkles
} from 'lucide-react';

export default function InventoryPage() {
  const { batches, selectedGodownId, setSelectedGodownId, allGodowns, addStockReceipt, updateBatchStatus } = useStockFlow();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'receiptDate' | 'ageDays' | 'quantity'>('receiptDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // asc = oldest first for FIFO!

  // Detail Drawer state
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered & Sorted batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      // Commodity filter
      if (selectedCommodity !== 'all' && b.commodity !== selectedCommodity) return false;

      // Status filter
      if (selectedStatus === 'active' && b.status !== 'active') return false;
      if (selectedStatus === 'quarantine' && b.status !== 'quarantine') return false;
      if (selectedStatus === 'exhausted' && b.status !== 'exhausted' && b.currentQuantityMt > 0.05) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.id.toLowerCase().includes(q) ||
          b.commodityName.toLowerCase().includes(q) ||
          b.supplier.toLowerCase().includes(q) ||
          b.variety.toLowerCase().includes(q) ||
          b.stackLocation.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'receiptDate') {
        const timeA = new Date(a.receiptDate).getTime();
        const timeB = new Date(b.receiptDate).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortBy === 'ageDays') {
        return sortOrder === 'asc' ? a.ageDays - b.ageDays : b.ageDays - a.ageDays;
      }
      if (sortBy === 'quantity') {
        return sortOrder === 'asc' ? a.currentQuantityMt - b.currentQuantityMt : b.currentQuantityMt - a.currentQuantityMt;
      }
      return 0;
    });
  }, [batches, selectedCommodity, selectedStatus, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredBatches.length / pageSize) || 1;
  const paginatedBatches = filteredBatches.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <AppShell pageTitle="Inventory Management" pageBreadcrumb="Inventory">
      <div className="space-y-6">
        {/* Top Header & Register Stock CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Food-Grain Inventory Lots
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Inspect batch status, calculate issued quantities, and identify oldest eligible stock for FIFO compliance.
            </p>
          </div>

          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Stock / Inward Rake</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search batch ID, supplier, variety, bay..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Commodity Filter */}
            <div>
              <select
                value={selectedCommodity}
                onChange={(e) => { setSelectedCommodity(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Commodities</option>
                {Object.entries(COMMODITY_METADATA).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Eligible</option>
                <option value="quarantine">Quarantine Locked</option>
                <option value="exhausted">Depleted / Zero Stock</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="receiptDate">Sort: Receipt Date</option>
                <option value="ageDays">Sort: Stock Age</option>
                <option value="quantity">Sort: Remaining Qty</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 transition"
                title={`Order: ${sortOrder === 'asc' ? 'Ascending (Oldest First)' : 'Descending'}`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Data Table (Section 8) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Showing {paginatedBatches.length} of {filteredBatches.length} batches</span>
            <span className="font-mono text-zinc-400">Chronological Sort (FIFO Priority: Ascending)</span>
          </div>

          {paginatedBatches.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-3">
              <Boxes className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No inventory batches match your filters</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try clearing search terms or status filters, or register a new incoming stock rake.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCommodity('all'); setSelectedStatus('all'); }}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-3">Batch ID</th>
                    <th className="py-3 px-3">Commodity & Variety</th>
                    <th className="py-3 px-3">Supplier Source</th>
                    <th className="py-3 px-3">Receipt Date</th>
                    <th className="py-3 px-3">Stock Age</th>
                    <th className="py-3 px-3 text-right">Received (MT)</th>
                    <th className="py-3 px-3 text-right">Issued (MT)</th>
                    <th className="py-3 px-3 text-right">Remaining (MT)</th>
                    <th className="py-3 px-3">Eligibility / Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {paginatedBatches.map((b, index) => {
                    const issuedMt = Math.max(0, Number((b.initialQuantityMt - b.currentQuantityMt).toFixed(2)));
                    const isOldestEligible = index === 0 && b.status === 'active' && b.currentQuantityMt > 0;
                    const isCriticalAge = b.ageDays > 180;

                    return (
                      <tr key={b.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition group">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{b.id}</span>
                            {isOldestEligible && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-300 dark:border-amber-800" title="Oldest Eligible Batch (FIFO Priority #1)">
                                FIFO #1
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 font-mono">{b.stackLocation}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">{b.commodityName}</div>
                          <div className="text-[11px] text-zinc-500 truncate max-w-[180px]">{b.variety}</div>
                        </td>

                        <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">
                          <div className="truncate max-w-[160px]">{b.supplier}</div>
                          <div className="text-[11px] text-zinc-400">{b.supplierState}</div>
                        </td>

                        <td className="py-3 px-3 font-mono text-zinc-700 dark:text-zinc-300">{b.receiptDate}</td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                            isCriticalAge
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                              : b.ageDays > 90
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {b.ageDays} days
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-mono text-zinc-500">{b.initialQuantityMt}</td>
                        <td className="py-3 px-3 text-right font-mono text-zinc-500">{issuedMt}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                          {b.currentQuantityMt}
                        </td>

                        <td className="py-3 px-3">
                          {b.status === 'quarantine' ? (
                            <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800">
                              Quarantine
                            </span>
                          ) : b.status === 'exhausted' || b.currentQuantityMt <= 0.01 ? (
                            <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-semibold">
                              Depleted
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                              Eligible (Active)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedBatch(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 text-zinc-700 dark:text-zinc-300 font-medium transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="text-zinc-500">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 disabled:opacity-50 text-zinc-700 dark:text-zinc-300"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 disabled:opacity-50 text-zinc-700 dark:text-zinc-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Batch Detail Drawer / Modal (Section 8 requirement) */}
        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-mono">{selectedBatch.id}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedBatch.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedBatch.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">{selectedBatch.commodityName} • {selectedBatch.variety}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grid attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                  <span className="text-zinc-500">Assigned Storage Location</span>
                  <div className="font-semibold text-zinc-900 dark:text-white mt-0.5">{selectedBatch.stackLocation}</div>
                  <div className="text-[11px] text-zinc-400">Bay ID: {selectedBatch.bayId}</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                  <span className="text-zinc-500">Grain Moisture Content</span>
                  <div className="font-semibold text-zinc-900 dark:text-white mt-0.5 font-mono">
                    {selectedBatch.moistureContentPercent}%
                  </div>
                  <div className="text-[11px] text-emerald-600">Safe threshold: &lt;12.0%</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                  <span className="text-zinc-500">Current Stock / Bag Count</span>
                  <div className="font-semibold text-zinc-900 dark:text-white mt-0.5 font-mono">
                    {selectedBatch.currentQuantityMt} MT ({selectedBatch.bagCount} bags)
                  </div>
                  <div className="text-[11px] text-zinc-400">Initial: {selectedBatch.initialQuantityMt} MT</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                  <span className="text-zinc-500">AGMARK Lab Report</span>
                  <div className="font-semibold text-zinc-900 dark:text-white mt-0.5 font-mono">
                    {selectedBatch.labReportNo}
                  </div>
                  <div className="text-[11px] text-zinc-400">Quality: {selectedBatch.qualityGrade}</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                  <span className="text-zinc-500">Receipt & Age</span>
                  <div className="font-semibold text-zinc-900 dark:text-white mt-0.5 font-mono">
                    {selectedBatch.receiptDate} ({selectedBatch.ageDays}d old)
                  </div>
                  <div className="text-[11px] text-zinc-400">Expiry: {selectedBatch.expiryDate}</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/80">
                  <span className="text-zinc-500">Fumigation Currency</span>
                  <div className="font-semibold text-zinc-900 dark:text-white mt-0.5 font-mono">
                    Due: {selectedBatch.fumigationDueDate}
                  </div>
                  <div className="text-[11px] text-zinc-400">Last: {selectedBatch.lastFumigationDate}</div>
                </div>
              </div>

              {/* Quarantine note if any */}
              {selectedBatch.quarantineReason && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
                  <strong>Quarantine Reason:</strong> {selectedBatch.quarantineReason}
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                {selectedBatch.status === 'active' ? (
                  <button
                    onClick={() => {
                      updateBatchStatus(selectedBatch.id, 'quarantine', 'Manual Quarantine by Godown Manager for re-testing');
                      setSelectedBatch(null);
                    }}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    Lock into Quarantine
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      updateBatchStatus(selectedBatch.id, 'active', 'Passed Secondary Lab Inspection');
                      setSelectedBatch(null);
                    }}
                    className="text-emerald-600 hover:underline font-semibold"
                  >
                    Release from Quarantine
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBatch(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                  <Link
                    href="/fifo"
                    onClick={() => setSelectedBatch(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Allocate in FIFO</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inward Stock Modal */}
        <InwardStockModal
          isOpen={isInwardModalOpen}
          onClose={() => setIsInwardModalOpen(false)}
          onAddBatch={(b) => {
            addStockReceipt({
              receiptNumber: `FCI/INW/2026/${Math.floor(1000 + Math.random() * 9000)}`,
              supplier: b.supplier,
              supplierState: b.supplierState,
              commodity: b.commodity,
              variety: b.variety,
              receiptDate: b.receiptDate,
              expiryDate: b.expiryDate,
              quantityMt: b.currentQuantityMt,
              qualityGrade: b.qualityGrade,
              stackLocation: b.stackLocation,
              bayId: b.bayId,
              moisturePercent: b.moistureContentPercent,
              labReportNo: b.labReportNo,
              createdBy: 'Rajesh Sharma (Godown Superintendent)',
            });
            setIsInwardModalOpen(false);
          }}
        />
      </div>
    </AppShell>
  );
}
