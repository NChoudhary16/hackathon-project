'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
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
  Lock,
  RotateCcw
} from 'lucide-react';
import { Batch, CommodityType, DeliveryChallan, FairPriceShop, FifoCalculationResult } from '../types/inventory';
import { calculateDeterministicFifoAllocation, evaluateManualDeviation } from '../lib/fifo-engine';
import { COMMODITY_METADATA } from '../lib/mock-data';

interface FifoSimulatorViewProps {
  batches: Batch[];
  fairPriceShops: FairPriceShop[];
  onDispatchCreated: (challan: DeliveryChallan, updatedBatches: Batch[]) => void;
}

export function FifoSimulatorView({ batches, fairPriceShops, onDispatchCreated }: FifoSimulatorViewProps) {
  const [commodity, setCommodity] = useState<CommodityType>('wheat');
  const [targetFpsId, setTargetFpsId] = useState<string>(fairPriceShops[0]?.id || '');
  const [requestedQuantityMt, setRequestedQuantityMt] = useState<number>(75.0);
  const [vehicleNumber, setVehicleNumber] = useState<string>('DL 1M 4492');
  const [driverName, setDriverName] = useState<string>('Harpreet Singh');
  const [driverPhone, setDriverPhone] = useState<string>('+91 98114 99012');

  // Manual deviation simulation
  const [isManualOverrideMode, setIsManualOverrideMode] = useState<boolean>(false);
  const [manualSelectedBatchIds, setManualSelectedBatchIds] = useState<string[]>([]);
  const [deviationReason, setDeviationReason] = useState<string>('Physical Bay Obstruction: Bay A-1 roller shutter defect preventing immediate loading.');
  const [officerName, setOfficerName] = useState<string>('Sunil Dutt (Food Civil Supplies Officer)');
  const [officerPin, setOfficerPin] = useState<string>('4491');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const currentMetadata = COMMODITY_METADATA[commodity];
  const selectedFps = fairPriceShops.find((f) => f.id === targetFpsId) || fairPriceShops[0];

  // Eligible active batches
  const eligibleBatches = batches
    .filter((b) => b.commodity === commodity && b.status === 'active' && b.currentQuantityMt > 0)
    .sort((a, b) => new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime());

  // Deterministic calculation
  const fifoResult: FifoCalculationResult = useMemo(() => {
    return calculateDeterministicFifoAllocation(commodity, requestedQuantityMt, batches);
  }, [commodity, requestedQuantityMt, batches]);

  // Deviation check
  const deviationEval = useMemo(() => {
    if (!isManualOverrideMode) return { isDeviated: false, skippedOlderBatches: [], deviationSummary: '' };
    return evaluateManualDeviation(manualSelectedBatchIds, batches, commodity);
  }, [isManualOverrideMode, manualSelectedBatchIds, batches, commodity]);

  const handleExecuteDispatch = () => {
    const challanId = `PDS/DC/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const isCompliant = !isManualOverrideMode || !deviationEval.isDeviated;

    const allocatedBatchesSummary = fifoResult.allocations.map((a) => ({
      batchId: a.batchId,
      stackLocation: a.stackLocation,
      allocatedMt: a.allocatedMt,
      bags: a.allocatedBags,
      receiptDate: a.receiptDate,
    }));

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
    const tareWeight = 14800;
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
    setSuccessToast(`Official Delivery Challan ${challanId} generated with ${fifoResult.allocatedMt} MT successfully!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner / Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-sm shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Simulator Control Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Deterministic FIFO Allocation Engine (Pure Business Logic)</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Mathematically prioritizes the oldest eligible consignments. Zero AI hallucination, 100% auditable Indian PDS compliance.
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Audit Hash: {fifoResult.auditHash}
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Commodity
            </label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value as CommodityType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-medium text-sm"
            >
              {Object.entries(COMMODITY_METADATA).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.name} ({meta.hindiName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Target Fair Price Shop (FPS)
            </label>
            <select
              value={targetFpsId}
              onChange={(e) => setTargetFpsId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 font-medium text-sm"
            >
              {fairPriceShops.map((fps) => (
                <option key={fps.id} value={fps.id}>
                  {fps.name} ({fps.district})
                </option>
              ))}
            </select>
          </div>

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
                max="250"
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
                className="w-20 px-2 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-sm text-center font-bold"
              />
            </div>
          </div>
        </div>

        {/* Multi-Batch Allocation Calculation Breakdown */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Deterministic Multi-Batch Breakdown (Earliest In First)
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {fifoResult.allocations.length} stack lot(s) combined to fulfill {requestedQuantityMt} MT
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100/60 dark:bg-zinc-800/40 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-4">Priority Rank</th>
                <th className="py-2.5 px-4">Batch ID</th>
                <th className="py-2.5 px-4">Stack Bay</th>
                <th className="py-2.5 px-4">Intake Date</th>
                <th className="py-2.5 px-4">Age in Silo</th>
                <th className="py-2.5 px-4">Moisture</th>
                <th className="py-2.5 px-4 text-right">Allocated MT</th>
                <th className="py-2.5 px-4 text-right">Bags</th>
                <th className="py-2.5 px-4 text-right">Remaining MT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {fifoResult.allocations.map((alloc) => (
                <tr key={alloc.batchId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      alloc.priorityRank === 1
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      #{alloc.priorityRank} {alloc.priorityRank === 1 ? '• Oldest Eligible' : ''}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                    {alloc.batchCode}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {alloc.stackLocation}
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {alloc.receiptDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${alloc.ageDays > 180 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {alloc.ageDays} days
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                    {alloc.moisturePercent}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                    {alloc.allocatedMt.toFixed(2)} MT
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {alloc.allocatedBags.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-500 font-mono">
                    {alloc.remainingInBatchMt.toFixed(2)} MT
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Manual Override / Deviation Simulation */}
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Simulate Manual Warehouse Override (Deviation Exception Engine)
              </h4>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
              <span>Enable Manual Selection</span>
              <input
                type="checkbox"
                checked={isManualOverrideMode}
                onChange={(e) => {
                  setIsManualOverrideMode(e.target.checked);
                  if (e.target.checked && eligibleBatches.length > 1) {
                    setManualSelectedBatchIds([eligibleBatches[eligibleBatches.length - 1].id]);
                  } else {
                    setManualSelectedBatchIds([]);
                  }
                }}
                className="w-4 h-4 rounded text-blue-600"
              />
            </label>
          </div>

          {isManualOverrideMode && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-zinc-500">
                Select batches to pull from. Bypassing an older eligible stack triggers an immediate deviation warning:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eligibleBatches.map((b) => (
                  <label
                    key={b.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer ${
                      manualSelectedBatchIds.includes(b.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={manualSelectedBatchIds.includes(b.id)}
                      onChange={(e) => {
                        if (e.target.checked) setManualSelectedBatchIds([...manualSelectedBatchIds, b.id]);
                        else setManualSelectedBatchIds(manualSelectedBatchIds.filter((id) => id !== b.id));
                      }}
                      className="rounded text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-mono font-medium">{b.id} • {b.stackLocation}</div>
                      <div className="text-[11px] text-zinc-500">Intake: {b.receiptDate} ({b.ageDays}d) • {b.currentQuantityMt} MT</div>
                    </div>
                  </label>
                ))}
              </div>

              {deviationEval.isDeviated && (
                <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>FIFO Deviation Warning: {deviationEval.deviationSummary}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-rose-900 dark:text-rose-300 mb-1">
                        Mandatory Reason
                      </label>
                      <input
                        type="text"
                        value={deviationReason}
                        onChange={(e) => setDeviationReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-rose-900 dark:text-rose-300 mb-1">
                          Authorizing Officer
                        </label>
                        <input
                          type="text"
                          value={officerName}
                          onChange={(e) => setOfficerName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-zinc-900 text-xs"
                        />
                      </div>
                      <div className="w-20">
                        <label className="block text-[11px] font-semibold text-rose-900 dark:text-rose-300 mb-1">
                          PIN
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

        {/* Dispatch Action Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={handleExecuteDispatch}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm shadow-md transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Official Delivery Challan (DC)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
