'use client';

import React, { useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { ManagerDashboardView } from '../../../components/dashboards/ManagerDashboardView';
import { InwardStockModal } from '../../../components/InwardStockModal';
import { FifoDispatchModal } from '../../../components/FifoDispatchModal';
import { useStockFlow } from '../../../lib/stockflow-context';

export default function ManagerRoleDashboardPage() {
  const { batches, fairPriceShops, addStockReceipt, createDispatch } = useStockFlow();
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  return (
    <AppShell
      pageTitle="Godown Superintendent Operations"
      pageBreadcrumb="Dashboard / Godown Manager"
      allowedRoles={['GODOWN_MANAGER', 'ADMIN']}
    >
      <ManagerDashboardView
        onOpenInwardModal={() => setIsInwardModalOpen(true)}
        onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
      />

      <InwardStockModal
        isOpen={isInwardModalOpen}
        onClose={() => setIsInwardModalOpen(false)}
        onAddBatch={(b) => {
          addStockReceipt({
            receiptNumber: `RCP-${Date.now().toString().slice(-4)}`,
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
            createdBy: 'Godown Superintendent',
          });
          setIsInwardModalOpen(false);
        }}
      />

      <FifoDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        batches={batches}
        fairPriceShops={fairPriceShops}
        onDispatchCreated={(challan) => {
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
          setIsDispatchModalOpen(false);
        }}
      />
    </AppShell>
  );
}
