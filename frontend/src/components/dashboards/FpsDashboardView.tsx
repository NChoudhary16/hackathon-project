'use client';

import React, { useState } from 'react';
import { 
  Store, 
  Truck, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Phone, 
  Users, 
  Boxes, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Check, 
  Printer, 
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useStockFlow } from '../../lib/stockflow-context';
import { DeliveryChallan } from '../../types/inventory';
import { ChallanPrintModal } from '../ChallanPrintModal';

export function FpsDashboardView() {
  const {
    challans,
    fairPriceShops,
    currentUser,
    acknowledgeChallan,
  } = useStockFlow();

  const [acknowledgedSuccessId, setAcknowledgedSuccessId] = useState<string | null>(null);
  const [printedChallan, setPrintedChallan] = useState<DeliveryChallan | null>(null);

  // Active FPS Shop (defaulting to the first shop or dealer's assigned shop)
  const currentFps = fairPriceShops[0] || {
    id: 'FPS-DEL-0412',
    name: 'Fair Price Shop #412 - Lajpat Nagar IV',
    dealerName: 'Ramesh Chaurasia',
    district: 'South Delhi',
    taluka: 'Kalkaji',
    beneficiaryCardsCount: 840,
    contactNumber: '+91 98101 22934',
    activeQuotaRemainingMt: 145.5,
  };

  // Consignments addressed to this FPS
  const fpsChallans = challans.filter(
    (c) => c.fpsId === currentFps.id || c.fpsName.includes('412') || true // Show demo consignments
  );

  const pendingDeliveries = fpsChallans.filter(
    (c) => c.status === 'In-Transit' || c.status === 'Allocated' || c.status === 'Loaded'
  );

  const receivedDeliveries = fpsChallans.filter(
    (c) => c.status === 'Acknowledged_FPS'
  );

  const handleAcknowledge = (challanId: string) => {
    acknowledgeChallan(challanId, 'Verified weighbridge seal and biometric dealer signature.');
    setAcknowledgedSuccessId(challanId);
    setTimeout(() => setAcknowledgedSuccessId(null), 5000);
  };

  // Quotas calculations
  const totalMonthlyQuotaMt = 180;
  const remainingQuotaMt = currentFps.activeQuotaRemainingMt;
  const distributedMt = Math.max(0, totalMonthlyQuotaMt - remainingQuotaMt);
  const quotaPercent = Math.round((distributedMt / totalMonthlyQuotaMt) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* FPS Dealer Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-950 via-zinc-900 to-purple-950 text-white p-6 sm:p-8 border border-purple-900/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              <Store className="w-3.5 h-3.5" />
              <span>NFSA Public Distribution System • Retail Dealer Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentFps.name}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Authorized Dealer: <strong className="text-white">{currentFps.dealerName}</strong> • {currentFps.district} District ({currentFps.taluka} Taluka). 
              Beneficiary Cards Enrolled: <strong className="text-white">{currentFps.beneficiaryCardsCount} Households</strong> (AAY &amp; Priority).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-purple-800/60 text-center min-w-36">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Remaining Quota</span>
              <p className="text-lg font-black text-purple-400 mt-0.5">{remainingQuotaMt.toFixed(1)} MT</p>
              <span className="text-[10px] text-zinc-500">of {totalMonthlyQuotaMt} MT Quota</span>
            </div>
          </div>
        </div>
      </div>

      {acknowledgedSuccessId && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">
              Consignment {acknowledgedSuccessId} successfully verified with QR code and added to shop inventory!
            </span>
          </div>
          <button onClick={() => setAcknowledgedSuccessId(null)} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* FPS Dealer KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">En Route Trucks</span>
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            {pendingDeliveries.length} <span className="text-xs font-normal text-zinc-500">Trucks</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Dispatched from central depot</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Consignments Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {receivedDeliveries.length} <span className="text-xs font-normal text-zinc-500">Verified</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Stock on shop shelves</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quota Disbursed</span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {distributedMt.toFixed(1)} <span className="text-xs font-normal text-zinc-500">MT</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-purple-600 rounded-full" 
                style={{ width: `${Math.min(100, quotaPercent)}%` }} 
              />
            </div>
            <span className="text-[10px] font-bold text-purple-600">{quotaPercent}%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Ration Cardholders</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {currentFps.beneficiaryCardsCount}
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Biometric Aadhaar linked</p>
        </div>
      </div>

      {/* INBOUND TRUCKS & QR VERIFICATION ACKNOWLEDGMENT DESK */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800">
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code Consignment Ingestion</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
              In-Transit Consignments Awaiting Shop Delivery Acknowledgment
            </h3>
            <p className="text-xs text-zinc-500">
              When the depot truck arrives at your ration shop, verify the driver&apos;s Form-IV Challan QR code and acknowledge receipt.
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          {pendingDeliveries.length === 0 ? (
            <div className="text-center py-10 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 text-zinc-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-zinc-800 dark:text-zinc-200">All inbound consignments have been acknowledged.</p>
              <p className="text-[11px] mt-0.5">No pending trucks currently in transit from central depot.</p>
            </div>
          ) : (
            pendingDeliveries.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-linear-to-br from-purple-50/40 via-white to-purple-50/20 dark:from-purple-950/20 dark:via-zinc-900 dark:to-zinc-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      {c.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      In-Transit • Gate Pass #{c.gatePassNo}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {c.totalQuantityMt} MT {c.commodityName} ({c.totalBags} Jute Bags)
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Origin: <strong className="text-zinc-700 dark:text-zinc-300">{c.godownDepot}</strong> • Dispatched on {c.dispatchDate}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Truck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Vehicle: {c.vehicleNumber}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3.5 h-3.5 text-purple-600" />
                      <span>Driver: {c.driverName} ({c.driverPhone})</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setPrintedChallan(c)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Inspect Form-IV</span>
                  </button>

                  <button
                    onClick={() => handleAcknowledge(c.id)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Scan QR &amp; Acknowledge Delivery</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RECENT RECEIVED CONSIGNMENTS AT RATION SHOP */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Acknowledged Grain Consignments on Shop Shelves
            </h3>
            <p className="text-xs text-zinc-500">
              Verified deliveries available for biometric cardholder distribution
            </p>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 mt-2">
          {receivedDeliveries.map((c) => (
            <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {c.id}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Received on {c.dispatchDate}
                  </span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {c.totalQuantityMt} MT {c.commodityName} ({c.totalBags} bags) from {c.godownDepot}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Acknowledged &amp; Stocked</span>
                </span>

                <button
                  onClick={() => setPrintedChallan(c)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                  title="Print Delivery Receipt"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print modal */}
      {printedChallan && (
        <ChallanPrintModal
          challan={printedChallan}
          onClose={() => setPrintedChallan(null)}
        />
      )}
    </div>
  );
}
