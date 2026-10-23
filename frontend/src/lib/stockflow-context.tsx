'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Batch, 
  CommodityType, 
  DeliveryChallan, 
  FairPriceShop, 
  GodownMetrics, 
  StockMovement, 
  StockReceipt, 
  AgeingThresholdConfig, 
  GodownProfile, 
  QualityGrade,
  BatchStatus,
  Role,
  Permission,
  UserProfile,
  SupplierEntity,
  CommodityEntity,
  AuditLogEntry,
  FifoExceptionEntry
} from '../types/inventory';
import { 
  INITIAL_BATCHES, 
  INITIAL_DELIVERY_CHALLANS, 
  INITIAL_RECEIPTS, 
  INITIAL_MOVEMENTS, 
  INITIAL_GODOWN_METRICS, 
  DEFAULT_AGEING_CONFIG,
  GODOWN_PROFILES,
  COMMODITY_METADATA,
  DEMO_GODOWNS,
  FAIR_PRICE_SHOPS,
  DEMO_USERS,
  ROLE_PERMISSIONS,
  INITIAL_SUPPLIERS,
  INITIAL_COMMODITY_ENTITIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_FIFO_EXCEPTIONS
} from './mock-data';
import { calculateStockAge, calculateSpoilageRisk } from './fifo-engine';

interface CreateReceiptInput {
  receiptNumber: string;
  supplier: string;
  supplierState: string;
  commodity: CommodityType;
  variety: string;
  receiptDate: string;
  expiryDate: string;
  quantityMt: number;
  qualityGrade: QualityGrade;
  stackLocation: string;
  bayId: string;
  moisturePercent: number;
  labReportNo: string;
  createdBy: string;
}

interface CreateDispatchInput {
  fpsId: string;
  commodity: CommodityType;
  totalQuantityMt: number;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  allocations: {
    batchId: string;
    stackLocation: string;
    allocatedMt: number;
    bags: number;
    receiptDate: string;
  }[];
  isFifoCompliant: boolean;
  deviationJustification?: string;
  authorizedByOfficer?: string;
  authorizationPinUsed?: boolean;
}

interface StockFlowContextType {
  // Data
  batches: Batch[];
  challans: DeliveryChallan[];
  receipts: StockReceipt[];
  movements: StockMovement[];
  metrics: GodownMetrics;
  selectedGodownId: string;
  currentGodown: GodownProfile;
  ageingConfig: AgeingThresholdConfig;
  allGodowns: typeof DEMO_GODOWNS;
  godownsList: GodownProfile[];
  fairPriceShops: FairPriceShop[];

  // RBAC & Users
  users: UserProfile[];
  currentUser: UserProfile;
  currentRole: Role;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  login: (credentials: { email?: string; password?: string; role?: Role; userId?: string }) => { success: boolean; error?: string; user?: UserProfile };
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  switchRole: (role: Role) => void;
  switchUser: (userId: string) => void;
  updateUserRole: (userId: string, newRole: Role, newGodownId?: string) => void;
  addUser: (user: Omit<UserProfile, 'id'>) => void;

  // Master Entities
  suppliers: SupplierEntity[];
  commodities: CommodityEntity[];
  auditLogs: AuditLogEntry[];
  fifoExceptions: FifoExceptionEntry[];

  // Mutators
  setSelectedGodownId: (id: string) => void;
  setAgeingConfig: (config: AgeingThresholdConfig) => void;
  addStockReceipt: (input: CreateReceiptInput) => { success: boolean; error?: string; receipt?: StockReceipt; batch?: Batch };
  createDispatch: (input: CreateDispatchInput) => { success: boolean; error?: string; challan?: DeliveryChallan };
  updateBatchStatus: (batchId: string, status: BatchStatus, reason?: string) => void;
  updateBatchQuality: (batchId: string, grade: QualityGrade, moisture: number, labReport: string) => void;
  acknowledgeChallan: (challanId: string, notes?: string) => void;
  addAuditLog: (action: string, entity: string, entityId: string, details: string, status?: 'SUCCESS' | 'WARNING' | 'EXCEPTION') => void;
  approveFifoException: (exceptionId: string, approverName?: string) => void;
  addGodown: (godown: GodownProfile) => void;
  addCommodity: (commodity: CommodityEntity) => void;
  addSupplier: (supplier: SupplierEntity) => void;
  addFairPriceShop: (fps: FairPriceShop) => void;
  resetAllData: () => void;
}

const StockFlowContext = createContext<StockFlowContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BATCHES: 'stockflow_batches_v2',
  CHALLANS: 'stockflow_challans_v2',
  RECEIPTS: 'stockflow_receipts_v2',
  MOVEMENTS: 'stockflow_movements_v2',
  GODOWN: 'stockflow_godown_v2',
  AGEING: 'stockflow_ageing_v2',
  USERS: 'stockflow_users_v2',
  CURRENT_USER_ID: 'stockflow_current_user_id_v2',
  AUTH_SESSION: 'stockflow_auth_session_v2',
  SUPPLIERS: 'stockflow_suppliers_v2',
  COMMODITIES: 'stockflow_commodities_v2',
  AUDIT_LOGS: 'stockflow_audit_logs_v2',
  FIFO_EXCEPTIONS: 'stockflow_fifo_exceptions_v2',
  GODOWNS_LIST: 'stockflow_godowns_list_v2',
  FAIR_PRICE_SHOPS: 'stockflow_fair_price_shops_v2',
};

export const DEMO_LOGIN_CREDENTIALS: Record<Role, { email: string; defaultPin: string; officerName: string; designation: string; godown?: string }> = {
  ADMIN: {
    email: 'admin@stockflow.gov.in',
    defaultPin: '123456',
    officerName: 'Rajesh Kumar Sharma',
    designation: 'Director (State Food & Civil Supplies)',
  },
  GODOWN_MANAGER: {
    email: 'manager.okhla@stockflow.gov.in',
    defaultPin: '123456',
    officerName: 'S. K. Verma',
    designation: 'Depot Superintendent / In-Charge',
    godown: 'FCI Central Depot Okhla',
  },
  QUALITY_INSPECTOR: {
    email: 'quality.inspector@stockflow.gov.in',
    defaultPin: '123456',
    officerName: 'Anjali Gupta',
    designation: 'Chief Quality & Laboratory Chemist',
    godown: 'FCI Central Depot Okhla',
  },
  DISPATCH_OFFICER: {
    email: 'dispatch.officer@stockflow.gov.in',
    defaultPin: '123456',
    officerName: 'Harpreet Singh',
    designation: 'Logistics & Weighbridge Supervisor',
    godown: 'FCI Central Depot Okhla',
  },
  FPS_DEALER: {
    email: 'dealer.fps412@pds.gov.in',
    defaultPin: '123456',
    officerName: 'Ramesh Chaurasia',
    designation: 'Fair Price Shop Authorized Dealer #412',
  },
};

export function getRoleDashboardPath(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'GODOWN_MANAGER':
      return '/dashboard/manager';
    case 'QUALITY_INSPECTOR':
      return '/dashboard/quality';
    case 'DISPATCH_OFFICER':
      return '/dashboard/dispatch';
    case 'FPS_DEALER':
      return '/dashboard/fps';
    default:
      return '/dashboard';
  }
}

export function StockFlowProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [challans, setChallans] = useState<DeliveryChallan[]>(INITIAL_DELIVERY_CHALLANS);
  const [receipts, setReceipts] = useState<StockReceipt[]>(INITIAL_RECEIPTS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_MOVEMENTS);
  const [selectedGodownId, setSelectedGodownId] = useState<string>('fci_okhla');
  const [ageingConfig, setAgeingConfig] = useState<AgeingThresholdConfig>(DEFAULT_AGEING_CONFIG);

  // RBAC & Master Entities state
  const [users, setUsers] = useState<UserProfile[]>(DEMO_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('usr_admin_01');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [suppliers, setSuppliers] = useState<SupplierEntity[]>(INITIAL_SUPPLIERS);
  const [commodities, setCommodities] = useState<CommodityEntity[]>(INITIAL_COMMODITY_ENTITIES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [fifoExceptions, setFifoExceptions] = useState<FifoExceptionEntry[]>(INITIAL_FIFO_EXCEPTIONS);
  const [godownsList, setGodownsList] = useState<GodownProfile[]>(Object.values(GODOWN_PROFILES));
  const [fairPriceShops, setFairPriceShops] = useState<FairPriceShop[]>(FAIR_PRICE_SHOPS);

  // Initialize from client storage safely
  useEffect(() => {
    setIsClient(true);
    try {
      const storedBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
      const storedChallans = localStorage.getItem(STORAGE_KEYS.CHALLANS);
      const storedReceipts = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      const storedMovements = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      const storedGodown = localStorage.getItem(STORAGE_KEYS.GODOWN);
      const storedAgeing = localStorage.getItem(STORAGE_KEYS.AGEING);
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedCurrentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const storedAuthSession = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      const storedSuppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      const storedCommodities = localStorage.getItem(STORAGE_KEYS.COMMODITIES);
      const storedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const storedExceptions = localStorage.getItem(STORAGE_KEYS.FIFO_EXCEPTIONS);
      const storedGodowns = localStorage.getItem(STORAGE_KEYS.GODOWNS_LIST);
      const storedFps = localStorage.getItem(STORAGE_KEYS.FAIR_PRICE_SHOPS);

      if (storedBatches) setBatches(JSON.parse(storedBatches));
      if (storedChallans) setChallans(JSON.parse(storedChallans));
      if (storedReceipts) setReceipts(JSON.parse(storedReceipts));
      if (storedMovements) setMovements(JSON.parse(storedMovements));
      if (storedGodown) setSelectedGodownId(storedGodown);
      if (storedAgeing) setAgeingConfig(JSON.parse(storedAgeing));
      if (storedUsers) setUsers(JSON.parse(storedUsers));
      if (storedCurrentUserId) setCurrentUserId(storedCurrentUserId);
      if (storedSuppliers) setSuppliers(JSON.parse(storedSuppliers));
      if (storedCommodities) setCommodities(JSON.parse(storedCommodities));
      if (storedAuditLogs) setAuditLogs(JSON.parse(storedAuditLogs));
      if (storedExceptions) setFifoExceptions(JSON.parse(storedExceptions));
      if (storedGodowns) setGodownsList(JSON.parse(storedGodowns));
      if (storedFps) setFairPriceShops(JSON.parse(storedFps));

      // Check authenticated session
      if (storedAuthSession) {
        try {
          const parsed = JSON.parse(storedAuthSession);
          if (parsed && parsed.isAuthenticated) {
            setIsAuthenticated(true);
            if (parsed.userId) setCurrentUserId(parsed.userId);
          } else {
            setIsAuthenticated(false);
          }
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.warn('Failed to hydrate StockFlow state from localStorage:', e);
    } finally {
      setIsAuthReady(true);
    }
  }, []);

  // Sync to storage
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
      localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(challans));
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
      localStorage.setItem(STORAGE_KEYS.GODOWN, selectedGodownId);
      localStorage.setItem(STORAGE_KEYS.AGEING, JSON.stringify(ageingConfig));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
      localStorage.setItem(STORAGE_KEYS.COMMODITIES, JSON.stringify(commodities));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEYS.FIFO_EXCEPTIONS, JSON.stringify(fifoExceptions));
      localStorage.setItem(STORAGE_KEYS.GODOWNS_LIST, JSON.stringify(godownsList));
      localStorage.setItem(STORAGE_KEYS.FAIR_PRICE_SHOPS, JSON.stringify(fairPriceShops));
    } catch {
      // Ignore quota errors
    }
  }, [
    isClient,
    batches,
    challans,
    receipts,
    movements,
    selectedGodownId,
    ageingConfig,
    users,
    currentUserId,
    suppliers,
    commodities,
    auditLogs,
    fifoExceptions,
    godownsList,
    fairPriceShops
  ]);

  // Current active user & role
  const currentUser = useMemo(() => {
    const found = users.find((u) => u.id === currentUserId);
    return found || users[0] || DEMO_USERS[0];
  }, [users, currentUserId]);

  const currentRole: Role = currentUser.role;

  // RBAC Permission checker
  const hasPermission = (permission: Permission): boolean => {
    const allowedPermissions = ROLE_PERMISSIONS[currentRole] || [];
    return allowedPermissions.includes(permission);
  };

  // Switch role directly (finds or adjusts the current user)
  const switchRole = (newRole: Role) => {
    const matchingUser = users.find((u) => u.role === newRole);
    if (matchingUser) {
      setCurrentUserId(matchingUser.id);
      if (matchingUser.godownId) setSelectedGodownId(matchingUser.godownId);
      if (isAuthenticated) {
        try {
          localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify({
            isAuthenticated: true,
            userId: matchingUser.id,
            role: matchingUser.role,
            timestamp: new Date().toISOString()
          }));
        } catch {}
      }
    } else {
      // Adjust current user's role
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, role: newRole } : u))
      );
    }
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.godownId) setSelectedGodownId(targetUser.godownId);
    if (isAuthenticated && targetUser) {
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify({
          isAuthenticated: true,
          userId: targetUser.id,
          role: targetUser.role,
          timestamp: new Date().toISOString()
        }));
      } catch {}
    }
  };

  // Login with email, role, or user ID
  const login = ({ email, password, role, userId }: { email?: string; password?: string; role?: Role; userId?: string }) => {
    let targetUser: UserProfile | undefined;
    if (userId) {
      targetUser = users.find((u) => u.id === userId);
    } else if (role) {
      targetUser = users.find((u) => u.role === role);
    } else if (email) {
      targetUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    }

    if (!targetUser) {
      return { success: false, error: 'Officer identification or email not found in NFSA registry.' };
    }

    // Check credentials (PIN/password) if provided
    if (password && password.trim().length > 0) {
      const pin = password.trim();
      const validPins = ['123456', 'admin123', 'manager123', 'quality123', 'dispatch123', 'fps123', 'password', 'nic@2026', 'demo'];
      const matchesRole = pin.toLowerCase().includes(targetUser.role.toLowerCase().slice(0, 4));
      // In demo/test mode, accept default pin 123456, role passwords, or standard pins
      if (!validPins.includes(pin) && !matchesRole && pin.length < 4) {
        return { success: false, error: 'Invalid Security PIN. Default test PIN is 123456.' };
      }
    }

    setCurrentUserId(targetUser.id);
    if (targetUser.godownId) {
      setSelectedGodownId(targetUser.godownId);
    }
    setIsAuthenticated(true);

    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify({
        isAuthenticated: true,
        userId: targetUser.id,
        role: targetUser.role,
        timestamp: new Date().toISOString()
      }));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, targetUser.id);
    } catch {}

    addAuditLog(
      'OFFICER_AUTHENTICATED',
      'AUTH_GATEWAY',
      targetUser.id,
      `Officer ${targetUser.name} (${targetUser.role}) authenticated via National Food Security Portal`,
      'SUCCESS'
    );

    return { success: true, user: targetUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } catch {}
    addAuditLog(
      'OFFICER_LOGOUT',
      'AUTH_GATEWAY',
      currentUser.id,
      `Officer ${currentUser.name} logged out from active terminal`,
      'SUCCESS'
    );
  };

  const updateUserRole = (userId: string, newRole: Role, newGodownId?: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              role: newRole,
              godownId: newGodownId !== undefined ? newGodownId : u.godownId,
              godownName: newGodownId ? godownsList.find(g => g.id === newGodownId)?.name : u.godownName,
            }
          : u
      )
    );
    addAuditLog('USER_ROLE_UPDATED', 'User', userId, `Updated role to ${newRole}`, 'SUCCESS');
  };

  const addUser = (newUser: Omit<UserProfile, 'id'>) => {
    const user: UserProfile = {
      ...newUser,
      id: `usr_${Date.now()}`,
    };
    setUsers((prev) => [user, ...prev]);
    addAuditLog('USER_REGISTERED', 'User', user.id, `Created user ${user.name} (${user.role})`, 'SUCCESS');
  };

  // Current selected godown profile
  const currentGodown = useMemo<GodownProfile>(() => {
    return (
      godownsList.find((g) => g.id === selectedGodownId) ||
      GODOWN_PROFILES[selectedGodownId] ||
      GODOWN_PROFILES.fci_okhla
    );
  }, [godownsList, selectedGodownId]);

  // Dynamic Godown Metrics Calculation
  const metrics = useMemo<GodownMetrics>(() => {
    const activeBatches = batches.filter((b) => b.status === 'active');
    const currentStockMt = Number(
      activeBatches.reduce((acc, b) => acc + b.currentQuantityMt, 0).toFixed(1)
    );
    const capacity = currentGodown.capacityMt;
    const utilizationRatePercent = Number(((currentStockMt / capacity) * 100).toFixed(1));

    const compliantChallans = challans.filter((c) => c.isFifoCompliant).length;
    const fifoComplianceRatePercent =
      challans.length > 0 ? Number(((compliantChallans / challans.length) * 100).toFixed(1)) : 100.0;

    const criticalAgeingBatchesCount = activeBatches.filter(
      (b) => b.ageDays >= ageingConfig.criticalAlertDays
    ).length;

    const pendingDispatchesCount = challans.filter(
      (c) => c.status === 'Draft' || c.status === 'Allocated' || c.status === 'In-Transit'
    ).length;

    const monthlyDispatchedMt = Number(
      challans.reduce((sum, c) => sum + c.totalQuantityMt, 0).toFixed(1)
    );

    return {
      totalCapacityMt: capacity,
      currentStockMt,
      utilizationRatePercent,
      fifoComplianceRatePercent,
      criticalAgeingBatchesCount,
      pendingDispatchesCount,
      activeBatchesCount: activeBatches.length,
      monthlyDispatchedMt,
    };
  }, [batches, challans, currentGodown, ageingConfig]);

  // Audit Log helper
  const addAuditLog = (
    action: string,
    entity: string,
    entityId: string,
    details: string,
    status: 'SUCCESS' | 'WARNING' | 'EXCEPTION' = 'SUCCESS'
  ) => {
    const newLog: AuditLogEntry = {
      id: `AUD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      action,
      entity,
      entityId,
      performedBy: `${currentUser.name} (${currentUser.role})`,
      userRole: currentUser.role,
      timestamp: new Date().toISOString(),
      details,
      status,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Add stock receipt & batch
  const addStockReceipt = (input: CreateReceiptInput) => {
    if (!hasPermission('CAN_CREATE_RECEIPT')) {
      return { success: false, error: 'Unauthorized: Requires GODOWN_MANAGER or ADMIN role to record receipts.' };
    }

    const batchId = `BATCH-${input.commodity.toUpperCase().slice(0, 3)}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const ageDays = calculateStockAge(input.receiptDate);
    const bagCount = Math.round((input.quantityMt * 1000) / 50);

    const newBatch: Batch = {
      id: batchId,
      commodity: input.commodity,
      commodityName: COMMODITY_METADATA[input.commodity]?.name || input.commodity,
      variety: input.variety,
      supplier: input.supplier,
      supplierState: input.supplierState,
      receiptDate: input.receiptDate,
      expiryDate: input.expiryDate,
      initialQuantityMt: input.quantityMt,
      currentQuantityMt: input.quantityMt,
      bagCount,
      bagSizeKg: 50,
      stackLocation: input.stackLocation,
      bayId: input.bayId,
      moistureContentPercent: input.moisturePercent,
      qualityGrade: input.qualityGrade,
      status: input.qualityGrade === 'Quarantine' ? 'quarantine' : 'active',
      labReportNo: input.labReportNo,
      fumigationDueDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      lastFumigationDate: new Date().toISOString().slice(0, 10),
      ageDays,
      spoilageRiskScore: calculateSpoilageRisk({
        ageDays,
        moistureContentPercent: input.moisturePercent,
        fumigationDueDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      }),
      quarantineReason: input.qualityGrade === 'Quarantine' ? 'Moisture or quality criteria failed upon intake' : undefined,
    };

    const newReceipt: StockReceipt = {
      id: `RCP-${new Date().toISOString().slice(0, 7).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      receiptNumber: input.receiptNumber,
      supplier: input.supplier,
      supplierState: input.supplierState,
      commodity: input.commodity,
      commodityName: newBatch.commodityName,
      variety: input.variety,
      batchIdentifier: batchId,
      receiptDate: input.receiptDate,
      expiryDate: input.expiryDate,
      receivedQuantityMt: input.quantityMt,
      bagCount,
      bagSizeKg: 50,
      moisturePercent: input.moisturePercent,
      qualityGrade: input.qualityGrade,
      godownId: selectedGodownId,
      stackLocation: input.stackLocation,
      bayId: input.bayId,
      labReportNo: input.labReportNo,
      createdBy: `${currentUser.name} (${currentUser.role})`,
      status: input.qualityGrade === 'Quarantine' ? 'REJECTED' : 'VERIFIED',
    };

    const newMovement: StockMovement = {
      id: `MOV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      batchId,
      commodity: input.commodity,
      commodityName: newBatch.commodityName,
      movementType: 'RECEIPT',
      quantityDeltaMt: input.quantityMt,
      bagsDelta: bagCount,
      referenceId: input.receiptNumber,
      userRole: `${currentUser.name} (${currentUser.role})`,
      reason: `Direct Receipt from ${input.supplier} (Variety: ${input.variety})`,
      godownId: selectedGodownId,
      sourceOrDestination: input.supplier,
    };

    setBatches((prev) => [newBatch, ...prev]);
    setReceipts((prev) => [newReceipt, ...prev]);
    setMovements((prev) => [newMovement, ...prev]);

    // Update commodity stock
    setCommodities((prev) =>
      prev.map((c) =>
        c.code.toLowerCase().includes(input.commodity.slice(0, 3).toLowerCase())
          ? { ...c, currentInStockMt: Number((c.currentInStockMt + input.quantityMt).toFixed(1)) }
          : c
      )
    );

    addAuditLog(
      'STOCK_RECEIPT_REGISTERED',
      'StockReceipt',
      newReceipt.receiptNumber,
      `Received ${input.quantityMt} MT ${newBatch.commodityName} from ${input.supplier}. Stack: ${input.stackLocation}`,
      input.qualityGrade === 'Quarantine' ? 'WARNING' : 'SUCCESS'
    );

    return { success: true, receipt: newReceipt, batch: newBatch };
  };

  // Create dispatch with FIFO allocation & stock deduction
  const createDispatch = (input: CreateDispatchInput) => {
    if (!hasPermission('CAN_DISPATCH_STOCK')) {
      return { success: false, error: 'Unauthorized: Requires DISPATCH_OFFICER, GODOWN_MANAGER, or ADMIN role to dispatch.' };
    }

    if (!input.isFifoCompliant && !hasPermission('CAN_OVERRIDE_FIFO')) {
      return { success: false, error: 'Unauthorized: Only GODOWN_MANAGER or ADMIN can authorize a FIFO exception.' };
    }

    const targetFps = fairPriceShops.find((f) => f.id === input.fpsId) || {
      id: input.fpsId,
      name: 'PDS Fair Price Shop',
      district: currentGodown.district,
    };

    const challanId = `PDS/DC/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    const totalBags = input.allocations.reduce((sum, a) => sum + a.bags, 0);

    // Update batch balances
    const updatedBatches = [...batches];
    for (const alloc of input.allocations) {
      const idx = updatedBatches.findIndex((b) => b.id === alloc.batchId);
      if (idx !== -1) {
        const remaining = Math.max(0, updatedBatches[idx].currentQuantityMt - alloc.allocatedMt);
        const remBags = Math.max(0, updatedBatches[idx].bagCount - alloc.bags);
        updatedBatches[idx] = {
          ...updatedBatches[idx],
          currentQuantityMt: Number(remaining.toFixed(2)),
          bagCount: remBags,
          status: remaining <= 0 ? 'exhausted' : updatedBatches[idx].status,
        };
      }
    }

    const newChallan: DeliveryChallan = {
      id: challanId,
      dispatchDate: new Date().toISOString().slice(0, 10),
      fpsId: input.fpsId,
      fpsName: targetFps.name,
      fpsDistrict: targetFps.district,
      commodity: input.commodity,
      commodityName: COMMODITY_METADATA[input.commodity]?.name || input.commodity,
      totalQuantityMt: input.totalQuantityMt,
      totalBags,
      vehicleNumber: input.vehicleNumber,
      driverName: input.driverName,
      driverPhone: input.driverPhone,
      godownDepot: currentGodown.name,
      allocatedBatches: input.allocations,
      isFifoCompliant: input.isFifoCompliant,
      deviationJustification: input.deviationJustification,
      authorizedByOfficer: input.authorizedByOfficer || `${currentUser.name} (${currentUser.role})`,
      authorizationPinUsed: input.authorizationPinUsed,
      status: 'In-Transit',
      qrCodeSignature: `VERIFIED-PDS-SECURE-${challanId.replace(/\//g, '')}-${Date.now()}`,
      grossWeightKg: Math.round(input.totalQuantityMt * 1000 * 1.25),
      tareWeightKg: Math.round(input.totalQuantityMt * 1000 * 0.25),
      netWeightKg: Math.round(input.totalQuantityMt * 1000),
      gatePassNo: `GP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const newMovements: StockMovement[] = input.allocations.map((a, i) => ({
      id: `MOV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}-${i}`,
      timestamp: new Date().toISOString(),
      batchId: a.batchId,
      commodity: input.commodity,
      commodityName: newChallan.commodityName,
      movementType: input.isFifoCompliant ? 'DISPATCH' : 'FIFO_EXCEPTION_DISPATCH',
      quantityDeltaMt: -a.allocatedMt,
      bagsDelta: -a.bags,
      referenceId: challanId,
      userRole: `${currentUser.name} (${currentUser.role})`,
      reason: input.isFifoCompliant
        ? `Strict FIFO dispatch to ${targetFps.name}`
        : `Authorized FIFO Exception: ${input.deviationJustification || 'Operational bypass'}`,
      godownId: selectedGodownId,
      sourceOrDestination: targetFps.name,
    }));

    // If FIFO deviation occurred, record formal FIFO Exception
    if (!input.isFifoCompliant) {
      const exceptionEntry: FifoExceptionEntry = {
        id: `EXC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        challanId,
        challanNumber: challanId,
        requestedBatchId: input.allocations[0]?.batchId || 'BATCH-UNKNOWN',
        bypassedBatchId: batches.find(b => b.commodity === input.commodity && b.status === 'active')?.id || 'BATCH-OLDEST',
        bypassedBatchAgeDays: 220,
        reason: input.deviationJustification || 'Operational bypass authorized by superintendent',
        approvedBy: currentUser.name,
        approvedRole: currentUser.role,
        timestamp: new Date().toISOString(),
        status: 'APPROVED',
      };
      setFifoExceptions((prev) => [exceptionEntry, ...prev]);
    }

    setBatches(updatedBatches);
    setChallans((prev) => [newChallan, ...prev]);
    setMovements((prev) => [...newMovements, ...prev]);

    // Update commodity stock
    setCommodities((prev) =>
      prev.map((c) =>
        c.code.toLowerCase().includes(input.commodity.slice(0, 3).toLowerCase())
          ? { ...c, currentInStockMt: Math.max(0, Number((c.currentInStockMt - input.totalQuantityMt).toFixed(1))) }
          : c
      )
    );

    addAuditLog(
      'DELIVERY_CHALLAN_ISSUED',
      'DeliveryChallan',
      challanId,
      `Issued Challan for ${input.totalQuantityMt} MT ${newChallan.commodityName} to ${targetFps.name}. Vehicle: ${input.vehicleNumber}. FIFO: ${input.isFifoCompliant ? 'Strict' : 'Deviation'}`,
      input.isFifoCompliant ? 'SUCCESS' : 'EXCEPTION'
    );

    return { success: true, challan: newChallan };
  };

  // Update batch status (e.g. Quarantine / Release)
  const updateBatchStatus = (batchId: string, newStatus: BatchStatus, reason?: string) => {
    if (!hasPermission('CAN_INSPECT_QUALITY') && !hasPermission('CAN_MANAGE_USERS')) {
      alert('Permission Denied: Quality Inspector or Administrator role required to alter batch status.');
      return;
    }

    const target = batches.find((b) => b.id === batchId);
    if (!target) return;

    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: newStatus,
              qualityGrade: newStatus === 'quarantine' ? 'Quarantine' : b.qualityGrade === 'Quarantine' ? 'Grade-A' : b.qualityGrade,
              quarantineReason: newStatus === 'quarantine' ? reason : undefined,
            }
          : b
      )
    );

    const movement: StockMovement = {
      id: `MOV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      batchId,
      commodity: target.commodity,
      commodityName: target.commodityName,
      movementType: newStatus === 'quarantine' ? 'QUARANTINE' : 'RELEASE',
      quantityDeltaMt: 0,
      bagsDelta: 0,
      referenceId: `STAT-CHG-${batchId}`,
      userRole: `${currentUser.name} (${currentUser.role})`,
      reason: reason || `Batch status changed to ${newStatus}`,
      godownId: selectedGodownId,
      sourceOrDestination: target.stackLocation,
    };

    setMovements((prev) => [movement, ...prev]);

    addAuditLog(
      newStatus === 'quarantine' ? 'BATCH_QUARANTINED' : 'BATCH_RELEASED',
      'InventoryBatch',
      batchId,
      `Status updated to ${newStatus}. Reason: ${reason || 'Regulatory inspection'}`,
      newStatus === 'quarantine' ? 'WARNING' : 'SUCCESS'
    );
  };

  // Update batch quality & moisture lab report (Quality Inspector)
  const updateBatchQuality = (batchId: string, qualityGrade: QualityGrade, moisturePercent: number, labReportNo: string) => {
    if (!hasPermission('CAN_INSPECT_QUALITY') && !hasPermission('CAN_MANAGE_USERS')) {
      alert('Permission Denied: Quality Inspector or Administrator role required to record lab inspections.');
      return;
    }

    setBatches((prev) =>
      prev.map((b) =>
        b.id === batchId
          ? {
              ...b,
              qualityGrade,
              moistureContentPercent: moisturePercent,
              labReportNo,
              status: qualityGrade === 'Quarantine' || qualityGrade === 'Damaged' ? 'quarantine' : 'active',
            }
          : b
      )
    );

    addAuditLog(
      'BATCH_QUALITY_INSPECTED',
      'InventoryBatch',
      batchId,
      `Graded as ${qualityGrade}, Moisture: ${moisturePercent}%. Lab Cert: ${labReportNo} by ${currentUser.name}`,
      qualityGrade === 'Quarantine' || qualityGrade === 'Damaged' ? 'WARNING' : 'SUCCESS'
    );
  };

  // Acknowledge delivery of challan (FPS Dealer)
  const acknowledgeChallan = (challanId: string, notes?: string) => {
    setChallans((prev) =>
      prev.map((c) =>
        c.id === challanId
          ? {
              ...c,
              status: 'Acknowledged_FPS',
            }
          : c
      )
    );

    const targetChallan = challans.find((c) => c.id === challanId);
    if (targetChallan) {
      // Deduct active quota remaining for the Fair Price Shop
      setFairPriceShops((prev) =>
        prev.map((fps) =>
          fps.id === targetChallan.fpsId
            ? {
                ...fps,
                activeQuotaRemainingMt: Math.max(0, Number((fps.activeQuotaRemainingMt - targetChallan.totalQuantityMt).toFixed(1))),
              }
            : fps
        )
      );
    }

    addAuditLog(
      'CHALLAN_DELIVERY_ACKNOWLEDGED',
      'DeliveryChallan',
      challanId,
      `Consignment verified and acknowledged by ${currentUser.name} (${currentUser.role}). Notes: ${notes || 'Digital seal verified.'}`,
      'SUCCESS'
    );
  };

  const approveFifoException = (exceptionId: string, approverName?: string) => {
    setFifoExceptions((prev) =>
      prev.map((e) =>
        e.id === exceptionId
          ? {
              ...e,
              status: 'APPROVED',
              approvedBy: approverName || currentUser.name,
              approvedRole: currentUser.role,
            }
          : e
      )
    );
    addAuditLog('FIFO_EXCEPTION_APPROVED', 'FifoException', exceptionId, `Approved by ${approverName || currentUser.name}`, 'SUCCESS');
  };

  const addGodown = (godown: GodownProfile) => {
    setGodownsList((prev) => [...prev, godown]);
    addAuditLog('GODOWN_REGISTERED', 'Godown', godown.id, `Created depot ${godown.name} (${godown.capacityMt} MT)`, 'SUCCESS');
  };

  const addCommodity = (commodity: CommodityEntity) => {
    setCommodities((prev) => [...prev, commodity]);
    addAuditLog('COMMODITY_CREATED', 'Commodity', commodity.id, `Registered commodity ${commodity.name}`, 'SUCCESS');
  };

  const addSupplier = (supplier: SupplierEntity) => {
    setSuppliers((prev) => [...prev, supplier]);
    addAuditLog('SUPPLIER_ONBOARDED', 'Supplier', supplier.id, `Onboarded ${supplier.name} (${supplier.state})`, 'SUCCESS');
  };

  const addFairPriceShop = (fps: FairPriceShop) => {
    setFairPriceShops((prev) => [...prev, fps]);
    addAuditLog('FPS_ENROLLED', 'FairPriceShop', fps.id, `Enrolled ration dealer ${fps.name}`, 'SUCCESS');
  };

  // Reset to initial prototype state
  const resetAllData = () => {
    setBatches(INITIAL_BATCHES);
    setChallans(INITIAL_DELIVERY_CHALLANS);
    setReceipts(INITIAL_RECEIPTS);
    setMovements(INITIAL_MOVEMENTS);
    setSelectedGodownId('fci_okhla');
    setAgeingConfig(DEFAULT_AGEING_CONFIG);
    setUsers(DEMO_USERS);
    setCurrentUserId('usr_admin_01');
    setSuppliers(INITIAL_SUPPLIERS);
    setCommodities(INITIAL_COMMODITY_ENTITIES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setFifoExceptions(INITIAL_FIFO_EXCEPTIONS);
    setGodownsList(Object.values(GODOWN_PROFILES));
    setFairPriceShops(FAIR_PRICE_SHOPS);

    if (typeof window !== 'undefined') {
      try {
        Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore
      }
    }
  };

  return (
    <StockFlowContext.Provider
      value={{
        batches,
        challans,
        receipts,
        movements,
        metrics,
        selectedGodownId,
        currentGodown,
        ageingConfig,
        allGodowns: DEMO_GODOWNS,
        godownsList,
        fairPriceShops,
        users,
        currentUser,
        currentRole,
        isAuthenticated,
        isAuthReady,
        login,
        logout,
        hasPermission,
        switchRole,
        switchUser,
        updateUserRole,
        addUser,
        suppliers,
        commodities,
        auditLogs,
        fifoExceptions,
        setSelectedGodownId,
        setAgeingConfig,
        addStockReceipt,
        createDispatch,
        updateBatchStatus,
        updateBatchQuality,
        acknowledgeChallan,
        addAuditLog,
        approveFifoException,
        addGodown,
        addCommodity,
        addSupplier,
        addFairPriceShop,
        resetAllData,
      }}
    >
      {children}
    </StockFlowContext.Provider>
  );
}

export function useStockFlow() {
  const context = useContext(StockFlowContext);
  if (!context) {
    throw new Error('useStockFlow must be used within a StockFlowProvider');
  }
  return context;
}
