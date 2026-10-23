'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA } from '../../lib/mock-data';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Truck, 
  Boxes,
  FileText
} from 'lucide-react';

type ReportTab = 
  | 'commodity' 
  | 'godown' 
  | 'ageing' 
  | 'compliance' 
  | 'fps-dispatch' 
  | 'movement' 
  | 'exceptions';

export default function ReportsPage() {
  const { batches, challans, movements, metrics, currentGodown, allGodowns, ageingConfig } = useStockFlow();

  const [activeReport, setActiveReport] = useState<ReportTab>('commodity');

  // Report 1: Commodity Inventory Data
  const commodityData = useMemo(() => {
    return Object.entries(COMMODITY_METADATA).map(([key, meta]) => {
      const activeBatches = batches.filter((b) => b.commodity === key && b.status === 'active');
      const totalMt = activeBatches.reduce((sum, b) => sum + b.currentQuantityMt, 0);
      const totalBags = activeBatches.reduce((sum, b) => sum + b.bagCount, 0);
      const avgMoisture = activeBatches.length > 0
        ? (activeBatches.reduce((sum, b) => sum + b.moistureContentPercent, 0) / activeBatches.length).toFixed(1)
        : '-';

      return {
        key,
        name: meta.name,
        hindiName: meta.hindiName,
        batchesCount: activeBatches.length,
        totalQuantityMt: Number(totalMt.toFixed(2)),
        totalBags,
        avgMoisture: `${avgMoisture}%`,
        maxSafeMoisture: `${meta.maxMoistureSafePercent}%`,
        shelfLifeDays: `${meta.standardShelfLifeDays}d`,
      };
    });
  }, [batches]);

  // Report 2: Godown Inventory Data
  const godownData = useMemo(() => {
    return allGodowns.map((g) => {
      const isCurrent = g.id === currentGodown.id;
      const stock = isCurrent ? metrics.currentStockMt : Math.round(g.capacityMt * 0.48);
      const util = isCurrent ? metrics.utilizationRatePercent : Number(((stock / g.capacityMt) * 100).toFixed(1));
      return {
        id: g.id,
        name: g.name,
        state: g.state,
        capacityMt: g.capacityMt,
        currentStockMt: stock,
        utilizationRate: `${util}%`,
        status: 'OPERATIONAL',
      };
    });
  }, [allGodowns, currentGodown, metrics]);

  // Report 3: Batch Ageing Report
  const ageingReportData = useMemo(() => {
    return batches
      .filter((b) => b.status === 'active' && b.currentQuantityMt > 0)
      .map((b) => ({
        batchId: b.id,
        commodity: b.commodityName,
        variety: b.variety,
        receiptDate: b.receiptDate,
        expiryDate: b.expiryDate,
        ageDays: b.ageDays,
        currentMt: b.currentQuantityMt,
        stackLocation: b.stackLocation,
        spoilageRiskScore: b.spoilageRiskScore,
        alertStatus: b.ageDays >= ageingConfig.criticalAlertDays ? 'CRITICAL (>180d)' : b.ageDays > 90 ? 'ELEVATED (>90d)' : 'NORMAL',
      }))
      .sort((a, b) => b.ageDays - a.ageDays);
  }, [batches, ageingConfig]);

  // Report 4: FIFO Compliance Report
  const complianceReportData = useMemo(() => {
    return challans.map((c) => ({
      challanId: c.id,
      date: c.dispatchDate,
      fpsName: c.fpsName,
      commodity: c.commodityName,
      dispatchedMt: c.totalQuantityMt,
      isCompliant: c.isFifoCompliant ? '100% COMPLIANT' : 'DEVIATION EXCEPTION',
      justification: c.deviationJustification || 'Pure Deterministic Schedule',
      authorizedBy: c.authorizedByOfficer || 'System Automatic FIFO',
    }));
  }, [challans]);

  // Report 5: FPS Dispatches
  const fpsDispatchData = useMemo(() => {
    return challans.map((c) => ({
      challanId: c.id,
      fpsName: c.fpsName,
      fpsId: c.fpsId,
      district: c.fpsDistrict,
      date: c.dispatchDate,
      commodity: c.commodityName,
      quantityMt: c.totalQuantityMt,
      bags: c.totalBags,
      vehicle: c.vehicleNumber,
      driver: c.driverName,
      gatePass: c.gatePassNo,
    }));
  }, [challans]);

  // Export to CSV Functionality
  const exportToCsv = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const header = keys.join(',');
    const csvContent = [
      header,
      ...rows.map((row) =>
        keys
          .map((k) => {
            const val = row[k] === undefined ? '' : String(row[k]);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell pageTitle="Central Reports & Analytics Export" pageBreadcrumb="Reports">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Food-Grain Analytics & Compliance Reports
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Export verified inventory statements, batch ageing audits, and FPS dispatch histories to CSV.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeReport === 'commodity') exportToCsv('commodity_inventory_report', commodityData);
                else if (activeReport === 'godown') exportToCsv('godown_capacity_report', godownData);
                else if (activeReport === 'ageing') exportToCsv('batch_ageing_audit', ageingReportData);
                else if (activeReport === 'compliance') exportToCsv('fifo_compliance_ledger', complianceReportData);
                else if (activeReport === 'fps-dispatch') exportToCsv('fps_dispatch_statement', fpsDispatchData);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Report Tabs (Section 14) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800 scrollbar-none text-xs font-semibold">
          {[
            { id: 'commodity', label: '1. Inventory by Commodity', icon: Boxes },
            { id: 'godown', label: '2. Inventory by Godown', icon: Building2 },
            { id: 'ageing', label: '3. Batch-Ageing Report', icon: Clock },
            { id: 'compliance', label: '4. FIFO Compliance Report', icon: ShieldCheck },
            { id: 'fps-dispatch', label: '5. Dispatch History by FPS', icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as ReportTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Report View Content */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
          {/* TAB 1: COMMODITY */}
          {activeReport === 'commodity' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-bold text-zinc-900 dark:text-white">Active Commodities Stock Statement</span>
                <span className="font-mono">Live Central Reserves</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                    <tr>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">Hindi Name</th>
                      <th className="p-3 text-right">Active Batches</th>
                      <th className="p-3 text-right">Total Tonnage (MT)</th>
                      <th className="p-3 text-right">Total Bags</th>
                      <th className="p-3">Average Moisture</th>
                      <th className="p-3">Max Safe Moisture</th>
                      <th className="p-3">Standard Shelf-Life</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {commodityData.map((c) => (
                      <tr key={c.key} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">{c.name}</td>
                        <td className="p-3 text-zinc-500">{c.hindiName}</td>
                        <td className="p-3 text-right font-mono">{c.batchesCount}</td>
                        <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{c.totalQuantityMt} MT</td>
                        <td className="p-3 text-right font-mono text-zinc-500">{c.totalBags}</td>
                        <td className="p-3 font-mono">{c.avgMoisture}</td>
                        <td className="p-3 font-mono text-zinc-500">{c.maxSafeMoisture}</td>
                        <td className="p-3 font-mono text-zinc-500">{c.shelfLifeDays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: GODOWN */}
          {activeReport === 'godown' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-bold text-zinc-900 dark:text-white">State & Central Godowns Capacity Utilization</span>
                <span className="font-mono">FCI / CWC / SWC Network</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                    <tr>
                      <th className="p-3">Godown Hub Name</th>
                      <th className="p-3">State / Jurisdiction</th>
                      <th className="p-3 text-right">Total Capacity (MT)</th>
                      <th className="p-3 text-right">Stored Stock (MT)</th>
                      <th className="p-3 text-right">Utilization %</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    {godownData.map((g) => (
                      <tr key={g.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 font-sans">
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">{g.name}</td>
                        <td className="p-3 text-zinc-500">{g.state}</td>
                        <td className="p-3 text-right font-mono">{g.capacityMt} MT</td>
                        <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{g.currentStockMt} MT</td>
                        <td className="p-3 text-right font-mono">{g.utilizationRate}</td>
                        <td className="p-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AGEING */}
          {activeReport === 'ageing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-bold text-zinc-900 dark:text-white">Batch-Level Ageing Audit Report</span>
                <span className="font-mono">Chronological Oldest Lots</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                    <tr>
                      <th className="p-3">Batch ID</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3">Receipt Date</th>
                      <th className="p-3">Storage Age</th>
                      <th className="p-3 text-right">Current Stock (MT)</th>
                      <th className="p-3">Stack Location</th>
                      <th className="p-3">Spoilage Risk</th>
                      <th className="p-3">Alert Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    {ageingReportData.map((b) => (
                      <tr key={b.batchId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{b.batchId}</td>
                        <td className="p-3 font-sans text-zinc-800 dark:text-zinc-200">{b.commodity}</td>
                        <td className="p-3 text-zinc-500">{b.receiptDate}</td>
                        <td className="p-3 font-bold text-zinc-900 dark:text-white">{b.ageDays} days</td>
                        <td className="p-3 text-right font-bold">{b.currentMt} MT</td>
                        <td className="p-3 text-zinc-500">{b.stackLocation}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.spoilageRiskScore > 50 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {b.spoilageRiskScore}/100
                          </span>
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.alertStatus.includes('CRITICAL') ? 'bg-rose-100 text-rose-800' : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {b.alertStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: COMPLIANCE */}
          {activeReport === 'compliance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-bold text-zinc-900 dark:text-white">FIFO Compliance & Deviation Audit Log</span>
                <span className="font-mono">Rate: {metrics.fifoComplianceRatePercent}%</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                    <tr>
                      <th className="p-3">Challan Ref</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Destination FPS</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3">FIFO Status</th>
                      <th className="p-3">Authorization Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {complianceReportData.map((c) => (
                      <tr key={c.challanId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{c.challanId}</td>
                        <td className="p-3 font-mono text-zinc-500">{c.date}</td>
                        <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200">{c.fpsName}</td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">{c.commodity}</td>
                        <td className="p-3 text-right font-mono font-bold">{c.dispatchedMt} MT</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.isCompliant.includes('100%') ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {c.isCompliant}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-500 text-[11px] max-w-xs truncate" title={c.justification}>
                          {c.justification}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: FPS DISPATCH STATEMENT */}
          {activeReport === 'fps-dispatch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-bold text-zinc-900 dark:text-white">Fair Price Shop Dispatch Statement</span>
                <span className="font-mono">Weighbridge Verified Passes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold">
                    <tr>
                      <th className="p-3">Challan</th>
                      <th className="p-3">Gate Pass</th>
                      <th className="p-3">FPS Shop Name</th>
                      <th className="p-3">District</th>
                      <th className="p-3">Commodity</th>
                      <th className="p-3 text-right">Net Qty (MT)</th>
                      <th className="p-3 text-right">Bags</th>
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Driver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
                    {fpsDispatchData.map((d) => (
                      <tr key={d.challanId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{d.challanId}</td>
                        <td className="p-3 text-zinc-500">{d.gatePass}</td>
                        <td className="p-3 font-sans font-semibold text-zinc-800 dark:text-zinc-200">{d.fpsName}</td>
                        <td className="p-3 font-sans text-zinc-500">{d.district}</td>
                        <td className="p-3 font-sans text-zinc-700 dark:text-zinc-300">{d.commodity}</td>
                        <td className="p-3 text-right font-bold text-zinc-900 dark:text-white">{d.quantityMt} MT</td>
                        <td className="p-3 text-right text-zinc-500">{d.bags}</td>
                        <td className="p-3 text-zinc-700 dark:text-zinc-300">{d.vehicle}</td>
                        <td className="p-3 font-sans text-zinc-500">{d.driver}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
