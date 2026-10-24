import { PrismaClient, Role, QualityGrade, BatchStatus, MovementType, ChallanStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting StockFlow database seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.fifoException.deleteMany();
  await prisma.challanAllocation.deleteMany();
  await prisma.deliveryChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.stockReceipt.deleteMany();
  await prisma.user.deleteMany();
  await prisma.fairPriceShop.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.commodity.deleteMany();
  await prisma.godown.deleteMany();

  // 2. Seed Godowns (5 Major State Depots)
  const godowns = await Promise.all([
    prisma.godown.create({
      data: {
        code: 'GDN-LDH-01',
        name: 'Central Depot Ludhiana Hub',
        district: 'Ludhiana',
        state: 'Punjab',
        capacityMt: 50000,
        active: true,
      },
    }),
    prisma.godown.create({
      data: {
        code: 'GDN-ASR-02',
        name: 'Amritsar Border Buffer Depot',
        district: 'Amritsar',
        state: 'Punjab',
        capacityMt: 35000,
        active: true,
      },
    }),
    prisma.godown.create({
      data: {
        code: 'GDN-JAL-03',
        name: 'Jalandhar PDS Distribution Center',
        district: 'Jalandhar',
        state: 'Punjab',
        capacityMt: 40000,
        active: true,
      },
    }),
    prisma.godown.create({
      data: {
        code: 'GDN-BTI-04',
        name: 'Bathinda Strategic Grain Silos',
        district: 'Bathinda',
        state: 'Punjab',
        capacityMt: 65000,
        active: true,
      },
    }),
    prisma.godown.create({
      data: {
        code: 'GDN-PTL-05',
        name: 'Patiala Buffer Storage Facility',
        district: 'Patiala',
        state: 'Punjab',
        capacityMt: 30000,
        active: true,
      },
    }),
  ]);

  const defaultGodown = godowns[0];

  // 3. Seed Users with RBAC roles (Password: Password@123)
  const passwordHash = await bcrypt.hash('Password@123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@stockflow.gov.in',
      passwordHash,
      name: 'Rajesh Kumar Sharma (Director PDS)',
      role: Role.ADMIN,
      godownId: defaultGodown.id,
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@stockflow.gov.in',
      passwordHash,
      name: 'S. K. Verma (Godown In-Charge)',
      role: Role.GODOWN_MANAGER,
      godownId: defaultGodown.id,
    },
  });

  const inspector = await prisma.user.create({
    data: {
      email: 'inspector@stockflow.gov.in',
      passwordHash,
      name: 'Anjali Gupta (Quality & Lab Inspector)',
      role: Role.QUALITY_INSPECTOR,
      godownId: defaultGodown.id,
    },
  });

  const dispatchOfficer = await prisma.user.create({
    data: {
      email: 'dispatch@stockflow.gov.in',
      passwordHash,
      name: 'Harpreet Singh (Dispatch Supervisor)',
      role: Role.DISPATCH_OFFICER,
      godownId: defaultGodown.id,
    },
  });

  // 4. Seed Commodities
  const commodities = await Promise.all([
    prisma.commodity.create({
      data: {
        code: 'WHEAT',
        name: 'Wheat (HD-3086 Certified)',
        category: 'Food Grains',
        standardBagWeightKg: 50,
        defaultShelfLifeDays: 365,
      },
    }),
    prisma.commodity.create({
      data: {
        code: 'RICE_RAW',
        name: 'Rice (Swarna Common Non-Basmati)',
        category: 'Food Grains',
        standardBagWeightKg: 50,
        defaultShelfLifeDays: 540,
      },
    }),
    prisma.commodity.create({
      data: {
        code: 'RICE_PARBOILED',
        name: 'Rice (Parboiled Grade-A)',
        category: 'Food Grains',
        standardBagWeightKg: 50,
        defaultShelfLifeDays: 730,
      },
    }),
    prisma.commodity.create({
      data: {
        code: 'SUGAR',
        name: 'Refined Sugar (M-30 Grade)',
        category: 'Essential Commodities',
        standardBagWeightKg: 50,
        defaultShelfLifeDays: 730,
      },
    }),
    prisma.commodity.create({
      data: {
        code: 'CHANA_DAL',
        name: 'Chana Dal (Whole Desi Pulses)',
        category: 'Pulses',
        standardBagWeightKg: 50,
        defaultShelfLifeDays: 180,
      },
    }),
    prisma.commodity.create({
      data: {
        code: 'FRK',
        name: 'Fortified Rice Kernels (FRK)',
        category: 'Fortified Nutrition',
        standardBagWeightKg: 25,
        defaultShelfLifeDays: 365,
      },
    }),
  ]);

  const wheat = commodities[0];
  const riceRaw = commodities[1];
  const sugar = commodities[3];
  const chanaDal = commodities[4];

  // 5. Seed Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        code: 'FCI-PUNJAB',
        name: 'Food Corporation of India (FCI) - Punjab Depot',
        state: 'Punjab',
        contactPerson: 'Gurtej Singh',
        phone: '+91-161-2401890',
        email: 'depot.ludhiana@fci.gov.in',
      },
    }),
    prisma.supplier.create({
      data: {
        code: 'PUNSUP-CENTRAL',
        name: 'Punjab State Civil Supplies Corp (PUNSUP)',
        state: 'Punjab',
        contactPerson: 'Mandeep Kaur',
        phone: '+91-161-2490123',
        email: 'procurement@punsup.gov.in',
      },
    }),
    prisma.supplier.create({
      data: {
        code: 'NAFED-NORTH',
        name: 'NAFED Regional Procurement Center',
        state: 'Haryana',
        contactPerson: 'Virender Yadav',
        phone: '+91-124-4091823',
        email: 'north.grains@nafed.gov.in',
      },
    }),
    prisma.supplier.create({
      data: {
        code: 'MARKFED-STATE',
        name: 'Punjab Markfed Co-operative Federation',
        state: 'Punjab',
        contactPerson: 'Balwinder Sandhu',
        phone: '+91-161-2550182',
        email: 'supplies@markfedpunjab.com',
      },
    }),
  ]);

  // 6. Seed Fair Price Shops (FPS)
  const fpsList = await Promise.all([
    prisma.fairPriceShop.create({
      data: {
        code: 'FPS-LDH-0412',
        name: 'Model Town Ration Depot #412',
        dealerName: 'Rameshwar Dayal',
        district: 'Ludhiana',
        taluka: 'Ludhiana West',
        beneficiaryCardsCount: 1420,
        contactPhone: '+91-98721-04123',
        activeQuotaRemainingKg: 15000,
      },
    }),
    prisma.fairPriceShop.create({
      data: {
        code: 'FPS-LDH-0885',
        name: 'Samrala Road Community PDS Store',
        dealerName: 'Manjit Singh',
        district: 'Ludhiana',
        taluka: 'Samrala',
        beneficiaryCardsCount: 980,
        contactPhone: '+91-98721-08854',
        activeQuotaRemainingKg: 12500,
      },
    }),
    prisma.fairPriceShop.create({
      data: {
        code: 'FPS-ASR-0219',
        name: 'Civil Lines Distribution Center',
        dealerName: 'Gurpreet Singh Randhawa',
        district: 'Amritsar',
        taluka: 'Amritsar North',
        beneficiaryCardsCount: 1850,
        contactPhone: '+91-98140-02198',
        activeQuotaRemainingKg: 20000,
      },
    }),
    prisma.fairPriceShop.create({
      data: {
        code: 'FPS-LDH-0108',
        name: 'Gill Road Fair Price Shop #108',
        dealerName: 'Jaswinder Kaur',
        district: 'Ludhiana',
        taluka: 'Ludhiana South',
        beneficiaryCardsCount: 1150,
        contactPhone: '+91-98150-10822',
        activeQuotaRemainingKg: 14000,
      },
    }),
    prisma.fairPriceShop.create({
      data: {
        code: 'FPS-LDH-0554',
        name: 'Miller Ganj Ration Center #554',
        dealerName: 'Satish Chander',
        district: 'Ludhiana',
        taluka: 'Ludhiana East',
        beneficiaryCardsCount: 890,
        contactPhone: '+91-98150-55410',
        activeQuotaRemainingKg: 10000,
      },
    }),
  ]);

  // 7. Seed Initial Stock Receipts & Batches across Multiple Commodities & Age Profiles

  // Helper date function
  const daysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };
  const addDays = (from: Date, days: number) => {
    const d = new Date(from);
    d.setDate(d.getDate() + days);
    return d;
  };

  // --- Batch 1: Oldest Wheat Batch (90 days old - FIFO priority 1) ---
  const r1Date = daysAgo(90);
  const r1Expiry = addDays(r1Date, 365);
  const receipt1 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'FCI/REC/2026/0112',
      godownId: defaultGodown.id,
      supplierId: suppliers[0].id,
      commodityId: wheat.id,
      variety: 'HD-3086 Certified Rake',
      receiptDate: r1Date,
      expiryDate: r1Expiry,
      vehicleNumber: 'PB-10-DF-4402',
      labReportNo: 'AGMARK-LDH-9011',
      moisturePercent: 11.2,
      stackLocation: 'Bay A-1, Stack S-02',
      bayId: 'A1',
      quantityKg: 50000,
      bagCount: 1000,
      qualityGrade: QualityGrade.GRADE_A,
      createdById: manager.id,
      remarks: 'Consignment received by rail rake at Ludhiana Goods Shed.',
    },
  });

  const batch1 = await prisma.inventoryBatch.create({
    data: {
      batchNumber: 'B-WHT-2026-001',
      godownId: defaultGodown.id,
      receiptId: receipt1.id,
      commodityId: wheat.id,
      variety: 'HD-3086 Certified Rake',
      initialQuantityKg: 50000,
      remainingQuantityKg: 42000, // 8000 kg issued via challan
      bagCount: 840,
      bagWeightKg: 50,
      stackLocation: 'Bay A-1, Stack S-02',
      bayId: 'A1',
      moisturePercent: 11.2,
      qualityGrade: QualityGrade.GRADE_A,
      status: BatchStatus.ACTIVE,
      receiptDate: r1Date,
      expiryDate: r1Expiry,
      fumigationDueDate: addDays(new Date(), 30),
      lastFumigationDate: daysAgo(60),
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch1.id,
      godownId: defaultGodown.id,
      movementType: MovementType.RECEIPT,
      quantityKg: 50000,
      balanceAfterKg: 50000,
      referenceType: 'STOCK_RECEIPT',
      referenceId: receipt1.id,
      reason: 'Initial Inward Consignment',
      performedById: manager.id,
      createdAt: r1Date,
    },
  });

  // --- Batch 2: Intermediate Wheat Batch (45 days old - FIFO priority 2) ---
  const r2Date = daysAgo(45);
  const r2Expiry = addDays(r2Date, 365);
  const receipt2 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'PUNSUP/REC/2026/0248',
      godownId: defaultGodown.id,
      supplierId: suppliers[1].id,
      commodityId: wheat.id,
      variety: 'PBW-725 Certified Foodgrain',
      receiptDate: r2Date,
      expiryDate: r2Expiry,
      vehicleNumber: 'PB-10-ER-9182',
      labReportNo: 'AGMARK-LDH-9442',
      moisturePercent: 11.8,
      stackLocation: 'Bay A-2, Stack S-05',
      bayId: 'A2',
      quantityKg: 60000,
      bagCount: 1200,
      qualityGrade: QualityGrade.GRADE_A,
      createdById: manager.id,
      remarks: 'Procured via Mandi procurement drive.',
    },
  });

  const batch2 = await prisma.inventoryBatch.create({
    data: {
      batchNumber: 'B-WHT-2026-002',
      godownId: defaultGodown.id,
      receiptId: receipt2.id,
      commodityId: wheat.id,
      variety: 'PBW-725 Certified Foodgrain',
      initialQuantityKg: 60000,
      remainingQuantityKg: 60000,
      bagCount: 1200,
      bagWeightKg: 50,
      stackLocation: 'Bay A-2, Stack S-05',
      bayId: 'A2',
      moisturePercent: 11.8,
      qualityGrade: QualityGrade.GRADE_A,
      status: BatchStatus.ACTIVE,
      receiptDate: r2Date,
      expiryDate: r2Expiry,
      fumigationDueDate: addDays(new Date(), 45),
      lastFumigationDate: daysAgo(15),
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch2.id,
      godownId: defaultGodown.id,
      movementType: MovementType.RECEIPT,
      quantityKg: 60000,
      balanceAfterKg: 60000,
      referenceType: 'STOCK_RECEIPT',
      referenceId: receipt2.id,
      reason: 'Inward Consignment from PUNSUP Mandi',
      performedById: manager.id,
      createdAt: r2Date,
    },
  });

  // --- Batch 3: Fresh Wheat Batch (7 days old - FIFO priority 3) ---
  const r3Date = daysAgo(7);
  const r3Expiry = addDays(r3Date, 365);
  const receipt3 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'FCI/REC/2026/0401',
      godownId: defaultGodown.id,
      supplierId: suppliers[0].id,
      commodityId: wheat.id,
      variety: 'HD-3086 Special Reserve',
      receiptDate: r3Date,
      expiryDate: r3Expiry,
      vehicleNumber: 'PB-10-GA-3321',
      labReportNo: 'AGMARK-LDH-9812',
      moisturePercent: 12.0,
      stackLocation: 'Bay A-3, Stack S-09',
      bayId: 'A3',
      quantityKg: 100000,
      bagCount: 2000,
      qualityGrade: QualityGrade.GRADE_A,
      createdById: manager.id,
      remarks: 'FCI Special Buffer Allocation.',
    },
  });

  const batch3 = await prisma.inventoryBatch.create({
    data: {
      batchNumber: 'B-WHT-2026-003',
      godownId: defaultGodown.id,
      receiptId: receipt3.id,
      commodityId: wheat.id,
      variety: 'HD-3086 Special Reserve',
      initialQuantityKg: 100000,
      remainingQuantityKg: 100000,
      bagCount: 2000,
      bagWeightKg: 50,
      stackLocation: 'Bay A-3, Stack S-09',
      bayId: 'A3',
      moisturePercent: 12.0,
      qualityGrade: QualityGrade.GRADE_A,
      status: BatchStatus.ACTIVE,
      receiptDate: r3Date,
      expiryDate: r3Expiry,
      fumigationDueDate: addDays(new Date(), 60),
      lastFumigationDate: r3Date,
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch3.id,
      godownId: defaultGodown.id,
      movementType: MovementType.RECEIPT,
      quantityKg: 100000,
      balanceAfterKg: 100000,
      referenceType: 'STOCK_RECEIPT',
      referenceId: receipt3.id,
      reason: 'Buffer Stock Receipt',
      performedById: manager.id,
      createdAt: r3Date,
    },
  });

  // --- Batch 4: Rice Batch under Quarantine (Moisture exceeded threshold) ---
  const r4Date = daysAgo(14);
  const r4Expiry = addDays(r4Date, 540);
  const receipt4 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'NAFED/REC/2026/0155',
      godownId: defaultGodown.id,
      supplierId: suppliers[2].id,
      commodityId: riceRaw.id,
      variety: 'Swarna Raw Non-Basmati',
      receiptDate: r4Date,
      expiryDate: r4Expiry,
      vehicleNumber: 'HR-26-CC-8100',
      labReportNo: 'AGMARK-QAR-0041',
      moisturePercent: 15.6,
      stackLocation: 'Bay C-1, Stack Q-01',
      bayId: 'C1',
      quantityKg: 30000,
      bagCount: 600,
      qualityGrade: QualityGrade.QUARANTINE,
      createdById: inspector.id,
      remarks: 'Moisture content 15.6% exceeds 14.0% statutory threshold. Marked for drying.',
    },
  });

  const batch4 = await prisma.inventoryBatch.create({
    data: {
      batchNumber: 'B-RCE-2026-004',
      godownId: defaultGodown.id,
      receiptId: receipt4.id,
      commodityId: riceRaw.id,
      variety: 'Swarna Raw Non-Basmati',
      initialQuantityKg: 30000,
      remainingQuantityKg: 30000,
      bagCount: 600,
      bagWeightKg: 50,
      stackLocation: 'Bay C-1, Stack Q-01',
      bayId: 'C1',
      moisturePercent: 15.6,
      qualityGrade: QualityGrade.QUARANTINE,
      status: BatchStatus.QUARANTINE,
      quarantineReason: 'Moisture content 15.6% exceeds PDS limit (14.0%). Mechanical aeration pending.',
      receiptDate: r4Date,
      expiryDate: r4Expiry,
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch4.id,
      godownId: defaultGodown.id,
      movementType: MovementType.RECEIPT,
      quantityKg: 30000,
      balanceAfterKg: 30000,
      referenceType: 'STOCK_RECEIPT',
      referenceId: receipt4.id,
      reason: 'Quarantine Consignment Inward',
      performedById: inspector.id,
      createdAt: r4Date,
    },
  });

  // --- Batch 5: Critical Ageing Wheat (185 days old - Alert Status & Top Priority) ---
  const r5Date = daysAgo(185);
  const r5Expiry = addDays(r5Date, 365);
  const receipt5 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'MARKFED/REC/2025/0890',
      godownId: defaultGodown.id,
      supplierId: suppliers[3].id,
      commodityId: wheat.id,
      variety: 'PBW-550 Rabi Harvest',
      receiptDate: r5Date,
      expiryDate: r5Expiry,
      vehicleNumber: 'PB-08-BW-1120',
      labReportNo: 'AGMARK-LDH-7789',
      moisturePercent: 12.4,
      stackLocation: 'Bay A-4, Stack S-12',
      bayId: 'A4',
      quantityKg: 35000,
      bagCount: 700,
      qualityGrade: QualityGrade.GRADE_B,
      createdById: manager.id,
      remarks: 'Aged grain from previous seasonal buffer. Requires immediate dispatch priority.',
    },
  });

  const batch5 = await prisma.inventoryBatch.create({
    data: {
      batchNumber: 'B-WHT-2025-089',
      godownId: defaultGodown.id,
      receiptId: receipt5.id,
      commodityId: wheat.id,
      variety: 'PBW-550 Rabi Harvest',
      initialQuantityKg: 35000,
      remainingQuantityKg: 35000,
      bagCount: 700,
      bagWeightKg: 50,
      stackLocation: 'Bay A-4, Stack S-12',
      bayId: 'A4',
      moisturePercent: 12.4,
      qualityGrade: QualityGrade.GRADE_B,
      status: BatchStatus.ACTIVE,
      receiptDate: r5Date,
      expiryDate: r5Expiry,
      fumigationDueDate: addDays(new Date(), 10),
      lastFumigationDate: daysAgo(40),
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch5.id,
      godownId: defaultGodown.id,
      movementType: MovementType.RECEIPT,
      quantityKg: 35000,
      balanceAfterKg: 35000,
      referenceType: 'STOCK_RECEIPT',
      referenceId: receipt5.id,
      reason: 'Aged Stock Buffer Inward',
      performedById: manager.id,
      createdAt: r5Date,
    },
  });

  // --- Batch 6: Fresh Rice Grade A (20 days old) ---
  const r6Date = daysAgo(20);
  const r6Expiry = addDays(r6Date, 540);
  const receipt6 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'FCI/REC/2026/0512',
      godownId: defaultGodown.id,
      supplierId: suppliers[0].id,
      commodityId: riceRaw.id,
      variety: 'Swarna Premium Common',
      receiptDate: r6Date,
      expiryDate: r6Expiry,
      vehicleNumber: 'PB-10-HA-7788',
      labReportNo: 'AGMARK-LDH-9921',
      moisturePercent: 12.1,
      stackLocation: 'Bay B-1, Stack S-01',
      bayId: 'B1',
      quantityKg: 80000,
      bagCount: 1600,
      qualityGrade: QualityGrade.GRADE_A,
      createdById: manager.id,
      remarks: 'Kharif crop arrival in excellent condition.',
    },
  });

  const batch6 = await prisma.inventoryBatch.create({
    data: {
      batchNumber: 'B-RCE-2026-006',
      godownId: defaultGodown.id,
      receiptId: receipt6.id,
      commodityId: riceRaw.id,
      variety: 'Swarna Premium Common',
      initialQuantityKg: 80000,
      remainingQuantityKg: 80000,
      bagCount: 1600,
      bagWeightKg: 50,
      stackLocation: 'Bay B-1, Stack S-01',
      bayId: 'B1',
      moisturePercent: 12.1,
      qualityGrade: QualityGrade.GRADE_A,
      status: BatchStatus.ACTIVE,
      receiptDate: r6Date,
      expiryDate: r6Expiry,
      fumigationDueDate: addDays(new Date(), 70),
      lastFumigationDate: r6Date,
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch6.id,
      godownId: defaultGodown.id,
      movementType: MovementType.RECEIPT,
      quantityKg: 80000,
      balanceAfterKg: 80000,
      referenceType: 'STOCK_RECEIPT',
      referenceId: receipt6.id,
      reason: 'Fresh Kharif Rice Arrival',
      performedById: manager.id,
      createdAt: r6Date,
    },
  });

  // --- Batch 7: Refined Sugar (35 days old) ---
  const r7Date = daysAgo(35);
  const r7Expiry = addDays(r7Date, 730);
  const receipt7 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'PUNSUP/REC/2026/0330',
      godownId: defaultGodown.id,
      supplierId: suppliers[1].id,
      commodityId: sugar.id,
      variety: 'M-30 Crystal Refined',
      receiptDate: r7Date,
      expiryDate: r7Expiry,
      vehicleNumber: 'PB-10-CX-2211',
      labReportNo: 'AGMARK-SGR-1102',
      moisturePercent: 0.8,
      stackLocation: 'Bay D-1, Stack S-01',
      bayId: 'D1',
      quantityKg: 25000,
      bagCount: 500,
      qualityGrade: QualityGrade.GRADE_A,
      createdById: manager.id,
      remarks: 'Sugar mill procurement for festival distribution.',
    },
  });

  const batch7 = await prisma.inventoryBatch.create({
    data: {
      batchNumber: 'B-SGR-2026-007',
      godownId: defaultGodown.id,
      receiptId: receipt7.id,
      commodityId: sugar.id,
      variety: 'M-30 Crystal Refined',
      initialQuantityKg: 25000,
      remainingQuantityKg: 20000, // 5000 kg dispatched
      bagCount: 400,
      bagWeightKg: 50,
      stackLocation: 'Bay D-1, Stack S-01',
      bayId: 'D1',
      moisturePercent: 0.8,
      qualityGrade: QualityGrade.GRADE_A,
      status: BatchStatus.ACTIVE,
      receiptDate: r7Date,
      expiryDate: r7Expiry,
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch7.id,
      godownId: defaultGodown.id,
      movementType: MovementType.RECEIPT,
      quantityKg: 25000,
      balanceAfterKg: 25000,
      referenceType: 'STOCK_RECEIPT',
      referenceId: receipt7.id,
      reason: 'Sugar Inward Receipt',
      performedById: manager.id,
      createdAt: r7Date,
    },
  });

  // --- Batch 8: Chana Dal in Fumigation Lockout ---
  const r8Date = daysAgo(60);
  const r8Expiry = addDays(r8Date, 180);
  const receipt8 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'NAFED/REC/2026/0202',
      godownId: defaultGodown.id,
      supplierId: suppliers[2].id,
      commodityId: chanaDal.id,
      variety: 'Desi Whole Pulses',
      receiptDate: r8Date,
      expiryDate: r8Expiry,
      vehicleNumber: 'HR-26-DF-9912',
      labReportNo: 'AGMARK-DAL-4421',
      moisturePercent: 9.8,
      stackLocation: 'Bay D-2, Stack S-03',
      bayId: 'D2',
      quantityKg: 20000,
      bagCount: 400,
      qualityGrade: QualityGrade.GRADE_A,
      createdById: inspector.id,
      remarks: 'Undergoing 7-day aluminium phosphide fumigation. Lockout active.',
    },
  });

  const batch8 = await prisma.inventoryBatch.create({
    data: {
      batchNumber: 'B-DAL-2026-008',
      godownId: defaultGodown.id,
      receiptId: receipt8.id,
      commodityId: chanaDal.id,
      variety: 'Desi Whole Pulses',
      initialQuantityKg: 20000,
      remainingQuantityKg: 20000,
      bagCount: 400,
      bagWeightKg: 50,
      stackLocation: 'Bay D-2, Stack S-03',
      bayId: 'D2',
      moisturePercent: 9.8,
      qualityGrade: QualityGrade.GRADE_A,
      status: BatchStatus.FUMIGATION_LOCKOUT,
      receiptDate: r8Date,
      expiryDate: r8Expiry,
      fumigationDueDate: addDays(new Date(), 90),
      lastFumigationDate: daysAgo(2),
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch8.id,
      godownId: defaultGodown.id,
      movementType: MovementType.RECEIPT,
      quantityKg: 20000,
      balanceAfterKg: 20000,
      referenceType: 'STOCK_RECEIPT',
      referenceId: receipt8.id,
      reason: 'Chana Dal Consignment Inward',
      performedById: inspector.id,
      createdAt: r8Date,
    },
  });

  // 8. Seed Delivery Challans & Dispatch Movements
  // Challan 1: Model Town FPS (Wheat - 8,000 kg)
  const challanDate1 = daysAgo(3);
  const challan1 = await prisma.deliveryChallan.create({
    data: {
      challanNumber: 'PDS/DC/2026/0014',
      godownId: defaultGodown.id,
      fpsId: fpsList[0].id,
      commodityId: wheat.id,
      totalQuantityKg: 8000,
      totalBags: 160,
      vehicleNumber: 'PB-10-TR-5544',
      driverName: 'Surinder Singh',
      driverPhone: '+91-98721-11223',
      status: ChallanStatus.DELIVERED,
      dispatchDate: challanDate1,
      createdById: dispatchOfficer.id,
      remarks: 'Monthly PDS quota dispatch to Model Town FPS. Strict FIFO applied.',
      allocations: {
        create: [
          {
            batchId: batch1.id,
            quantityKg: 8000,
            bagCount: 160,
            priorityRank: 1,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch1.id,
      godownId: defaultGodown.id,
      movementType: MovementType.DISPATCH,
      quantityKg: -8000,
      balanceAfterKg: 42000,
      referenceType: 'DELIVERY_CHALLAN',
      referenceId: challan1.id,
      reason: 'FIFO Dispatch for Model Town Quota',
      performedById: dispatchOfficer.id,
      createdAt: challanDate1,
    },
  });

  // Challan 2: Samrala Road FPS (Sugar - 5,000 kg)
  const challanDate2 = daysAgo(1);
  const challan2 = await prisma.deliveryChallan.create({
    data: {
      challanNumber: 'PDS/DC/2026/0015',
      godownId: defaultGodown.id,
      fpsId: fpsList[1].id,
      commodityId: sugar.id,
      totalQuantityKg: 5000,
      totalBags: 100,
      vehicleNumber: 'PB-10-ZX-9081',
      driverName: 'Gurmeet Singh',
      driverPhone: '+91-98721-33445',
      status: ChallanStatus.DISPATCHED,
      dispatchDate: challanDate2,
      createdById: dispatchOfficer.id,
      remarks: 'Festival Sugar quota dispatch to Samrala Road PDS.',
      allocations: {
        create: [
          {
            batchId: batch7.id,
            quantityKg: 5000,
            bagCount: 100,
            priorityRank: 1,
          },
        ],
      },
    },
  });

  await prisma.stockMovement.create({
    data: {
      batchId: batch7.id,
      godownId: defaultGodown.id,
      movementType: MovementType.DISPATCH,
      quantityKg: -5000,
      balanceAfterKg: 20000,
      referenceType: 'DELIVERY_CHALLAN',
      referenceId: challan2.id,
      reason: 'Festival Sugar Quota Dispatch',
      performedById: dispatchOfficer.id,
      createdAt: challanDate2,
    },
  });

  // 9. Seed a FIFO Exception Audit Record (Managerial Override example)
  await prisma.fifoException.create({
    data: {
      challanId: challan1.id,
      requestedBatchId: batch1.id,
      bypassedBatchId: batch5.id,
      reason: 'Stack S-12 temporary crane maintenance underway; cleared oldest stack S-02 instead under Manager authorization.',
      approvedById: manager.id,
      createdAt: challanDate1,
    },
  });

  // 10. Audit Log Entries
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'SYSTEM_SEED',
        entity: 'DATABASE',
        entityId: 'ROOT',
        payloadJson: JSON.stringify({
          seededAt: new Date().toISOString(),
          godownsCount: godowns.length,
          commoditiesCount: commodities.length,
          fpsCount: fpsList.length,
        }),
        performedById: admin.id,
      },
      {
        action: 'DISPATCH_VERIFIED',
        entity: 'DELIVERY_CHALLAN',
        entityId: challan1.id,
        payloadJson: JSON.stringify({
          challanNumber: challan1.challanNumber,
          verifiedQuantityKg: 8000,
          verifiedBags: 160,
        }),
        performedById: dispatchOfficer.id,
      },
    ],
  });

  console.log('✅ StockFlow comprehensive mock database seeding completed successfully!');
  console.log(`📦 Seeded ${godowns.length} Godowns, ${commodities.length} Commodities, ${fpsList.length} FPS, 8 Inventory Batches.`);
  console.log(`👥 Demo credentials:`);
  console.log(`   - Admin: admin@stockflow.gov.in / Password@123`);
  console.log(`   - Manager: manager@stockflow.gov.in / Password@123`);
  console.log(`   - Inspector: inspector@stockflow.gov.in / Password@123`);
  console.log(`   - Dispatch: dispatch@stockflow.gov.in / Password@123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
