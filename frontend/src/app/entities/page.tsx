'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA } from '../../lib/mock-data';
import { 
  Building2, 
  Warehouse, 
  Boxes, 
  Truck, 
  Store, 
  Layers, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  PackagePlus, 
  History, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Award,
  ChevronRight
} from 'lucide-react';

type EntityType = 
  | 'godowns' 
  | 'commodities' 
  | 'suppliers' 
  | 'fps' 
  | 'batches' 
  | 'receipts_dispatches' 
  | 'exceptions_audit';

export default function EntityDashboardsPage() {
  const {
    godownsList,
    commodities,
    suppliers,
    fairPriceShops,
    batches,
    receipts,
    challans,
    movements,
    fifoExceptions,
    auditLogs,
    currentGodown
  } = useStockFlow();

  const [selectedEntity, setSelectedEntity] = useState<EntityType>('godowns');

  // Aggregated metrics for commodities
  const activeBatches = batches.filter(b => b.status === 'active');
  const totalStockMt = activeBatches.reduce((sum, b) => sum + b.currentQuantityMt, 0);

  // Ageing breakdown
  const ageingTiers = {
    tier1: batches.filter(b => b.status === 'active' && b.ageDays <= 30),
    tier2: batches.filter(b => b.status === 'active' && b.ageDays > 30 && b.ageDays <= 60),
    tier3: batches.filter(b => b.status === 'active' && b.ageDays > 60 && b.ageDays <= 90),
    tier4: batches.filter(b => b.status === 'active' && b.ageDays > 90 && b.ageDays <= 180),
    tier5: batches.filter(b => b.status === 'active' && b.ageDays > 180),
  };

  // Suppliers stats
  const totalSuppliedMt = suppliers.reduce((sum, s) => sum + s.totalSuppliedMt, 0);
  const avgSupplierReliability = Number((suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / suppliers.length).toFixed(1));

  // FPS stats
  const totalBeneficiaryCards = fairPriceShops.reduce((sum, f) => sum + f.beneficiaryCardsCount, 0);
  const totalRemainingQuotaMt = fairPriceShops.reduce((sum, f) => sum + f.activeQuotaRemainingMt, 0);

  return (
    <AppShell pageTitle="Entity Intelligence Dashboards" pageBreadcrumb="Entity Analytics">
      <div className="space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold uppercase tracking-wider">
                Dedicated Entity Intelligence
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
              Deep Analytics for Each Core Entity
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Select an entity below to inspect its dedicated dashboard, regulatory health metrics, and performance analytics.
            </p>
          </div>
        </div>

        {/* Entity Selector Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {[
            { id: 'godowns', label: 'Godowns', icon: Warehouse, count: `${godownsList.length} Depots`, color: 'text-blue-600 dark:text-blue-400' },
            { id: 'commodities', label: 'Commodities', icon: Boxes, count: `${commodities.length} Types`, color: 'text-amber-600 dark:text-amber-400' },
            { id: 'suppliers', label: 'Suppliers', icon: Building2, count: `${suppliers.length} Agencies`, color: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'fps', label: 'Fair Price Shops', icon: Store, count: `${fairPriceShops.length} Shops`, color: 'text-indigo-600 dark:text-indigo-400' },
            { id: 'batches', label: 'Batches & Stacks', icon: Layers, count: `${batches.length} Lots`, color: 'text-purple-600 dark:text-purple-400' },
            { id: 'receipts_dispatches', label: 'Flow & Logistics', icon: Truck, count: `${receipts.length + challans.length} Events`, color: 'text-rose-600 dark:text-rose-400' },
            { id: 'exceptions_audit', label: 'Audit & Exceptions', icon: ShieldCheck, count: `${fifoExceptions.length} Deviations`, color: 'text-cyan-600 dark:text-cyan-400' },
          ].map((entity) => {
            const Icon = entity.icon;
            const isSelected = selectedEntity === entity.id;

            return (
              <button
                key={entity.id}
                onClick={() => setSelectedEntity(entity.id as EntityType)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md scale-102'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400 dark:text-blue-600' : entity.color}`} />
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-400'}`}>
                    {entity.count}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold block truncate">{entity.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 1. GODOWNS ENTITY DASHBOARD */}
        {selectedEntity === 'godowns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">State Depot Network</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{godownsList.length}</span>
                  <span className="text-xs text-zinc-400">Strategic Warehouses</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Interconnected across 3 states & Union Territory</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Cumulative Capacity</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {godownsList.reduce((sum, g) => sum + g.capacityMt, 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">Metric Tonnes</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  100% Operational Readiness
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Heavy Silos & Covered Bays</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {godownsList.reduce((sum, g) => sum + g.siloCount, 0)}
                  </span>
                  <span className="text-xs text-zinc-400">Silos Installed</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Fitted with aerated pest-sealed dampers</p>
              </div>
            </div>

            {/* Individual Godown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {godownsList.map((g) => (
                <div key={g.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-zinc-900 dark:text-white">{g.name}</h4>
                      <p className="text-xs text-zinc-500">{g.district}, {g.state} &bull; Depot Code: {g.id}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {g.operationalStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                    <div>
                      <span className="text-zinc-400 text-[10px] block">Max Capacity</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{g.capacityMt.toLocaleString()} MT</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] block">Silos Installed</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{g.siloCount} Silos</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] block">Manager Contact</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate">{g.managerName}</span>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    <span>Email: <strong>{g.managerEmail}</strong></span>
                    <span>Phone: <strong>{g.managerPhone}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. COMMODITIES ENTITY DASHBOARD */}
        {selectedEntity === 'commodities' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Registered Commodities</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{commodities.length}</span>
                  <span className="text-xs text-zinc-400">Standard Grains</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Food grains, pulses, sugar & oil</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Standard Packaging</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">50</span>
                  <span className="text-xs text-zinc-400">kg Jute Bags</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">BIS-certified gunny bags</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Average Shelf-Life</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">465</span>
                  <span className="text-xs text-zinc-400">Days</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Regulated under NFSA standards</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Active Stock in Buffer</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {Number(commodities.reduce((sum, c) => sum + c.currentInStockMt, 0).toFixed(1))}
                  </span>
                  <span className="text-xs text-zinc-400">MT</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Available for FIFO dispatches</p>
              </div>
            </div>

            {/* Commodities Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {commodities.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">
                      {c.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {c.currentInStockMt} {c.unit}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{c.name}</h4>
                    <p className="text-xs text-zinc-500">{c.category}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Max Safe Moisture:</span>
                      <strong className="text-amber-600 dark:text-amber-400">&le; {c.maxSafeMoisturePercent}%</strong>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Standard Shelf-Life:</span>
                      <strong>{c.defaultShelfLifeDays} Days</strong>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Bag Unit:</span>
                      <strong>{c.standardBagWeightKg} kg / bag</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SUPPLIERS ENTITY DASHBOARD */}
        {selectedEntity === 'suppliers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Total Procurement Agencies</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{suppliers.length}</span>
                  <span className="text-xs text-zinc-400">FCI & State Hubs</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Direct rail rake and truck arrivals</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Total Delivered Tonnage</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {totalSuppliedMt.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">MT</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Since season procurement kickoff</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Average Reliability Index</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {avgSupplierReliability}%
                  </span>
                  <span className="text-xs text-zinc-400">Composite Score</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  High SLA Adherence
                </p>
              </div>
            </div>

            {/* Supplier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((s) => (
                <div key={s.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{s.name}</h4>
                      <p className="text-xs text-zinc-500">{s.state} &bull; {s.code}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      {s.category}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Delivered Volume:</span>
                      <strong className="text-zinc-900 dark:text-white font-bold">{s.totalSuppliedMt.toLocaleString()} MT</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Quality Pass Rate:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{s.qualityPassRate}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Reliability Score:</span>
                      <strong className="text-blue-600 dark:text-blue-400 font-bold">{s.reliabilityScore} / 100</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
                    <p>Contact: <strong>{s.contactPerson}</strong></p>
                    <p>Phone: <strong>{s.phone}</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. FAIR PRICE SHOPS (FPS) ENTITY DASHBOARD */}
        {selectedEntity === 'fps' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Connected Ration Shops</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{fairPriceShops.length}</span>
                  <span className="text-xs text-zinc-400">Authorized Outlets</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">South, East, and Central districts</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Beneficiary Cards Covered</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    {totalBeneficiaryCards.toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-400">Ration Cards</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Antyodaya & Priority Households</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Current Remaining Quota</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {totalRemainingQuotaMt}
                  </span>
                  <span className="text-xs text-zinc-400">MT</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Allocated under NFSA monthly plan</p>
              </div>
            </div>

            {/* FPS Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fairPriceShops.map((f) => (
                <div key={f.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{f.name}</h4>
                      <p className="text-xs text-zinc-500">{f.district} ({f.taluka})</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                      {f.id}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Authorized Dealer:</span>
                      <strong className="text-zinc-900 dark:text-white">{f.dealerName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Beneficiary Cards:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{f.beneficiaryCardsCount.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Active Quota Rem:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{f.activeQuotaRemainingMt} MT</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
                    Dealer Contact: <strong className="text-zinc-700 dark:text-zinc-300">{f.contactNumber}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. INVENTORY BATCHES & STACKS DASHBOARD */}
        {selectedEntity === 'batches' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">0 - 30 Days Old</span>
                <div className="mt-2 text-2xl font-bold text-emerald-600">{ageingTiers.tier1.length} Lots</div>
                <span className="text-[10px] text-zinc-400">Fresh Receipts</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">31 - 60 Days Old</span>
                <div className="mt-2 text-2xl font-bold text-teal-600">{ageingTiers.tier2.length} Lots</div>
                <span className="text-[10px] text-zinc-400">Optimum State</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">61 - 90 Days Old</span>
                <div className="mt-2 text-2xl font-bold text-blue-600">{ageingTiers.tier3.length} Lots</div>
                <span className="text-[10px] text-zinc-400">FIFO Eligible</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">91 - 180 Days Old</span>
                <div className="mt-2 text-2xl font-bold text-amber-600">{ageingTiers.tier4.length} Lots</div>
                <span className="text-[10px] text-zinc-400">Priority Outward</span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">&gt;180 Days (Critical)</span>
                <div className="mt-2 text-2xl font-bold text-rose-600">{ageingTiers.tier5.length} Lots</div>
                <span className="text-[10px] text-rose-500 font-bold">Immediate Dispatch</span>
              </div>
            </div>

            {/* Granular Stack Layout */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Depot Stacking Health & Fumigation Lockout Registry
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-zinc-900 dark:text-white">{b.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        b.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="text-zinc-700 dark:text-zinc-300">
                      <strong>{b.commodityName}</strong> ({b.variety})
                      <p className="text-[11px] text-zinc-500">{b.stackLocation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      <div>
                        <span className="text-zinc-400 block">Current Balance</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{b.currentQuantityMt} MT</strong>
                      </div>
                      <div>
                        <span className="text-zinc-400 block">Stock Age</span>
                        <strong className={b.ageDays > 120 ? 'text-rose-600' : 'text-zinc-800 dark:text-zinc-200'}>{b.ageDays} Days</strong>
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                      <span>Moisture: <strong>{b.moistureContentPercent}%</strong></span>
                      <span>Fumigation Due: <strong>{b.fumigationDueDate}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. RECEIPTS & DISPATCHES (FLOW & LOGISTICS) */}
        {selectedEntity === 'receipts_dispatches' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Inward Stock Inflow</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {receipts.reduce((sum, r) => sum + r.receivedQuantityMt, 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-400">MT Received</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">{receipts.length} verified rail/mandi receipts</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Outward FPS Dispatches</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {challans.reduce((sum, c) => sum + c.totalQuantityMt, 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-400">MT Dispatched</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">{challans.length} delivery challans issued</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Net Depot Inventory Delta</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                    {(receipts.reduce((sum, r) => sum + r.receivedQuantityMt, 0) - challans.reduce((sum, c) => sum + c.totalQuantityMt, 0)).toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-400">MT Buffer</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Positive buffer stock maintained</p>
              </div>
            </div>

            {/* Weighbridge Gate Pass Stream */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Weighbridge Gate Pass & Logistics Turnaround Log
              </h3>
              <div className="space-y-2">
                {challans.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-zinc-900 dark:text-white font-mono">{c.gatePassNo}</strong>
                        <span className="text-zinc-400">&bull;</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{c.id}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                        Vehicle: <strong>{c.vehicleNumber}</strong> &bull; Driver: <strong>{c.driverName}</strong> ({c.driverPhone})
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{c.totalQuantityMt} MT ({c.totalBags} bags)</span>
                      <span className="text-[10px] text-zinc-500">Gross: {c.grossWeightKg.toLocaleString()} kg | Tare: {c.tareWeightKg.toLocaleString()} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. EXCEPTIONS & AUDIT LOGS DASHBOARD */}
        {selectedEntity === 'exceptions_audit' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Documented FIFO Exceptions</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{fifoExceptions.length}</span>
                  <span className="text-xs text-zinc-400">Total Cases</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">100% authorized with regulatory justification</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Compliance Rate</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {challans.length > 0 ? ((challans.filter(c => c.isFifoCompliant).length / challans.length) * 100).toFixed(1) : 100}%
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Target &gt;95% met</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-xs text-zinc-500 font-medium">Cryptographic Audit Logs</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">{auditLogs.length}</span>
                  <span className="text-xs text-zinc-400">Signed Records</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Append-only immutable system trace</p>
              </div>
            </div>

            {/* Exceptions Detail Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Detailed Regulatory Deviation & Authorization Breakdown
              </h3>

              <div className="space-y-3">
                {fifoExceptions.map((ex) => (
                  <div key={ex.id} className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{ex.id}</span>
                        <span className="text-zinc-400">&bull;</span>
                        <span className="font-mono text-zinc-600 dark:text-zinc-300">Challan: {ex.challanNumber}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                        {ex.status}
                      </span>
                    </div>

                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                      <strong>Root Cause Justification:</strong> {ex.reason}
                    </p>

                    <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex flex-wrap items-center justify-between text-[11px] text-zinc-500 gap-2">
                      <span>Bypassed Lot: <code className="text-rose-600 dark:text-rose-400 font-bold">{ex.bypassedBatchId}</code> ({ex.bypassedBatchAgeDays} days old)</span>
                      <span>Authorized by: <strong className="text-zinc-900 dark:text-white">{ex.approvedBy}</strong> ({ex.approvedRole})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
