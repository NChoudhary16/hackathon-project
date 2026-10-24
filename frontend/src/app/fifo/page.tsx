'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA, DEMO_GODOWNS } from '../../lib/mock-data';
import { CommodityType, Batch, FifoCalculationResult, DeliveryChallan } from '../../types/inventory';
import { calculateDeterministicFifoAllocation, evaluateManualDeviation } from '../../lib/fifo-engine';
import { ChallanPrintModal } from '../../components/ChallanPrintModal';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  Lock, 
  UserCheck, 
  Sparkles, 
  Info, 
  Calendar, 
  Layers, 
  Scale, 
  Printer,
  ChevronRight,
  Boxes
} from 'lucide-react';

export default function FifoAllocationPage() {
  const { 
    batches, 
    challans, 
    fairPriceShops, 
    createDispatch, 
    currentGodown, 
    selectedGodownId, 
    setSelectedGodownId, 
    allGodowns 
  } = useStockFlow();

  // Wizard Step: 1 = Request, 2 = Review & Exception, 3 = Confirmation / Completed
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Dispatch Request Form
  const [commodity, setCommodity] = useState<CommodityType>('wheat');
  const [targetFpsId, setTargetFpsId] = useState<string>(fairPriceShops[0]?.id || 'FPS-DEL-0412');
  const [requestedQuantityMt, setRequestedQuantityMt] = useState<number>(75.0);
  const [fifoUnit, setFifoUnit] = useState<'kg' | 'mt' | 'qtl' | 'bags'>('kg');
  const [vehicleNumber, setVehicleNumber] = useState<string>('DL 1M 4492');
  const [driverName, setDriverName] = useState<string>('Harpreet Singh');
  const [driverPhone, setDriverPhone] = useState<string>('+91 98114 99012');

  // Manual Deviation / Exception Simulation
  const [isManualOverrideMode, setIsManualOverrideMode] = useState<boolean>(false);
  const [manualSelectedBatchIds, setManualSelectedBatchIds] = useState<string[]>([]);
  const [deviationReason, setDeviationReason] = useState<string>('Physical Bay Obstruction: Bay A-1 roller shutter defect preventing immediate loading.');
  const [officerName, setOfficerName] = useState<string>('Dr. V. K. Aggarwal (District Food Controller)');
  const [officerPin, setOfficerPin] = useState<string>('4491');
  const [officerPinInput, setOfficerPinInput] = useState<string>('');

  // Confirmation & Print state
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [generatedChallan, setGeneratedChallan] = useState<DeliveryChallan | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const selectedFps = fairPriceShops.find((f) => f.id === targetFpsId) || fairPriceShops[0];

  // Eligible Active Batches for Selected Commodity
  const eligibleBatches = useMemo(() => {
    return batches
      .filter((b) => b.commodity === commodity && b.status === 'active' && b.currentQuantityMt > 0.01)
      .sort((a, b) => new Date(a.receiptDate).getTime() - new Date(b.receiptDate).getTime());
  }, [batches, commodity]);

  // Quarantined / Ineligible Batches for Explanation
  const ineligibleBatches = useMemo(() => {
    return batches.filter((b) => b.commodity === commodity && (b.status === 'quarantine' || b.qualityGrade === 'Quarantine'));
  }, [batches, commodity]);

  // Total Available Eligible Quantity
  const totalEligibleStockMt = eligibleBatches.reduce((sum, b) => sum + b.currentQuantityMt, 0);

  // Pure Deterministic FIFO Allocation
  const deterministicFifoResult: FifoCalculationResult = useMemo(() => {
    return calculateDeterministicFifoAllocation(commodity, requestedQuantityMt, batches);
  }, [commodity, requestedQuantityMt, batches]);

  // Manual Deviation Evaluation
  const deviationEval = useMemo(() => {
    if (!isManualOverrideMode || manualSelectedBatchIds.length === 0) {
      return { isDeviated: false, skippedOlderBatches: [], deviationSummary: 'Strict FIFO Compliance maintained.' };
    }
    return evaluateManualDeviation(manualSelectedBatchIds, batches, commodity);
  }, [isManualOverrideMode, manualSelectedBatchIds, batches, commodity]);

  // Shortage Calculation
  const shortageMt = Math.max(0, Number((requestedQuantityMt - deterministicFifoResult.allocatedMt).toFixed(2)));
  const isShortage = shortageMt > 0.01;

  // Active proposed allocations
  const activeAllocations = useMemo(() => {
    if (!isManualOverrideMode) {
      return deterministicFifoResult.allocations.map((a) => ({
        batchId: a.batchId,
        stackLocation: a.stackLocation,
        allocatedMt: a.allocatedMt,
        bags: a.allocatedBags,
        receiptDate: a.receiptDate,
        remainingInBatchMt: a.remainingInBatchMt,
        priorityRank: a.priorityRank,
        ageDays: a.ageDays,
      }));
    } else {
      // Allocate from manually selected batches
      let remainingNeeded = requestedQuantityMt;
      const selected = batches.filter((b) => manualSelectedBatchIds.includes(b.id));
      return selected.map((b, idx) => {
        const alloc = Math.min(remainingNeeded, b.currentQuantityMt);
        remainingNeeded = Math.max(0, remainingNeeded - alloc);
        return {
          batchId: b.id,
          stackLocation: b.stackLocation,
          allocatedMt: Number(alloc.toFixed(2)),
          bags: Math.round(alloc * 20),
          receiptDate: b.receiptDate,
          remainingInBatchMt: Math.max(0, Number((b.currentQuantityMt - alloc).toFixed(2))),
          priorityRank: idx + 1,
          ageDays: b.ageDays,
        };
      });
    }
  }, [isManualOverrideMode, deterministicFifoResult, manualSelectedBatchIds, batches, requestedQuantityMt]);

  // Handle Confirmed Dispatch Submission
  const handleConfirmDispatch = () => {
    setErrorBanner(null);

    // Validation 1: Prevent dispatch if shortage exists under strict rules
    if (isShortage) {
      setErrorBanner(`Cannot finalize dispatch: Available eligible stock (${deterministicFifoResult.allocatedMt} MT) is insufficient for requested ${requestedQuantityMt} MT. Shortage: ${shortageMt} MT.`);
      setIsConfirmDialogOpen(false);
      return;
    }

    // Validation 2: If deviated, require PIN
    if (isManualOverrideMode && deviationEval.isDeviated) {
      if (officerPinInput.trim() !== officerPin) {
        setErrorBanner('Authorization Failed: Invalid District Food Controller 4-digit PIN for FIFO exception.');
        setIsConfirmDialogOpen(false);
        return;
      }
    }

    const res = createDispatch({
      fpsId: selectedFps.id,
      commodity,
      totalQuantityMt: requestedQuantityMt,
      vehicleNumber,
      driverName,
      driverPhone,
      allocations: activeAllocations.map((a) => ({
        batchId: a.batchId,
        stackLocation: a.stackLocation,
        allocatedMt: a.allocatedMt,
        bags: a.bags,
        receiptDate: a.receiptDate,
      })),
      isFifoCompliant: !isManualOverrideMode || !deviationEval.isDeviated,
      deviationJustification: isManualOverrideMode && deviationEval.isDeviated ? deviationReason : undefined,
      authorizedByOfficer: isManualOverrideMode && deviationEval.isDeviated ? officerName : undefined,
      authorizationPinUsed: isManualOverrideMode && deviationEval.isDeviated,
    });

    if (!res.success || !res.challan) {
      setErrorBanner(res.error || 'Dispatch creation failed.');
      setIsConfirmDialogOpen(false);
      return;
    }

    setGeneratedChallan(res.challan);
    setIsConfirmDialogOpen(false);
    setCurrentStep(3);
  };

  // Helper Preset Acceptance Test Scenarios (Section 20)
  const loadScenario = (type: 'testA' | 'testB' | 'testC' | 'testD') => {
    setErrorBanner(null);
    setIsManualOverrideMode(false);
    setManualSelectedBatchIds([]);

    if (type === 'testA') {
      // Test A: FIFO allocation (R-101, R-102, R-103)
      setCommodity('wheat');
      setRequestedQuantityMt(74.5);
      setCurrentStep(1);
    } else if (type === 'testB') {
      // Test B: Insufficient stock
      setCommodity('sugar');
      setRequestedQuantityMt(120.0); // Only 85 MT available
      setCurrentStep(1);
    } else if (type === 'testC') {
      // Test C: Ineligible Quarantined batch check
      setCommodity('wheat');
      setRequestedQuantityMt(40.0);
      setCurrentStep(1);
    } else if (type === 'testD') {
      // Test D: FIFO exception bypass
      setCommodity('wheat');
      setRequestedQuantityMt(50.0);
      setIsManualOverrideMode(true);
      // Select newer batch BATCH-WHT-2026-014 instead of older BATCH-WHT-2025-081
      setManualSelectedBatchIds(['BATCH-WHT-2026-014']);
      setOfficerPinInput('4491');
      setCurrentStep(2);
    }
  };

  return (
    <AppShell pageTitle="FIFO Stock Allocation Engine" pageBreadcrumb="FIFO Allocation">
      <div className="space-y-6">
        {/* Step Progress Ribbon */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Deterministic FIFO Dispatch Engine</h2>
                <p className="text-xs text-zinc-500">Government PDS Stock Rotation Mandate (Oldest Stock Issued First)</p>
              </div>
            </div>

            {/* Stepper Indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`px-3 py-1 rounded-lg ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                1. Request
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className={`px-3 py-1 rounded-lg ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                2. Calculate & Validate
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <span className={`px-3 py-1 rounded-lg ${currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                3. Challan Issued
              </span>
            </div>
          </div>

          {/* Quick Scenario Preset Strip (Section 20 Acceptance Tests) */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-zinc-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Acceptance Test Scenarios:</span>
            </span>
            <button
              onClick={() => loadScenario('testA')}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium transition cursor-pointer"
            >
              Test A: Multi-Batch Split (FIFO)
            </button>
            <button
              onClick={() => loadScenario('testB')}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-400 font-medium transition cursor-pointer"
            >
              Test B: Insufficient Stock (Shortage)
            </button>
            <button
              onClick={() => loadScenario('testC')}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-400 font-medium transition cursor-pointer"
            >
              Test C: Quarantined Lot Exclusion
            </button>
            <button
              onClick={() => loadScenario('testD')}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium transition cursor-pointer"
            >
              Test D: Bypass Exception & PIN
            </button>
          </div>
        </div>

        {errorBanner && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button onClick={() => setErrorBanner(null)} className="text-rose-600 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: DISPATCH REQUEST FORM */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Step 1: Enter Dispatch Quota Details</h3>
              <p className="text-xs text-zinc-500">
                Specify destination Fair Price Shop, commodity, and required tonnage. The engine will determine the batch allocation.
              </p>

              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Origin Godown Depot</label>
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium flex items-center justify-between">
                    <span>{currentGodown.name}</span>
                    <span className="text-[11px] text-zinc-500">{currentGodown.district}, {currentGodown.state}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Destination Fair Price Shop (FPS)</label>
                  <select
                    value={targetFpsId}
                    onChange={(e) => setTargetFpsId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    {fairPriceShops.map((fps) => (
                      <option key={fps.id} value={fps.id}>
                        {fps.name} ({fps.id}) — {fps.district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Food-Grain Commodity</label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value as CommodityType)}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold"
                  >
                    {Object.entries(COMMODITY_METADATA).map(([k, m]) => (
                      <option key={k} value={k}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">
                        Requested Dispatch Quantity
                      </label>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs font-semibold">
                        <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <select
                          value={fifoUnit}
                          onChange={(e) => setFifoUnit(e.target.value as 'kg' | 'mt' | 'qtl' | 'bags')}
                          className="bg-transparent font-bold text-xs cursor-pointer border-none outline-hidden"
                        >
                          <option value="kg">Kilograms (kg)</option>
                          <option value="mt">Metric Tonnes (MT)</option>
                          <option value="qtl">Quintals (qtl)</option>
                          <option value="bags">Standard 50kg Bags</option>
                        </select>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      Total Eligible in Silo: <strong className="font-mono text-zinc-800 dark:text-zinc-200">
                        {fifoUnit === 'kg' 
                          ? `${(totalEligibleStockMt * 1000).toLocaleString()} kg` 
                          : fifoUnit === 'qtl'
                          ? `${(totalEligibleStockMt * 10).toLocaleString()} qtl`
                          : fifoUnit === 'bags'
                          ? `${(totalEligibleStockMt * 20).toLocaleString()} Bags`
                          : `${totalEligibleStockMt.toFixed(1)} MT`}
                      </strong>
                    </span>
                  </div>

                  <input
                    type="number"
                    step={fifoUnit === 'kg' ? '100' : fifoUnit === 'bags' ? '1' : fifoUnit === 'qtl' ? '1' : '0.5'}
                    min={fifoUnit === 'kg' ? '50' : fifoUnit === 'bags' ? '1' : fifoUnit === 'qtl' ? '0.5' : '0.1'}
                    required
                    value={
                      fifoUnit === 'kg'
                        ? Math.round(requestedQuantityMt * 1000)
                        : fifoUnit === 'qtl'
                        ? Number((requestedQuantityMt * 10).toFixed(1))
                        : fifoUnit === 'bags'
                        ? Math.round(requestedQuantityMt * 20)
                        : requestedQuantityMt
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (fifoUnit === 'kg') setRequestedQuantityMt(val / 1000);
                      else if (fifoUnit === 'qtl') setRequestedQuantityMt(val / 10);
                      else if (fifoUnit === 'bags') setRequestedQuantityMt(val / 20);
                      else setRequestedQuantityMt(val);
                    }}
                    className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono text-base font-bold focus:ring-2 focus:ring-blue-500/20"
                  />

                  {/* Dynamic Conversion Strip */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[11px] font-semibold text-zinc-500">Live Equivalent:</span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                      {Math.round(requestedQuantityMt * 1000).toLocaleString()} kg
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      {requestedQuantityMt.toFixed(2)} MT
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-[11px] font-mono font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                      {(requestedQuantityMt * 10).toFixed(1)} qtl
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      ~{Math.round(requestedQuantityMt * 20).toLocaleString()} Bags (50kg)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Driver Name</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Driver Phone</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <span>Proceed to Allocation & Validation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 1 Side Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-3">
                <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Eligible Inventory Lots for {COMMODITY_METADATA[commodity].name}</span>
                </div>

                <div className="space-y-2 text-xs">
                  {eligibleBatches.slice(0, 4).map((b, idx) => (
                    <div key={b.id} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{b.id}</span>
                          {idx === 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800">
                              Oldest (Rank #1)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500">Rec: {b.receiptDate} ({b.ageDays}d old) • {b.stackLocation}</div>
                      </div>
                      <div className="text-right font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {b.currentQuantityMt} MT
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quarantined lot callout if any */}
                {ineligibleBatches.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Ineligible Batch Excluded: {ineligibleBatches[0].id}</span>
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400">
                      Reason: {ineligibleBatches[0].quarantineReason || 'Quarantined due to moisture content spike exceeding 12.0% threshold.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ALLOCATION CALCULATION, SHORTAGE CHECK, AND EXCEPTION REVIEW */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Calculation Status Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Step 2: Deterministic FIFO Allocation Schedule
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Target Quota: <strong>{requestedQuantityMt} MT</strong> for <strong>{selectedFps.name}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold"
                  >
                    Back to Edit Request
                  </button>
                  <button
                    onClick={() => setIsManualOverrideMode(!isManualOverrideMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      isManualOverrideMode
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {isManualOverrideMode ? 'Manual Override Active' : 'Simulate Exception Bypass'}
                  </button>
                </div>
              </div>

              {/* Shortage Alert (Section 10 Step 3) */}
              {isShortage && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <strong>Insufficient Eligible Stock in Godown:</strong> Total available eligible stock is {deterministicFifoResult.allocatedMt} MT. Outstanding shortage: <strong>{shortageMt} MT</strong>.
                      <div className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        In accordance with Section 10 Rule 3: System prevents finalizing a dispatch with an unmet quantity without administrative quota adjustment.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FIFO Violation Warning if manual deviation active (Section 10 Step 3) */}
              {isManualOverrideMode && deviationEval.isDeviated && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>FIFO DEVIATION WARNING: Older Eligible Consignment(s) Bypassed</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {deviationEval.deviationSummary} Skipping older eligible grain requires explicit justification, District Food Controller authorization, and records an immutable audit entry.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Operational Justification Reason</label>
                      <input
                        type="text"
                        value={deviationReason}
                        onChange={(e) => setDeviationReason(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">DFC Officer 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="PIN (Demo: 4491)"
                        value={officerPinInput}
                        onChange={(e) => setOfficerPinInput(e.target.value)}
                        className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-700 font-mono text-center tracking-widest text-base font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Proposed Allocation Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Batch Code</th>
                      <th className="py-3 px-3">Stack Location</th>
                      <th className="py-3 px-3">Receipt Date</th>
                      <th className="py-3 px-3">Stock Age</th>
                      <th className="py-3 px-3 text-right">Proposed Issue</th>
                      <th className="py-3 px-3 text-right">Bags</th>
                      <th className="py-3 px-3 text-right">Remaining Balance</th>
                      <th className="py-3 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    {activeAllocations.map((a, idx) => (
                      <tr key={a.batchId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            idx === 0 ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'
                          }`}>
                            Rank #{a.priorityRank}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-blue-600 dark:text-blue-400">{a.batchId}</td>
                        <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400">{a.stackLocation}</td>
                        <td className="py-3 px-3 text-zinc-500">{a.receiptDate}</td>
                        <td className="py-3 px-3 text-zinc-500">{a.ageDays}d</td>
                        <td className="py-3 px-3 text-right font-bold text-zinc-900 dark:text-white">
                          {a.allocatedMt} MT
                        </td>
                        <td className="py-3 px-3 text-right text-zinc-500">{a.bags}</td>
                        <td className="py-3 px-3 text-right text-zinc-500">{a.remainingInBatchMt} MT</td>
                        <td className="py-3 px-3 font-sans">
                          {a.remainingInBatchMt <= 0.01 ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                              Exhausted
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                              Partial Pull
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  Total Allocated: <strong className="font-mono text-zinc-900 dark:text-white">{activeAllocations.reduce((sum, a) => sum + a.allocatedMt, 0)} MT</strong> of {requestedQuantityMt} MT
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    disabled={isShortage}
                    onClick={() => setIsConfirmDialogOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer ${
                      isShortage
                        ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Review & Confirm Dispatch</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DISPATCH COMPLETED & CHALLAN REFERENCE */}
        {currentStep === 3 && generatedChallan && (
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                Dispatch Verified & Balance Updated
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Delivery Challan Issued Successfully
              </h2>
              <p className="text-xs text-zinc-500 font-mono">
                Challan ID: <strong className="text-blue-600">{generatedChallan.id}</strong> • Gate Pass: {generatedChallan.gatePassNo}
              </p>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs text-left grid grid-cols-2 gap-3">
              <div>
                <span className="text-zinc-500">Destination:</span>
                <div className="font-semibold text-zinc-900 dark:text-white">{generatedChallan.fpsName}</div>
              </div>
              <div>
                <span className="text-zinc-500">Commodity & Tonnage:</span>
                <div className="font-semibold text-zinc-900 dark:text-white">{generatedChallan.commodityName} ({generatedChallan.totalQuantityMt} MT)</div>
              </div>
              <div>
                <span className="text-zinc-500">Driver & Vehicle:</span>
                <div className="font-semibold text-zinc-900 dark:text-white">{generatedChallan.driverName} ({generatedChallan.vehicleNumber})</div>
              </div>
              <div>
                <span className="text-zinc-500">Compliance Status:</span>
                <div className="font-bold text-emerald-600">
                  {generatedChallan.isFifoCompliant ? '100% FIFO Compliant' : 'Authorized Deviation Exception'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Delivery Challan</span>
              </button>

              <Link
                href="/challans"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-200 dark:border-zinc-700 transition"
              >
                <FileText className="w-4 h-4" />
                <span>View in Challan Ledger</span>
              </Link>

              <button
                onClick={() => { setCurrentStep(1); setGeneratedChallan(null); }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-800 text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Allocation</span>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog (Section 10 Step 4) */}
        {isConfirmDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Confirm Grain Dispatch Allocation</h3>
                <p className="text-xs text-zinc-500">
                  This will deduct {requestedQuantityMt} MT across {activeAllocations.length} batch stacks and generate an official government delivery challan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-500">FPS Quota:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedFps.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Net Weight:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">{requestedQuantityMt} MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Bags:</span>
                  <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {activeAllocations.reduce((sum, a) => sum + a.bags, 0)} bags
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsConfirmDialogOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDispatch}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm & Generate Challan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Print Modal */}
        {generatedChallan && (
          <ChallanPrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            challan={generatedChallan}
          />
        )}
      </div>
    </AppShell>
  );
}
