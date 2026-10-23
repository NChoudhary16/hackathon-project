'use client';

import React, { useState } from 'react';
import { X, PlusCircle, Warehouse, Sparkles, ShieldCheck, Scale, FileText } from 'lucide-react';
import { Batch, CommodityType, QualityGrade } from '../types/inventory';
import { COMMODITY_METADATA } from '../lib/mock-data';
import { calculateStockAge, calculateSpoilageRisk } from '../lib/fifo-engine';

interface InwardStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBatch: (batch: Batch) => void;
}

export function InwardStockModal({ isOpen, onClose, onAddBatch }: InwardStockModalProps) {
  const [commodity, setCommodity] = useState<CommodityType>('wheat');
  const [variety, setVariety] = useState<string>('PBW-725 Certified Foodgrain');
  const [supplier, setSupplier] = useState<string>('Punjab State Grains Procurement Corp (PUNGRAIN)');
  const [supplierState, setSupplierState] = useState<string>('Punjab');
  const [quantityMt, setQuantityMt] = useState<number>(150);
  const [stackLocation, setStackLocation] = useState<string>('Bay A-4, Stack S-14');
  const [bayId, setBayId] = useState<string>('A4');
  const [moisture, setMoisture] = useState<number>(10.8);
  const [qualityGrade, setQualityGrade] = useState<QualityGrade>('Grade-A');
  const [labReportNo, setLabReportNo] = useState<string>(`AGMARK-PUN-${Math.floor(1000 + Math.random() * 9000)}`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = '2026-10-22';
    const batchId = `BATCH-${commodity.substring(0, 3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;
    const ageDays = 0;
    const fumigationDue = '2027-01-22';
    const risk = calculateSpoilageRisk({
      ageDays,
      moistureContentPercent: moisture,
      fumigationDueDate: fumigationDue,
    });

    const newBatch: Batch = {
      id: batchId,
      commodity,
      commodityName: COMMODITY_METADATA[commodity].name,
      variety,
      supplier,
      supplierState,
      receiptDate: today,
      expiryDate: '2027-10-22',
      initialQuantityMt: quantityMt,
      currentQuantityMt: quantityMt,
      bagCount: Math.round(quantityMt * 20),
      bagSizeKg: 50,
      stackLocation,
      bayId,
      moistureContentPercent: moisture,
      qualityGrade,
      status: qualityGrade === 'Quarantine' ? 'quarantine' : 'active',
      labReportNo,
      fumigationDueDate: fumigationDue,
      lastFumigationDate: today,
      ageDays,
      spoilageRiskScore: risk,
    };

    onAddBatch(newBatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <Warehouse className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Inward New Foodgrain Consignment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Commodity
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value as CommodityType)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
              >
                {Object.entries(COMMODITY_METADATA).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Grain Variety / Specification
              </label>
              <input
                type="text"
                required
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Procuring Supplier Agency
              </label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Origin State
              </label>
              <input
                type="text"
                required
                value={supplierState}
                onChange={(e) => setSupplierState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Net Quantity (MT)
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={quantityMt}
                onChange={(e) => setQuantityMt(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Stack Bay Location
              </label>
              <input
                type="text"
                required
                value={stackLocation}
                onChange={(e) => setStackLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Moisture %
              </label>
              <input
                type="number"
                min="1"
                max="25"
                step="0.1"
                required
                value={moisture}
                onChange={(e) => setMoisture(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Quality Inspection Grade
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value as QualityGrade)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <option value="Grade-A">Grade-A (FCI Standard - Eligible for FIFO)</option>
                <option value="Grade-B">Grade-B (Passed Secondary Inspection)</option>
                <option value="Quarantine">Quarantine (Locked - High moisture / infested)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                AGMARK Lab Report No.
              </label>
              <input
                type="text"
                required
                value={labReportNo}
                onChange={(e) => setLabReportNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
            >
              Confirm Intake & Position in FIFO Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
