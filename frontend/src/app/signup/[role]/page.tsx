'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  FlaskConical,
  Truck,
  Store,
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  BadgeCheck,
  Building,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { useStockFlow, getRoleDashboardPath } from '../../../lib/stockflow-context';
import { Role, UserProfile } from '../../../types/inventory';
import { ThemeToggle } from '../../../components/ThemeToggle';

// Map URL slug → Role
const SLUG_TO_ROLE: Record<string, Role> = {
  admin: 'ADMIN',
  manager: 'GODOWN_MANAGER',
  quality: 'QUALITY_INSPECTOR',
  dispatch: 'DISPATCH_OFFICER',
  fps: 'FPS_DEALER',
};

const ROLE_META: Record<Role, {
  title: string;
  roleName: string;
  subtitle: string;
  department: string;
  defaultDesignation: string;
  badgeLabel: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  accentBg: string;
  avatarColor: string;
  tag: string;
}> = {
  ADMIN: {
    title: 'State Administrator Registration',
    roleName: 'State Administrator',
    subtitle: 'Register executive credentials for state-level godown governance and audit oversight',
    department: 'Directorate of Food & Civil Supplies — Central HQ',
    defaultDesignation: 'Joint Director / Deputy Director',
    badgeLabel: 'HQ Gazetted Officer ID',
    icon: ShieldCheck,
    gradient: 'from-rose-600 to-rose-700',
    accentColor: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800',
    avatarColor: 'bg-rose-600',
    tag: 'Executive Authority',
  },
  GODOWN_MANAGER: {
    title: 'Godown Superintendent Registration',
    roleName: 'Godown Superintendent',
    subtitle: 'Register warehouse in-charge credentials for inward receipts, stack layouts & capacity management',
    department: 'FCI Central Depot Operations — Warehouse Unit',
    defaultDesignation: 'Depot Superintendent / Warehouse Manager',
    badgeLabel: 'Depot In-Charge Code',
    icon: SlidersHorizontal,
    gradient: 'from-blue-600 to-blue-700',
    accentColor: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
    avatarColor: 'bg-blue-600',
    tag: 'Depot Operations',
  },
  QUALITY_INSPECTOR: {
    title: 'Quality & AGMARK Inspector Registration',
    roleName: 'Quality Inspector',
    subtitle: 'Register laboratory chemist & field inspector credentials for AGMARK grading & moisture assay',
    department: 'Agmark Central Grain Inspection Cell — QC Lab',
    defaultDesignation: 'AGMARK Quality Inspector / Lab Chemist',
    badgeLabel: 'AGMARK Chemist Reg No.',
    icon: FlaskConical,
    gradient: 'from-emerald-600 to-emerald-700',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
    avatarColor: 'bg-emerald-600',
    tag: 'Moisture & Grading',
  },
  DISPATCH_OFFICER: {
    title: 'Dispatch & Fleet Officer Registration',
    roleName: 'Dispatch Officer',
    subtitle: 'Register weighbridge & outward logistics supervisor credentials for FIFO delivery challans',
    department: 'Civil Supplies Fleet & Weighbridge — Outward Gate',
    defaultDesignation: 'Logistics Supervisor / Weighbridge Officer',
    badgeLabel: 'Weighbridge Gate Pass ID',
    icon: Truck,
    gradient: 'from-amber-500 to-amber-600',
    accentColor: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800',
    avatarColor: 'bg-amber-600',
    tag: 'FIFO & Gate Passes',
  },
  FPS_DEALER: {
    title: 'Fair Price Shop (FPS) Dealer Registration',
    roleName: 'FPS Retail Dealer',
    subtitle: 'Register authorized ration dealer account for PDS distribution & consignment QR verification',
    department: 'NFSA Retail Distribution Network — PDS Branch',
    defaultDesignation: 'Authorized FPS Licensee / Shop Dealer',
    badgeLabel: 'FPS License Number',
    icon: Store,
    gradient: 'from-purple-600 to-purple-700',
    accentColor: 'text-purple-600 dark:text-purple-400',
    accentBg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
    avatarColor: 'bg-purple-600',
    tag: 'PDS Beneficiary Quota',
  },
};

function RoleSignupContent() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.role as string;
  const role = SLUG_TO_ROLE[slug];

  const { addUser, login, godownsList, fairPriceShops } = useStockFlow();

  // Form Fields
  const [salutation, setSalutation] = useState('Shri');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [selectedGodownId, setSelectedGodownId] = useState(godownsList[0]?.id || 'fci_okhla');
  const [selectedFpsId, setSelectedFpsId] = useState(fairPriceShops[0]?.id || 'fps_central_01');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(null);

  const meta = role ? ROLE_META[role] : null;

  // Initialize designation when meta is ready
  React.useEffect(() => {
    if (meta && !designation) {
      setDesignation(meta.defaultDesignation);
    }
  }, [meta, designation]);

  if (!meta || !role) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-white">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold">Invalid Registration Portal</h2>
        <p className="text-xs text-zinc-400 mt-1 mb-4">The role specified in URL does not exist.</p>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
        >
          Select Official Role &rarr;
        </Link>
      </div>
    );
  }

  const Icon = meta.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!fullName.trim()) {
      setErrorMessage('Please enter officer full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid departmental or official email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Security clearance PIN / Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Security PIN and Confirm PIN do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Please acknowledge the NFSA official code of conduct declaration.');
      return;
    }

    setIsSubmitting(true);

    try {
      const assignedGodown = godownsList.find((g) => g.id === selectedGodownId);
      const assignedFps = fairPriceShops.find((f) => f.id === selectedFpsId);

      const officialName = `${salutation} ${fullName.trim()}`;
      const avatarLetter = fullName.trim().charAt(0).toUpperCase() || 'U';

      // Create new officer user
      const newUser = addUser({
        name: officialName,
        email: email.trim().toLowerCase(),
        role: role,
        avatarLetter: avatarLetter,
        avatarColor: meta.avatarColor,
        designation: designation.trim() || meta.defaultDesignation,
        department: meta.department,
        godownId: role === 'GODOWN_MANAGER' || role === 'DISPATCH_OFFICER' ? selectedGodownId : undefined,
        godownName: role === 'GODOWN_MANAGER' || role === 'DISPATCH_OFFICER' ? assignedGodown?.name : undefined,
        phone: phone.trim() || '+91 98110 00000',
        fpsId: role === 'FPS_DEALER' ? selectedFpsId : undefined,
        active: true,
      });

      setRegisteredUser(newUser);

      // Authenticate session
      login({ userId: newUser.id, password: password });

      setIsSuccess(true);
      setIsSubmitting(false);

      // Smoothly navigate to dashboard
      setTimeout(() => {
        router.push(getRoleDashboardPath(role));
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Registration failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/signup"
              className="w-9 h-9 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Return to Role Selector"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">StockFlow iPDS</span>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${meta.accentBg} ${meta.accentColor}`}>
                  {meta.tag}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">National Food Security Act • Portal Registration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/login/${slug}`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Already registered? Sign In &rarr;
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {isSuccess ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Clearance Granted
            </span>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-4">
              Officer Account Registered Successfully!
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-md mx-auto">
              Welcome, <strong className="text-zinc-900 dark:text-white">{registeredUser?.name}</strong>. Your official {meta.roleName} terminal is being initialized...
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Designation:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{registeredUser?.designation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Official Email:</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">{registeredUser?.email}</span>
              </div>
              {registeredUser?.godownName && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Depot Station:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{registeredUser?.godownName}</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Redirecting to your segregated {meta.roleName} dashboard...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
            {/* Header Banner */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white border-b border-zinc-800 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center shadow-lg shrink-0`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                        {meta.tag}
                      </span>
                      <span className="text-xs text-zinc-400">• Official Registration</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                      {meta.title}
                    </h1>
                    <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                      {meta.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Section 1: Personal / Officer Identification */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Officer Identification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Salutation
                    </label>
                    <select
                      value={salutation}
                      onChange={(e) => setSalutation(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      <option value="Shri">Shri</option>
                      <option value="Smt.">Smt.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Er.">Er.</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Full Legal Name (as per Service Record / License) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Sharma"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Official Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={`officer@${slug === 'fps' ? 'fpsdealers.in' : 'fci.gov.in'}`}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Contact Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98110 12345"
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Designation & Station Assignment */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-500" />
                  Designation & Station Assignment
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Official Designation / Title
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder={meta.defaultDesignation}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      {meta.badgeLabel}
                    </label>
                    <div className="relative">
                      <BadgeCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type="text"
                        value={badgeNumber}
                        onChange={(e) => setBadgeNumber(e.target.value)}
                        placeholder={`e.g. ${slug.toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`}
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Role Specific Dropdown */}
                {(role === 'GODOWN_MANAGER' || role === 'DISPATCH_OFFICER') && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Assigned Food Grain Godown / Depot <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedGodownId}
                      onChange={(e) => setSelectedGodownId(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      {godownsList.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} — {g.district}, {g.state} ({g.capacityMt.toLocaleString()} MT Capacity)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {role === 'FPS_DEALER' && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Assigned Fair Price Shop Unit <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedFpsId}
                      onChange={(e) => setSelectedFpsId(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    >
                      {fairPriceShops.map((fps) => (
                        <option key={fps.id} value={fps.id}>
                          {fps.name} — #{fps.id} ({fps.district})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Section 3: Security & Credentials Setup */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-500" />
                  Security Credentials Setup
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Create Security PIN / Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 4 characters (e.g. 123456)"
                        className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Confirm Security PIN / Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter security PIN"
                        className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed cursor-pointer">
                    I solemnly declare that all provided identity and station details are accurate. I acknowledge that actions executed under this role account are subject to statutory NFSA electronic audit logs.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href={`/login/${slug}`}
                  className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Already registered? Sign in instead</span>
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${meta.gradient} text-white font-semibold text-xs shadow-md transition cursor-pointer disabled:opacity-60 hover:opacity-90`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Registering Officer Clearance...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Complete Registration & Open Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-4 px-4 text-center text-xs text-zinc-500 bg-white/50 dark:bg-zinc-900/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StockFlow iPDS • Government Food-Grain Godown Management System</span>
          <span className="text-zinc-400 text-[11px]">Authorized Departmental Use Only</span>
        </div>
      </footer>
    </div>
  );
}

export default function RoleSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xs">
        Loading Role Registration Portal...
      </div>
    }>
      <RoleSignupContent />
    </Suspense>
  );
}
