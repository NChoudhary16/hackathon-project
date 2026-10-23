'use client';

import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Truck, 
  Warehouse, 
  FileText, 
  Building2, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  QrCode,
  ArrowRight,
  Sparkles,
  FlaskConical,
  Scale
} from 'lucide-react';
import { Batch, DeliveryChallan } from '../types/inventory';
import { COMMODITY_METADATA } from '../lib/mock-data';

interface TraceabilityTimelineProps {
  batches: Batch[];
  challans: DeliveryChallan[];
}

export function TraceabilityTimeline({ batches, challans }: TraceabilityTimelineProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeBatch = batches.find((b) => b.id === selectedBatchId) || batches[0];
  const meta = activeBatch ? COMMODITY_METADATA[activeBatch.commodity] : null;

  // Find challans that utilized this batch
  const relatedChallans = challans.filter((c) =>
    c.allocatedBatches.some((b) => b.batchId === activeBatch?.id)
  );

  return (
    <div className="space-y-6">
      {/* Batch Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>End-to-End Batch-to-FPS Provenance Traceability</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Trace foodgrains from farm procurement hubs through godown silos to fair price shop ration dealers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
            Select Batch:
          </label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm font-mono font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} ({b.commodityName} - {b.stackLocation})
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeBatch && meta && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Batch Quick Card */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {activeBatch.id}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${meta.accentBg}`}>
                  {meta.name}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  {activeBatch.variety}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Supplier: {activeBatch.supplier} ({activeBatch.supplierState})
                </p>
              </div>

              <div className="space-y-2 text-xs border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Current Balance:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {activeBatch.currentQuantityMt} / {activeBatch.initialQuantityMt} MT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Intake Date:</span>
                  <span className="font-medium">{activeBatch.receiptDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Stack Location:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{activeBatch.stackLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Moisture Content:</span>
                  <span className="font-bold">{activeBatch.moistureContentPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Quality Certificate:</span>
                  <span className="font-mono">{activeBatch.labReportNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Fumigation Due:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">{activeBatch.fumigationDueDate}</span>
                </div>
              </div>
            </div>

            {/* Related Challans */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                Linked Delivery Challans ({relatedChallans.length})
              </h4>
              {relatedChallans.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No dispatches executed from this lot yet.</p>
              ) : (
                <div className="space-y-2">
                  {relatedChallans.map((rc) => (
                    <div key={rc.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
                      <div className="flex justify-between font-mono font-bold">
                        <span>{rc.id}</span>
                        <span className="text-blue-600 dark:text-blue-400">{rc.totalQuantityMt} MT</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1 truncate">
                        {rc.fpsName} ({rc.fpsDistrict})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right 2 Columns: Provenance Chain Steps */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wider text-zinc-500">
              Verified Chronological Lifecycle Chain
            </h3>

            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {/* Step 1: Procurement */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Stage 1 • Mandi Procurement & Railhead Transit
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">{activeBatch.receiptDate}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                    Consignment Received from {activeBatch.supplier}
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Initial intake consignment of {activeBatch.initialQuantityMt} MT standard jute bags. Weighbridge tare/gross verified with Railhead receipt note.
                  </p>
                </div>
              </div>

              {/* Step 2: Quality Inspection */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                  <FlaskConical className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      Stage 2 • Quality Lab Certification & Stack Stacking
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">Certificate #{activeBatch.labReportNo}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                    Assigned to {activeBatch.stackLocation} (Grade: {activeBatch.qualityGrade})
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Lab analysis measured grain moisture at {activeBatch.moistureContentPercent}%. Passed foreign matter test (&lt;0.5%), weevil check, and grain size grading.
                  </p>
                </div>
              </div>

              {/* Step 3: Godown Ageing & Fumigation */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Stage 3 • Godown Residence & Preservation
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">{activeBatch.ageDays} Days in Silo</span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                    Proactive Pest Treatment & Stack Moisture Monitoring
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Last fumigation: {activeBatch.lastFumigationDate} • Next scheduled inspection: {activeBatch.fumigationDueDate}. Current spoilage risk index calculated at {activeBatch.spoilageRiskScore}/100.
                  </p>
                </div>
              </div>

              {/* Step 4: Deterministic FIFO Allocation */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs shadow-xs">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      Stage 4 • FIFO Allocation Algorithm Execution
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">100% Deterministic</span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                    Strict Earliest-In Queue Position
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Batches are prioritized strictly by calendar intake date to enforce zero rotting of older buffer stocks before newer harvest arrivals are touched.
                  </p>
                </div>
              </div>

              {/* Step 5: Last Mile FPS Delivery */}
              <div className="relative">
                <div className="absolute -left-[30px] top-0 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shadow-xs">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                      Stage 5 • Target Fair Price Shop (FPS)
                    </span>
                    <span className="text-[11px] text-zinc-400">Beneficiary Ration Distribution</span>
                  </div>
                  <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
                    Delivered with QR Digital Authentication
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Final handoff verified against FPS dealer e-PoS device with biometric ration distribution to Antyodaya and Priority Household (PHH) cardholders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
