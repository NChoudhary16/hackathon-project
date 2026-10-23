'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA } from '../../lib/mock-data';
import { CommodityType, QualityGrade } from '../../types/inventory';
import { 
  PackagePlus, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Scale, 
  Layers, 
  X,
  ArrowRight
} from 'lucide-react';

export default function StockReceiptsPage() {
  const { receipts, batches, addStockReceipt, currentGodown } = useStockFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Form State
  const [receiptNumber, setReceiptNumber] = useState(`FCI/REC/2026/${Math.floor(1000 + Math.random() * 9000)}`);
  const [supplier, setSupplier] = useState('Food Corporation of India (FCI) - Punjab Depo');
  const [supplierState, setSupplierState] = useState('Punjab');
  const [commodity, setCommodity] = useState<CommodityType>('wheat');
  const [variety, setVariety] = useState('HD-3086 Certified Foodgrain Rake');
  const [receiptDate, setReceiptDate] = useState('2026-10-22');
  const [expiryDate, setExpiryDate] = useState('2027-10-22');
  const [quantityMt, setQuantityMt] = useState<number>(100.0);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade-A');
  const [stackLocation, setStackLocation] = useState('Bay A-3, Stack S-11');
  const [bayId, setBayId] = useState('A3');
  const [moisturePercent, setMoisturePercent] = useState<number>(11.2);
  const [labReportNo, setLabReportNo] = useState(`AGMARK-LDH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [createdBy, setCreatedBy] = useState('S. K. Verma (Civil Supplies Inspector)');

  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredReceipts = receipts.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.receiptNumber.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q) ||
        r.batchIdentifier.toLowerCase().includes(q) ||
        r.commodityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (quantityMt <= 0) {
      setFormError('Received quantity must be strictly greater than 0 MT.');
      return;
    }

    const res = addStockReceipt({
      receiptNumber: receiptNumber.trim(),
      supplier: supplier.trim(),
      supplierState: supplierState.trim(),
      commodity,
      variety: variety.trim(),
      receiptDate,
      expiryDate,
      quantityMt,
      qualityGrade,
      stackLocation: stackLocation.trim(),
      bayId: bayId.trim(),
      moisturePercent,
      labReportNo: labReportNo.trim(),
      createdBy: createdBy.trim(),
    });

    if (!res.success) {
      setFormError(res.error || 'Failed to submit receipt.');
      return;
    }

    setSuccessToast(`Receipt #${receiptNumber} accepted! Generated batch ${res.batch?.id} and updated inventory.`);
    setIsAddFormOpen(false);
    // Reset random ref
    setReceiptNumber(`FCI/REC/2026/${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <AppShell pageTitle="Stock Receipts & Inward Consignments" pageBreadcrumb="Stock Receipts">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Stock Inward Receipts
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Record incoming rail rakes and mandi consignments with weighbridge readings and lab moisture certifications.
            </p>
          </div>

          <button
            onClick={() => { setIsAddFormOpen(true); setFormError(null); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Inward Receipt</span>
          </button>
        </div>

        {/* Success Feedback Banner */}
        {successToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Search & Statistics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt reference, supplier, linked batch ID..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs px-4">
            <span className="text-zinc-500">Total Inward Tonnage:</span>
            <span className="font-mono font-bold text-zinc-900 dark:text-white">
              {receipts.reduce((sum, r) => sum + r.receivedQuantityMt, 0).toFixed(1)} MT
            </span>
          </div>
        </div>

        {/* Receipts Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Showing {filteredReceipts.length} receipt records</span>
            <span className="font-mono text-zinc-400">Linked to Central Stock Inventory</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Receipt Reference</th>
                  <th className="py-3 px-3">Supplier & Origin</th>
                  <th className="py-3 px-3">Commodity</th>
                  <th className="py-3 px-3">Linked Batch ID</th>
                  <th className="py-3 px-3">Receipt Date</th>
                  <th className="py-3 px-3 text-right">Received Qty</th>
                  <th className="py-3 px-3">Quality Status</th>
                  <th className="py-3 px-3">Godown</th>
                  <th className="py-3 px-3">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {r.receiptNumber}
                    </td>
                    <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">
                      <div className="font-semibold">{r.supplier}</div>
                      <div className="text-[11px] text-zinc-400">{r.supplierState}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{r.commodityName}</div>
                      <div className="text-[11px] text-zinc-500">{r.variety}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-800 dark:text-zinc-200">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        {r.batchIdentifier}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-600 dark:text-zinc-400">{r.receiptDate}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{r.receivedQuantityMt} MT
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'VERIFIED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">{currentGodown.name}</td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">{r.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Receipt Modal Form (Section 9 requirement) */}
        {isAddFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <PackagePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">Record Stock Receipt & Inward Batch</h3>
                    <p className="text-xs text-zinc-500">Creates receipt ledger entry, inventory batch, and logs inward movement.</p>
                  </div>
                </div>
                <button onClick={() => setIsAddFormOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="my-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Receipt Reference #</label>
                    <input
                      type="text"
                      required
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Commodity</label>
                    <select
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value as CommodityType)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    >
                      {Object.entries(COMMODITY_METADATA).map(([k, m]) => (
                        <option key={k} value={k}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Supplier Procurement Agency</label>
                    <input
                      type="text"
                      required
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Supplier Origin State</label>
                    <input
                      type="text"
                      required
                      value={supplierState}
                      onChange={(e) => setSupplierState(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Variety / Grade Details</label>
                    <input
                      type="text"
                      required
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Received Net Quantity (MT)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      required
                      value={quantityMt}
                      onChange={(e) => setQuantityMt(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Receipt Date</label>
                    <input
                      type="date"
                      required
                      value={receiptDate}
                      onChange={(e) => setReceiptDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Assigned Bay & Stack</label>
                    <input
                      type="text"
                      required
                      value={stackLocation}
                      onChange={(e) => setStackLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Bay ID</label>
                    <input
                      type="text"
                      required
                      value={bayId}
                      onChange={(e) => setBayId(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Moisture Content (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={moisturePercent}
                      onChange={(e) => setMoisturePercent(parseFloat(e.target.value) || 0)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">AGMARK / QA Lab Certificate #</label>
                    <input
                      type="text"
                      required
                      value={labReportNo}
                      onChange={(e) => setLabReportNo(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Submit & Generate Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
