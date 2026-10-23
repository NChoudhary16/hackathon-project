'use client';

import React from 'react';
import { X, Printer, ShieldCheck, AlertTriangle, QrCode, Building2, Truck, FileCheck, CheckCircle2 } from 'lucide-react';
import { DeliveryChallan } from '../types/inventory';

interface ChallanPrintModalProps {
  challan: DeliveryChallan | null;
  onClose: () => void;
  isOpen?: boolean;
}

export function ChallanPrintModal({ challan, onClose, isOpen = true }: ChallanPrintModalProps) {
  if (!isOpen || !challan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (Screen only) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {challan.id}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              challan.isFifoCompliant
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {challan.isFifoCompliant ? 'Strict FIFO Compliant' : 'Authorized Deviation'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Challan</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Official Document */}
        <div className="p-8 overflow-y-auto space-y-6 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 print:p-0 print:m-0 font-sans">
          {/* Government / Department Header */}
          <div className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-4 text-center space-y-1">
            <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-600 dark:text-zinc-400">
              Department of Food & Public Supplies • Targeted Public Distribution System (TPDS)
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Official Foodgrain Delivery Challan & Gate Pass
            </h1>
            <div className="text-xs font-medium text-zinc-500">
              Generated via StockFlow iPDS Deterministic Inventory Engine • NFSA Compliance Protocol
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs bg-zinc-50/50 dark:bg-zinc-800/40">
            <div>
              <span className="text-zinc-400 font-semibold uppercase text-[10px] block">Challan No.</span>
              <span className="font-mono font-bold text-sm">{challan.id}</span>
            </div>
            <div>
              <span className="text-zinc-400 font-semibold uppercase text-[10px] block">Dispatch Date</span>
              <span className="font-medium">{challan.dispatchDate}</span>
            </div>
            <div>
              <span className="text-zinc-400 font-semibold uppercase text-[10px] block">Gate Pass No.</span>
              <span className="font-mono font-bold text-sm">{challan.gatePassNo}</span>
            </div>
            <div>
              <span className="text-zinc-400 font-semibold uppercase text-[10px] block">Dispatch Status</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{challan.status}</span>
            </div>
          </div>

          {/* Godown & Destination FPS Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Dispatch Godown Depot
              </span>
              <p className="font-bold text-sm">{challan.godownDepot}</p>
              <p className="text-zinc-500 mt-1">Weighbridge Gross: {challan.grossWeightKg.toLocaleString()} kg</p>
              <p className="text-zinc-500">Tare: {challan.tareWeightKg.toLocaleString()} kg | Net: {challan.netWeightKg.toLocaleString()} kg</p>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Destination Fair Price Shop (FPS)
              </span>
              <p className="font-bold text-sm">{challan.fpsName}</p>
              <p className="text-zinc-500 mt-1">FPS Code: {challan.fpsId} ({challan.fpsDistrict})</p>
              <p className="text-zinc-500">Vehicle: {challan.vehicleNumber} | Driver: {challan.driverName} ({challan.driverPhone})</p>
            </div>
          </div>

          {/* Allocated Batches Breakdown Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Traceable Batch Allocations (Deterministic FIFO Dispatch)
            </h3>
            <table className="w-full text-left text-xs border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              <thead className="bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300">
                <tr>
                  <th className="p-2.5">Batch Code</th>
                  <th className="p-2.5">Stack Location</th>
                  <th className="p-2.5">Receipt Date</th>
                  <th className="p-2.5 text-right">Dispatched MT</th>
                  <th className="p-2.5 text-right">50kg Jute Bags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {challan.allocatedBatches.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-mono font-medium">{item.batchId}</td>
                    <td className="p-2.5 text-zinc-600 dark:text-zinc-400">{item.stackLocation}</td>
                    <td className="p-2.5 text-zinc-600 dark:text-zinc-400">{item.receiptDate}</td>
                    <td className="p-2.5 text-right font-bold font-mono">{item.allocatedMt.toFixed(2)} MT</td>
                    <td className="p-2.5 text-right font-mono">{item.bags.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-zinc-50 dark:bg-zinc-800/60 font-bold border-t border-zinc-200 dark:border-zinc-800">
                <tr>
                  <td colSpan={3} className="p-2.5 text-right">Consignment Total:</td>
                  <td className="p-2.5 text-right text-blue-600 dark:text-blue-400 font-mono">
                    {challan.totalQuantityMt.toFixed(2)} MT
                  </td>
                  <td className="p-2.5 text-right font-mono">{challan.totalBags.toLocaleString()} bags</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deviation / Audit Statement */}
          <div className={`p-4 rounded-xl border text-xs ${
            challan.isFifoCompliant
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
          }`}>
            <div className="flex items-start gap-2.5">
              {challan.isFifoCompliant ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wide block">
                  {challan.isFifoCompliant ? 'FIFO Compliance Certified' : 'Supervised Deviation Exception Logged'}
                </span>
                <p>
                  {challan.isFifoCompliant
                    ? 'All grains allocated strictly conform to First-In, First-Out sequence based on earliest intake timestamp.'
                    : challan.deviationJustification}
                </p>
                {challan.authorizedByOfficer && (
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 pt-1">
                    Authorized Officer: {challan.authorizedByOfficer} • Cryptographic PIN Authenticated
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Signatures & Security QR Code */}
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-end justify-between gap-6 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 border border-zinc-300 dark:border-zinc-700 rounded-lg flex items-center justify-center p-1 bg-white">
                <QrCode className="w-full h-full text-zinc-800" />
              </div>
              <div className="font-mono text-[10px] text-zinc-500 max-w-xs break-all">
                DIGITAL SIGNATURE:<br />
                {challan.qrCodeSignature}
              </div>
            </div>

            <div className="text-right space-y-8">
              <div className="h-8 border-b border-zinc-400 dark:border-zinc-600 w-44" />
              <div className="font-bold uppercase text-[10px] text-zinc-500">
                Godown Superintendent / Gate Officer Seal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
