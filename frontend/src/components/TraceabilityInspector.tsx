'use client';

import React, { useState } from 'react';
import { 
  GitCommit, 
  ArrowRight, 
  Search, 
  Calendar, 
  Truck, 
  Store, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  PackagePlus, 
  Boxes, 
  History, 
  CheckCircle2, 
  Clock, 
  User, 
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStockFlow } from '../lib/stockflow-context';

interface TraceabilityInspectorProps {
  initialBatchId?: string;
}

export function TraceabilityInspector({ initialBatchId }: TraceabilityInspectorProps) {
  const { batches, receipts, challans, movements, auditLogs, fifoExceptions, fairPriceShops } = useStockFlow();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId || batches[0]?.id || 'BATCH-WHT-2025-081'
  );

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const linkedReceipt = receipts.find((r) => r.batchIdentifier === selectedBatch?.id);
  const relatedMovements = movements.filter((m) => m.batchId === selectedBatch?.id);
  const relatedChallans = challans.filter((c) =>
    c.allocatedBatches.some((a) => a.batchId === selectedBatch?.id)
  );
  const relatedExceptions = fifoExceptions.filter(
    (e) => e.requestedBatchId === selectedBatch?.id || e.bypassedBatchId === selectedBatch?.id
  );
  const relatedAuditLogs = auditLogs.filter(
    (a) => a.entityId === selectedBatch?.id || relatedChallans.some((c) => c.id === a.entityId)
  );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
      {/* Header and Batch Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <GitCommit className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              End-to-End Batch Traceability Lineage
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Trace this inventory batch from inward supplier receipt to stack storage, outward dispatches, and audit logs.
          </p>
        </div>

        {/* Quick Batch Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-500 whitespace-nowrap">
            Select Batch:
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.commodityName} ({b.currentQuantityMt} MT rem)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Card for the Batch */}
      {selectedBatch && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs">
          <div>
            <span className="text-zinc-500 block text-[11px]">Batch Identifier</span>
            <span className="font-bold text-zinc-900 dark:text-white font-mono">{selectedBatch.id}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Commodity & Variety</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
              {selectedBatch.commodityName} ({selectedBatch.variety})
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Stack Location</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {selectedBatch.stackLocation} (Bay {selectedBatch.bayId})
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[11px]">Balance / Initial</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {selectedBatch.currentQuantityMt} MT <span className="text-zinc-400 font-normal">/ {selectedBatch.initialQuantityMt} MT</span>
            </span>
          </div>
        </div>
      )}

      {/* Chronological Pipeline Flow */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
        
        {/* STAGE 1: INWARD RECEIPT */}
        <div className="relative">
          <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/80 border-2 border-blue-600 flex items-center justify-center text-blue-600">
            <PackagePlus className="w-3 h-3" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span>Stage 1: Inward Rail / Mandi Receipt</span>
                {linkedReceipt?.status === 'VERIFIED' && (
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                    AGMARK Verified
                  </span>
                )}
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedBatch?.receiptDate} ({selectedBatch?.ageDays} days ago)
              </span>
            </div>

            <p className="text-xs text-zinc-800 dark:text-zinc-200">
              Procured from <strong>{selectedBatch?.supplier}</strong> ({selectedBatch?.supplierState}).
              Total received: <strong>{selectedBatch?.initialQuantityMt} MT</strong> ({selectedBatch?.bagCount} bags @ 50kg standard).
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-500 font-mono">
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                Receipt #: {linkedReceipt?.receiptNumber || 'RCP-RECORDED'}
              </span>
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                Lab Report: {selectedBatch?.labReportNo}
              </span>
              <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                Moisture: {selectedBatch?.moistureContentPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* STAGE 2: PHYSICAL STACKING & QUALITY ASSURANCE */}
        <div className="relative">
          <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/80 border-2 border-purple-600 flex items-center justify-center text-purple-600">
            <Boxes className="w-3 h-3" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Stage 2: Stacking & Periodic Quality Assurance
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                selectedBatch?.status === 'active'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}>
                {selectedBatch?.status}
              </span>
            </div>

            <p className="text-xs text-zinc-700 dark:text-zinc-300">
              Stored in <strong>{selectedBatch?.stackLocation}</strong>. Quality grade designated as{' '}
              <strong className="text-zinc-900 dark:text-white">{selectedBatch?.qualityGrade}</strong>.
              Fumigation cycle scheduled for <strong>{selectedBatch?.fumigationDueDate}</strong> (Last executed: {selectedBatch?.lastFumigationDate}).
            </p>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500 text-[10px] block">Stock Age</span>
                <span className="font-bold text-zinc-900 dark:text-white">{selectedBatch?.ageDays} Days</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500 text-[10px] block">Spoilage Risk Score</span>
                <span className={`font-bold ${
                  (selectedBatch?.spoilageRiskScore || 0) > 50 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {selectedBatch?.spoilageRiskScore || 0} / 100
                </span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500 text-[10px] block">Current Status</span>
                <span className="font-semibold text-zinc-900 dark:text-white capitalize">{selectedBatch?.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* STAGE 3: ALLOCATIONS & DELIVERY CHALLANS */}
        <div className="relative">
          <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-600 flex items-center justify-center text-emerald-600">
            <Truck className="w-3 h-3" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Stage 3: Outward Dispatches & FPS Delivery Challans
              </span>
              <span className="text-xs font-semibold text-zinc-500">
                {relatedChallans.length} Challan(s) Linked
              </span>
            </div>

            {relatedChallans.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">
                No dispatches have drawn stock from this batch yet. 100% of initial tonnage remains available.
              </p>
            ) : (
              <div className="space-y-2">
                {relatedChallans.map((c) => {
                  const alloc = c.allocatedBatches.find((a) => a.batchId === selectedBatch?.id);
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-zinc-900 dark:text-white font-mono">{c.id}</strong>
                          <span className="text-zinc-500">&bull; {c.dispatchDate}</span>
                          {c.isFifoCompliant ? (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 text-[10px] font-bold">
                              Strict FIFO
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-bold">
                              Deviation Authorized
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                          Destination: <strong>{c.fpsName}</strong> ({c.fpsDistrict}) &bull; Vehicle: <strong>{c.vehicleNumber}</strong> (Driver: {c.driverName})
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                          -{alloc?.allocatedMt || 0} MT ({alloc?.bags || 0} bags)
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Gate Pass: {c.gatePassNo}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* STAGE 4: REGULATORY FIFO & AUDIT LEDGER */}
        <div className="relative">
          <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-600 flex items-center justify-center text-amber-600">
            <History className="w-3 h-3" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Stage 4: Regulatory FIFO Compliance & Audit Ledger
              </span>
              <span className="text-xs text-zinc-500">
                {relatedMovements.length} movement event(s)
              </span>
            </div>

            {/* Any FIFO Exceptions */}
            {relatedExceptions.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Documented Regulatory Deviation Record</span>
                </div>
                {relatedExceptions.map((ex) => (
                  <p key={ex.id} className="text-zinc-700 dark:text-zinc-300">
                    Exception #{ex.id}: {ex.reason} — Approved by <strong>{ex.approvedBy}</strong> ({ex.approvedRole}) on {ex.timestamp.slice(0, 10)}.
                  </p>
                ))}
              </div>
            )}

            {/* Movements history */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
              {relatedMovements.map((m) => (
                <div key={m.id} className="p-2.5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      m.quantityDeltaMt > 0 ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-white">{m.movementType}</span>
                      <p className="text-[11px] text-zinc-500">{m.reason}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono font-bold ${
                      m.quantityDeltaMt > 0 ? 'text-blue-600' : 'text-emerald-600'
                    }`}>
                      {m.quantityDeltaMt > 0 ? `+${m.quantityDeltaMt}` : `${m.quantityDeltaMt}`} MT
                    </span>
                    <span className="text-[10px] text-zinc-400 block">{m.timestamp.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
