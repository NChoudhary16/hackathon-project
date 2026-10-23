'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Wheat, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Building2, 
  Scale, 
  Sparkles, 
  Lock,
  ArrowRight,
  Play,
  RotateCw,
  Warehouse,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  BadgeAlert
} from 'lucide-react';

interface MorphBadge {
  id: string;
  prefix?: string;
  icon: React.ReactNode;
  label: string;
  iconBg: string;
  pillBg?: string;
  hasToggle?: boolean;
  toggleActive?: boolean;
}

interface HeroPillarState {
  lead: string;
  badge1: MorphBadge;
  conjunction1: string;
  badge2: MorphBadge;
  conjunction2: string;
  badge3: MorphBadge;
  conjunction3: string;
  badge4: MorphBadge;
  closing: string;
  subhead: string;
  keyStat: { label: string; value: string; detail: string };
}

const PILLAR_STATES: HeroPillarState[] = [
  {
    lead: "An enterprise platform to enforce",
    badge1: {
      id: "fifo-rule",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      label: "strict FIFO",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/80 ring-1 ring-emerald-500/20",
      hasToggle: true,
      toggleActive: true,
    },
    conjunction1: "rules, allocate",
    badge2: {
      id: "multi-batch",
      icon: <Wheat className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      label: "multi-batch",
      iconBg: "bg-amber-100 dark:bg-amber-950/80 ring-1 ring-amber-500/20",
    },
    conjunction2: "grain, and dispatch",
    badge3: {
      id: "rations",
      icon: <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      label: "food rations",
      iconBg: "bg-blue-100 dark:bg-blue-950/80 ring-1 ring-blue-500/20",
    },
    conjunction3: "with",
    badge4: {
      id: "zero-dev",
      icon: <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      label: "zero deviations",
      iconBg: "bg-indigo-100 dark:bg-indigo-950/80 ring-1 ring-indigo-500/20",
    },
    closing: "across Indian PDS godowns.",
    subhead: "Prioritizes the oldest eligible grain consignments using 100% deterministic mathematical business logic — eliminating grain rotting, stock hoarding, and unauthorized stack dispatching.",
    keyStat: {
      label: "FIFO Compliance",
      value: "98.4%",
      detail: "+14.2% reduction in grain ageing",
    },
  },
  {
    lead: "An enterprise platform to prevent",
    badge1: {
      id: "spoilage",
      icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      label: "stock spoilage",
      iconBg: "bg-rose-100 dark:bg-rose-950/80 ring-1 ring-rose-500/20",
      hasToggle: true,
      toggleActive: false,
    },
    conjunction1: "risks, audit",
    badge2: {
      id: "ageing-cycle",
      icon: <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
      label: "ageing cycles",
      iconBg: "bg-violet-100 dark:bg-violet-950/80 ring-1 ring-violet-500/20",
    },
    conjunction2: "live, and generate",
    badge3: {
      id: "challans",
      icon: <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      label: "delivery challans",
      iconBg: "bg-cyan-100 dark:bg-cyan-950/80 ring-1 ring-cyan-500/20",
    },
    conjunction3: "with",
    badge4: {
      id: "traceability",
      icon: <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      label: "FPS traceability",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/80 ring-1 ring-emerald-500/20",
    },
    closing: "under NFSA transparency mandates.",
    subhead: "Real-time moisture radar, stack fumigation tracking, and automated QR-signed Delivery Challans for seamless delivery to 1,420+ Fair Price Shops.",
    keyStat: {
      label: "Active Godown Stock",
      value: "1,258 MT",
      detail: "11 monitored stack bays",
    },
  },
  {
    lead: "An enterprise platform to optimize",
    badge1: {
      id: "godowns",
      icon: <Scale className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
      label: "450+ godowns",
      iconBg: "bg-sky-100 dark:bg-sky-950/80 ring-1 ring-sky-500/20",
      hasToggle: true,
      toggleActive: true,
    },
    conjunction1: "centrally, verify",
    badge2: {
      id: "quality",
      icon: <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
      label: "quality grades",
      iconBg: "bg-teal-100 dark:bg-teal-950/80 ring-1 ring-teal-500/20",
    },
    conjunction2: "deterministically, and govern",
    badge3: {
      id: "dispatches",
      icon: <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      label: "secure dispatches",
      iconBg: "bg-purple-100 dark:bg-purple-950/80 ring-1 ring-purple-500/20",
    },
    conjunction3: "with",
    badge4: {
      id: "audit-pass",
      icon: <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      label: "digital audit seals",
      iconBg: "bg-amber-100 dark:bg-amber-950/80 ring-1 ring-amber-500/20",
    },
    closing: "for state civil supplies departments.",
    subhead: "Multi-batch quantity splitting automatically pairs older expiring lots first while logging supervisor cryptographic override signatures whenever physical bay deviations occur.",
    keyStat: {
      label: "Monthly Dispatches",
      value: "842.5 MT",
      detail: "Zero unauthorized deviations",
    },
  },
];

interface MorphingHeroProps {
  onOpenSimulator: () => void;
  onOpenInward: () => void;
  onNavigateToBay: () => void;
}

export function MorphingHero({ onOpenSimulator, onOpenInward, onNavigateToBay }: MorphingHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [toggleState, setToggleState] = useState(true);

  // Auto morph cycle every 4.2 seconds unless hovered or paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PILLAR_STATES.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [isPaused]);

  const current = PILLAR_STATES[currentIndex];

  const renderBadge = (badge: MorphBadge, keyPrefix: string) => {
    return (
      <motion.span
        key={`${badge.id}-${currentIndex}-${keyPrefix}`}
        initial={{ opacity: 0, y: 10, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.94 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 px-3 py-1 mx-1.5 align-middle rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-all select-none cursor-pointer group"
        onClick={() => {
          setCurrentIndex((prev) => (prev + 1) % PILLAR_STATES.length);
        }}
        title="Click to cycle next morph state"
      >
        {/* Badge Icon or Toggle */}
        <span
          className={`flex items-center justify-center w-6 h-6 rounded-full transition-transform group-hover:scale-110 ${badge.iconBg}`}
        >
          {badge.icon}
        </span>

        {/* Badge Text */}
        <span className="text-zinc-900 dark:text-zinc-100 font-medium tracking-tight text-xl sm:text-2xl md:text-3xl">
          {badge.label}
        </span>

        {/* Optional Pill Switch (just like in the reference image) */}
        {badge.hasToggle ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setToggleState(!toggleState);
            }}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ${
              toggleState ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 600, damping: 30 }}
              className={`bg-white w-4 h-4 rounded-full shadow-md transform ${
                toggleState ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </span>
        ) : null}
      </motion.span>
    );
  };

  return (
    <div 
      className="relative w-full pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-linear-to-b from-white via-zinc-50/60 to-zinc-100/40 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 bg-[radial-gradient(#0066cc_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Top Banner Tag */}
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">StockFlow iPDS</span>
          <span className="text-zinc-400">|</span>
          <span className="text-zinc-600 dark:text-zinc-400">Government Godown FIFO Compliance Prototype</span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            FCI Standard
          </span>
        </div>

        {/* The Hero Morphing Headline (Directly matching Image 2 reference with morphing logos/badges and text) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] font-semibold tracking-tight text-zinc-900 dark:text-white leading-[1.35] sm:leading-[1.3] md:leading-[1.25] max-w-5xl">
          <span>{current.lead}</span>
          {renderBadge(current.badge1, "b1")}
          <span>{current.conjunction1}</span>
          {renderBadge(current.badge2, "b2")}
          <span>{current.conjunction2}</span>
          {renderBadge(current.badge3, "b3")}
          <span>{current.conjunction3}</span>
          {renderBadge(current.badge4, "b4")}
          <span>{current.closing}</span>
        </h1>

        {/* Dynamic Subheading */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
          {current.subhead}
        </p>

        {/* Action Controls & Navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onOpenSimulator}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-base shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Launch FIFO Dispatch Simulator</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <button
            onClick={onOpenInward}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium text-base border border-zinc-300 dark:border-zinc-700 shadow-xs transition-all cursor-pointer"
          >
            <Warehouse className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
            <span>Inward New Consignment</span>
          </button>

          <button
            onClick={onNavigateToBay}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-medium text-base transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Explore Stacks & Bays</span>
          </button>
        </div>

        {/* Pillar State Indicators & Play/Pause */}
        <div className="mt-10 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition cursor-pointer"
            title={isPaused ? "Resume auto-morphing" : "Pause auto-morphing"}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-500" /> : <RotateCw className="w-3 h-3 animate-spin text-zinc-500" />}
            <span>{isPaused ? "Paused" : "Auto-Morphing"}</span>
          </button>

          <div className="flex items-center gap-1.5">
            {PILLAR_STATES.map((state, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 transition-all rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-8 bg-blue-600 dark:bg-blue-500'
                    : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
                }`}
                aria-label={`View Pillar ${idx + 1}`}
              />
            ))}
          </div>

          <span className="hidden sm:inline-block text-zinc-400">•</span>
          <span className="hidden sm:inline-block">
            Pillar {currentIndex + 1} of {PILLAR_STATES.length}: <strong className="text-zinc-700 dark:text-zinc-300">{current.keyStat.label} ({current.keyStat.value})</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
