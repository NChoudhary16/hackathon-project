import { PrismaClient, Role, QualityGrade, BatchStatus, MovementType } from '@prisma/client';
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

  // 2. Seed Godowns
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
  ]);

  const defaultGodown = godowns[0];

  // 3. Seed Users
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
  ]);

  const wheat = commodities[0];
  const rice = commodities[1];

  // 5. Seed Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        code: 'FCI-PUNJAB',
        name: 'Food Corporation of India (FCI) - Punjab Depo',
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
  ]);

  // 7. Seed Initial Stock Receipts, Inventory Batches & Movements
  // Batch 1: Oldest Wheat Batch (90 days old - FIFO priority 1)
  const r1Date = new Date();
  r1Date.setDate(r1Date.getDate() - 90);
  const r1Expiry = new Date(r1Date);
  r1Expiry.setFullYear(r1Expiry.getFullYear() + 1);

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
      quantityKg: 50000, // 50 MT
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
      remainingQuantityKg: 42000, // 8000 kg issued previously
      bagCount: 840,
      bagWeightKg: 50,
      stackLocation: 'Bay A-1, Stack S-02',
      bayId: 'A1',
      moisturePercent: 11.2,
      qualityGrade: QualityGrade.GRADE_A,
      status: BatchStatus.ACTIVE,
      receiptDate: r1Date,
      expiryDate: r1Expiry,
      fumigationDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastFumigationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
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

  // Batch 2: Intermediate Wheat Batch (45 days old - FIFO priority 2)
  const r2Date = new Date();
  r2Date.setDate(r2Date.getDate() - 45);
  const r2Expiry = new Date(r2Date);
  r2Expiry.setFullYear(r2Expiry.getFullYear() + 1);

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
      quantityKg: 60000, // 60 MT
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
      fumigationDueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      lastFumigationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
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

  // Batch 3: Fresh Wheat Batch (7 days old - FIFO priority 3)
  const r3Date = new Date();
  r3Date.setDate(r3Date.getDate() - 7);
  const r3Expiry = new Date(r3Date);
  r3Expiry.setFullYear(r3Expiry.getFullYear() + 1);

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
      quantityKg: 100000, // 100 MT
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
      fumigationDueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
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

  // Batch 4: Rice Batch under Quarantine (Moisture exceeded threshold - NOT eligible for FIFO dispatch)
  const r4Date = new Date();
  r4Date.setDate(r4Date.getDate() - 14);
  const r4Expiry = new Date(r4Date);
  r4Expiry.setMonth(r4Expiry.getMonth() + 18);

  const receipt4 = await prisma.stockReceipt.create({
    data: {
      receiptNumber: 'NAFED/REC/2026/0155',
      godownId: defaultGodown.id,
      supplierId: suppliers[2].id,
      commodityId: rice.id,
      variety: 'Swarna Raw Non-Basmati',
      receiptDate: r4Date,
      expiryDate: r4Expiry,
      vehicleNumber: 'HR-26-CC-8100',
      labReportNo: 'AGMARK-QAR-0041',
      moisturePercent: 15.6, // High moisture > 14%
      stackLocation: 'Bay C-1, Stack Q-01',
      bayId: 'C1',
      quantityKg: 30000, // 30 MT
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
      commodityId: rice.id,
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

  // 8. Seed an initial Delivery Challan to show FIFO history
  const challanDate = new Date();
  challanDate.setDate(challanDate.getDate() - 3);

  const challan = await prisma.deliveryChallan.create({
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
      status: 'DELIVERED',
      dispatchDate: challanDate,
      createdById: dispatchOfficer.id,
      remarks: 'Monthly PDS quota dispatch to Model Town FPS.',
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
      referenceId: challan.id,
      reason: 'FIFO Dispatch for FPS Quota',
      performedById: dispatchOfficer.id,
      createdAt: challanDate,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_SEED',
      entity: 'DATABASE',
      entityId: 'ROOT',
      payloadJson: JSON.stringify({ seededAt: new Date().toISOString() }),
      performedById: admin.id,
    },
  });

  console.log('✅ StockFlow database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
