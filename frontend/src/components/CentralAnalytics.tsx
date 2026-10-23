'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Warehouse, 
  Clock, 
  Scale, 
  Droplet,
  Layers,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Batch, DeliveryChallan, GodownMetrics } from '../types/inventory';
import { COMMODITY_METADATA } from '../lib/mock-data';

interface CentralAnalyticsProps {
  batches: Batch[];
  challans: DeliveryChallan[];
  metrics: GodownMetrics;
}

export function CentralAnalytics({ batches, challans, metrics }: CentralAnalyticsProps) {
  // Aggregate stock by commodity
  const stockByCommodity = Object.entries(COMMODITY_METADATA).map(([key, meta]) => {
    const totalMt = batches
      .filter((b) => b.commodity === key && b.status === 'active')
      .reduce((sum, b) => sum + b.currentQuantityMt, 0);
    return {
      name: meta.name.split(' (')[0],
      mt: Number(totalMt.toFixed(1)),
      color: meta.color,
    };
  }).filter((item) => item.mt > 0);

  // Ageing Distribution
  const ageingBuckets = [
    { name: 'Fresh (<30d)', count: 0, mt: 0, color: '#10b981' },
    { name: 'Normal (31-90d)', count: 0, mt: 0, color: '#3b82f6' },
    { name: 'Priority (91-180d)', count: 0, mt: 0, color: '#f59e0b' },
    { name: 'Critical (>180d)', count: 0, mt: 0, color: '#ef4444' },
  ];

  batches.forEach((b) => {
    if (b.status === 'active') {
      if (b.ageDays <= 30) {
        ageingBuckets[0].count++;
        ageingBuckets[0].mt += b.currentQuantityMt;
      } else if (b.ageDays <= 90) {
        ageingBuckets[1].count++;
        ageingBuckets[1].mt += b.currentQuantityMt;
      } else if (b.ageDays <= 180) {
        ageingBuckets[2].count++;
        ageingBuckets[2].mt += b.currentQuantityMt;
      } else {
        ageingBuckets[3].count++;
        ageingBuckets[3].mt += b.currentQuantityMt;
      }
    }
  });

  // Monthly Compliance Historical Data
  const complianceTrend = [
    { month: 'May 2026', compliance: 92.1, dispatchesMt: 680 },
    { month: 'Jun 2026', compliance: 94.5, dispatchesMt: 740 },
    { month: 'Jul 2026', compliance: 96.0, dispatchesMt: 810 },
    { month: 'Aug 2026', compliance: 97.2, dispatchesMt: 790 },
    { month: 'Sep 2026', compliance: 98.1, dispatchesMt: 825 },
    { month: 'Oct 2026 (Live)', compliance: 98.4, dispatchesMt: 842 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">FIFO Compliance Rate</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">
            {metrics.fifoComplianceRatePercent}%
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+6.3% vs state baseline</span>
          </p>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Silo Capacity Utilization</span>
            <Warehouse className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">
            {metrics.utilizationRatePercent}%
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {metrics.currentStockMt} MT of {metrics.totalCapacityMt} MT capacity
          </p>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Ageing Alert</span>
            <Clock className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
            {metrics.criticalAgeingBatchesCount} Lots (&gt;180d)
          </div>
          <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">
            Prioritized automatically in next dispatch
          </p>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Dispatches</span>
            <Scale className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">
            {metrics.monthlyDispatchedMt} MT
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Dispatched across 1,420+ Fair Price Shops
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Stock by Commodity */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
            Current Foodgrain Stock by Commodity (MT)
          </h3>
          <p className="text-xs text-zinc-500 mb-6">Real-time tonnage distribution across active godown stacks</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByCommodity} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} MT`, 'Current Stock']}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Bar dataKey="mt" radius={[6, 6, 0, 0]}>
                  {stockByCommodity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Ageing Distribution Tier */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-1">
            Stock Ageing & Spoilage Prevention Radar
          </h3>
          <p className="text-xs text-zinc-500 mb-4">Metric tonnes categorized by days in storage</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageingBuckets}
                    dataKey="mt"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {ageingBuckets.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toFixed(1)} MT`, 'Stock']}
                    contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 text-xs">
              {ageingBuckets.map((bucket, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bucket.color }} />
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{bucket.name}</span>
                  </div>
                  <div className="font-mono font-bold text-zinc-900 dark:text-white">
                    {bucket.mt.toFixed(1)} MT ({bucket.count} lots)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: Compliance Trend Over Time */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                6-Month FIFO Compliance Rate & Dispatch Volume
              </h3>
              <p className="text-xs text-zinc-500">Measurable impact of deterministic stack allocation on adherence rates</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
              Target: &gt;95% FIFO Adherence
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={complianceTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'FIFO Compliance']}
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Area type="monotone" dataKey="compliance" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCompliance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
