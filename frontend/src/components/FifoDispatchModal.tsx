'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Truck, 
  FileText, 
  Clock, 
  Layers, 
  Scale, 
  UserCheck, 
  Sparkles,
  Info,
  Calendar,
  Hash
} from 'lucide-react';
import { Batch, CommodityType, DeliveryChallan, FairPriceShop, FifoCalculationResult } from '../types/inventory';
import { calculateDeterministicFifoAllocation, evaluateManualDeviation } from '../lib/fifo-engine';
import { COMMODITY_METADATA } from '../lib/mock-data';

interface FifoDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: Batch[];
  fairPriceShops: FairPriceShop[];
  onDispatchCreated: (challan: DeliveryChallan, updatedBatches: Batch[]) => void;
  initialCommodity?: CommodityType;
}

export function FifoDispatchModal({
  isOpen,
  onClose,
  batches,
  fairPriceShops,
  onDispatchCreated,
  initialCommodity = 'wheat',
}: FifoDispatchModalProps) {
  const [commodity, setCommodity] = useState<CommodityType>(initialCommodity);
  const [targetFpsId, setTargetFpsId] = useState<string>(fairPriceShops[0]?.id || '');
  const [requestedQuantityMt, setRequestedQuantityMt] = useState<number>(65.0);
  const [vehicleNumber, setVehicleNumber] = useState<string>('DL 1M 8831');
  const [driverName, setDriverName] = useState<string>('Rajinder Singh');
  const [driverPhone, setDriverPhone] = useState<string>('+91 98110 54321');

  // Manual deviation simulation mode
  const [isManualOverrideMode, setIsManualOverrideMode] = useState<boolean>(false);
  const [manualSelectedBatchIds, setManualSelectedBatchIds] = useState<string[]>([]);
  const [deviationReason, setDeviationReason] = useState<string>('Physical Bay Obstruction: Forklift / conveyor malfunction in stack bay preventing egress.');
  const [officerName, setOfficerName] = useState<string>('R. K. Meena (Assistant Food Controller)');
  const [officerPin, setOfficerPin] = useState<string>('8421');

  // Calculate deterministic FIFO allocation
  const fifoResult: FifoCalculationResult = useMemo(() => {
    return calculateDeterministicFifoAllocation(commodity, requestedQuantityMt, batches);
  }, [commodity, requestedQuantityMt, batches]);

  // Check manual deviation if enabled
  const deviationEval = useMemo(() => {
    if (!isManualOverrideMode) return { isDeviated: false, skippedOlderBatches: [], deviationSummary: '' };
    return evaluateManualDeviation(manualSelectedBatchIds, batches, commodity);
  }, [isManualOverrideMode, manualSelectedBatchIds, batches, commodity]);

  if (!isOpen) return null;

  const currentMetadata = COMMODITY_METADATA[commodity];
  const selectedFps = fairPriceShops.find((f) => f.id === targetFpsId) || fairPriceShops[0];

  // Eligible active batches for this commodity
  const eligibleBatches = batches
    .filter((b) => b.commodity === commodity && b.status === 'active' && b.currentQuantityMt > 0)
    .sort((a, b) => new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime());

  const handleGenerateChallan = () => {
    // Generate Delivery Challan
    const challanId = `PDS/DC/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const isCompliant = !isManualOverrideMode || !deviationEval.isDeviated;

    // Determine which batches were allocated
    const allocatedBatchesSummary = fifoResult.allocations.map((a) => ({
      batchId: a.batchId,
      stackLocation: a.stackLocation,
      allocatedMt: a.allocatedMt,
      bags: a.allocatedBags,
      receiptDate: a.receiptDate,
    }));

    // Update batch stock levels in memory
    const updatedBatches = batches.map((batch) => {
      const allocated = fifoResult.allocations.find((a) => a.batchId === batch.id);
      if (allocated) {
        const remaining = Math.max(0, batch.currentQuantityMt - allocated.allocatedMt);
        return {
          ...batch,
          currentQuantityMt: Number(remaining.toFixed(2)),
          bagCount: Math.round(remaining * 20),
          status: remaining <= 0.05 ? ('exhausted' as const) : batch.status,
        };
      }
      return batch;
    });

    const netWeight = fifoResult.allocatedMt * 1000;
    const tareWeight = 14500;
    const grossWeight = tareWeight + netWeight;

    const newChallan: DeliveryChallan = {
      id: challanId,
      dispatchDate: '2026-10-22',
      fpsId: selectedFps.id,
      fpsName: selectedFps.name,
      fpsDistrict: selectedFps.district,
      commodity,
      commodityName: currentMetadata.name,
      totalQuantityMt: fifoResult.allocatedMt,
      totalBags: fifoResult.totalBags,
      vehicleNumber,
      driverName,
      driverPhone,
      godownDepot: 'FCI Central Depot Okhla (Unit-4)',
      allocatedBatches: allocatedBatchesSummary,
      isFifoCompliant: isCompliant,
      deviationJustification: isCompliant ? undefined : deviationReason,
      authorizedByOfficer: isCompliant ? undefined : officerName,
      authorizationPinUsed: !isCompliant,
      status: 'Allocated',
      qrCodeSignature: `${isCompliant ? 'VERIFIED-FIFO' : 'AUTH-DEVIATION'}-${challanId.replace(/\//g, '-')}-${Date.now().toString(16)}`,
      grossWeightKg: grossWeight,
      tareWeightKg: tareWeight,
      netWeightKg: netWeight,
      gatePassNo: `GP-2026-OKH-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onDispatchCreated(newChallan, updatedBatches);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Deterministic FIFO Stock Allocation Engine
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Guaranteed oldest-stock prioritization adhering strictly to FCI Storage Regulations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Form Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Commodity select */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                Select Commodity
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value as CommodityType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {Object.entries(COMMODITY_METADATA).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.name} ({meta.hindiName})
                  </option>
                ))}
              </select>
            </div>

            {/* Target FPS */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                Target Fair Price Shop (FPS)
              </label>
              <select
                value={targetFpsId}
                onChange={(e) => setTargetFpsId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {fairPriceShops.map((fps) => (
                  <option key={fps.id} value={fps.id}>
                    {fps.name} ({fps.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Requested Quantity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Demand Quantity (MT)
                </label>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {requestedQuantityMt} MT ({Math.round(requestedQuantityMt * 20)} Bags)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={requestedQuantityMt}
                  onChange={(e) => setRequestedQuantityMt(parseFloat(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={requestedQuantityMt}
                  onChange={(e) => setRequestedQuantityMt(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-20 px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Card */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-semibold text-sm text-blue-950 dark:text-blue-200">
                  Deterministic Multi-Batch Allocation Result
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                  {fifoResult.auditHash}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {fifoResult.isFullyFulfilled ? '100% Demand Fulfilled' : 'Partial Stock Available'}
                </span>
              </div>
            </div>

            {/* Allocation Table */}
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="py-2.5 px-3">Priority Rank</th>
                    <th className="py-2.5 px-3">Batch Code</th>
                    <th className="py-2.5 px-3">Stack Location</th>
                    <th className="py-2.5 px-3">Receipt Date</th>
                    <th className="py-2.5 px-3">Godown Age</th>
                    <th className="py-2.5 px-3">Moisture %</th>
                    <th className="py-2.5 px-3 text-right">Allocated MT</th>
                    <th className="py-2.5 px-3 text-right">50kg Bags</th>
                    <th className="py-2.5 px-3 text-right">Remaining MT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {fifoResult.allocations.map((alloc) => (
                    <tr key={alloc.batchId} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                          alloc.priorityRank === 1 
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}>
                          #{alloc.priorityRank} {alloc.priorityRank === 1 ? '(Oldest)' : ''}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                        {alloc.batchCode}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                        {alloc.stackLocation}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                        {alloc.receiptDate}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold ${alloc.ageDays > 180 ? 'text-rose-600 dark:text-rose-400' : alloc.ageDays > 90 ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                          {alloc.ageDays} days
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                        {alloc.moisturePercent}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                        {alloc.allocatedMt.toFixed(2)} MT
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-zinc-700 dark:text-zinc-300">
                        {alloc.allocatedBags.toLocaleString()} bags
                      </td>
                      <td className="py-2.5 px-3 text-right text-zinc-500 dark:text-zinc-400 font-mono">
                        {alloc.remainingInBatchMt.toFixed(2)} MT
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-zinc-50 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100 border-t border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <td colSpan={6} className="py-2.5 px-3 text-right">
                      Total Allocated:
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400 font-bold">
                      {fifoResult.allocatedMt.toFixed(2)} MT
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {fifoResult.totalBags.toLocaleString()} bags
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Interactive Deviation Test / Override Simulator */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Simulate Warehouse Physical Deviation / Manual Override
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span>Enable Manual Batch Picking</span>
                <input
                  type="checkbox"
                  checked={isManualOverrideMode}
                  onChange={(e) => {
                    setIsManualOverrideMode(e.target.checked);
                    if (e.target.checked && eligibleBatches.length > 1) {
                      // By default select a newer batch to trigger the real-world deviation warning test!
                      setManualSelectedBatchIds([eligibleBatches[eligibleBatches.length - 1].id]);
                    } else {
                      setManualSelectedBatchIds([]);
                    }
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>

            {isManualOverrideMode && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Select which stacks the superintendent wants to pull from. Picking a newer stack while older eligible lots exist triggers the mandatory FCI Deviation Audit Flag:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {eligibleBatches.map((b) => (
                    <label
                      key={b.id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                        manualSelectedBatchIds.includes(b.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={manualSelectedBatchIds.includes(b.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setManualSelectedBatchIds([...manualSelectedBatchIds, b.id]);
                          } else {
                            setManualSelectedBatchIds(manualSelectedBatchIds.filter((id) => id !== b.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-medium">{b.id}</span>
                          <span className="text-[10px] text-zinc-500">{b.receiptDate}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">{b.stackLocation} • {b.currentQuantityMt} MT avail</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* If deviation is detected, show the strict authorization requirement */}
                {deviationEval.isDeviated && (
                  <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-xs text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                          Strict FIFO Deviation Detected!
                        </h5>
                        <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                          {deviationEval.deviationSummary}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-rose-200 dark:border-rose-900/60">
                      <div>
                        <label className="block text-[11px] font-semibold text-rose-900 dark:text-rose-300 mb-1">
                          Mandatory Exception Justification
                        </label>
                        <select
                          value={deviationReason}
                          onChange={(e) => setDeviationReason(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-100"
                        >
                          <option value="Physical Bay Obstruction: Forklift / conveyor defect in stack bay preventing safe extraction.">
                            Physical Bay Obstruction (Stack Bay Inaccessible)
                          </option>
                          <option value="Quality Concern: Suspected moisture pocket in older batch under quarantine investigation.">
                            Quality Concern in Older Lot (Lab Re-testing)
                          </option>
                          <option value="Fumigation Quarantine Lockout: Residual gas clearance waiting period.">
                            Fumigation Quarantine Lockout in Bay
                          </option>
                          <option value="Target FPS specific fortified grain entitlement requested by District Collector.">
                            Specific Fortified Grain Mandate
                          </option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-rose-900 dark:text-rose-300 mb-1">
                            Authorizing Officer Name
                          </label>
                          <input
                            type="text"
                            value={officerName}
                            onChange={(e) => setOfficerName(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 text-xs"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[11px] font-semibold text-rose-900 dark:text-rose-300 mb-1">
                            Auth PIN
                          </label>
                          <input
                            type="password"
                            maxLength={4}
                            value={officerPin}
                            onChange={(e) => setOfficerPin(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 text-xs text-center font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logistics Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 text-xs">
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Vehicle Truck No.</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Driver Name</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Driver Mobile</label>
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:inline-block">
              {fifoResult.totalBags} bags ready for gate pass
            </span>
            <button
              onClick={handleGenerateChallan}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-md transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Official Delivery Challan (DC)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
