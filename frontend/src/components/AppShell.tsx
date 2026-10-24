'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Warehouse, 
  Boxes, 
  PackagePlus, 
  FileText, 
  ShieldCheck, 
  Clock, 
  History, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Search, 
  Bell, 
  Building2, 
  User, 
  Sparkles, 
  PlusCircle, 
  ExternalLink,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  FlaskConical,
  Truck,
  Store,
  LogOut
} from 'lucide-react';
import { useStockFlow } from '../lib/stockflow-context';
import { InwardStockModal } from './InwardStockModal';
import { FifoDispatchModal } from './FifoDispatchModal';
import { ThemeToggle } from './ThemeToggle';
import { AuthGuard } from './AuthGuard';
import { Role, Permission } from '../types/inventory';

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageBreadcrumb?: string;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
}

export function AppShell({ 
  children, 
  pageTitle, 
  pageBreadcrumb,
  allowedRoles,
  requiredPermission 
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    batches, 
    challans, 
    metrics, 
    allGodowns, 
    selectedGodownId, 
    setSelectedGodownId, 
    currentGodown,
    fairPriceShops,
    currentUser,
    currentRole,
    addStockReceipt,
    createDispatch,
    resetAllData,
    logout,
    backendConnected,
    syncWithBackend
  } = useStockFlow();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Modals
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isFifoModalOpen, setIsFifoModalOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Role Dashboards', icon: SlidersHorizontal, badge: '5 Roles', badgeColor: 'blue' },
    { href: '/master', label: 'Master Admin', icon: Building2, badge: 'Director', badgeColor: 'rose' },
    { href: '/entities', label: 'Entity Dashboards', icon: BarChart3, badge: 'All 12', badgeColor: 'purple' },
    { href: '/inventory', label: 'Inventory', icon: Boxes, badge: `${batches.filter(b => b.status === 'active').length}` },
    { href: '/receipts', label: 'Stock Receipts', icon: PackagePlus, badge: undefined },
    { href: '/challans', label: 'Delivery Challans', icon: FileText, badge: `${challans.length}` },
    { href: '/fifo', label: 'FIFO Allocation', icon: ShieldCheck, badge: 'Deterministic' },
    { href: '/ageing', label: 'Stock Ageing', icon: Clock, badge: metrics.criticalAgeingBatchesCount > 0 ? `${metrics.criticalAgeingBatchesCount} Alert` : undefined, badgeColor: 'rose' },
    { href: '/movements', label: 'Movement History', icon: History, badge: undefined },
    { href: '/reports', label: 'Reports', icon: BarChart3, badge: undefined },
    { href: '/settings', label: 'Settings', icon: Settings, badge: undefined },
  ];

  // Quick search results
  const searchResults = searchQuery.trim().length > 1 ? {
    batches: batches.filter(b => 
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.commodityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4),
    challans: challans.filter(c => 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.fpsName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 4),
  } : null;

  return (
    <AuthGuard allowedRoles={allowedRoles} requiredPermission={requiredPermission} pageTitle={pageTitle}>
      <div className="min-h-screen flex flex-col bg-[#FAFAFC] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Official Prototype Notification Strip */}
      <div className="bg-[#F5F5F7] text-zinc-600 px-4 py-1.5 text-xs border-b border-zinc-200/80 flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Link href="/" className="font-semibold text-zinc-950 hover:text-blue-600 transition flex items-center gap-1.5">
              <span>StockFlow iPDS</span>
              <span className="text-[10px] text-zinc-500 font-normal">v1.2 (NFSA India)</span>
            </Link>
            <span className="text-zinc-300 hidden sm:inline">•</span>
            <span className="text-zinc-500 hidden sm:inline">
              Smart Food-Grain Inventory & Deterministic FIFO Compliance
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            <button
              onClick={resetAllData}
              title="Reset state to initial demonstration dataset"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200/80 transition cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3 h-3 text-amber-500" />
              <span>Reset Demo Data</span>
            </button>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-zinc-700 font-medium border border-zinc-200/80 shadow-2xs">
              Demonstration Prototype
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 z-30 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-100 dark:border-zinc-800/80">
            {!isSidebarCollapsed ? (
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>StockFlow</span>
                    <span className="text-blue-600 dark:text-blue-400">iPDS</span>
                  </div>
                  <div className="text-[10px] text-zinc-500">Government Godown Ops</div>
                </div>
              </Link>
            ) : (
              <Link href="/dashboard" className="mx-auto">
                <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </Link>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Depot Badge */}
          {!isSidebarCollapsed && (
            <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate">{currentGodown.name}</span>
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center justify-between">
                <span>{currentGodown.district}, {currentGodown.state}</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">{metrics.currentStockMt} MT</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`} />
                  {!isSidebarCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-blue-700 text-blue-100'
                          : item.badgeColor === 'rose'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Public Landing Link */}
          <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <Link
              href="/"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition ${
                isSidebarCollapsed ? 'justify-center px-2' : ''
              }`}
              title={isSidebarCollapsed ? 'Public Landing Page' : undefined}
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              {!isSidebarCollapsed && <span>Public Landing Page</span>}
            </Link>
          </div>

          {/* User Profile at Bottom */}
          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className={`flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 ${isSidebarCollapsed ? 'justify-center p-2' : ''}`}>
              <div className={`w-8 h-8 rounded-lg ${currentUser.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                {currentUser.avatarLetter}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="capitalize">{currentUser.role.toLowerCase().replace('_', ' ')}</span>
                  </div>
                </div>
              )}
              {!isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Sign out of portal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="mt-2 w-full flex items-center justify-center p-2 rounded-xl text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                title="Sign out of portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
              onClick={() => setIsMobileMenuOpen(false)} 
            />
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-zinc-950 h-full flex flex-col shadow-2xl z-10 p-4 border-r border-zinc-800">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm">StockFlow iPDS</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-3">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Active Godown
                </label>
                <select
                  value={selectedGodownId}
                  onChange={(e) => setSelectedGodownId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                >
                  {allGodowns.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto">
                {navLinks.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Appearance</span>
                  <ThemeToggle variant="segmented" />
                </div>
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Public Landing Page</span>
                </Link>
                <div className="text-xs text-zinc-500">
                  Logged in as <span className="font-semibold text-zinc-800 dark:text-zinc-200">{currentUser.name}</span> ({currentUser.role.replace('_', ' ')})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-semibold transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Terminal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN COLUMN */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* TOP APP HEADER */}
          <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger & Page Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="hidden sm:inline">PDS Command</span>
                  <span className="hidden sm:inline">/</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                    {pageBreadcrumb || 'StockFlow iPDS'}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                  {pageTitle || 'Food-Grain Godown Management'}
                </h1>
              </div>
            </div>

            {/* Center: Global Search Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search batches, challans, gate passes, suppliers..."
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-900 dark:text-zinc-100"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    Clear
                  </button>
                )}

                {/* Instant Search Dropdown */}
                {isSearchOpen && searchResults && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 p-3 space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Matching Batches ({searchResults.batches.length})
                      </div>
                      {searchResults.batches.length === 0 ? (
                        <div className="text-xs text-zinc-500 py-1">No matching batches found</div>
                      ) : (
                        <div className="space-y-1">
                          {searchResults.batches.map(b => (
                            <Link
                              key={b.id}
                              href="/inventory"
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center justify-between p-1.5 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                              <div>
                                <span className="font-mono font-bold text-blue-600">{b.id}</span>
                                <span className="text-zinc-500 ml-2">{b.commodityName}</span>
                              </div>
                              <span className="font-mono text-zinc-700 dark:text-zinc-300">{b.currentQuantityMt} MT</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        Matching Challans ({searchResults.challans.length})
                      </div>
                      {searchResults.challans.length === 0 ? (
                        <div className="text-xs text-zinc-500 py-1">No matching challans found</div>
                      ) : (
                        <div className="space-y-1">
                          {searchResults.challans.map(c => (
                            <Link
                              key={c.id}
                              href="/challans"
                              onClick={() => setIsSearchOpen(false)}
                              className="flex items-center justify-between p-1.5 rounded-lg text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                              <div>
                                <span className="font-mono font-bold text-emerald-600">{c.id}</span>
                                <span className="text-zinc-500 ml-2">{c.fpsName}</span>
                              </div>
                              <span className="font-mono text-zinc-700 dark:text-zinc-300">{c.totalQuantityMt} MT</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Godown Selector, Theme Toggle, Alerts & CTAs */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Godown Selector */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={selectedGodownId}
                  onChange={(e) => setSelectedGodownId(e.target.value)}
                  className="bg-transparent font-medium text-zinc-800 dark:text-zinc-200 text-xs focus:outline-none cursor-pointer"
                >
                  {allGodowns.map((g) => (
                    <option key={g.id} value={g.id} className="dark:bg-zinc-900">
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Backend Connection Indicator */}
              <button
                type="button"
                onClick={() => syncWithBackend()}
                title={backendConnected ? 'Connected to live PostgreSQL Backend API (Port 5000)' : 'Click to reconnect to Express backend API (Port 5000)'}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition cursor-pointer ${
                  backendConnected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{backendConnected ? 'API Live: PG SQL' : 'Local Demo Mode'}</span>
              </button>

              {/* Theme Toggle Button */}
              <ThemeToggle />

              {/* Quick Sign Out Button */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                title="Sign out of portal"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Notification Indicator */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition cursor-pointer"
                  title="Notifications & Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {metrics.criticalAgeingBatchesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-zinc-950 animate-ping" />
                  )}
                  {metrics.criticalAgeingBatchesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white dark:ring-zinc-950" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="font-bold text-xs text-zinc-900 dark:text-white">Active Alerts & Tasks</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Real-time</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {metrics.criticalAgeingBatchesCount > 0 && (
                        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300">
                          <div className="font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{metrics.criticalAgeingBatchesCount} Batches Exceed 180 Days</span>
                          </div>
                          <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
                            Urgent: Oldest lots in Bay A-1 must be rotated under strict FIFO dispatch.
                          </p>
                          <Link
                            href="/ageing"
                            onClick={() => setIsNotificationsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline mt-2"
                          >
                            <span>Inspect Ageing Board</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}

                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-blue-800 dark:text-blue-300">
                        <div className="font-semibold flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>FIFO Compliance at {metrics.fifoComplianceRatePercent}%</span>
                        </div>
                        <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                          Zero unauthorized stock bypasses in current allocation cycle.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action: Inward Stock Button */}
              <button
                onClick={() => setIsInwardModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200/90 transition cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Inward Stock</span>
              </button>

              {/* Action: FIFO Dispatch Button */}
              <button
                onClick={() => setIsFifoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-950 hover:bg-black text-white shadow-xs transition hover:scale-[1.02] cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>FIFO Dispatch</span>
              </button>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          {/* Enterprise Footer */}
          <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 px-4 sm:px-6 text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">StockFlow iPDS</span>
                <span>• Government Food-Grain Godown FIFO Compliance System</span>
              </div>
              <div className="text-[11px] text-zinc-400 text-center sm:text-right">
                <span>Hackathon Demonstration Prototype</span> • <span>National Food Security Act (NFSA) Compliant</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global Inward Stock Modal */}
      <InwardStockModal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        onAddBatch={(b) => {
          // Handled via context or directly
          addStockReceipt({
            receiptNumber: `FCI/INW/2026/${Math.floor(1000 + Math.random() * 9000)}`,
            supplier: b.supplier,
            supplierState: b.supplierState,
            commodity: b.commodity,
            variety: b.variety,
            receiptDate: b.receiptDate,
            expiryDate: b.expiryDate,
            quantityMt: b.currentQuantityMt,
            qualityGrade: b.qualityGrade,
            stackLocation: b.stackLocation,
            bayId: b.bayId,
            moisturePercent: b.moistureContentPercent,
            labReportNo: b.labReportNo,
            createdBy: 'Rajesh Sharma (Godown Superintendent)',
          });
          setIsInwardModalOpen(false);
        }}
      />

      {/* Global FIFO Dispatch Modal */}
      <FifoDispatchModal
        isOpen={isFifoModalOpen}
        onClose={() => setIsFifoModalOpen(false)}
        batches={batches}
        fairPriceShops={fairPriceShops}
        onDispatchCreated={(challan, updatedBatches) => {
          createDispatch({
            fpsId: challan.fpsId,
            commodity: challan.commodity,
            totalQuantityMt: challan.totalQuantityMt,
            vehicleNumber: challan.vehicleNumber,
            driverName: challan.driverName,
            driverPhone: challan.driverPhone,
            allocations: challan.allocatedBatches,
            isFifoCompliant: challan.isFifoCompliant,
            deviationJustification: challan.deviationJustification,
            authorizedByOfficer: challan.authorizedByOfficer,
            authorizationPinUsed: challan.authorizationPinUsed,
          });
          setIsFifoModalOpen(false);
        }}
        initialCommodity="wheat"
      />
    </div>
  </AuthGuard>
  );
}
