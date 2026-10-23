'use client';

import React, { useState } from 'react';
import { 
  FlaskConical, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Boxes, 
  Sparkles, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  ArrowRight, 
  Check, 
  X,
  Sliders,
  ShieldAlert,
  Percent,
  Calendar
} from 'lucide-react';
import { useStockFlow } from '../../lib/stockflow-context';
import { QualityGrade, BatchStatus } from '../../types/inventory';
import { COMMODITY_METADATA } from '../../lib/mock-data';

export function QualityDashboardView() {
  const {
    batches,
    currentGodown,
    updateBatchQuality,
    updateBatchStatus,
    currentUser,
    hasPermission,
  } = useStockFlow();

  // Selected batch for live laboratory inspection modal / panel
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [testGrade, setTestGrade] = useState<QualityGrade>('Grade-A');
  const [testMoisture, setTestMoisture] = useState<number>(11.5);
  const [testReportNo, setTestReportNo] = useState<string>('');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quarantine & lab stats
  const totalBatches = batches.length;
  const gradeABatches = batches.filter((b) => b.qualityGrade === 'Grade-A').length;
  const gradeBBatches = batches.filter((b) => b.qualityGrade === 'Grade-B').length;
  const quarantineBatches = batches.filter((b) => b.status === 'quarantine' || b.qualityGrade === 'Quarantine').length;
  const highMoistureBatches = batches.filter((b) => b.moistureContentPercent > 12.5).length;
  const avgMoisture = batches.length > 0 
    ? (batches.reduce((sum, b) => sum + b.moistureContentPercent, 0) / batches.length).toFixed(1)
    : '11.8';

  const handleOpenInspection = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;
    setSelectedBatchId(batchId);
    setTestGrade(batch.qualityGrade);
    setTestMoisture(batch.moistureContentPercent);
    setTestReportNo(batch.labReportNo || `AGMARK/LAB/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSaveInspection = () => {
    if (!selectedBatchId) return;
    updateBatchQuality(selectedBatchId, testGrade, testMoisture, testReportNo);
    setSuccessMessage(`Inspection report ${testReportNo} recorded successfully for ${selectedBatchId}`);
    setSelectedBatchId(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const filteredBatches = batches.filter((b) => {
    const matchesGrade = filterGrade === 'all' || b.qualityGrade === filterGrade;
    const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.commodityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.stackLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Quality Inspector Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-950 via-zinc-900 to-emerald-950 text-white p-6 sm:p-8 border border-emerald-900/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Agmark Food Grain Laboratory • Quality & Assay Workbench</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Grain Quality Certification & Moisture Control
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Statutory AGMARK assay desk. Test moisture content, assign Grade-A / Grade-B certifications, issue lab test reports, and enforce quarantine lockouts on fungal or pest-infested consignments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-emerald-800/60 text-center min-w-32">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Quality Lead</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{currentUser.name}</p>
              <span className="text-[10px] text-zinc-500">Chief Lab Chemist</span>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* QC Laboratory KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Grade-A Lots</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {gradeABatches} <span className="text-xs font-normal text-zinc-500">Certified</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Premium NFSA standard</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Moisture</span>
            <Percent className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {avgMoisture}%
          </div>
          <p className="text-[10px] text-emerald-600 mt-1 font-medium">&lt;12.0% safe moisture target</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quarantined</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">
            {quarantineBatches} <span className="text-xs font-normal text-zinc-500">Locked</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">Fumigation / moisture lock</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Moisture</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {highMoistureBatches} <span className="text-xs font-normal text-zinc-500">Lots</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">&gt;12.5% moisture alert</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Assay Lots</span>
            <Boxes className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-zinc-900 dark:text-white">
            {totalBatches} <span className="text-xs font-normal text-zinc-500">Batches</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1">100% lab tracked</p>
        </div>
      </div>

      {/* GRAIN MOISTURE THRESHOLD BENCHMARKS */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AGMARK Quality Standards</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
              Statutory Moisture Limits by Commodity
            </h3>
            <p className="text-xs text-zinc-500">
              National Food Security Act (NFSA) upper threshold limits. Lots exceeding limits cannot be accepted on Grade-A receipt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-900 dark:text-white">Wheat (HD-3086)</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-600">Max 12.0%</span>
              <span className="text-[10px] text-zinc-400">moisture</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Safe storage: 365 days</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-900 dark:text-white">Raw Rice (Swarna)</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-600">Max 14.0%</span>
              <span className="text-[10px] text-zinc-400">moisture</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Safe storage: 240 days</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-900 dark:text-white">Parboiled Rice</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-600">Max 14.5%</span>
              <span className="text-[10px] text-zinc-400">moisture</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Safe storage: 180 days</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700">
            <span className="text-xs font-bold text-zinc-900 dark:text-white">Chana & Tuvar Dal</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-600">Max 10.5%</span>
              <span className="text-[10px] text-zinc-400">moisture</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Safe storage: 300 days</p>
          </div>
        </div>
      </div>

      {/* GRAIN BATCHES QC WORKBENCH & LAB INSPECTION */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Laboratory Inspection & Grading Queue
            </h3>
            <p className="text-xs text-zinc-500">
              Select any inventory lot to test moisture %, change AGMARK grading, or enforce quarantine locks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search batch or stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
            />

            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Grades</option>
              <option value="Grade-A">Grade-A</option>
              <option value="Grade-B">Grade-B</option>
              <option value="Quarantine">Quarantine</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase text-[10px] font-bold">
                <th className="pb-3">Batch ID</th>
                <th className="pb-3">Commodity & Variety</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Moisture %</th>
                <th className="pb-3">Current Grade</th>
                <th className="pb-3">Lab Report #</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="py-3 font-mono font-bold text-zinc-900 dark:text-white">
                    {b.id}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">{b.commodityName}</div>
                    <div className="text-[10px] text-zinc-400">{b.variety}</div>
                  </td>
                  <td className="py-3 text-zinc-600 dark:text-zinc-400">
                    {b.stackLocation}
                  </td>
                  <td className="py-3">
                    <span className={`font-bold ${b.moistureContentPercent > 12.5 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {b.moistureContentPercent}%
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.qualityGrade === 'Grade-A'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : b.qualityGrade === 'Grade-B'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {b.qualityGrade}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-zinc-500">
                    {b.labReportNo || 'PENDING_ASSAY'}
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleOpenInspection(b.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition cursor-pointer"
                    >
                      Assay & Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE INSPECTION MODAL */}
      {selectedBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                  <FlaskConical className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Record Laboratory Assay Certificate
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Batch: <strong className="font-mono text-zinc-800 dark:text-zinc-200">{selectedBatchId}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedBatchId(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Assigned Quality Grade
                </label>
                <select
                  value={testGrade}
                  onChange={(e) => setTestGrade(e.target.value as QualityGrade)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="Grade-A">Grade-A (Sound, Merchantable, AGMARK Passed)</option>
                  <option value="Grade-B">Grade-B (Slight Discoloration, Acceptable)</option>
                  <option value="Quarantine">Quarantine (Fumigation / High Moisture Lock)</option>
                  <option value="Damaged">Damaged (Distressed, Distilleries Only)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Moisture Content Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="25"
                  value={testMoisture}
                  onChange={(e) => setTestMoisture(parseFloat(e.target.value))}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Moisture above 13.0% will automatically trigger a biological hazard warning.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  AGMARK Laboratory Report Number
                </label>
                <input
                  type="text"
                  value={testReportNo}
                  onChange={(e) => setTestReportNo(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedBatchId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInspection}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                Save Laboratory Certification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
