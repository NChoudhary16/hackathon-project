'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Truck, 
  ShieldCheck, 
  FileText, 
  Building2, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  QrCode, 
  Phone, 
  Calendar,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Clock,
  Printer
} from 'lucide-react';
import { useStockFlow } from '../../lib/stockflow-context';
import { CommodityType, DeliveryChallan } from '../../types/inventory';
import { COMMODITY_METADATA } from '../../lib/mock-data';
import { calculateDeterministicFifoAllocation } from '../../lib/fifo-engine';
import { ChallanPrintModal } from '../ChallanPrintModal';

interface DispatchDashboardViewProps {
  onOpenDispatchModal?: () => void;
}

export function DispatchDashboardView({
  onOpenDispatchModal,
}: DispatchDashboardViewProps) {
  const {
    batches,
    challans,
    fairPriceShops,
    currentGodown,
    createDispatch,
    currentUser,
  } = useStockFlow();

  // Quick Dispatch Console State
  const [selectedFpsId, setSelectedFpsId] = useState<string>(fairPriceShops[0]?.id || 'FPS-DEL-0412');
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityType>('wheat');
  const [dispatchQtyMt, setDispatchQtyMt] = useState<number>(25);
  const [vehicleNo, setVehicleNo] = useState<string>('DL 1M 4492');
  const [driverName, setDriverName] = useState<string>('Mohinder Singh');
  const [driverPhone, setDriverPhone] = useState<string>('+91 98112 44920');
  const [tareWeightKg, setTareWeightKg] = useState<number>(6250);
  const [isSuccessNotification, setIsSuccessNotification] = useState<string | null>(null);

  // Print modal state
  const [printedChallan, setPrintedChallan] = useState<DeliveryChallan | null>(null);

  // Calculate gross weight automatically
  const netWeightKg = Math.round(dispatchQtyMt * 1000);
  const grossWeightKg = tareWeightKg + netWeightKg;

  // Real-time FIFO simulation for the selected commodity
  const fifoResult = calculateDeterministicFifoAllocation(selectedCommodity, dispatchQtyMt, batches);

  const handleIssueChallan = () => {
    if (fifoResult.allocations.length === 0) {
      alert('Error: Insufficient stock available in depot for this commodity.');
      return;
    }

    const allocations = fifoResult.allocations.map((a) => ({
      batchId: a.batchId,
      stackLocation: a.stackLocation,
      allocatedMt: a.allocatedMt,
      bags: a.allocatedBags,
      receiptDate: a.receiptDate,
    }));

    const res = createDispatch({
      fpsId: selectedFpsId,
      commodity: selectedCommodity,
      totalQuantityMt: dispatchQtyMt,
      vehicleNumber: vehicleNo,
      driverName,
      driverPhone,
      allocations,
      isFifoCompliant: !fifoResult.hasDeviation,
      authorizedByOfficer: `${currentUser.name} (${currentUser.role})`,
    });

    if (res.success && res.challan) {
      setIsSuccessNotification(`Form-IV Delivery Challan ${res.challan.id} generated with Gate Pass ${res.challan.gatePassNo}!`);
      setTimeout(() => setIsSuccessNotification(null), 5000);
    }
  };

  const totalDispatchedMt = challans.reduce((sum, c) => sum + c.totalQuantityMt, 0);
  const inTransitChallans = challans.filter((c) => c.status === 'In-Transit' || c.status === 'Allocated' || c.status === 'Loaded');
  const compliantCount = challans.filter((c) => c.isFifoCompliant).length;
  const complianceRate = challans.length > 0 ? Math.round((compliantCount / challans.length) * 100) : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dispatch Officer Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-950 via-zinc-900 to-amber-950 text-white p-6 sm:p-8 border border-amber-900/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>Weighbridge & Fleet Outward Dispatch Terminal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              FIFO Allocation & Form-IV Delivery Challans
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Managing electronic weighbridge gross/tare ticketing, automated oldest-batch FIFO selection, gate pass generation, and real-time fleet transit tracking to Fair Price Shops.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/challans"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>All Delivery Challans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {isSuccessNotification && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{isSuccessNotification}</span>
          </div>
          <button onClick={() => setIsSuccessNotification(null)} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Dispatch Officer KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Dispatched</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {totalDispatchedMt.toFixed(1)} <span className="text-xs font-normal text-zinc-500">MT</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Released from depot</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Challans Issued</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {challans.length} <span className="text-xs font-normal text-zinc-500">Form-IV</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">With QR authentication</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">FIFO Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {complianceRate}%
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Strict oldest batch adherence</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fleet In-Transit</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {inTransitChallans.length} <span className="text-xs font-normal text-zinc-500">Trucks</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">En route to ration dealers</p>
        </div>
      </div>

      {/* QUICK DISPATCH & WEIGHBRIDGE WORKBENCH */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
              <Scale className="w-3.5 h-3.5" />
              <span>Weighbridge Console</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
              Issue Delivery Challan & Weighbridge Gate Pass
            </h3>
            <p className="text-xs text-zinc-500">
              Deterministic FIFO engine automatically allocates from the oldest eligible batch.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-5">
          {/* Dispatch Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Target Fair Price Shop (FPS)
                </label>
                <select
                  value={selectedFpsId}
                  onChange={(e) => setSelectedFpsId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  {fairPriceShops.map((fps) => (
                    <option key={fps.id} value={fps.id}>
                      {fps.name} ({fps.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Grain Commodity
                </label>
                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value as CommodityType)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="wheat">Wheat (HD-3086)</option>
                  <option value="rice_raw">Raw Rice (Swarna)</option>
                  <option value="rice_parboiled">Parboiled Rice</option>
                  <option value="sugar">Refined Sugar</option>
                  <option value="chana_dal">Chana Dal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Quantity (MT)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={dispatchQtyMt}
                  onChange={(e) => setDispatchQtyMt(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Tare Weight (Kg)
                </label>
                <input
                  type="number"
                  value={tareWeightKg}
                  onChange={(e) => setTareWeightKg(parseInt(e.target.value) || 0)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Gross Weight (Kg)
                </label>
                <input
                  type="number"
                  disabled
                  value={grossWeightKg}
                  className="w-full mt-1 px-3 py-2 text-xs font-bold rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Vehicle Registration
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Driver Full Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Driver Phone
                </label>
                <input
                  type="text"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Real-time FIFO Allocation Preview */}
          <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Deterministic FIFO Stack Pick</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Oldest First
                </span>
              </div>

              <div className="space-y-2 mt-3">
                {fifoResult.allocations.length === 0 ? (
                  <p className="text-xs text-rose-500 font-medium">
                    No active stock available to fulfill this allocation.
                  </p>
                ) : (
                  fifoResult.allocations.map((alloc) => (
                    <div
                      key={alloc.batchId}
                      className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-zinc-900 dark:text-white">
                          {alloc.batchId}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {alloc.stackLocation} • Age: {alloc.ageDays} days
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-zinc-900 dark:text-white">
                          {alloc.allocatedMt} MT
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {alloc.allocatedBags} bags (50kg)
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-400 block">Net Grain Payload</span>
                <span className="text-sm font-black text-zinc-900 dark:text-white">{dispatchQtyMt} MT ({netWeightKg.toLocaleString()} Kg)</span>
              </div>

              <button
                onClick={handleIssueChallan}
                disabled={fifoResult.allocations.length === 0}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Issue Challan & Gate Pass</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE FLEET IN TRANSIT */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Fleet Dispatches & Form-IV Gate Passes
            </h3>
            <p className="text-xs text-zinc-500">
              Active consignments issued from weighbridge to Fair Price Shops
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold">
                <th className="pb-3">Challan / Gate Pass</th>
                <th className="pb-3">Fair Price Shop</th>
                <th className="pb-3">Commodity</th>
                <th className="pb-3">Tonnage</th>
                <th className="pb-3">Vehicle & Driver</th>
                <th className="pb-3">FIFO Status</th>
                <th className="pb-3">Delivery Status</th>
                <th className="pb-3 text-right">Form-IV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {challans.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="py-3">
                    <div className="font-mono font-bold text-zinc-900 dark:text-white">{c.id}</div>
                    <div className="font-mono text-[10px] text-zinc-400">{c.gatePassNo}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-zinc-800 dark:text-zinc-200">{c.fpsName}</div>
                    <div className="text-[10px] text-zinc-400">{c.fpsDistrict}</div>
                  </td>
                  <td className="py-3 text-zinc-700 dark:text-zinc-300">
                    {c.commodityName}
                  </td>
                  <td className="py-3 font-bold text-zinc-900 dark:text-white">
                    {c.totalQuantityMt} MT
                  </td>
                  <td className="py-3">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{c.vehicleNumber}</div>
                    <div className="text-[10px] text-zinc-400">{c.driverName} ({c.driverPhone})</div>
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.isFifoCompliant
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {c.isFifoCompliant ? 'Strict FIFO' : 'Bypass Override'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Acknowledged_FPS'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setPrintedChallan(c)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1 ml-auto"
                    >
                      <Printer className="w-3 h-3 text-amber-600" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challan Print Modal */}
      {printedChallan && (
        <ChallanPrintModal
          challan={printedChallan}
          onClose={() => setPrintedChallan(null)}
        />
      )}
    </div>
  );
}
