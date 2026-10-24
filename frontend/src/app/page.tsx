'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Warehouse, 
  Clock, 
  Truck, 
  FileText, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  Building2, 
  Boxes,
  BarChart3, 
  RotateCcw, 
  Search, 
  Calendar,
  Lock,
  KeyRound,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Play,
  Sliders,
  Check,
  PackageCheck,
  QrCode,
  Flame,
  HelpCircle,
  Menu,
  X,
  UserCheck,
  Scale,
  ShieldAlert,
  Cpu,
  Activity,
  Zap,
  ArrowUpRight,
  Eye,
  CheckCircle,
  Gauge,
  Workflow
} from 'lucide-react';
import { FifoWorkflowVisualizer } from '../components/FifoWorkflowVisualizer';

const LANDING_NAV_ITEMS = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'simulator', label: 'FIFO Simulator', href: '#simulator', hasDot: true },
  { id: 'roles', label: 'Role Portals', href: '#roles' },
  { id: 'workflow', label: 'Workflow', href: '#workflow' },
  { id: 'capabilities', label: 'Capabilities', href: '#capabilities' },
  { id: 'traceability', label: 'Traceability', href: '#traceability' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
];

export type WeighingUnit = 'kg' | 'mt' | 'qtl' | 'bags';

export interface WeighingUnitConfig {
  id: WeighingUnit;
  label: string;
  shortLabel: string;
  badge: string;
  kgPerUnit: number;
  min: number;
  max: number;
  step: number;
  standardIndent: number;
  presets: { label: string; desc: string; value: number }[];
}

export const WEIGHING_UNITS: Record<WeighingUnit, WeighingUnitConfig> = {
  kg: {
    id: 'kg',
    label: 'Kilograms (kg)',
    shortLabel: 'kg',
    badge: 'Standard SI Metric',
    kgPerUnit: 1,
    min: 30000,
    max: 310000,
    step: 5000,
    standardIndent: 180000,
    presets: [
      { label: '60,000 kg', desc: 'Local FPS', value: 60000 },
      { label: '120,000 kg', desc: 'Sub-division', value: 120000 },
      { label: '180,000 kg', desc: 'Block Allocation', value: 180000 },
      { label: '270,000 kg', desc: 'District Fleet', value: 270000 },
    ],
  },
  mt: {
    id: 'mt',
    label: 'Metric Tonnes (MT)',
    shortLabel: 'MT',
    badge: 'Depot Wholesale',
    kgPerUnit: 1000,
    min: 30,
    max: 310,
    step: 5,
    standardIndent: 180,
    presets: [
      { label: '60 MT', desc: 'Local FPS', value: 60 },
      { label: '120 MT', desc: 'Sub-division', value: 120 },
      { label: '180 MT', desc: 'Block Allocation', value: 180 },
      { label: '270 MT', desc: 'District Fleet', value: 270 },
    ],
  },
  qtl: {
    id: 'qtl',
    label: 'Quintals (qtl)',
    shortLabel: 'qtl',
    badge: 'Mandi / MSP',
    kgPerUnit: 100,
    min: 300,
    max: 3100,
    step: 50,
    standardIndent: 1800,
    presets: [
      { label: '600 qtl', desc: 'Local FPS', value: 600 },
      { label: '1,200 qtl', desc: 'Sub-division', value: 1200 },
      { label: '1,800 qtl', desc: 'Block Allocation', value: 1800 },
      { label: '2,700 qtl', desc: 'District Fleet', value: 2700 },
    ],
  },
  bags: {
    id: 'bags',
    label: 'Standard Bags (50kg)',
    shortLabel: 'Bags',
    badge: 'Jute Packages',
    kgPerUnit: 50,
    min: 600,
    max: 6200,
    step: 100,
    standardIndent: 3600,
    presets: [
      { label: '1,200 Bags', desc: 'Local FPS', value: 1200 },
      { label: '2,400 Bags', desc: 'Sub-division', value: 2400 },
      { label: '3,600 Bags', desc: 'Block Allocation', value: 3600 },
      { label: '5,400 Bags', desc: 'District Fleet', value: 5400 },
    ],
  },
};

export default function LandingPage() {
  // Mobile nav state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Active navbar section state
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 130;
      const sectionIds = LANDING_NAV_ITEMS.map((item) => item.id);

      // Check if at the bottom of the page
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 70) {
        setActiveSection(sectionIds[sectionIds.length - 1]);
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -76;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    }
  };

  // Weighing Unit Selection State (default to kg as requested)
  const [weighingUnit, setWeighingUnit] = useState<WeighingUnit>('kg');
  // Interactive FIFO Demo calculation state in base kg
  const [demoRequestedKg, setDemoRequestedKg] = useState<number>(180000);
  const [activeCommodity, setActiveCommodity] = useState<'wheat' | 'rice_raw'>('wheat');
  const [selectedDepot, setSelectedDepot] = useState<string>('depot-okhla');

  // Interactive Persona Showcase State
  const [activeRoleTab, setActiveRoleTab] = useState<'manager' | 'quality' | 'dispatch' | 'fps' | 'admin'>('manager');

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Helper formatting functions for dynamic weighing units
  const currentUnitConfig = WEIGHING_UNITS[weighingUnit];

  const formatQuantity = (kgVal: number, unit: WeighingUnit = weighingUnit) => {
    const config = WEIGHING_UNITS[unit];
    const converted = kgVal / config.kgPerUnit;
    if (unit === 'kg') {
      return `${Math.round(converted).toLocaleString()} kg`;
    }
    if (unit === 'mt') {
      return `${Number(converted.toFixed(2)).toLocaleString()} MT`;
    }
    if (unit === 'qtl') {
      return `${Number(converted.toFixed(1)).toLocaleString()} qtl`;
    }
    return `${Math.round(converted).toLocaleString()} Bags`;
  };

  const formatNumberOnly = (kgVal: number, unit: WeighingUnit = weighingUnit) => {
    const config = WEIGHING_UNITS[unit];
    const converted = kgVal / config.kgPerUnit;
    if (unit === 'kg' || unit === 'bags') {
      return Math.round(converted).toLocaleString();
    }
    if (unit === 'mt') {
      return Number(converted.toFixed(2)).toLocaleString();
    }
    return Number(converted.toFixed(1)).toLocaleString();
  };

  // Demo Batches for the live interactive simulator (stored with base kg values)
  const demoBatches = activeCommodity === 'wheat' ? [
    { id: 'BATCH-WHT-2025-081', date: '12 Mar 2026', daysAgo: 224, initialAvailableKg: 100000, commodity: 'Wheat (Grade A)', bay: 'Bay A-1, Stack S-02', isOldest: true, moisture: '10.8%' },
    { id: 'BATCH-WHT-2025-099', date: '18 May 2026', daysAgo: 157, initialAvailableKg: 60000, commodity: 'Wheat (Grade A)', bay: 'Bay A-2, Stack S-05', isOldest: false, moisture: '11.2%' },
    { id: 'BATCH-WHT-2026-014', date: '04 Jul 2026', daysAgo: 110, initialAvailableKg: 150000, commodity: 'Wheat (Grade A)', bay: 'Bay A-3, Stack S-08', isOldest: false, moisture: '11.5%' },
  ] : [
    { id: 'BATCH-RCE-2025-045', date: '02 Apr 2026', daysAgo: 203, initialAvailableKg: 90000, commodity: 'Raw Rice (Swarna)', bay: 'Bay B-1, Stack S-01', isOldest: true, moisture: '12.1%' },
    { id: 'BATCH-RCE-2025-062', date: '28 Jun 2026', daysAgo: 116, initialAvailableKg: 70000, commodity: 'Raw Rice (Swarna)', bay: 'Bay B-2, Stack S-03', isOldest: false, moisture: '12.4%' },
    { id: 'BATCH-RCE-2026-008', date: '15 Aug 2026', daysAgo: 68, initialAvailableKg: 140000, commodity: 'Raw Rice (Swarna)', bay: 'Bay B-3, Stack S-06', isOldest: false, moisture: '12.8%' },
  ];

  // Calculate live allocation for the slider (in kg)
  let remainingToAllocateKg = demoRequestedKg;
  const demoAllocations = demoBatches.map((b) => {
    const allocatedKg = Math.min(remainingToAllocateKg, b.initialAvailableKg);
    remainingToAllocateKg = Math.max(0, remainingToAllocateKg - allocatedKg);
    return {
      ...b,
      allocatedKg,
      remainingKg: b.initialAvailableKg - allocatedKg,
      percentAllocated: Math.round((allocatedKg / b.initialAvailableKg) * 100)
    };
  });

  const totalAllocatedKg = demoAllocations.reduce((sum, b) => sum + b.allocatedKg, 0);
  const shortageKg = Math.max(0, demoRequestedKg - totalAllocatedKg);

  const faqs = [
    {
      q: 'How does StockFlow iPDS guarantee deterministic FIFO allocation?',
      a: 'The engine queries all active batches for the requested commodity within the godown depot, strictly ordered ascending by inward receipt timestamp. Allocation consumes 100% of the oldest batch before decrementing the subsequent batch. No manual stack selection is allowed without biometric / PIN authorization.'
    },
    {
      q: 'What occurs if the oldest batch is physically blocked by broken machinery?',
      a: 'StockFlow iPDS provides an Authorized Supervised Exception workflow. The godown superintendent selects the next accessible lot and must enter mandatory regulatory justification (e.g., conveyor breakdown, fumigation lockout) along with District Food Controller (DFC) credentials. A deviation flag is printed on the Delivery Challan and recorded in the audit trail.'
    },
    {
      q: 'Are delivery challans and gate passes printable at depot weighbridges?',
      a: 'Yes. StockFlow iPDS generates standard Government Form-IV Delivery Challans and Gate Passes formatted for standard A4 and thermal printers. Every document features a cryptographically verifiable QR code embedding the exact batch IDs, vehicle registration number, and net metric tonnage.'
    },
    {
      q: 'Can Fair Price Shops verify which godown consignment they received?',
      a: 'Every ration shop can scan the challan QR code or query the public batch tracking number to inspect the full timeline: arrival rail rake, source state procurement mandi, laboratory moisture test report, godown storage bay, and dispatch date.'
    },
    {
      q: 'Does StockFlow iPDS work with existing National Food Security Act systems?',
      a: 'Yes. The platform includes standard CSV/JSON data ingestion schemas designed to plug directly into state food distribution portals and Central Food Corporation of India (FCI) depots without requiring core infrastructure replacement.'
    }
  ];

  // Role showcase data
  const rolesData = {
    manager: {
      title: 'Godown Superintendent',
      subtitle: 'Depot Operations & Stock Placement',
      badge: 'Depot Level 1',
      description: 'Oversees inward rake unloading, assigns CPWD-compliant bay stack coordinates, monitors moisture thresholds, and executes automated FIFO indents with real-time stock balances.',
      route: '/dashboard/manager',
      stats: [
        { label: 'Depot Capacity', value: '2,500,000 kg (2,500 MT)' },
        { label: 'Active Stacks', value: '36 Bays' },
        { label: 'Avg Ageing', value: '42.6 Days' }
      ],
      highlights: [
        'Automated stack assignment preventing manual stack selection bias',
        'Real-time stack drawdown meters and remaining bag tallies',
        'Direct exception logging with mandatory supervisory sign-off'
      ]
    },
    quality: {
      title: 'Quality & Lab Inspector',
      subtitle: 'Moisture Testing & Fumigation Standards',
      badge: 'Technical Cell',
      description: 'Samples grain upon rake arrival at depot siding, conducts laboratory moisture analysis (<=12% for Wheat), schedules periodic fumigation treatments, and logs certified lot grading.',
      route: '/dashboard/quality',
      stats: [
        { label: 'Moisture Compliance', value: '99.8%' },
        { label: 'Pest Fumigations', value: '18 Active' },
        { label: 'Certified Grade-A', value: '100%' }
      ],
      highlights: [
        'Mandatory moisture percentage logging before inward approval',
        'Automatic alert when moisture exceeds 12.0% safe threshold',
        'Digital fumigation certificates linked to batch QR identifiers'
      ]
    },
    dispatch: {
      title: 'Dispatch & Weighbridge Officer',
      subtitle: 'Gate Outward & Weighbridge Integration',
      badge: 'Logistics Cell',
      description: 'Manages outward truck queues, captures digital weighbridge tare and gross readings, prints official Form-IV Delivery Challans, and verifies vehicle registrations.',
      route: '/dashboard/dispatch',
      stats: [
        { label: 'Daily Outward', value: '380,000 kg (380 MT)' },
        { label: 'Avg Gate Turnaround', value: '18 Mins' },
        { label: 'Weighbridge Variance', value: '0.01%' }
      ],
      highlights: [
        'Instant Form-IV Delivery Challan with encrypted QR verification',
        'Multi-stack split calculations printed with exact bag counts',
        'Real-time gate pass printing with driver biometric acknowledgment'
      ]
    },
    fps: {
      title: 'Fair Price Shop (FPS) Dealer',
      subtitle: 'Ration Shop Consignment Receipt',
      badge: 'Distribution Point',
      description: 'Receives grain consignments at the ration shop, scans challan QR code using any smartphone camera, cross-checks batch IDs, and immediately confirms delivery receipt.',
      route: '/dashboard/fps',
      stats: [
        { label: 'FPS Network', value: '1,420 Shops' },
        { label: 'Receipt Verification', value: '100% QR' },
        { label: 'Zero-Dispute Rate', value: '99.6%' }
      ],
      highlights: [
        'Scan QR code to reveal entire grain journey and rake arrival date',
        'Instant mobile delivery confirmation to prevent en-route leakage',
        'Direct grievance reporting for moisture or bag weight discrepancies'
      ]
    },
    admin: {
      title: 'District Food Controller / Master Admin',
      subtitle: 'Apex Monitoring & Exception Governance',
      badge: 'Ministry / DFC Apex',
      description: 'Maintains state-wide operational visibility across all godowns, tracks district ageing heatmaps, audits emergency FIFO overrides, and monitors quota balance compliance.',
      route: '/dashboard/admin',
      stats: [
        { label: 'Active Depots', value: '28 FCI Hubs' },
        { label: 'State Stock Value', value: '₹142.8 Cr' },
        { label: 'Exception Audits', value: '100% Signed' }
      ],
      highlights: [
        'Live district map showing ageing risk scores and critical stacks (>180d)',
        'Full tamper-proof audit trail of every supervisor override',
        'One-click export of Form-IV reports for state legislative committees'
      ]
    }
  };

  const activeRoleData = rolesData[activeRoleTab];

  return (
    <div className="relative isolate min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Top Radial Slate Background - Low z-index fixed layer visible behind all sections */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none h-full w-full bg-top-radial-slate"
        aria-hidden="true"
      />

      {/* 1. TRICOLOR NATIONAL ACCENT STRIP */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* 2. OFFICIAL TOP RIBBON (Govt / NFSA Identity) */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md px-6 sm:px-8 lg:px-12 py-2 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-950">
              Government of India • Ministry of Consumer Affairs, Food & Public Distribution
            </span>
            <span className="hidden md:inline text-zinc-300">•</span>
            <span className="hidden md:inline text-zinc-600 font-medium">
              National Food Security Act (NFSA) Architecture
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-zinc-600 text-[11px] font-medium">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span>28 Central Depots Active</span>
            </div>
            <span className="text-zinc-300">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-[11px] font-semibold text-zinc-800 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Demonstration Prototype v2.4</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. CLEAN SPACIOUS STICKY NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 transition-all shadow-[0_2px_15px_-4px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex h-[72px] items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Left: Brand Identity + Navigation Links */}
          <div className="flex items-center gap-8 lg:gap-11">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-all">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-[20px] tracking-tight text-zinc-950">
                  StockFlow
                </span>
                <span className="text-blue-600 font-extrabold text-[12.5px] bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200/70 leading-none">
                  iPDS
                </span>
              </div>
            </Link>

            {/* Navigation Items (Desktop) — Dynamic Moving Capsule */}
            <nav className="hidden lg:flex items-center p-1 rounded-full bg-zinc-100/85 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs">
              {LANDING_NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={`relative px-3.5 py-1.5 text-[13.5px] font-medium transition-colors duration-200 rounded-full flex items-center gap-1.5 select-none cursor-pointer ${
                      isActive
                        ? 'text-zinc-950 dark:text-white font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-capsule"
                        className="absolute inset-0 bg-white dark:bg-zinc-900 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.06)] border border-zinc-200/80 dark:border-zinc-700 -z-0"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                    {item.hasDot && (
                      <span
                        className={`relative z-10 w-1.5 h-1.5 rounded-full transition-colors ${
                          isActive ? 'bg-blue-600 animate-pulse' : 'bg-blue-500'
                        }`}
                      />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/entities"
              className="hidden xl:inline-flex text-[13.5px] font-medium text-zinc-600 hover:text-zinc-950 px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Entity Directory
            </Link>

            <Link
              href="/login"
              className="hidden sm:inline-flex text-[13.5px] font-semibold text-zinc-700 hover:text-zinc-950 px-3 py-2 transition-colors cursor-pointer"
            >
              Officer Login
            </Link>

            {/* Main Action Dark Pill Button */}
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-zinc-950 hover:bg-black active:scale-[0.98] px-5 text-[13.5px] font-semibold text-white shadow-sm shadow-zinc-950/20 transition-all cursor-pointer"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 transition-colors focus:outline-none ml-1"
              aria-label="Toggle Navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileNavOpen && (
          <div className="lg:hidden border-b border-zinc-200/90 bg-white/98 backdrop-blur-xl px-6 py-4 shadow-xl space-y-3">
            <div className="flex flex-col space-y-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {LANDING_NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => {
                      handleNavClick(e, item.id);
                      setIsMobileNavOpen(false);
                    }}
                    className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/80 dark:border-blue-800/80 shadow-2xs'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-zinc-100 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hasDot && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        Live
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>Officer Login</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-full bg-zinc-950 hover:bg-black text-white text-sm font-semibold shadow-xs transition"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </Link>
              <Link
                href="/entities"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition"
              >
                <Boxes className="w-4 h-4" />
                <span>Entity Directory & Portals</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="overview" className="relative">
        {/* Subtle Ambient Mesh Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl rounded-full" />
        </div>

        {/* 4. HERO SECTION */}
        <section className="px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center max-w-5xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100/90 border border-zinc-200/90 px-4 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs mb-8 hover:bg-zinc-100 transition-all">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>NFSA Architecture v2.4</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-500 font-normal">Deterministic FIFO Engine</span>
          </div>

          {/* Hero Headline matching reference layout */}
          <h1 className="mx-auto max-w-[960px] text-[clamp(40px,7vw,86px)] font-black tracking-[-0.04em] leading-[1.03] text-zinc-950">
            <span className="block">Strict FIFO on</span>
            <span className="inline-flex items-center justify-center gap-3 sm:gap-4 my-1.5 sm:my-2 align-middle flex-wrap">
              <motion.span
                className="inline-flex items-center justify-center w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/30 origin-center select-none cursor-pointer"
                initial={{ rotate: -8 }}
                animate={{
                  rotate: [-8, -3, -11, -5, -8],
                  y: [0, -3, 1, -2, 0],
                  scale: [1, 1.03, 0.98, 1.02, 1],
                }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  rotate: [-8, 8, -12, 6, -8],
                  scale: 1.1,
                  transition: { duration: 0.5 },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  animate={{
                    rotate: [-3, 3, -3],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center justify-center"
                >
                  <ShieldCheck className="w-6 h-6 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                </motion.span>
              </motion.span>
              <span className="text-zinc-950">Every Godown</span>
            </span>
            <span className="block bg-gradient-to-b from-zinc-950 via-zinc-800 to-zinc-400 bg-clip-text text-transparent pb-1">
              and any grain stack.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 sm:mt-8 max-w-[620px] text-[16px] sm:text-[18px] leading-[1.6] text-zinc-600 font-normal">
            Automate mathematical FIFO lot selection in government food-grain godowns.
            Zero silent spoilage, tamper-proof Form-IV QR challans, and real-time grain traceability.
          </p>

          {/* Central Hero Dark Pill CTA Button matching reference */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="inline-flex h-12 sm:h-13 items-center justify-center gap-2.5 rounded-full bg-zinc-950 hover:bg-black px-8 text-[15px] font-semibold text-white shadow-xl shadow-zinc-950/20 hover:scale-[1.02] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Explore Command Center</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200/90 px-7 text-[15px] font-semibold text-zinc-800 shadow-xs hover:border-zinc-300 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Officer Login</span>
            </Link>
          </div>

          {/* Caption below button */}
          <p className="mt-4 text-xs text-zinc-500 font-medium">
            National Food Security Act Compliant • Form-IV Gate Passes • Zero Spoilage Mandate
          </p>

          {/* High-Trust Live Metrics Strip */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-1">
                <span>FIFO Accuracy</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-zinc-950 font-mono">100.0%</div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Strict timestamp order</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-1">
                <span>Silent Spoilage</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-emerald-600 font-mono">0.00%</div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Protected grain lots</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-1">
                <span>Challan QR Speed</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-zinc-950 font-mono">&lt; 30s</div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Weighbridge auto-sync</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-1">
                <span>Depot Capacity</span>
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-zinc-950 font-mono">2,500,000 kg</div>
              <p className="text-[11px] text-zinc-500 mt-0.5">2,500 MT • Live demonstration node</p>
            </div>
          </div>
        </section>

        {/* 5. HERO STUDIO WINDOW: LIVE INTERACTIVE FIFO SIMULATOR */}
        <section id="simulator" className="px-4 sm:px-6 pb-24 scroll-mt-20">
          <div className="mx-auto max-w-[1280px] rounded-[32px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-3 sm:p-6 border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.07)]">
            {/* macOS Window Frame */}
            <div className="relative w-full rounded-[24px] bg-white border border-zinc-200 shadow-sm overflow-hidden">
              {/* Window Title Bar */}
              <div className="h-13 bg-zinc-50/90 border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F57] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#FEBC2E] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#28C840] inline-block" />
                  <span className="text-xs font-semibold text-zinc-700 ml-2 hidden sm:inline flex items-center gap-2">
                    <span>FCI Regional Depot #4 (Okhla Industrial Area) • Live Allocation Engine</span>
                  </span>
                </div>

                {/* Window Header Chips */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>FIFO COMPLIANCE: 100%</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-[11px] font-medium">
                    <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Live Godown Node</span>
                  </div>
                </div>
              </div>

              {/* Window Body: Interactive Simulator Interface */}
              <div className="p-4 sm:p-8 space-y-7 bg-white">
                {/* Control Ribbon */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-950">Deterministic Allocation Engine Simulator</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold uppercase">
                        Real-time Math
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600">
                      Drag the quota slider below or pick a preset to see how older consignments are exhausted before touching newer stacks.
                    </p>
                  </div>

                  {/* Weighing Unit Dropdown & Commodity Pill Switcher */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Weighing Unit Selector Dropdown */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 shadow-2xs">
                      <Scale className="w-4 h-4 text-blue-600 shrink-0" />
                      <label htmlFor="weighing-unit-selector" className="text-xs font-bold text-zinc-700 whitespace-nowrap">
                        Weighing Unit:
                      </label>
                      <div className="relative">
                        <select
                          id="weighing-unit-selector"
                          value={weighingUnit}
                          onChange={(e) => setWeighingUnit(e.target.value as WeighingUnit)}
                          aria-label="Select Weighing Unit"
                          className="appearance-none bg-blue-50/80 hover:bg-blue-100/70 border border-blue-200 text-blue-900 font-bold text-xs rounded-lg pl-2.5 pr-7 py-1 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 cursor-pointer transition-colors"
                        >
                          <option value="kg">Kilograms (kg) — Standard SI</option>
                          <option value="mt">Metric Tonnes (MT) — Depot</option>
                          <option value="qtl">Quintals (qtl) — Mandi / MSP</option>
                          <option value="bags">Standard 50kg Bags</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-blue-700 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Commodity Pill Switcher */}
                    <div className="flex items-center p-1 rounded-xl bg-zinc-200/70 border border-zinc-300 self-start md:self-auto">
                      <button
                        onClick={() => setActiveCommodity('wheat')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          activeCommodity === 'wheat'
                            ? 'bg-white text-zinc-950 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        Wheat (Grade-A)
                      </button>
                      <button
                        onClick={() => setActiveCommodity('rice_raw')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          activeCommodity === 'rice_raw'
                            ? 'bg-white text-zinc-950 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                      >
                        Raw Rice (Swarna)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Slider & Presets Box */}
                <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                          Fair Price Shop Indent / Sub-division Requisition
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                          Live Dynamic Conversion
                        </span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-zinc-950 font-mono mt-1 flex items-baseline gap-2">
                        <span>{formatNumberOnly(demoRequestedKg, weighingUnit)}</span>
                        <span className="text-sm font-semibold text-zinc-500">{currentUnitConfig.label}</span>
                      </div>
                    </div>

                    {/* Dynamic Real-time Unit Conversions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {weighingUnit !== 'kg' && (
                        <span className="px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200/90 font-mono font-semibold text-zinc-800 text-xs">
                          = {Math.round(demoRequestedKg).toLocaleString()} kg
                        </span>
                      )}
                      {weighingUnit !== 'mt' && (
                        <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 font-mono font-bold text-blue-900 text-xs">
                          = {(demoRequestedKg / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} MT
                        </span>
                      )}
                      {weighingUnit !== 'qtl' && (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-mono font-semibold text-amber-900 text-xs">
                          = {(demoRequestedKg / 100).toLocaleString(undefined, { maximumFractionDigits: 1 })} qtl
                        </span>
                      )}
                      {weighingUnit !== 'bags' && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 font-mono font-semibold text-emerald-900 text-xs">
                          = {Math.round(demoRequestedKg / 50).toLocaleString()} Bags (50kg)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-semibold text-zinc-500 mr-1">Quick Presets:</span>
                    {currentUnitConfig.presets.map((preset) => {
                      const isSelected = demoRequestedKg === preset.value * currentUnitConfig.kgPerUnit;
                      return (
                        <button
                          key={preset.value}
                          onClick={() => setDemoRequestedKg(preset.value * currentUnitConfig.kgPerUnit)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                          }`}
                        >
                          {preset.label} ({preset.desc})
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="range"
                    min={currentUnitConfig.min}
                    max={currentUnitConfig.max}
                    step={currentUnitConfig.step}
                    value={Math.round(demoRequestedKg / currentUnitConfig.kgPerUnit)}
                    onChange={(e) => setDemoRequestedKg(Number(e.target.value) * currentUnitConfig.kgPerUnit)}
                    className="w-full h-2.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                    <span>Min: {formatQuantity(currentUnitConfig.min * currentUnitConfig.kgPerUnit)}</span>
                    <span>Standard Indent: {formatQuantity(180000)}</span>
                    <span>Max: {formatQuantity(310000)} (Total Godown Available)</span>
                  </div>
                </div>

                {/* Real-time Allocation Cards (FIFO Sequence) */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Deterministic FIFO Drawdown Sequence (Oldest Inward First)</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      100% Zero-Guesswork Mathematical Routing
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {demoAllocations.map((batch, index) => {
                      const isFullyExhausted = batch.remainingKg === 0;
                      const isPartial = batch.allocatedKg > 0 && batch.remainingKg > 0;
                      const isUntouched = batch.allocatedKg === 0;

                      return (
                        <div
                          key={batch.id}
                          className={`p-5 rounded-2xl border transition-all duration-200 ${
                            batch.allocatedKg > 0
                              ? 'bg-gradient-to-b from-white to-zinc-50/80 border-blue-200 shadow-xs ring-1 ring-blue-500/10'
                              : 'bg-white border-zinc-200 opacity-80'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
                            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800">
                              Priority #{index + 1}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                              batch.isOldest
                                ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              {batch.daysAgo} Days In Godown
                            </span>
                          </div>

                          <div className="mt-3.5">
                            <div className="font-mono font-bold text-xs text-zinc-950 flex items-center justify-between">
                              <span>{batch.id}</span>
                              <span className="text-[10px] text-zinc-400 font-normal">Lab: {batch.moisture}</span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                              <Warehouse className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{batch.bay}</span>
                            </div>
                          </div>

                          {/* Visual Progress Bar of Drawdown */}
                          <div className="mt-4">
                            <div className="flex justify-between text-[11px] mb-1 font-medium">
                              <span className="text-zinc-500">Allocation Progress</span>
                              <span className="font-mono font-bold text-zinc-900">{batch.percentAllocated}%</span>
                            </div>
                            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 rounded-full ${
                                  isFullyExhausted ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${batch.percentAllocated}%` }}
                              />
                            </div>
                          </div>

                          {/* Numbers breakdown in active weighing unit */}
                          <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Initial Stack Size:</span>
                              <span className="font-mono font-semibold">{formatQuantity(batch.initialAvailableKg)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-700">Drawn For Quota:</span>
                              <span className="font-mono font-bold text-blue-700">+{formatQuantity(batch.allocatedKg)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Remaining in Bay:</span>
                              <span className="font-mono text-zinc-700">{formatQuantity(batch.remainingKg)}</span>
                            </div>

                            {/* Status Pill Indicator */}
                            <div className="pt-2">
                              {isFullyExhausted && (
                                <span className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
                                  <Check className="w-3.5 h-3.5" /> Stack Fully Cleared
                                </span>
                              )}
                              {isPartial && (
                                <span className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider border border-amber-200">
                                  <Sliders className="w-3.5 h-3.5" /> Partial Draw ({formatQuantity(batch.allocatedKg)})
                                </span>
                              )}
                              {isUntouched && (
                                <span className="w-full inline-flex items-center justify-center py-1.5 rounded-xl bg-zinc-100 text-zinc-500 text-[11px] font-medium border border-zinc-200">
                                  Untouched (Protected Reserve)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary & Live Dispatch CTA */}
                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1.5">
                    <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider flex items-center gap-2">
                      <span>Calculated Allocation Order Complete</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white flex flex-wrap items-center gap-2">
                      <span>{formatQuantity(totalAllocatedKg)} Allocated Across {demoAllocations.filter(b => b.allocatedKg > 0).length} Stacks</span>
                      <span className="text-xs font-normal text-emerald-400 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-800">
                        100% Oldest Consignments Exhausted First
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Link
                      href="/challans"
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-white" />
                      <span>Generate Form-IV Challan</span>
                    </Link>
                    <Link
                      href="/fifo"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition cursor-pointer"
                    >
                      <span>Full FIFO Engine</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. INTERACTIVE ROLE-BASED ECOSYSTEM TOUR */}
        <section id="roles" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-transparent scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-[720px] mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>ROLE-BASED GOVERNANCE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-[-0.03em]">
                Tailored Dashboards for Every Stakeholder
              </h2>
              <p className="text-sm sm:text-base text-zinc-600">
                From godown floor operators to state district controllers, each actor has a customized interface enforcing transparency and eliminating manual loopholes.
              </p>
            </div>

            {/* Persona Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              {[
                { id: 'manager', label: 'Godown Superintendent', icon: Warehouse },
                { id: 'quality', label: 'Quality & Lab Inspector', icon: ShieldAlert },
                { id: 'dispatch', label: 'Dispatch & Weighbridge', icon: Truck },
                { id: 'fps', label: 'Fair Price Shop (FPS)', icon: Building2 },
                { id: 'admin', label: 'District Food Controller', icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeRoleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRoleTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-zinc-950 text-white shadow-sm scale-[1.02]'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Persona Card Showcase */}
            <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-[28px] bg-white border border-zinc-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {activeRoleData.badge}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">{activeRoleData.subtitle}</span>
                  </div>
                  <h3 className="text-2xl font-extrabold text-zinc-950 mt-1">
                    {activeRoleData.title}
                  </h3>
                </div>

                <Link
                  href={activeRoleData.route}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <span>Open {activeRoleData.title} Portal</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed">
                {activeRoleData.description}
              </p>

              {/* Role KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeRoleData.stats.map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
                    <div className="text-xs text-zinc-500 font-medium">{stat.label}</div>
                    <div className="text-xl font-extrabold text-zinc-950 font-mono mt-0.5">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Role Key Highlights */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Core Responsibilities & Guardrails
                </div>
                <div className="space-y-2">
                  {activeRoleData.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. ANIMATED FIFO WORKFLOW & ARCHITECTURE */}
        <section id="workflow" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-transparent scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-10">
            <div className="text-center max-w-[780px] mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>END-TO-END SUPPLY CHAIN ENGINE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-[-0.03em]">
                Interactive FIFO Workflow Architecture: <br />
                <span className="text-blue-600">From Inward Rail Rake to Fair Price Shops</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                Explore how incoming stock is digitally logged, evaluated against oldest batch timestamps, multi-split when needed, and dispatched under continuous audit compliance.
              </p>
            </div>

            <FifoWorkflowVisualizer />
          </div>
        </section>

        {/* 8. THE OPERATIONAL PROBLEM (Why Manual Registers Fail) */}
        <section id="problem" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-transparent scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-[700px] mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-800 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>THE OPERATIONAL DILEMMA IN FOOD STORAGE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-[-0.03em]">
                Managing stock is not enough. <br />
                <span className="text-zinc-500 font-normal">Managing stock rotation is what prevents waste.</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                When fresh food-grains arrive weekly, manual register bookkeeping inevitably leads to older grain getting buried behind new arrivals, resulting in silent spoilage and audit failures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Problem 1 */}
              <div className="p-7 rounded-[26px] bg-white border border-zinc-200 shadow-2xs space-y-4 hover:border-zinc-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 font-mono font-bold flex items-center justify-center text-sm border border-rose-200">
                  01
                </div>
                <h3 className="text-lg font-bold text-zinc-950">Multiple Batches, Staggered Dates</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Wheat and rice arrive continuously from diverse state procurement mandis. Without strict digital batch tagging, floor staff naturally unload from the easiest stack, leaving older lots to deteriorate.
                </p>
              </div>

              {/* Problem 2 */}
              <div className="p-7 rounded-[26px] bg-white border border-zinc-200 shadow-2xs space-y-4 hover:border-zinc-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 font-mono font-bold flex items-center justify-center text-sm border border-amber-200">
                  02
                </div>
                <h3 className="text-lg font-bold text-zinc-950">Manual Multi-Stack Calculations</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  When a block quota demands 120 MT, calculating 45 MT from one bay and 75 MT from another on paper leads to bag miscounts, dispatch gate bottlenecks, and unverified vehicle loadings.
                </p>
              </div>

              {/* Problem 3 */}
              <div className="p-7 rounded-[26px] bg-white border border-zinc-200 shadow-2xs space-y-4 hover:border-zinc-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 font-mono font-bold flex items-center justify-center text-sm border border-blue-200">
                  03
                </div>
                <h3 className="text-lg font-bold text-zinc-950">Broken Audit Trail to Citizens</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  If ration recipients complain about moisture or quality at a local Fair Price Shop, tracing back to the arrival rail rake, carriage number, and laboratory moisture certificate is impossible with paper registers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 9. FOUR CORE CAPABILITIES (Bento Grid Showcase) */}
        <section id="capabilities" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-transparent scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-[680px] mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-semibold">
                <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>UNIFIED ARCHITECTURE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-[-0.03em]">
                One Connected Workflow for <br />
                <span className="text-blue-600">Inventory, FIFO, and Accountability.</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-600">
                Four critical operational capabilities connected in real-time across India's public distribution supply chain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Capability 1 */}
              <div className="p-6 rounded-[26px] bg-zinc-50/80 border border-zinc-200 hover:border-zinc-300 transition-all space-y-3.5 group">
                <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 group-hover:scale-105 transition-transform shadow-2xs">
                  <Warehouse className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">1. Digital Inward Receipts</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Record inward rakes with supplier state, laboratory moisture test results, initial bag counts, and assigned bay/stack coordinates.
                </p>
              </div>

              {/* Capability 2 */}
              <div className="p-6 rounded-[26px] bg-zinc-50/80 border border-zinc-200 hover:border-zinc-300 transition-all space-y-3.5 group">
                <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 group-hover:scale-105 transition-transform shadow-2xs">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">2. Ageing Surveillance</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Categorizes stock into 0–30d, 31–60d, 61–90d, and &gt;180d critical alerts. Spoilage risk score warns managers before quality degrades.
                </p>
              </div>

              {/* Capability 3 */}
              <div className="p-6 rounded-[26px] bg-zinc-50/80 border border-zinc-200 hover:border-zinc-300 transition-all space-y-3.5 group">
                <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 group-hover:scale-105 transition-transform shadow-2xs">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">3. Deterministic FIFO</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Automated allocation engine consumes oldest lots first. Prevents unauthorized stack bypass unless authorized with DFC credentials.
                </p>
              </div>

              {/* Capability 4 */}
              <div className="p-6 rounded-[26px] bg-zinc-50/80 border border-zinc-200 hover:border-zinc-300 transition-all space-y-3.5 group">
                <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 group-hover:scale-105 transition-transform shadow-2xs">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-base font-bold text-zinc-950">4. Challan & Gate Passes</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Prints official Form-IV delivery challans with QR signatures, truck weighbridge tare/gross receipts, and driver contact info.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. END-TO-END TRACEABILITY JOURNEY */}
        <section id="traceability" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-transparent scroll-mt-20">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-12">
            <div className="text-center max-w-[660px] mx-auto space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>COMPLETE AUDIT INTEGRITY</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-[-0.03em]">
                From State Procurement to Ration Beneficiary
              </h2>
              <p className="text-sm sm:text-base text-zinc-600">
                Every metric tonne has an unbroken verifiable chain of custody.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className="p-6 rounded-[24px] bg-white border border-zinc-200 space-y-3 shadow-2xs hover:border-blue-300 transition-colors">
                <div className="text-[11px] font-mono font-bold text-blue-600 uppercase">Stage 01</div>
                <h4 className="font-bold text-base text-zinc-950">Mandi Procurement Rake</h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Consignment logged upon rail siding arrival with supplier agency, initial moisture lab reading, and grain variety classification.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-[24px] bg-white border border-zinc-200 space-y-3 shadow-2xs hover:border-amber-300 transition-colors">
                <div className="text-[11px] font-mono font-bold text-amber-600 uppercase">Stage 02</div>
                <h4 className="font-bold text-base text-zinc-950">Physical Bay Stacking</h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Bags stacked in designated godown bays (e.g. Bay A-1, Stack S-02). System timestamps stack date and initiates ageing counter.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-[24px] bg-white border border-zinc-200 space-y-3 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="text-[11px] font-mono font-bold text-emerald-600 uppercase">Stage 03</div>
                <h4 className="font-bold text-base text-zinc-950">FIFO Indent Fulfillment</h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  When a block requisition arrives, algorithm automatically selects the oldest lot, calculating required bags and truck tare weights.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-[24px] bg-white border border-zinc-200 space-y-3 shadow-2xs hover:border-purple-300 transition-colors">
                <div className="text-[11px] font-mono font-bold text-purple-600 uppercase">Stage 04</div>
                <h4 className="font-bold text-base text-zinc-950">FPS Delivery & Sign-off</h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Challan printed with QR signature. Fair Price Shop owner scans upon delivery to acknowledge verified lot receipt without dispute.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. INTERACTIVE FAQ ACCORDION */}
        <section id="faq" className="py-20 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-transparent scroll-mt-20">
          <div className="max-w-[860px] mx-auto px-4 sm:px-6 space-y-10">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-[-0.03em]">
                Everything you need to know about StockFlow iPDS
              </h2>
            </div>

            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
              {faqs.map((faq, i) => (
                <div key={i} className="py-5">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left text-base sm:text-lg font-bold text-zinc-950 hover:text-blue-600 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 p-1.5 rounded-full bg-zinc-100 text-zinc-600">
                      {expandedFaq === i ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </button>
                  {expandedFaq === i && (
                    <div className="mt-3.5 text-xs sm:text-sm text-zinc-600 leading-relaxed pr-6 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 12. HIGH-IMPACT FINAL CALLOUT CARD */}
        <section className="py-16 px-4 sm:px-6 bg-transparent border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="max-w-[1280px] mx-auto p-8 sm:p-14 rounded-[32px] bg-gradient-to-b from-zinc-950 to-zinc-900 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
            {/* Background accent glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight max-w-xl mx-auto">
              Ready to explore the operational platform?
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto">
              Step into the full management suite with pre-configured godown depots, real-time inventory bay visualization, and print-ready challan generators.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard"
                className="flex h-[48px] items-center gap-2 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 px-8 text-[15px] font-semibold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4 text-zinc-950" />
              </Link>

              <Link
                href="/login"
                className="flex h-[48px] items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 px-6 text-[15px] font-semibold text-white transition cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Officer Login</span>
              </Link>

              <Link
                href="/fifo"
                className="flex h-[48px] items-center gap-2 rounded-full bg-zinc-800 hover:bg-zinc-700 px-6 text-[15px] font-semibold text-zinc-200 border border-zinc-700 transition cursor-pointer"
              >
                <span>FIFO Engine View</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 13. MINIMAL MODERN FOOTER WITH AMBIENT MASKING */}
      <footer className="relative w-full overflow-hidden border-t border-zinc-200/30 dark:border-zinc-800/70 bg-slate/10 dark:bg-slate-950/10 backdrop-blur-md pt-8 sm:pt-10 pb-0">
        {/* Ambient Masked Background Glow from behind */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] max-w-full h-[260px] bg-gradient-to-t from-blue-600/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        {/* Subtle grid pattern with radial gradient mask from behind */}
        <div
          className="absolute inset-0 pointer-events-none -z-10 opacity-30 dark:opacity-20 text-zinc-400 dark:text-zinc-600 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_100%,black_30%,transparent_80%)]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Copyright & Action Bar */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          <span>© 2026 StockFlow. All rights reserved.</span>

          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            aria-label="X (Twitter)"
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        {/* Massive Brand Watermark with Vertical Fade Mask */}
        <div className="relative z-10 w-full overflow-hidden select-none pointer-events-none flex justify-center items-end mt-4 sm:mt-6 [mask-image:linear-gradient(to_bottom,black_20%,black_65%,transparent_98%)]">
          <span className="text-[clamp(4.5rem,19vw,17.5rem)] font-black tracking-[-0.04em] leading-[0.85] bg-gradient-to-b from-zinc-300/80 via-zinc-200/50 to-zinc-100/10 dark:from-zinc-700/70 dark:via-zinc-800/40 dark:to-zinc-900/10 bg-clip-text text-transparent text-center whitespace-nowrap block select-none">
            stockflow
          </span>
        </div>

        {/* Bottom subtle edge feather mask */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent pointer-events-none z-20" />
      </footer>
    </div>
  );
}
