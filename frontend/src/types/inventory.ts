export type CommodityType = 
  | 'wheat' 
  | 'rice_raw' 
  | 'rice_parboiled' 
  | 'sugar' 
  | 'iodized_salt' 
  | 'chana_dal' 
  | 'tuvar_dal' 
  | 'mustard_oil';

export type QualityGrade = 'Grade-A' | 'Grade-B' | 'Quarantine' | 'Damaged';

export type BatchStatus = 'active' | 'exhausted' | 'quarantine' | 'fumigation_lockout';

export interface Batch {
  id: string; // e.g. "B-WHT-2025-091"
  commodity: CommodityType;
  commodityName: string;
  variety: string; // e.g. "Sharbati / HD-2967"
  supplier: string; // e.g. "Food Corporation of India (FCI) - Punjab Depo"
  supplierState: string;
  receiptDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  initialQuantityMt: number; // Metric Tonnes
  currentQuantityMt: number; // Metric Tonnes
  bagCount: number; // 50kg standard jute bags
  bagSizeKg: number;
  stackLocation: string; // e.g. "Bay A-3, Stack 12"
  bayId: string; // e.g. "A3"
  moistureContentPercent: number; // e.g. 11.2%
  qualityGrade: QualityGrade;
  status: BatchStatus;
  labReportNo: string;
  fumigationDueDate: string;
  lastFumigationDate: string;
  quarantineReason?: string;
  ageDays: number;
  spoilageRiskScore: number; // 0 - 100
}

export interface FairPriceShop {
  id: string; // e.g. "FPS-DEL-0412"
  name: string;
  dealerName: string;
  district: string;
  taluka: string;
  beneficiaryCardsCount: number;
  contactNumber: string;
  activeQuotaRemainingMt: number;
}

export interface FifoAllocationItem {
  batchId: string;
  batchCode: string;
  stackLocation: string;
  receiptDate: string;
  ageDays: number;
  allocatedMt: number;
  allocatedBags: number;
  remainingInBatchMt: number;
  moisturePercent: number;
  qualityGrade: QualityGrade;
  isOldestAvailable: boolean;
  priorityRank: number; // 1 = oldest eligible
}

export interface FifoCalculationResult {
  commodity: CommodityType;
  requestedMt: number;
  allocatedMt: number;
  totalBags: number;
  isFullyFulfilled: boolean;
  allocations: FifoAllocationItem[];
  hasDeviation: boolean;
  deviationBatchCount: number;
  deviationReasons?: string[];
  oldestEligibleBypassed?: Batch[];
  allocationTimestamp: string;
  auditHash: string;
}

export interface DeliveryChallan {
  id: string; // e.g. "PDS/DC/2026/0842"
  dispatchDate: string;
  fpsId: string;
  fpsName: string;
  fpsDistrict: string;
  commodity: CommodityType;
  commodityName: string;
  totalQuantityMt: number;
  totalBags: number;
  vehicleNumber: string; // e.g. "DL 1M 4492"
  driverName: string;
  driverPhone: string;
  godownDepot: string;
  allocatedBatches: {
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
  status: 'Draft' | 'Allocated' | 'Loaded' | 'In-Transit' | 'Acknowledged_FPS';
  qrCodeSignature: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  gatePassNo: string;
}

export interface GodownMetrics {
  totalCapacityMt: number;
  currentStockMt: number;
  utilizationRatePercent: number;
  fifoComplianceRatePercent: number;
  criticalAgeingBatchesCount: number; // >180 days
  pendingDispatchesCount: number;
  activeBatchesCount: number;
  monthlyDispatchedMt: number;
}

export type MovementType = 
  | 'RECEIPT' 
  | 'DISPATCH' 
  | 'QUARANTINE' 
  | 'RELEASE' 
  | 'ADJUSTMENT' 
  | 'FIFO_EXCEPTION_DISPATCH';

export interface StockMovement {
  id: string; // e.g. "MOV-2026-1022-014"
  timestamp: string; // ISO date-time string
  batchId: string;
  commodity: CommodityType;
  commodityName: string;
  movementType: MovementType;
  quantityDeltaMt: number; // Positive for incoming/receipt, negative for dispatch
  bagsDelta: number;
  referenceId: string; // Receipt Ref or Challan ID
  userRole: string; // "R. K. Sharma (Godown Superintendent)"
  reason?: string;
  godownId: string;
  sourceOrDestination: string; // e.g. "FCI Ludhiana Hub" or "FPS-DL-LAJ-219"
}

export interface StockReceipt {
  id: string; // e.g. "RCP-2026-10-8821"
  receiptNumber: string; // e.g. "FCI/REC/2026/9821"
  supplier: string;
  supplierState: string;
  commodity: CommodityType;
  commodityName: string;
  variety: string;
  batchIdentifier: string; // linked batch ID
  receiptDate: string;
  expiryDate: string;
  receivedQuantityMt: number;
  bagCount: number;
  bagSizeKg: number;
  moisturePercent: number;
  qualityGrade: QualityGrade;
  godownId: string;
  stackLocation: string;
  bayId: string;
  labReportNo: string;
  createdBy: string;
  status: 'VERIFIED' | 'PENDING_LAB' | 'REJECTED';
}

export interface AgeingThresholdConfig {
  band1MaxDays: number; // e.g. 30
  band2MaxDays: number; // e.g. 60
  band3MaxDays: number; // e.g. 90
  criticalAlertDays: number; // e.g. 180
}

export interface GodownProfile {
  id: string;
  name: string;
  state: string;
  district: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  capacityMt: number;
  siloCount: number;
  operationalStatus: 'NORMAL' | 'MAINTENANCE' | 'ALERT';
}

export type Role = 
  | 'ADMIN' 
  | 'GODOWN_MANAGER' 
  | 'QUALITY_INSPECTOR' 
  | 'DISPATCH_OFFICER' 
  | 'FPS_DEALER';

export type Permission = 
  | 'CAN_ACCESS_MASTER_DASHBOARD'
  | 'CAN_MANAGE_USERS'
  | 'CAN_MANAGE_GODOWNS'
  | 'CAN_MANAGE_COMMODITIES'
  | 'CAN_MANAGE_SUPPLIERS'
  | 'CAN_MANAGE_FPS'
  | 'CAN_CREATE_RECEIPT'
  | 'CAN_INSPECT_QUALITY'
  | 'CAN_DISPATCH_STOCK'
  | 'CAN_OVERRIDE_FIFO'
  | 'CAN_VIEW_AUDIT_LOGS'
  | 'CAN_VIEW_ALL_GODOWNS'
  | 'CAN_ACKNOWLEDGE_DELIVERY'
  | 'CAN_VIEW_FPS_QUOTA';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  designation: string;
  department: string;
  godownId?: string;
  godownName?: string;
  phone?: string;
  fpsId?: string;
  active: boolean;
  avatarLetter: string;
  avatarColor: string;
}

export interface SupplierEntity {
  id: string;
  code: string;
  name: string;
  state: string;
  contactPerson: string;
  phone: string;
  email: string;
  category: 'FCI' | 'STATE_CORP' | 'COOPERATIVE' | 'MILLER';
  totalSuppliedMt: number;
  reliabilityScore: number;
  qualityPassRate: number;
}

export interface CommodityEntity {
  id: string;
  code: string;
  name: string;
  category: string;
  standardBagWeightKg: number;
  defaultShelfLifeDays: number;
  maxSafeMoisturePercent: number;
  unit: string;
  currentInStockMt: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  performedBy: string;
  userRole: string;
  timestamp: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'EXCEPTION';
}

export interface FifoExceptionEntry {
  id: string;
  challanId: string;
  challanNumber: string;
  requestedBatchId: string;
  bypassedBatchId: string;
  bypassedBatchAgeDays: number;
  reason: string;
  approvedBy: string;
  approvedRole: string;
  timestamp: string;
  status: 'APPROVED' | 'PENDING_DFC_REVIEW' | 'FLAGGED';
}
