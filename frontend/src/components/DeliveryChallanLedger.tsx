'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Truck, 
  Eye, 
  Printer, 
  Search, 
  Filter, 
  Calendar, 
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DeliveryChallan } from '../types/inventory';
import { ChallanPrintModal } from './ChallanPrintModal';

interface DeliveryChallanLedgerProps {
  challans: DeliveryChallan[];
  onOpenDispatchModal: () => void;
}

export function DeliveryChallanLedger({ challans, onOpenDispatchModal }: DeliveryChallanLedgerProps) {
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);
  const [filterCompliance, setFilterCompliance] = useState<'all' | 'compliant' | 'deviated'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredChallans = challans.filter((c) => {
    if (filterCompliance === 'compliant' && !c.isFifoCompliant) return false;
    if (filterCompliance === 'deviated' && c.isFifoCompliant) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.fpsName.toLowerCase().includes(q) ||
        c.vehicleNumber.toLowerCase().includes(q) ||
        c.commodityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Challan No, FPS Store, Vehicle or Commodity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCompliance}
            onChange={(e) => setFilterCompliance(e.target.value as any)}
            className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">All Compliance Statuses</option>
            <option value="compliant">Strict FIFO Compliant Only</option>
            <option value="deviated">Authorized Deviations Only</option>
          </select>

          <button
            onClick={onOpenDispatchModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>Generate New DC</span>
          </button>
        </div>
      </div>

      {/* Challan Table / Cards */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Challan / Date</th>
                <th className="py-3 px-4">Destination FPS</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4 text-right">Quantity / Bags</th>
                <th className="py-3 px-4">Vehicle & Driver</th>
                <th className="py-3 px-4 text-center">FIFO Status</th>
                <th className="py-3 px-4 text-center">Dispatch State</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredChallans.map((challan) => (
                <tr key={challan.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {challan.id}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {challan.dispatchDate}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {challan.fpsName}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate">
                      {challan.fpsDistrict} • Code: {challan.fpsId}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {challan.commodityName}
                    </span>
                    <div className="text-[10px] text-zinc-400">
                      {challan.allocatedBatches.length} batch(es) split
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono">
                    <div className="font-bold text-blue-600 dark:text-blue-400">
                      {challan.totalQuantityMt.toFixed(1)} MT
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {challan.totalBags.toLocaleString()} bags
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">
                      {challan.vehicleNumber}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {challan.driverName}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {challan.isFifoCompliant ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Deviation
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      challan.status === 'Acknowledged_FPS'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {challan.status === 'Acknowledged_FPS' ? 'Acknowledged' : challan.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedChallan(challan)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-medium text-xs transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View DC</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Modal Trigger */}
      <ChallanPrintModal
        challan={selectedChallan}
        onClose={() => setSelectedChallan(null)}
      />
    </div>
  );
}
