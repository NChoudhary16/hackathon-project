'use client';

import React, { useState } from 'react';
import { AppShell } from '../../../components/AppShell';
import { DispatchDashboardView } from '../../../components/dashboards/DispatchDashboardView';
import { FifoDispatchModal } from '../../../components/FifoDispatchModal';
import { useStockFlow } from '../../../lib/stockflow-context';

export default function DispatchRoleDashboardPage() {
  const { batches, fairPriceShops, createDispatch } = useStockFlow();
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  return (
    <AppShell 
      pageTitle="Dispatch & Fleet Weighbridge Terminal" 
      pageBreadcrumb="Role Dashboards / Dispatch Officer"
      allowedRoles={['DISPATCH_OFFICER', 'ADMIN']}
    >
      <div className="space-y-6">
        <DispatchDashboardView 
          onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
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
      </div>
    </AppShell>
  );
}
