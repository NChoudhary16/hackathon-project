'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { DeliveryChallan } from '../../types/inventory';
import { ChallanPrintModal } from '../../components/ChallanPrintModal';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Truck, 
  Eye, 
  Printer, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Boxes,
  PlusCircle,
  Download
} from 'lucide-react';

export default function ChallansPage() {
  const { challans, currentGodown } = useStockFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompliance, setFilterCompliance] = useState<'all' | 'compliant' | 'deviated'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState<DeliveryChallan | null>(null);
  const [selectedChallanDetail, setSelectedChallanDetail] = useState<DeliveryChallan | null>(null);

  const filteredChallans = challans.filter((c) => {
    if (filterCompliance === 'compliant' && !c.isFifoCompliant) return false;
    if (filterCompliance === 'deviated' && c.isFifoCompliant) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.fpsName.toLowerCase().includes(q) ||
        c.vehicleNumber.toLowerCase().includes(q) ||
        c.commodityName.toLowerCase().includes(q) ||
        c.gatePassNo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell pageTitle="Delivery Challans & Gate Passes" pageBreadcrumb="Delivery Challans">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Official Delivery Challans Ledger
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Inspect multi-batch allocation splits, driver gate passes, and print official government delivery challans.
            </p>
          </div>

          <Link
            href="/fifo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Create FIFO Dispatch</span>
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search challan ID, FPS depot, vehicle, gate pass..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Compliance Filter */}
            <div>
              <select
                value={filterCompliance}
                onChange={(e) => setFilterCompliance(e.target.value as any)}
                className="w-full text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Compliance Statuses</option>
                <option value="compliant">100% Strict FIFO Compliant</option>
                <option value="deviated">Authorized FIFO Exception</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Dispatch Statuses</option>
                <option value="Loaded">Loaded (Ready at Siding)</option>
                <option value="In-Transit">In-Transit to FPS</option>
                <option value="Acknowledged_FPS">Acknowledged by FPS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Challan Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Showing {filteredChallans.length} of {challans.length} delivery challans</span>
            <span className="font-mono text-zinc-400">Cryptographically Sealed Gate Passes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Challan ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Destination FPS</th>
                  <th className="py-3 px-3">Commodity</th>
                  <th className="py-3 px-3 text-right">Net Qty (MT)</th>
                  <th className="py-3 px-3 text-right">Bags</th>
                  <th className="py-3 px-3">Batches Allocated</th>
                  <th className="py-3 px-3">Vehicle & Driver</th>
                  <th className="py-3 px-3">Compliance</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredChallans.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{c.id}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{c.gatePassNo}</div>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-500">{c.dispatchDate}</td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{c.fpsName}</div>
                      <div className="text-[11px] text-zinc-400">{c.fpsDistrict} ({c.fpsId})</div>
                    </td>

                    <td className="py-3 px-3 font-medium text-zinc-700 dark:text-zinc-300">{c.commodityName}</td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-white">
                      {c.totalQuantityMt} MT
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-zinc-500">{c.totalBags}</td>

                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-zinc-700 dark:text-zinc-300">
                          {c.allocatedBatches?.length || 1} Batch(es)
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                        {c.allocatedBatches?.map(b => b.batchId).join(', ')}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-zinc-700 dark:text-zinc-300">{c.vehicleNumber}</div>
                      <div className="text-[11px] text-zinc-400">{c.driverName}</div>
                    </td>

                    <td className="py-3 px-3">
                      {c.isFifoCompliant ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          100% FIFO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800" title={c.deviationJustification}>
                          Exception
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedChallanDetail(c)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition cursor-pointer"
                          title="View Batch Allocations"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedChallanForPrint(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-semibold transition cursor-pointer"
                          title="Print Official Challan"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Challan Breakdown Detail Modal (Section 11 requirement) */}
        {selectedChallanDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                      {selectedChallanDetail.id}
                    </h3>
                    <div className="text-xs text-zinc-500">
                      Dispatched to {selectedChallanDetail.fpsName} • Gate Pass: {selectedChallanDetail.gatePassNo}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedChallanDetail(null)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Multi-Batch Breakdown Table (Section 11) */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                  <span>Batch-Wise Allocation Breakdown</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Source Godown Inventory Batches</span>
                </div>

                <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                      <tr>
                        <th className="p-2.5">Source Batch ID</th>
                        <th className="p-2.5">Stack Location</th>
                        <th className="p-2.5">Receipt Date</th>
                        <th className="p-2.5 text-right">Allocated Qty</th>
                        <th className="p-2.5 text-right">Bags</th>
                        <th className="p-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                      {selectedChallanDetail.allocatedBatches?.map((b) => (
                        <tr key={b.batchId}>
                          <td className="p-2.5 font-bold text-blue-600 dark:text-blue-400">{b.batchId}</td>
                          <td className="p-2.5 text-zinc-600 dark:text-zinc-400">{b.stackLocation}</td>
                          <td className="p-2.5 text-zinc-500">{b.receiptDate}</td>
                          <td className="p-2.5 text-right font-bold text-zinc-900 dark:text-white">{b.allocatedMt} MT</td>
                          <td className="p-2.5 text-right text-zinc-500">{b.bags}</td>
                          <td className="p-2.5 text-right">
                            <Link
                              href="/inventory"
                              onClick={() => setSelectedChallanDetail(null)}
                              className="text-xs text-blue-600 hover:underline font-sans font-semibold"
                            >
                              View Batch
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Exception Note if present */}
              {selectedChallanDetail.deviationJustification && (
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300 text-xs space-y-1">
                  <strong>Authorized Exception Justification:</strong>
                  <p className="text-[11px] leading-relaxed">{selectedChallanDetail.deviationJustification}</p>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 pt-1">
                    Authorized Officer: {selectedChallanDetail.authorizedByOfficer || 'District Food Controller'}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                <span className="font-mono text-zinc-500">Gross Weight: {selectedChallanDetail.grossWeightKg} kg • Tare: {selectedChallanDetail.tareWeightKg} kg</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedChallanDetail(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedChallanForPrint(selectedChallanDetail);
                      setSelectedChallanDetail(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Challan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Print Modal */}
        {selectedChallanForPrint && (
          <ChallanPrintModal
            isOpen={!!selectedChallanForPrint}
            onClose={() => setSelectedChallanForPrint(null)}
            challan={selectedChallanForPrint}
          />
        )}
      </div>
    </AppShell>
  );
}
