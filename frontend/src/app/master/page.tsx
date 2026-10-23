'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { RbacGuard } from '../../components/RbacGuard';
import { TraceabilityInspector } from '../../components/TraceabilityInspector';
import { useStockFlow } from '../../lib/stockflow-context';
import { COMMODITY_METADATA } from '../../lib/mock-data';
import { Role } from '../../types/inventory';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Boxes, 
  PackagePlus, 
  Truck, 
  Store, 
  FileText, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpDown, 
  ExternalLink, 
  Lock, 
  KeyRound, 
  TrendingUp, 
  Clock, 
  Warehouse, 
  Sparkles,
  BarChart3,
  Sliders,
  Check,
  RefreshCw,
  GitCommit,
  Layers
} from 'lucide-react';

type EntityTab = 
  | 'users' 
  | 'godowns' 
  | 'commodities' 
  | 'suppliers' 
  | 'fps' 
  | 'batches' 
  | 'receipts' 
  | 'challans' 
  | 'movements' 
  | 'audit' 
  | 'exceptions';

export default function MasterDashboardPage() {
  const {
    users,
    updateUserRole,
    addUser,
    godownsList,
    addGodown,
    commodities,
    addCommodity,
    suppliers,
    addSupplier,
    fairPriceShops,
    addFairPriceShop,
    batches,
    receipts,
    challans,
    movements,
    auditLogs,
    fifoExceptions,
    approveFifoException,
    updateBatchStatus,
    selectedGodownId,
    setSelectedGodownId,
    currentUser,
    currentRole
  } = useStockFlow();

  const [activeTab, setActiveTab] = useState<EntityTab>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals / forms
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('GODOWN_MANAGER');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  const [newUserGodownId, setNewUserGodownId] = useState('fci_okhla');

  // Network Aggregations
  const totalNetworkCapacityMt = godownsList.reduce((sum, g) => sum + g.capacityMt, 0);
  const totalNetworkStockMt = Number(batches.filter(b => b.status === 'active').reduce((sum, b) => sum + b.currentQuantityMt, 0).toFixed(1));
  const networkUtilizationPercent = totalNetworkCapacityMt > 0 ? Number(((totalNetworkStockMt / totalNetworkCapacityMt) * 100).toFixed(1)) : 0;
  const compliantChallans = challans.filter(c => c.isFifoCompliant).length;
  const overallFifoRate = challans.length > 0 ? Number(((compliantChallans / challans.length) * 100).toFixed(1)) : 100.0;
  const criticalBatchesCount = batches.filter(b => b.status === 'active' && b.ageDays >= 180).length;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      designation: newUserRole === 'ADMIN' ? 'State Officer' : newUserRole === 'GODOWN_MANAGER' ? 'Depot Superintendent' : 'Authorized Staff',
      department: newUserDepartment.trim() || 'Food & Civil Supplies',
      godownId: newUserGodownId,
      godownName: godownsList.find(g => g.id === newUserGodownId)?.name,
      active: true,
      avatarLetter: newUserName.trim().slice(0, 2).toUpperCase(),
      avatarColor: 'bg-indigo-600',
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserDepartment('');
    setIsAddUserOpen(false);
  };

  return (
    <AppShell 
      pageTitle="Master Administration" 
      pageBreadcrumb="Executive Console"
      allowedRoles={['ADMIN']}
    >
      <RbacGuard permission="CAN_ACCESS_MASTER_DASHBOARD" requiredRoleLabel="State Administrator" recommendedRole="ADMIN">
        <div className="space-y-8 pb-16">
          {/* Top Executive Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-extrabold uppercase tracking-wider">
                  Master Administrator Console
                </span>
                <span className="text-xs text-zinc-400">&bull; NFSA Central Supervision</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1">
                State Food & Grain Infrastructure Command Center
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Supervisory oversight across all 12 core database entities, warehouse networks, staff RBAC roles, and regulatory FIFO audit records.
              </p>
            </div>

            {/* Quick Director Profile Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {currentUser.avatarLetter}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 text-[9px] font-black uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">{currentUser.designation}</p>
              </div>
            </div>
          </div>

          {/* Master Network KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-xs text-zinc-500 font-medium block">Total Network Godowns</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{godownsList.length}</span>
                <span className="text-xs text-zinc-400">Depots</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {totalNetworkCapacityMt.toLocaleString()} MT Total Capacity
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-xs text-zinc-500 font-medium block">Grain in Silos & Stacks</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalNetworkStockMt}</span>
                <span className="text-xs text-zinc-400">MT</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                {networkUtilizationPercent}% Utilization
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-xs text-zinc-500 font-medium block">Active Batches</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {batches.filter(b => b.status === 'active').length}
                </span>
                <span className="text-xs text-zinc-400">Lots</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {batches.filter(b => b.status === 'quarantine').length} Quarantined
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-xs text-zinc-500 font-medium block">FIFO Compliance Rate</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{overallFifoRate}%</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                {fifoExceptions.length} Audited Exceptions
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-xs text-zinc-500 font-medium block">Fair Price Shops</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900 dark:text-white">{fairPriceShops.length}</span>
                <span className="text-xs text-zinc-400">Dealers</span>
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1 block">
                100% Quotas Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <span className="text-xs text-zinc-500 font-medium block">Critical Ageing Alert</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${criticalBatchesCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {criticalBatchesCount}
                </span>
                <span className="text-xs text-zinc-400">&gt;180 Days</span>
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Priority Dispatch Req.
              </span>
            </div>
          </div>

          {/* Cross-Godown Balancer Overview */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Statewide Godown Depot Utilization Matrix</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Monitor capacity thresholds and reallocate inward rake consignments across state warehouses.
                </p>
              </div>
              <span className="text-xs font-semibold text-zinc-500">
                Network Average: <strong className="text-blue-600 dark:text-blue-400">{networkUtilizationPercent}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {godownsList.map((g) => {
                const isSelected = g.id === selectedGodownId;
                const occ = g.id === 'fci_okhla' ? totalNetworkStockMt : Math.round(g.capacityMt * 0.68);
                const pct = Math.min(100, Number(((occ / g.capacityMt) * 100).toFixed(1)));

                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedGodownId(g.id)}
                    className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/30 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {g.name}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{g.district}, {g.state}</p>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-zinc-500 text-[11px]">Occupancy</span>
                        <span className="font-bold text-zinc-900 dark:text-white">{pct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct > 85 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>{occ} MT Stored</span>
                        <span>{g.capacityMt} MT Cap</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN SECTION: CORE ENTITIES MANAGEMENT COMMAND CONSOLE */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Top Command Strip & Entity Tabs */}
            <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Master Database Entities Manager (All 12 Core Entities)</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Manage records, inspect relationships, assign RBAC permissions, and resolve regulatory flags.
                  </p>
                </div>

                {/* Add User Action if on Users tab */}
                {activeTab === 'users' && (
                  <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Onboard Depot Staff</span>
                  </button>
                )}
              </div>

              {/* Entity Navigation Tabs */}
              <div className="mt-5 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { id: 'users', label: 'Users & RBAC', count: users.length, icon: Users },
                  { id: 'godowns', label: 'Godowns', count: godownsList.length, icon: Warehouse },
                  { id: 'commodities', label: 'Commodities', count: commodities.length, icon: Boxes },
                  { id: 'suppliers', label: 'Suppliers', count: suppliers.length, icon: Building2 },
                  { id: 'fps', label: 'Fair Price Shops', count: fairPriceShops.length, icon: Store },
                  { id: 'batches', label: 'Inventory Batches', count: batches.length, icon: Layers },
                  { id: 'receipts', label: 'Stock Receipts', count: receipts.length, icon: PackagePlus },
                  { id: 'challans', label: 'Delivery Challans', count: challans.length, icon: Truck },
                  { id: 'movements', label: 'Stock Movements', count: movements.length, icon: History },
                  { id: 'audit', label: 'Audit Logs', count: auditLogs.length, icon: ShieldCheck },
                  { id: 'exceptions', label: 'FIFO Exceptions', count: fifoExceptions.length, icon: AlertTriangle },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id as EntityTab);
                        setSearchQuery('');
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-xs transition cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-search filter bar */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search within ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-xs text-zinc-400 hidden sm:block">
                  Live Master View &bull; Synchronized
                </span>
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="p-4 sm:p-6 overflow-x-auto">
              
              {/* TAB 1: USERS & RBAC */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Staff Officer</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Active RBAC Role</th>
                          <th className="p-3">Assigned Godown</th>
                          <th className="p-3">Department</th>
                          <th className="p-3 text-right">Role Governance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {users
                          .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-8 h-8 rounded-lg ${u.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                                    {u.avatarLetter}
                                  </div>
                                  <div>
                                    <span className="font-bold text-zinc-900 dark:text-white block">{u.name}</span>
                                    <span className="text-[11px] text-zinc-500">{u.designation}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">{u.email}</td>
                              <td className="p-3">
                                <select
                                  value={u.role}
                                  onChange={(e) => updateUserRole(u.id, e.target.value as Role)}
                                  className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
                                >
                                  <option value="ADMIN">ADMIN</option>
                                  <option value="GODOWN_MANAGER">GODOWN_MANAGER</option>
                                  <option value="QUALITY_INSPECTOR">QUALITY_INSPECTOR</option>
                                  <option value="DISPATCH_OFFICER">DISPATCH_OFFICER</option>
                                  <option value="FPS_DEALER">FPS_DEALER</option>
                                </select>
                              </td>
                              <td className="p-3 text-zinc-700 dark:text-zinc-300">
                                {u.godownName || 'Statewide Network'}
                              </td>
                              <td className="p-3 text-zinc-500 truncate max-w-[180px]">{u.department}</td>
                              <td className="p-3 text-right">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Active Verified
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: GODOWNS */}
              {activeTab === 'godowns' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Depot Code & Name</th>
                          <th className="p-3">District / State</th>
                          <th className="p-3">Depot Manager</th>
                          <th className="p-3">Max Capacity</th>
                          <th className="p-3">Silos / Bays</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {godownsList
                          .filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || g.district.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((g) => (
                            <tr key={g.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3">
                                <span className="font-bold text-zinc-900 dark:text-white block">{g.name}</span>
                                <span className="font-mono text-[10px] text-zinc-400">ID: {g.id}</span>
                              </td>
                              <td className="p-3 text-zinc-700 dark:text-zinc-300">{g.district}, {g.state}</td>
                              <td className="p-3">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{g.managerName}</span>
                                <span className="text-[10px] text-zinc-500">{g.managerPhone}</span>
                              </td>
                              <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{g.capacityMt.toLocaleString()} MT</td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400">{g.siloCount} Heavy Silos</td>
                              <td className="p-3 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                  {g.operationalStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: COMMODITIES */}
              {activeTab === 'commodities' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Code & Commodity</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Standard Bag Wt</th>
                          <th className="p-3">Safe Moisture Threshold</th>
                          <th className="p-3">Standard Shelf-Life</th>
                          <th className="p-3 text-right">Current Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {commodities
                          .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-bold">
                                    {c.code}
                                  </span>
                                  <span className="font-bold text-zinc-900 dark:text-white">{c.name}</span>
                                </div>
                              </td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400">{c.category}</td>
                              <td className="p-3 font-semibold">{c.standardBagWeightKg} kg / bag</td>
                              <td className="p-3 text-amber-600 dark:text-amber-400 font-bold">&le; {c.maxSafeMoisturePercent}%</td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400">{c.defaultShelfLifeDays} Days</td>
                              <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                {c.currentInStockMt} {c.unit}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: SUPPLIERS */}
              {activeTab === 'suppliers' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Supplier Agency</th>
                          <th className="p-3">Origin State</th>
                          <th className="p-3">Contact Officer</th>
                          <th className="p-3">Total Supplied</th>
                          <th className="p-3">Quality Pass %</th>
                          <th className="p-3 text-right">Reliability Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {suppliers
                          .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3">
                                <span className="font-bold text-zinc-900 dark:text-white block">{s.name}</span>
                                <span className="font-mono text-[10px] text-zinc-400">{s.code} &bull; {s.category}</span>
                              </td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400">{s.state}</td>
                              <td className="p-3">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{s.contactPerson}</span>
                                <span className="text-[10px] text-zinc-500">{s.phone}</span>
                              </td>
                              <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                                {s.totalSuppliedMt.toLocaleString()} MT
                              </td>
                              <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{s.qualityPassRate}%</td>
                              <td className="p-3 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {s.reliabilityScore}/100
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: FAIR PRICE SHOPS */}
              {activeTab === 'fps' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">FPS Code & Name</th>
                          <th className="p-3">Authorized Dealer</th>
                          <th className="p-3">District / Taluka</th>
                          <th className="p-3">Beneficiary Ration Cards</th>
                          <th className="p-3">Contact Phone</th>
                          <th className="p-3 text-right">Active Quota Rem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {fairPriceShops
                          .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.dealerName.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((f) => (
                            <tr key={f.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3">
                                <span className="font-bold text-zinc-900 dark:text-white block">{f.name}</span>
                                <span className="font-mono text-[10px] text-zinc-400">{f.id}</span>
                              </td>
                              <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200">{f.dealerName}</td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400">{f.district} ({f.taluka})</td>
                              <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400">
                                {f.beneficiaryCardsCount.toLocaleString()} Cards
                              </td>
                              <td className="p-3 text-zinc-500 font-mono">{f.contactNumber}</td>
                              <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                {f.activeQuotaRemainingMt} MT
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: INVENTORY BATCHES */}
              {activeTab === 'batches' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Batch Code</th>
                          <th className="p-3">Commodity & Variety</th>
                          <th className="p-3">Location & Bay</th>
                          <th className="p-3">Age Days</th>
                          <th className="p-3">Moisture %</th>
                          <th className="p-3">Balance Quantity</th>
                          <th className="p-3 text-right">Status & Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {batches
                          .filter(b => b.id.toLowerCase().includes(searchQuery.toLowerCase()) || b.commodityName.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((b) => (
                            <tr key={b.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">{b.id}</td>
                              <td className="p-3">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{b.commodityName}</span>
                                <span className="text-[10px] text-zinc-400">{b.variety}</span>
                              </td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400">{b.stackLocation} (Bay {b.bayId})</td>
                              <td className="p-3">
                                <span className={`font-bold ${b.ageDays > 120 ? 'text-rose-600' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                  {b.ageDays} d
                                </span>
                              </td>
                              <td className="p-3 font-mono font-semibold">{b.moistureContentPercent}%</td>
                              <td className="p-3">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">{b.currentQuantityMt} MT</span>
                                <span className="text-[10px] text-zinc-400">{b.bagCount} bags</span>
                              </td>
                              <td className="p-3 text-right">
                                {b.status === 'quarantine' ? (
                                  <button
                                    onClick={() => updateBatchStatus(b.id, 'active', 'Released by State Administrator')}
                                    className="px-2 py-1 rounded bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 cursor-pointer"
                                  >
                                    Release Batch
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => updateBatchStatus(b.id, 'quarantine', 'Quarantined by State Administrator for inspection')}
                                    className="px-2 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 font-bold text-[10px] hover:bg-rose-200 cursor-pointer"
                                  >
                                    Lock Quarantine
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: STOCK RECEIPTS */}
              {activeTab === 'receipts' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Receipt Number</th>
                          <th className="p-3">Supplier Agency</th>
                          <th className="p-3">Commodity</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Lab Report #</th>
                          <th className="p-3">Date</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {receipts
                          .filter(r => r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) || r.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((r) => (
                            <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">{r.receiptNumber}</td>
                              <td className="p-3 text-zinc-800 dark:text-zinc-200 font-medium">{r.supplier}</td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400">{r.commodityName}</td>
                              <td className="p-3 font-bold text-blue-600 dark:text-blue-400">{r.receivedQuantityMt} MT</td>
                              <td className="p-3 font-mono text-[11px] text-zinc-500">{r.labReportNo}</td>
                              <td className="p-3 text-zinc-500">{r.receiptDate}</td>
                              <td className="p-3 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  r.status === 'VERIFIED'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: DELIVERY CHALLANS */}
              {activeTab === 'challans' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Challan Number</th>
                          <th className="p-3">Destination FPS</th>
                          <th className="p-3">Commodity & Tonnage</th>
                          <th className="p-3">Vehicle & Driver</th>
                          <th className="p-3">FIFO Strictness</th>
                          <th className="p-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {challans
                          .filter(c => c.id.toLowerCase().includes(searchQuery.toLowerCase()) || c.fpsName.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">{c.id}</td>
                              <td className="p-3">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block">{c.fpsName}</span>
                                <span className="text-[10px] text-zinc-400">{c.fpsDistrict}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-zinc-900 dark:text-white">{c.totalQuantityMt} MT</span>
                                <span className="text-[10px] text-zinc-500 block">{c.commodityName}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 block">{c.vehicleNumber}</span>
                                <span className="text-[10px] text-zinc-400">{c.driverName}</span>
                              </td>
                              <td className="p-3">
                                {c.isFifoCompliant ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    Strict FIFO
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    Deviation
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 9: STOCK MOVEMENTS (LEDGER) */}
              {activeTab === 'movements' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Movement ID</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Batch ID</th>
                          <th className="p-3">Delta Tonnage</th>
                          <th className="p-3">Operational Reason</th>
                          <th className="p-3">Officer</th>
                          <th className="p-3 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {movements
                          .filter(m => m.id.toLowerCase().includes(searchQuery.toLowerCase()) || m.batchId.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((m) => (
                            <tr key={m.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">{m.id}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                  m.movementType === 'RECEIPT'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                    : m.movementType === 'DISPATCH'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}>
                                  {m.movementType}
                                </span>
                              </td>
                              <td className="p-3 font-mono text-zinc-600 dark:text-zinc-400">{m.batchId}</td>
                              <td className="p-3 font-mono font-bold">
                                <span className={m.quantityDeltaMt > 0 ? 'text-blue-600' : 'text-emerald-600'}>
                                  {m.quantityDeltaMt > 0 ? `+${m.quantityDeltaMt}` : m.quantityDeltaMt} MT
                                </span>
                              </td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">{m.reason}</td>
                              <td className="p-3 text-zinc-500">{m.userRole}</td>
                              <td className="p-3 text-right font-mono text-[11px] text-zinc-400">{m.timestamp.slice(0, 16).replace('T', ' ')}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 10: AUDIT LOGS */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Log ID</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Entity Target</th>
                          <th className="p-3">Officer & Role</th>
                          <th className="p-3">Details & Audit Payload</th>
                          <th className="p-3 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {auditLogs
                          .filter(a => a.action.toLowerCase().includes(searchQuery.toLowerCase()) || a.details.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((a) => (
                            <tr key={a.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">{a.id}</td>
                              <td className="p-3">
                                <span className="font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                  {a.action}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-blue-600 dark:text-blue-400 block">{a.entity}</span>
                                <span className="text-[10px] text-zinc-400 font-mono">{a.entityId}</span>
                              </td>
                              <td className="p-3 text-zinc-700 dark:text-zinc-300 font-medium">{a.performedBy}</td>
                              <td className="p-3 text-zinc-600 dark:text-zinc-400 max-w-sm truncate">{a.details}</td>
                              <td className="p-3 text-right font-mono text-[11px] text-zinc-400">{a.timestamp.slice(0, 19).replace('T', ' ')}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 11: FIFO EXCEPTIONS */}
              {activeTab === 'exceptions' && (
                <div className="space-y-4">
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3">Exception ID</th>
                          <th className="p-3">Challan Ref</th>
                          <th className="p-3">Selected Batch vs Bypassed Lot</th>
                          <th className="p-3">Justification & Root Cause</th>
                          <th className="p-3">Authorizing Officer</th>
                          <th className="p-3 text-right">Approval Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {fifoExceptions
                          .filter(e => e.id.toLowerCase().includes(searchQuery.toLowerCase()) || e.reason.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((e) => (
                            <tr key={e.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition">
                              <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">{e.id}</td>
                              <td className="p-3 font-mono text-blue-600 dark:text-blue-400">{e.challanNumber}</td>
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
                                    Dispatched: {e.requestedBatchId}
                                  </span>
                                  <span className="text-rose-500 font-mono text-[10px] block">
                                    Bypassed: {e.bypassedBatchId} ({e.bypassedBatchAgeDays}d old)
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-zinc-700 dark:text-zinc-300 max-w-xs">{e.reason}</td>
                              <td className="p-3">
                                <span className="font-semibold text-zinc-900 dark:text-white block">{e.approvedBy}</span>
                                <span className="text-[10px] text-zinc-500">{e.approvedRole}</span>
                              </td>
                              <td className="p-3 text-right">
                                {e.status === 'APPROVED' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    DFC Approved
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => approveFifoException(e.id, currentUser.name)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow-xs cursor-pointer"
                                  >
                                    Authorize Exception
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* TRACEABILITY INSPECTOR SECTION (BATCH JOURNEY) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Interactive Batch Lifecycle & Traceability Explorer</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Inspect how any grain consignment moves through receipt, depot stacking, movements, dispatches, and regulatory audits.
              </p>
            </div>

            <TraceabilityInspector initialBatchId="BATCH-WHT-2025-081" />
          </div>

          {/* ADD USER MODAL */}
          {isAddUserOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      Onboard New Depot Staff Member
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddUserOpen(false)}
                    className="text-zinc-400 hover:text-zinc-600 text-sm font-bold cursor-pointer"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Balwinder Singh"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Govt / Official Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., b.singh@stockflow.gov.in"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Assigned Role (RBAC)
                      </label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as Role)}
                        className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      >
                        <option value="GODOWN_MANAGER">Godown Manager</option>
                        <option value="QUALITY_INSPECTOR">Quality Inspector</option>
                        <option value="DISPATCH_OFFICER">Dispatch Officer</option>
                        <option value="FPS_DEALER">FPS Dealer</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Assigned Godown Depot
                      </label>
                      <select
                        value={newUserGodownId}
                        onChange={(e) => setNewUserGodownId(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                      >
                        {godownsList.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Department / Section
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Weighbridge Operations & Gate Control"
                      value={newUserDepartment}
                      onChange={(e) => setNewUserDepartment(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Create Verified User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </RbacGuard>
    </AppShell>
  );
}
