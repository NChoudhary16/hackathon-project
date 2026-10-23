'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Network, 
  Truck, 
  FileText, 
  Warehouse, 
  Search, 
  Settings, 
  HelpCircle, 
  CheckCircle2, 
  Boxes, 
  Database, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  phase: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  color: string;
  accent: string;
  metrics?: { label: string; value: string }[];
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'receive-stock',
    phase: 'Phase 1: Inward & Receipt',
    title: 'Receive Stock',
    subtitle: 'Stock arrives at warehouse',
    description: 'Grain rail rakes and transport trucks arrive at the depot. Consignments undergo initial weighbridge verification (gross weight vs tare weight) and gate entry logging.',
    badge: 'Step 01',
    color: '#2563eb',
    accent: 'bg-blue-50 text-blue-700 border-blue-200',
    metrics: [
      { label: 'Avg Inward Vol', value: '450 MT / Rake' },
      { label: 'Weighbridge Accuracy', value: '±0.02%' }
    ]
  },
  {
    id: 'digital-logging',
    phase: 'Phase 1: Inward & Receipt',
    title: 'Digital Inward Logging',
    subtitle: 'Record commodity type, supplier, receipt date, batch details & initial qty',
    description: 'Depot quality inspectors record commodity type (Wheat Grade-A, Raw Rice), procurement state / agency, lab moisture test percentage, stack coordinates, and stamp unique digital Batch IDs.',
    badge: 'Step 02',
    color: '#059669',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    metrics: [
      { label: 'Moisture Threshold', value: '≤ 12.0%' },
      { label: 'Batch ID Format', value: 'BATCH-COMM-YYYY-XXX' }
    ]
  },
  {
    id: 'stock-stored',
    phase: 'Phase 1: Inward & Receipt',
    title: 'Stock Stored',
    subtitle: 'Batch-wise stock added to inventory',
    description: 'Bags are stacked according to CPWD/FCI specifications in designated bays. System locks batch timestamp and initiates the continuous ageing clock in the central database.',
    badge: 'Step 03',
    color: '#d97706',
    accent: 'bg-amber-50 text-amber-700 border-amber-200',
    metrics: [
      { label: 'Standard Stack', value: '15 Bags High' },
      { label: 'Bay Identification', value: 'Geo-tagged Stacks' }
    ]
  },
  {
    id: 'create-challan',
    phase: 'Phase 2: FIFO Dispatch Engine',
    title: 'Create Delivery Challan',
    subtitle: 'Enter FPS and required quantity',
    description: 'A Fair Price Shop (FPS) indents a monthly grain quota for ration card holders. The operator selects the recipient shop code and inputs target metric tonnage.',
    badge: 'Step 04',
    color: '#db2777',
    accent: 'bg-pink-50 text-pink-700 border-pink-200',
    metrics: [
      { label: 'Indenting Window', value: '1st - 10th of Month' },
      { label: 'Validation', value: 'Govt Quota Cap Checked' }
    ]
  },
  {
    id: 'identify-oldest',
    phase: 'Phase 2: FIFO Dispatch Engine',
    title: 'Identify Oldest Eligible Batch (FIFO)',
    subtitle: 'System selects the oldest batch with available stock',
    description: 'The deterministic FIFO algorithm executes: SELECT * FROM batches WHERE commodity = ? AND status = active ORDER BY receipt_date ASC LIMIT 1. Prevents bypassing older grain.',
    badge: 'Step 05',
    color: '#4f46e5',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    metrics: [
      { label: 'Sort Priority', value: 'receiptDate ASC' },
      { label: 'Audit Log', value: '100% Immutable' }
    ]
  },
  {
    id: 'check-quantity',
    phase: 'Phase 2: FIFO Dispatch Engine',
    title: 'Check Batch Quantity',
    subtitle: 'Is oldest batch quantity enough to meet demand?',
    description: 'Algorithm evaluates if available stock in oldest batch >= requested allocation. If adequate, single batch issue occurs. If inadequate, automated multi-batch waterfall triggers.',
    badge: 'Step 06',
    color: '#0d9488',
    accent: 'bg-teal-50 text-teal-700 border-teal-200',
    metrics: [
      { label: 'Decision Logic', value: 'batch.qty >= demand' },
      { label: 'Split Limit', value: 'Up to 3 stacks max' }
    ]
  },
  {
    id: 'pull-next-oldest',
    phase: 'Phase 2: FIFO Dispatch Engine',
    title: 'Pull from Next Oldest Batches',
    subtitle: 'Automatically allocate remaining quantity from next oldest batches',
    description: 'Exhausts 100% of the oldest stack to zero balance before decrementing from subsequent arrival dates until full demand is completely met without manual guesswork.',
    badge: 'Step 07 (Split)',
    color: '#ea580c',
    accent: 'bg-orange-50 text-orange-700 border-orange-200',
    metrics: [
      { label: 'Waterfall Order', value: 'Strict Age Hierarchy' },
      { label: 'Stack Clearance', value: 'Complete Bay Depletion' }
    ]
  },
  {
    id: 'allocate-generate',
    phase: 'Phase 2: FIFO Dispatch Engine',
    title: 'Allocate & Generate Delivery Challan',
    subtitle: 'Allocate from oldest batch and create challan',
    description: 'System locks batches, issues unique dispatch serial number, and generates official Government Form-IV challan containing cryptographic QR code and transporter details.',
    badge: 'Step 08',
    color: '#2563eb',
    accent: 'bg-blue-50 text-blue-700 border-blue-200',
    metrics: [
      { label: 'Format', value: 'Govt Form-IV' },
      { label: 'Security', value: 'Encrypted QR Code' }
    ]
  },
  {
    id: 'update-inventory',
    phase: 'Phase 3: Real-Time Governance',
    title: 'Update Inventory',
    subtitle: 'Deduct issued quantities and update remaining stock in real-time',
    description: 'Depot balances decrement instantly across all server instances. Stacks depleted to 0 MT are archived for fumigation and bay sanitization clearance.',
    badge: 'Step 09',
    color: '#7c3aed',
    accent: 'bg-purple-50 text-purple-700 border-purple-200',
    metrics: [
      { label: 'Sync Latency', value: '< 250ms' },
      { label: 'Stack Re-audit', value: 'Immediate' }
    ]
  },
  {
    id: 'maintain-traceability',
    phase: 'Phase 3: Real-Time Governance',
    title: 'Maintain Traceability',
    subtitle: 'Record which batches and quantities were supplied to each FPS',
    description: 'A permanent digital link connects the FPS shop code to the exact godown bay, supplier mandi, arrival rail carriage number, and inspection officer stamp.',
    badge: 'Step 10',
    color: '#059669',
    accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    metrics: [
      { label: 'Provenance', value: 'Rake → Depot → FPS' },
      { label: 'Public Audit', value: 'Ration Card Linkable' }
    ]
  },
  {
    id: 'alerts-management',
    phase: 'Phase 3: Real-Time Governance',
    title: 'Alerts & Exception Management',
    subtitle: 'Monitor stock aging • Flag old batches • Alert on skipping • Require DFC reason',
    description: 'Automated monitors highlight lots nearing 90+ days. If a supervisor attempts to skip an older lot, system demands mandatory DFC credentials & physical obstruction justification.',
    badge: 'Step 11',
    color: '#dc2626',
    accent: 'bg-rose-50 text-rose-700 border-rose-200',
    metrics: [
      { label: 'Deviation Alert', value: 'Instant SMS & Push' },
      { label: 'Supervisor PIN', value: 'Mandatory Auth' }
    ]
  },
  {
    id: 'centralized-dashboard',
    phase: 'Phase 3: Real-Time Governance',
    title: 'Centralized Dashboard',
    subtitle: 'Incoming stock • Available inventory • Batch-wise aging • FIFO compliance',
    description: 'Ministry and District Food Controllers monitor real-time FIFO compliance scores, regional grain velocity, state-wide spoilage prevention indices, and depot efficiency rankings.',
    badge: 'Step 12',
    color: '#0284c7',
    accent: 'bg-sky-50 text-sky-700 border-sky-200',
    metrics: [
      { label: 'State Compliance', value: '98.4% Average' },
      { label: 'Spoilage Prevented', value: '14,200 MT / yr' }
    ]
  }
];

export function FifoWorkflowVisualizer() {
  const [activeTab, setActiveTab] = useState<'flowchart' | 'network'>('flowchart');
  const [selectedStepId, setSelectedStepId] = useState<string>('identify-oldest');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(4);

  // Auto-step simulation loop
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = (prev + 1) % WORKFLOW_STEPS.length;
        setSelectedStepId(WORKFLOW_STEPS[next].id);
        return next;
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeStep = WORKFLOW_STEPS.find((s) => s.id === selectedStepId) || WORKFLOW_STEPS[0];

  const handleSelectStep = (stepId: string) => {
    const idx = WORKFLOW_STEPS.findIndex((s) => s.id === stepId);
    if (idx !== -1) {
      setCurrentStepIndex(idx);
      setSelectedStepId(stepId);
      setIsPlaying(false);
    }
  };

  return (
    <div className="w-full rounded-[28px] bg-[#F5F5F7] p-2.5 sm:p-5 border border-zinc-200/90 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.06)]">
      {/* Container Window */}
      <div className="relative w-full rounded-[22px] bg-white border border-zinc-200/90 shadow-xs overflow-hidden">
        
        {/* Window Header Bar */}
        <div className="bg-white border-b border-zinc-200/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#28C840] inline-block" />
            </div>
            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 tracking-tight">
                FIFO System Lifecycle & Movement Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                LIVE ANIMATED SVG
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200/80 text-xs">
              <button
                onClick={() => setActiveTab('flowchart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === 'flowchart'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Operational Flowchart</span>
              </button>
              <button
                onClick={() => setActiveTab('network')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  activeTab === 'network'
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                <Network className="w-3.5 h-3.5 text-indigo-600" />
                <span>Godown → iPDS → FPS Network</span>
              </button>
            </div>

            {/* Play/Pause Simulator Control */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-50 border-amber-200 text-amber-800' 
                  : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              }`}
              title={isPlaying ? 'Pause auto-walkthrough' : 'Play auto-walkthrough'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* View Content Area: CLEAN WHITE BACKGROUND */}
        <div className="p-3 sm:p-6 bg-white text-zinc-900 relative overflow-hidden">
          {/* Light Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(226,232,240,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.5) 1px, transparent 1px)',
              backgroundSize: '36px 36px'
            }}
          />

          {/* VIEW 1: OPERATIONAL FLOWCHART (From Flowchart Image on Clean White Canvas) */}
          {activeTab === 'flowchart' && (
            <div className="space-y-4 relative z-10">
              <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                <svg 
                  viewBox="0 0 1140 560" 
                  className="w-full min-w-[980px] h-auto select-none"
                >
                  <defs>
                    <filter id="lightShadow" x="-10%" y="-10%" width="125%" height="125%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.06" />
                    </filter>
                    <filter id="activeShadow" x="-15%" y="-15%" width="130%" height="130%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#2563eb" flood-opacity="0.18" />
                    </filter>
                  </defs>

                  {/* ───────────────── CONNECTING FLOW PATHS (CRISP SOLID TONES) ───────────────── */}

                  {/* Start -> Receive Stock */}
                  <path 
                    id="path-start-receive" 
                    d="M 570 46 L 570 65 L 210 65 L 210 88" 
                    fill="none" 
                    stroke="#10b981" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-50" dur="1.5s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#059669">
                    <animateMotion dur="2s" repeatCount="indefinite"><mpath href="#path-start-receive" /></animateMotion>
                  </circle>

                  {/* Receive Stock -> Digital Inward Logging */}
                  <path 
                    id="path-receive-digital" 
                    d="M 310 124 L 350 124" 
                    fill="none" 
                    stroke="#3b82f6" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#2563eb">
                    <animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#path-receive-digital" /></animateMotion>
                  </circle>

                  {/* Digital Inward Logging -> Stock Stored */}
                  <path 
                    id="path-digital-stored" 
                    d="M 590 124 L 640 124" 
                    fill="none" 
                    stroke="#10b981" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#059669">
                    <animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#path-digital-stored" /></animateMotion>
                  </circle>

                  {/* Stock Stored -> Create Challan (Curves down into Row 2) */}
                  <path 
                    id="path-stored-challan" 
                    d="M 850 124 L 920 124 C 950 124, 950 175, 920 175 L 140 175 C 110 175, 110 215, 140 215 L 150 240" 
                    fill="none" 
                    stroke="#d97706" 
                    stroke-width="2.2" 
                    stroke-dasharray="8 5" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-150" dur="3s" repeatCount="indefinite" />
                  </path>
                  <circle r="5" fill="#b45309">
                    <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#path-stored-challan" /></animateMotion>
                  </circle>

                  {/* Create Challan -> Identify Oldest Batch */}
                  <path 
                    id="path-challan-oldest" 
                    d="M 235 276 L 275 276" 
                    fill="none" 
                    stroke="#db2777" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#be185d">
                    <animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#path-challan-oldest" /></animateMotion>
                  </circle>

                  {/* Identify Oldest -> Check Batch Quantity */}
                  <path 
                    id="path-oldest-check" 
                    d="M 470 276 L 505 276" 
                    fill="none" 
                    stroke="#4f46e5" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#4338ca">
                    <animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#path-oldest-check" /></animateMotion>
                  </circle>

                  {/* Check Batch Quantity -> Diamond */}
                  <path 
                    id="path-check-diamond" 
                    d="M 695 276 L 735 276" 
                    fill="none" 
                    stroke="#0d9488" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#0f766e">
                    <animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#path-check-diamond" /></animateMotion>
                  </circle>

                  {/* Diamond -> Yes -> Allocate & Generate Challan */}
                  <path 
                    id="path-diamond-yes" 
                    d="M 835 276 L 910 276" 
                    fill="none" 
                    stroke="#10b981" 
                    stroke-width="2.4" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="5" fill="#059669">
                    <animateMotion dur="1.2s" repeatCount="indefinite"><mpath href="#path-diamond-yes" /></animateMotion>
                  </circle>

                  {/* Diamond -> No -> Pull from Next Oldest Batches */}
                  <path 
                    id="path-diamond-no" 
                    d="M 785 316 L 785 350 L 730 350" 
                    fill="none" 
                    stroke="#ea580c" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.5s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#c2410c">
                    <animateMotion dur="1.6s" repeatCount="indefinite"><mpath href="#path-diamond-no" /></animateMotion>
                  </circle>

                  {/* Pull from Next Oldest Batches -> Allocate & Generate Challan */}
                  <path 
                    id="path-pull-allocate" 
                    d="M 730 370 L 980 370 L 980 312" 
                    fill="none" 
                    stroke="#ea580c" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-60" dur="1.8s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#c2410c">
                    <animateMotion dur="2s" repeatCount="indefinite"><mpath href="#path-pull-allocate" /></animateMotion>
                  </circle>

                  {/* Allocate & Generate Challan -> Update Inventory (Curves down into Row 3) */}
                  <path 
                    id="path-allocate-update" 
                    d="M 980 312 L 980 410 C 980 425, 960 425, 940 425 L 140 425 C 110 425, 110 455, 140 455 L 150 480" 
                    fill="none" 
                    stroke="#2563eb" 
                    stroke-width="2.2" 
                    stroke-dasharray="8 5" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-150" dur="3s" repeatCount="indefinite" />
                  </path>
                  <circle r="5" fill="#1d4ed8">
                    <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#path-allocate-update" /></animateMotion>
                  </circle>

                  {/* Update Inventory -> Maintain Traceability */}
                  <path 
                    id="path-update-trace" 
                    d="M 235 480 L 275 480" 
                    fill="none" 
                    stroke="#7c3aed" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#6d28d9">
                    <animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#path-update-trace" /></animateMotion>
                  </circle>

                  {/* Maintain Traceability -> Alerts & Exception Management */}
                  <path 
                    id="path-trace-alerts" 
                    d="M 470 480 L 505 480" 
                    fill="none" 
                    stroke="#059669" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#047857">
                    <animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#path-trace-alerts" /></animateMotion>
                  </circle>

                  {/* Alerts & Exception -> Centralized Dashboard */}
                  <path 
                    id="path-alerts-dashboard" 
                    d="M 740 480 L 780 480" 
                    fill="none" 
                    stroke="#dc2626" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#b91c1c">
                    <animateMotion dur="1.4s" repeatCount="indefinite"><mpath href="#path-alerts-dashboard" /></animateMotion>
                  </circle>

                  {/* Centralized Dashboard -> End */}
                  <path 
                    id="path-dashboard-end" 
                    d="M 1010 480 L 1050 480" 
                    fill="none" 
                    stroke="#0284c7" 
                    stroke-width="2.2" 
                    stroke-dasharray="6 4" 
                  >
                    <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="1.2s" repeatCount="indefinite" />
                  </path>
                  <circle r="4.5" fill="#0369a1">
                    <animateMotion dur="1.2s" repeatCount="indefinite"><mpath href="#path-dashboard-end" /></animateMotion>
                  </circle>

                  {/* ───────────────── ROW 2 CONTAINER: LIGHT BLUE ENCLOSURE ───────────────── */}
                  <rect 
                    x="40" 
                    y="190" 
                    width="1060" 
                    height="215" 
                    rx="18" 
                    fill="rgba(240,249,255,0.6)" 
                    stroke="#93c5fd" 
                    stroke-width="1.8" 
                    stroke-dasharray="8 6" 
                  />
                  <g transform="translate(420, 178)">
                    <rect x="0" y="0" width="300" height="25" rx="12.5" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.4" />
                    <text x="150" y="16.5" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#1e40af" letter-spacing="0.8">
                      Dispatch Process (FIFO Allocation)
                    </text>
                  </g>

                  {/* ───────────────── CRISP WHITE CARD NODES: ROW 1 ───────────────── */}

                  {/* START PILL */}
                  <g transform="translate(520, 18)" style={{ cursor: 'pointer' }}>
                    <rect x="0" y="0" width="100" height="28" rx="14" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" />
                    <text x="50" y="18" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#047857">
                      Start
                    </text>
                  </g>

                  {/* RECEIVE STOCK */}
                  <g 
                    transform="translate(110, 88)" 
                    onClick={() => handleSelectStep('receive-stock')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'receive-stock' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="200" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'receive-stock' ? '#2563eb' : '#bfdbfe'}
                      stroke-width={selectedStepId === 'receive-stock' ? 2.4 : 1.4}
                    />
                    <rect x="14" y="14" width="44" height="44" rx="9" fill="#eff6ff" />
                    <path d="M 24 40 L 48 40 L 48 28 L 38 28 L 32 34 L 24 34 Z M 28 44 A 3 3 0 1 0 28 38 A 3 3 0 1 0 28 44 Z M 44 44 A 3 3 0 1 0 44 38 A 3 3 0 1 0 44 44 Z" fill="#2563eb" />
                    <text x="68" y="32" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#0f172a">Receive Stock</text>
                    <text x="68" y="47" font-family="Inter,sans-serif" font-size="9" fill="#64748b">Stock arrives at warehouse</text>
                  </g>

                  {/* DIGITAL INWARD LOGGING */}
                  <g 
                    transform="translate(350, 88)" 
                    onClick={() => handleSelectStep('digital-logging')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'digital-logging' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="240" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'digital-logging' ? '#059669' : '#bbf7d0'}
                      stroke-width={selectedStepId === 'digital-logging' ? 2.4 : 1.4}
                    />
                    <rect x="14" y="14" width="44" height="44" rx="9" fill="#ecfdf5" />
                    <path d="M 28 24 L 42 24 L 46 28 L 46 48 L 28 48 Z" fill="none" stroke="#059669" stroke-width="1.8" />
                    <circle cx="44" cy="44" r="6" fill="#10b981" />
                    <path d="M 44 41 L 44 47 M 41 44 L 47 44" stroke="#ffffff" stroke-width="1.5" />
                    <text x="68" y="30" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#0f172a">Digital Inward Logging</text>
                    <text x="68" y="44" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">Record commodity, supplier,</text>
                    <text x="68" y="55" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">receipt date & batch qty</text>
                  </g>

                  {/* STOCK STORED */}
                  <g 
                    transform="translate(640, 88)" 
                    onClick={() => handleSelectStep('stock-stored')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'stock-stored' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="210" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'stock-stored' ? '#d97706' : '#fde68a'}
                      stroke-width={selectedStepId === 'stock-stored' ? 2.4 : 1.4}
                    />
                    <rect x="14" y="14" width="44" height="44" rx="9" fill="#fef3c7" />
                    <rect x="25" y="32" width="12" height="12" fill="none" stroke="#d97706" stroke-width="1.5" />
                    <rect x="39" y="32" width="12" height="12" fill="none" stroke="#d97706" stroke-width="1.5" />
                    <rect x="32" y="20" width="12" height="12" fill="none" stroke="#d97706" stroke-width="1.5" />
                    <text x="68" y="32" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#0f172a">Stock Stored</text>
                    <text x="68" y="47" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">Batch-wise stock added to</text>
                    <text x="68" y="58" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">active godown inventory</text>
                  </g>

                  {/* ───────────────── CRISP WHITE CARD NODES: ROW 2 (DISPATCH) ───────────────── */}

                  {/* CREATE DELIVERY CHALLAN */}
                  <g 
                    transform="translate(60, 240)" 
                    onClick={() => handleSelectStep('create-challan')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'create-challan' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="175" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'create-challan' ? '#db2777' : '#fbcfe8'}
                      stroke-width={selectedStepId === 'create-challan' ? 2.4 : 1.4}
                    />
                    <rect x="12" y="14" width="42" height="44" rx="9" fill="#fdf2f8" />
                    <path d="M 24 24 L 40 24 L 44 28 L 44 48 L 24 48 Z M 28 32 L 38 32 M 28 38 L 38 38" fill="none" stroke="#db2777" stroke-width="1.6" />
                    <text x="62" y="31" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">Create Delivery Challan</text>
                    <text x="62" y="46" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">Enter FPS and required</text>
                    <text x="62" y="57" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">metric tonnage</text>
                  </g>

                  {/* IDENTIFY OLDEST ELIGIBLE BATCH (FIFO) */}
                  <g 
                    transform="translate(275, 240)" 
                    onClick={() => handleSelectStep('identify-oldest')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'identify-oldest' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="195" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'identify-oldest' ? '#4f46e5' : '#c7d2fe'}
                      stroke-width={selectedStepId === 'identify-oldest' ? 2.4 : 1.4}
                    />
                    <rect x="12" y="14" width="42" height="44" rx="9" fill="#eef2ff" />
                    <circle cx="31" cy="34" r="8" fill="none" stroke="#4f46e5" stroke-width="1.8" />
                    <line x1="37" y1="40" x2="45" y2="48" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" />
                    <text x="62" y="30" font-family="Inter,sans-serif" font-size="10.5" font-weight="700" fill="#0f172a">Identify Oldest Batch</text>
                    <text x="62" y="42" font-family="Inter,sans-serif" font-size="9" font-weight="600" fill="#4338ca">(FIFO Enforced)</text>
                    <text x="62" y="55" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">Selects oldest active lot</text>
                  </g>

                  {/* CHECK BATCH QUANTITY */}
                  <g 
                    transform="translate(505, 240)" 
                    onClick={() => handleSelectStep('check-quantity')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'check-quantity' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="190" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'check-quantity' ? '#0d9488' : '#99f6e4'}
                      stroke-width={selectedStepId === 'check-quantity' ? 2.4 : 1.4}
                    />
                    <rect x="12" y="14" width="42" height="44" rx="9" fill="#f0fdfa" />
                    <circle cx="33" cy="36" r="6" fill="none" stroke="#0d9488" stroke-width="2" />
                    <path d="M 33 26 L 33 30 M 33 42 L 33 46 M 23 36 L 27 36 M 39 36 L 43 36" stroke="#0d9488" stroke-width="1.8" stroke-linecap="round" />
                    <text x="62" y="31" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">Check Batch Quantity</text>
                    <text x="62" y="46" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">Is oldest batch enough</text>
                    <text x="62" y="57" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">to fulfill full demand?</text>
                  </g>

                  {/* DECISION DIAMOND: IS QUANTITY ENOUGH? */}
                  <g transform="translate(735, 236)" style={{ cursor: 'pointer' }} filter="url(#lightShadow)">
                    <polygon 
                      points="50,0 100,40 50,80 0,40" 
                      fill="#fef2f2" 
                      stroke="#ef4444" 
                      stroke-width="1.8" 
                    />
                    <text x="50" y="36" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#b91c1c">
                      Is quantity
                    </text>
                    <text x="50" y="49" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#b91c1c">
                      enough?
                    </text>
                    <text x="108" y="35" font-family="Inter,sans-serif" font-size="10" font-weight="800" fill="#059669">Yes</text>
                    <text x="60" y="94" font-family="Inter,sans-serif" font-size="10" font-weight="800" fill="#c2410c">No</text>
                  </g>

                  {/* PULL FROM NEXT OLDEST BATCHES */}
                  <g 
                    transform="translate(530, 335)" 
                    onClick={() => handleSelectStep('pull-next-oldest')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'pull-next-oldest' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="200" 
                      height="60" 
                      rx="10" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'pull-next-oldest' ? '#ea580c' : '#fed7aa'}
                      stroke-width={selectedStepId === 'pull-next-oldest' ? 2.4 : 1.4}
                    />
                    <rect x="10" y="10" width="38" height="40" rx="8" fill="#fff7ed" />
                    <rect x="18" y="24" width="10" height="10" fill="none" stroke="#ea580c" stroke-width="1.4" />
                    <rect x="30" y="24" width="10" height="10" fill="none" stroke="#ea580c" stroke-width="1.4" />
                    <text x="56" y="26" font-family="Inter,sans-serif" font-size="10" font-weight="700" fill="#0f172a">Pull from Next Oldest</text>
                    <text x="56" y="39" font-family="Inter,sans-serif" font-size="8" fill="#64748b">Waterfall allocate remaining</text>
                    <text x="56" y="49" font-family="Inter,sans-serif" font-size="8" fill="#64748b">until quota fulfilled</text>
                  </g>

                  {/* ALLOCATE & GENERATE DELIVERY CHALLAN */}
                  <g 
                    transform="translate(910, 240)" 
                    onClick={() => handleSelectStep('allocate-generate')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'allocate-generate' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="170" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'allocate-generate' ? '#2563eb' : '#bfdbfe'}
                      stroke-width={selectedStepId === 'allocate-generate' ? 2.4 : 1.4}
                    />
                    <rect x="12" y="14" width="42" height="44" rx="9" fill="#eff6ff" />
                    <path d="M 24 24 L 38 24 L 42 28 L 42 48 L 24 48 Z" fill="none" stroke="#2563eb" stroke-width="1.6" />
                    <circle cx="40" cy="44" r="5" fill="#10b981" />
                    <path d="M 38 44 L 40 46 L 43 43" stroke="#ffffff" stroke-width="1.4" fill="none" />
                    <text x="60" y="30" font-family="Inter,sans-serif" font-size="10.5" font-weight="700" fill="#0f172a">Allocate & Generate</text>
                    <text x="60" y="44" font-family="Inter,sans-serif" font-size="9" font-weight="600" fill="#1d4ed8">Delivery Challan</text>
                    <text x="60" y="56" font-family="Inter,sans-serif" font-size="8" fill="#64748b">Locked & QR Signed</text>
                  </g>

                  {/* ───────────────── CRISP WHITE CARD NODES: ROW 3 (GOVERNANCE) ───────────────── */}

                  {/* UPDATE INVENTORY */}
                  <g 
                    transform="translate(60, 444)" 
                    onClick={() => handleSelectStep('update-inventory')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'update-inventory' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="175" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'update-inventory' ? '#7c3aed' : '#ddd6fe'}
                      stroke-width={selectedStepId === 'update-inventory' ? 2.4 : 1.4}
                    />
                    <rect x="12" y="14" width="42" height="44" rx="9" fill="#f5f3ff" />
                    <ellipse cx="33" cy="27" rx="10" ry="3.5" fill="none" stroke="#7c3aed" stroke-width="1.6" />
                    <path d="M 23 27 L 23 45 C 23 48, 43 48, 43 45 L 43 27" fill="none" stroke="#7c3aed" stroke-width="1.6" />
                    <path d="M 23 36 C 23 39, 43 39, 43 36" fill="none" stroke="#7c3aed" stroke-width="1.6" />
                    <text x="60" y="31" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">Update Inventory</text>
                    <text x="60" y="46" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">Deduct issued quantities</text>
                    <text x="60" y="57" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">in live database</text>
                  </g>

                  {/* MAINTAIN TRACEABILITY */}
                  <g 
                    transform="translate(275, 444)" 
                    onClick={() => handleSelectStep('maintain-traceability')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'maintain-traceability' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="195" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'maintain-traceability' ? '#059669' : '#a7f3d0'}
                      stroke-width={selectedStepId === 'maintain-traceability' ? 2.4 : 1.4}
                    />
                    <rect x="12" y="14" width="42" height="44" rx="9" fill="#ecfdf5" />
                    <circle cx="33" cy="36" r="10" fill="none" stroke="#059669" stroke-width="1.6" />
                    <polyline points="33,30 33,36 38,36" fill="none" stroke="#059669" stroke-width="1.6" stroke-linecap="round" />
                    <text x="62" y="31" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">Maintain Traceability</text>
                    <text x="62" y="46" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">Record which batches were</text>
                    <text x="62" y="57" font-family="Inter,sans-serif" font-size="8.5" fill="#64748b">supplied to each FPS</text>
                  </g>

                  {/* ALERTS & EXCEPTION MANAGEMENT */}
                  <g 
                    transform="translate(505, 444)" 
                    onClick={() => handleSelectStep('alerts-management')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'alerts-management' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="235" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'alerts-management' ? '#dc2626' : '#fecaca'}
                      stroke-width={selectedStepId === 'alerts-management' ? 2.4 : 1.4}
                    />
                    <rect x="12" y="14" width="42" height="44" rx="9" fill="#fef2f2" />
                    <path d="M 33 24 L 45 44 L 21 44 Z" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-linejoin="round" />
                    <line x1="33" y1="31" x2="33" y2="36" stroke="#dc2626" stroke-width="1.8" stroke-linecap="round" />
                    <circle cx="33" cy="40" r="1" fill="#dc2626" />
                    <text x="62" y="28" font-family="Inter,sans-serif" font-size="10.5" font-weight="700" fill="#991b1b">Alerts & Exceptions</text>
                    <text x="62" y="41" font-family="Inter,sans-serif" font-size="8" fill="#64748b">• Monitor stock aging & flag old</text>
                    <text x="62" y="52" font-family="Inter,sans-serif" font-size="8" fill="#64748b">• Alert on skipping older batch</text>
                    <text x="62" y="63" font-family="Inter,sans-serif" font-size="8" fill="#64748b">• Require reason for exceptions</text>
                  </g>

                  {/* CENTRALIZED DASHBOARD */}
                  <g 
                    transform="translate(780, 444)" 
                    onClick={() => handleSelectStep('centralized-dashboard')}
                    style={{ cursor: 'pointer' }}
                    filter={selectedStepId === 'centralized-dashboard' ? 'url(#activeShadow)' : 'url(#lightShadow)'}
                  >
                    <rect 
                      width="230" 
                      height="72" 
                      rx="12" 
                      fill="#ffffff"
                      stroke={selectedStepId === 'centralized-dashboard' ? '#0284c7' : '#bae6fd'}
                      stroke-width={selectedStepId === 'centralized-dashboard' ? 2.4 : 1.4}
                    />
                    <rect x="12" y="14" width="42" height="44" rx="9" fill="#f0f9ff" />
                    <rect x="23" y="25" width="20" height="15" rx="2" fill="none" stroke="#0284c7" stroke-width="1.6" />
                    <line x1="28" y1="35" x2="28" y2="31" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round" />
                    <line x1="33" y1="35" x2="33" y2="28" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round" />
                    <line x1="38" y1="35" x2="38" y2="33" stroke="#0284c7" stroke-width="1.6" stroke-linecap="round" />
                    <line x1="33" y1="40" x2="33" y2="45" stroke="#0284c7" stroke-width="1.6" />
                    <text x="62" y="28" font-family="Inter,sans-serif" font-size="10.5" font-weight="700" fill="#0369a1">Centralized Dashboard</text>
                    <text x="62" y="41" font-family="Inter,sans-serif" font-size="8" fill="#64748b">• Available inventory & aging</text>
                    <text x="62" y="52" font-family="Inter,sans-serif" font-size="8" fill="#64748b">• Dispatch history & rakes</text>
                    <text x="62" y="63" font-family="Inter,sans-serif" font-size="8" fill="#64748b">• FIFO compliance metrics</text>
                  </g>

                  {/* END PILL */}
                  <g transform="translate(1050, 466)" style={{ cursor: 'pointer' }}>
                    <rect x="0" y="0" width="70" height="28" rx="14" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" />
                    <text x="35" y="18" text-anchor="middle" font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#047857">
                      End
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* VIEW 2: GODOWNS → IPDS → FPS NETWORK (ON CLEAN WHITE CANVAS) */}
          {activeTab === 'network' && (
            <div className="space-y-4 relative z-10">
              <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                <svg 
                  viewBox="0 0 1100 540" 
                  className="w-full min-w-[980px] h-auto select-none"
                >
                  <defs>
                    <linearGradient id="netLineG" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#d97706" />
                      <stop offset="100%" stop-color="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="netLineF" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#4f46e5" />
                      <stop offset="100%" stop-color="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Bezier Connectors */}
                  <path id="net-g1" d="M 248 120 C 380 120, 400 270, 520 270" fill="none" stroke="url(#netLineG)" stroke-width="2.2" stroke-dasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-220" dur="2.4s" repeatCount="indefinite"/>
                  </path>
                  <path id="net-g2" d="M 248 210 C 360 210, 410 270, 520 270" fill="none" stroke="url(#netLineG)" stroke-width="2.2" stroke-dasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-220" dur="2.8s" repeatCount="indefinite"/>
                  </path>
                  <path id="net-g3" d="M 248 330 C 360 330, 410 270, 520 270" fill="none" stroke="url(#netLineG)" stroke-width="2.2" stroke-dasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-220" dur="3.1s" repeatCount="indefinite"/>
                  </path>
                  <path id="net-g4" d="M 248 420 C 380 420, 400 270, 520 270" fill="none" stroke="url(#netLineG)" stroke-width="2.2" stroke-dasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-220" dur="2.6s" repeatCount="indefinite"/>
                  </path>

                  <path id="net-f1" d="M 696 270 C 810 270, 820 120, 930 120" fill="none" stroke="url(#netLineF)" stroke-width="2.2" stroke-dasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-220" dur="2.2s" repeatCount="indefinite"/>
                  </path>
                  <path id="net-f2" d="M 696 270 C 800 270, 820 210, 930 210" fill="none" stroke="url(#netLineF)" stroke-width="2.2" stroke-dasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-220" dur="2.9s" repeatCount="indefinite"/>
                  </path>
                  <path id="net-f3" d="M 696 270 C 800 270, 820 330, 930 330" fill="none" stroke="url(#netLineF)" stroke-width="2.2" stroke-dasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-220" dur="2.5s" repeatCount="indefinite"/>
                  </path>
                  <path id="net-f4" d="M 696 270 C 810 270, 820 420, 930 420" fill="none" stroke="url(#netLineF)" stroke-width="2.2" stroke-dasharray="6 5">
                    <animate attributeName="stroke-dashoffset" from="0" to="-220" dur="3.3s" repeatCount="indefinite"/>
                  </path>

                  {/* Flowing Grain Particles: Godown -> IPDS */}
                  <circle r="5.5" fill="#d97706">
                    <animateMotion dur="2.4s" repeatCount="indefinite" begin="0s"><mpath href="#net-g1"/></animateMotion>
                  </circle>
                  <circle r="4" fill="#fbbf24">
                    <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.8s"><mpath href="#net-g1"/></animateMotion>
                  </circle>
                  <circle r="5.5" fill="#d97706">
                    <animateMotion dur="2.8s" repeatCount="indefinite" begin="0.4s"><mpath href="#net-g2"/></animateMotion>
                  </circle>
                  <circle r="5.5" fill="#d97706">
                    <animateMotion dur="3.1s" repeatCount="indefinite" begin="0.6s"><mpath href="#net-g3"/></animateMotion>
                  </circle>
                  <circle r="5.5" fill="#d97706">
                    <animateMotion dur="2.6s" repeatCount="indefinite" begin="1.0s"><mpath href="#net-g4"/></animateMotion>
                  </circle>

                  {/* Flowing Grain Particles: IPDS -> FPS */}
                  <circle r="5.5" fill="#059669">
                    <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.3s"><mpath href="#net-f1"/></animateMotion>
                  </circle>
                  <circle r="4" fill="#34d399">
                    <animateMotion dur="2.2s" repeatCount="indefinite" begin="1.1s"><mpath href="#net-f1"/></animateMotion>
                  </circle>
                  <circle r="5.5" fill="#059669">
                    <animateMotion dur="2.9s" repeatCount="indefinite" begin="0.7s"><mpath href="#net-f2"/></animateMotion>
                  </circle>
                  <circle r="5.5" fill="#059669">
                    <animateMotion dur="2.5s" repeatCount="indefinite" begin="1.4s"><mpath href="#net-f3"/></animateMotion>
                  </circle>
                  <circle r="5.5" fill="#059669">
                    <animateMotion dur="3.3s" repeatCount="indefinite" begin="0.9s"><mpath href="#net-f4"/></animateMotion>
                  </circle>

                  {/* GODOWN CARDS (LEFT) */}
                  <g transform="translate(62,84)">
                    <rect width="170" height="72" rx="14" fill="#ffffff" stroke="#fde68a" stroke-width="1.6" filter="url(#lightShadow)"/>
                    <rect width="4" height="72" rx="2" fill="#d97706"/>
                    <text x="58" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">GODOWN – 01</text>
                    <text x="58" y="42" font-family="Inter,sans-serif" font-size="9.5" fill="#64748b">Central Warehouse</text>
                    <rect x="58" y="49" width="95" height="15" rx="7.5" fill="#fef3c7"/>
                    <text x="75" y="60.5" font-family="Inter,sans-serif" font-size="8.5" fill="#b45309" font-weight="700">Stock: 4,200 MT</text>
                  </g>
                  <g transform="translate(62,174)">
                    <rect width="170" height="72" rx="14" fill="#ffffff" stroke="#fde68a" stroke-width="1.6" filter="url(#lightShadow)"/>
                    <rect width="4" height="72" rx="2" fill="#d97706"/>
                    <text x="58" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">GODOWN – 02</text>
                    <text x="58" y="42" font-family="Inter,sans-serif" font-size="9.5" fill="#64748b">North District</text>
                    <rect x="58" y="49" width="95" height="15" rx="7.5" fill="#fef3c7"/>
                    <text x="75" y="60.5" font-family="Inter,sans-serif" font-size="8.5" fill="#b45309" font-weight="700">Stock: 3,750 MT</text>
                  </g>
                  <g transform="translate(62,294)">
                    <rect width="170" height="72" rx="14" fill="#ffffff" stroke="#fde68a" stroke-width="1.6" filter="url(#lightShadow)"/>
                    <rect width="4" height="72" rx="2" fill="#d97706"/>
                    <text x="58" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">GODOWN – 03</text>
                    <text x="58" y="42" font-family="Inter,sans-serif" font-size="9.5" fill="#64748b">South District</text>
                    <rect x="58" y="49" width="95" height="15" rx="7.5" fill="#fef3c7"/>
                    <text x="75" y="60.5" font-family="Inter,sans-serif" font-size="8.5" fill="#b45309" font-weight="700">Stock: 2,900 MT</text>
                  </g>
                  <g transform="translate(62,384)">
                    <rect width="170" height="72" rx="14" fill="#ffffff" stroke="#fde68a" stroke-width="1.6" filter="url(#lightShadow)"/>
                    <rect width="4" height="72" rx="2" fill="#d97706"/>
                    <text x="58" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">GODOWN – 04</text>
                    <text x="58" y="42" font-family="Inter,sans-serif" font-size="9.5" fill="#64748b">East Depot</text>
                    <rect x="58" y="49" width="95" height="15" rx="7.5" fill="#fef3c7"/>
                    <text x="75" y="60.5" font-family="Inter,sans-serif" font-size="8.5" fill="#b45309" font-weight="700">Stock: 5,100 MT</text>
                  </g>

                  {/* CENTRAL IPDS HUB */}
                  <g transform="translate(520,270)">
                    <circle cx="0" cy="0" r="92" fill="none" stroke="#e0e7ff" stroke-width="1.8">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="0" cy="0" r="76" fill="none" stroke="#c7d2fe" stroke-width="1.4" stroke-dasharray="8 6">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="12s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="0" cy="0" r="54" fill="#ffffff" stroke="#4f46e5" stroke-width="2.2" filter="url(#lightShadow)"/>
                    <circle cx="0" cy="0" r="54" fill="none" stroke="#6366f1" stroke-width="3" stroke-dasharray="34 100" stroke-linecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite"/>
                    </circle>
                    <text x="0" y="-8" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="800" fill="#312e81" letter-spacing="1.5">iPDS HUB</text>
                    <text x="0" y="8" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" fill="#64748b">FIFO Allocation</text>
                    <rect x="-28" y="16" width="56" height="16" rx="8" fill="#eef2ff" stroke="#6366f1" stroke-width="1"/>
                    <text x="0" y="27" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="#4338ca">ACTIVE</text>
                  </g>

                  {/* FPS CARDS (RIGHT) */}
                  <g transform="translate(868,84)">
                    <rect width="170" height="72" rx="14" fill="#ffffff" stroke="#a7f3d0" stroke-width="1.6" filter="url(#lightShadow)"/>
                    <rect x="166" width="4" height="72" rx="2" fill="#059669"/>
                    <text x="14" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">FPS – A01</text>
                    <text x="14" y="42" font-family="Inter,sans-serif" font-size="9.5" fill="#64748b">Ward 12, Zone A</text>
                    <rect x="14" y="49" width="105" height="15" rx="7.5" fill="#ecfdf5"/>
                    <text x="24" y="60.5" font-family="Inter,sans-serif" font-size="8.5" fill="#047857" font-weight="700">850 beneficiaries</text>
                  </g>
                  <g transform="translate(868,174)">
                    <rect width="170" height="72" rx="14" fill="#ffffff" stroke="#a7f3d0" stroke-width="1.6" filter="url(#lightShadow)"/>
                    <rect x="166" width="4" height="72" rx="2" fill="#059669"/>
                    <text x="14" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">FPS – A02</text>
                    <text x="14" y="42" font-family="Inter,sans-serif" font-size="9.5" fill="#64748b">Ward 08, Zone B</text>
                    <rect x="14" y="49" width="105" height="15" rx="7.5" fill="#ecfdf5"/>
                    <text x="24" y="60.5" font-family="Inter,sans-serif" font-size="8.5" fill="#047857" font-weight="700">620 beneficiaries</text>
                  </g>
                  <g transform="translate(868,294)">
                    <rect width="170" height="72" rx="14" fill="#ffffff" stroke="#a7f3d0" stroke-width="1.6" filter="url(#lightShadow)"/>
                    <rect x="166" width="4" height="72" rx="2" fill="#059669"/>
                    <text x="14" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">FPS – B01</text>
                    <text x="14" y="42" font-family="Inter,sans-serif" font-size="9.5" fill="#64748b">Ward 03, Zone C</text>
                    <rect x="14" y="49" width="105" height="15" rx="7.5" fill="#ecfdf5"/>
                    <text x="24" y="60.5" font-family="Inter,sans-serif" font-size="8.5" fill="#047857" font-weight="700">1,100 beneficiaries</text>
                  </g>
                  <g transform="translate(868,384)">
                    <rect width="170" height="72" rx="14" fill="#ffffff" stroke="#a7f3d0" stroke-width="1.6" filter="url(#lightShadow)"/>
                    <rect x="166" width="4" height="72" rx="2" fill="#059669"/>
                    <text x="14" y="26" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#0f172a">FPS – B02</text>
                    <text x="14" y="42" font-family="Inter,sans-serif" font-size="9.5" fill="#64748b">Ward 21, Zone D</text>
                    <rect x="14" y="49" width="105" height="15" rx="7.5" fill="#ecfdf5"/>
                    <text x="24" y="60.5" font-family="Inter,sans-serif" font-size="8.5" fill="#047857" font-weight="700">740 beneficiaries</text>
                  </g>

                  {/* BOTTOM FIFO QUEUE BAR */}
                  <g transform="translate(390,488)">
                    <rect x="0" y="0" width="260" height="34" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.4" filter="url(#lightShadow)"/>
                    <text x="10" y="22" font-family="Inter,sans-serif" font-size="8.5" font-weight="700" fill="#64748b" letter-spacing="1">QUEUE →</text>
                    <rect x="58" y="5" width="40" height="24" rx="6" fill="#fef2f2" stroke="#f87171" stroke-width="1.2">
                      <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite"/>
                    </rect>
                    <text x="78" y="21" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="#dc2626">Oct-24</text>
                    <rect x="102" y="5" width="40" height="24" rx="6" fill="#fefce8" stroke="#facc15" stroke-width="1.2"/>
                    <text x="122" y="21" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="#ca8a04">Nov-24</text>
                    <rect x="146" y="5" width="40" height="24" rx="6" fill="#eef2ff" stroke="#818cf8" stroke-width="1.2"/>
                    <text x="166" y="21" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="#4f46e5">Dec-24</text>
                    <rect x="190" y="5" width="40" height="24" rx="6" fill="#ecfdf5" stroke="#34d399" stroke-width="1.2"/>
                    <text x="210" y="21" text-anchor="middle" font-family="Inter,sans-serif" font-size="8" font-weight="700" fill="#059669">Jan-25</text>
                    <text x="234" y="21" font-family="Inter,sans-serif" font-size="11" fill="#dc2626">→</text>
                    <text x="244" y="21" font-family="Inter,sans-serif" font-size="7.5" font-weight="800" fill="#dc2626">OUT</text>
                  </g>
                </svg>
              </div>
            </div>
          )}

          {/* INTERACTIVE INSPECTION CARD FOR ACTIVE STEP (CLEAN WHITE CARD) */}
          <div className="mt-4 p-4 rounded-2xl bg-[#FAFAFC] border border-zinc-200/90 text-xs shadow-2xs relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${activeStep.accent}`}>
                    {activeStep.badge}
                  </span>
                  <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider font-semibold">
                    {activeStep.phase}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <span>{activeStep.title}</span>
                  <span className="text-zinc-500 font-normal">— {activeStep.subtitle}</span>
                </h4>
                <p className="text-zinc-600 text-xs leading-relaxed max-w-3xl">
                  {activeStep.description}
                </p>
              </div>

              {/* Step Metrics Pills */}
              {activeStep.metrics && (
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  {activeStep.metrics.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white border border-zinc-200/90 text-center min-w-[120px] shadow-2xs">
                      <div className="text-[10px] text-zinc-500 font-medium">{m.label}</div>
                      <div className="text-xs font-bold text-zinc-950 font-mono mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Step Selector Pills */}
            <div className="mt-3 pt-3 border-t border-zinc-200/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-zinc-500 font-semibold mr-1 shrink-0">Jump to step:</span>
              {WORKFLOW_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStep(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                    selectedStepId === s.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  {idx + 1}. {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Window Footer Summary Ribbon */}
        <div className="bg-white border-t border-zinc-200/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-900">Deterministic FIFO Guarantee:</span>
            <span>Mathematical timestamp precedence completely eliminates manual stack favouritism.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-mono">
            <span>FCI Circular #14-B Compliant</span>
            <span>•</span>
            <span>End-to-End Traceability</span>
          </div>
        </div>

      </div>
    </div>
  );
}
export default FifoWorkflowVisualizer;
