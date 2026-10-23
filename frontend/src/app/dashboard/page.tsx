'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '../../components/AppShell';
import { useStockFlow } from '../../lib/stockflow-context';
import { Role } from '../../types/inventory';
import { RoleDashboardSelector, ROLE_DASHBOARDS_CONFIG } from '../../components/dashboards/RoleDashboardSelector';
import { AdminDashboardView } from '../../components/dashboards/AdminDashboardView';
import { ManagerDashboardView } from '../../components/dashboards/ManagerDashboardView';
import { QualityDashboardView } from '../../components/dashboards/QualityDashboardView';
import { DispatchDashboardView } from '../../components/dashboards/DispatchDashboardView';
import { FpsDashboardView } from '../../components/dashboards/FpsDashboardView';
import { InwardStockModal } from '../../components/InwardStockModal';
import { FifoDispatchModal } from '../../components/FifoDispatchModal';
import { ShieldCheck, UserCheck, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

function DashboardContent() {
  const { 
    currentRole, 
    currentUser, 
    batches, 
    fairPriceShops, 
    addStockReceipt, 
    createDispatch, 
    switchRole 
  } = useStockFlow();
  
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role') as Role | null;

  // Selected role for dashboard view:
  // Strictly defaults to authenticated user's active session role unless explicit valid param provided
  const initialRole: Role = roleParam && ROLE_DASHBOARDS_CONFIG[roleParam] 
    ? roleParam 
    : currentRole;

  const [selectedDashboardRole, setSelectedDashboardRole] = useState<Role>(initialRole);
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  // If user switches role via session switcher, immediately sync dashboard view
  useEffect(() => {
    if (!roleParam) {
      setSelectedDashboardRole(currentRole);
    }
  }, [currentRole, roleParam]);

  const dashboardMeta = ROLE_DASHBOARDS_CONFIG[selectedDashboardRole];
  const isViewingOwnRole = selectedDashboardRole === currentRole;

  return (
    <AppShell 
      pageTitle={dashboardMeta.title} 
      pageBreadcrumb={`Role Dashboards / ${dashboardMeta.shortTitle}`}
    >
      <div className="space-y-6">
        {/* Authenticated Role Status Banner */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${currentUser.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}>
              {currentUser.avatarLetter}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentUser.role.replace('_', ' ')}
                </span>
                {currentUser.godownName && (
                  <span className="text-[11px] text-zinc-500 hidden md:inline">
                    • {currentUser.godownName}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {isViewingOwnRole ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Displaying active authenticated role dashboard
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Viewing preview of {selectedDashboardRole.replace('_', ' ')} dashboard
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isViewingOwnRole && (
            <button
              onClick={() => switchRole(selectedDashboardRole)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Switch Session Role to {selectedDashboardRole.replace('_', ' ')}</span>
            </button>
          )}
        </div>

        {/* Top-Level Role Dashboard Selector */}
        <RoleDashboardSelector
          selectedDashboardRole={selectedDashboardRole}
          onSelectRole={(role) => setSelectedDashboardRole(role)}
          showSwitchSessionPrompt={true}
        />

        {/* Dedicated Separate Dashboard Views based on selected role */}
        {selectedDashboardRole === 'ADMIN' && (
          <AdminDashboardView />
        )}

        {selectedDashboardRole === 'GODOWN_MANAGER' && (
          <ManagerDashboardView
            onOpenInwardModal={() => setIsInwardModalOpen(true)}
            onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
          />
        )}

        {selectedDashboardRole === 'QUALITY_INSPECTOR' && (
          <QualityDashboardView />
        )}

        {selectedDashboardRole === 'DISPATCH_OFFICER' && (
          <DispatchDashboardView
            onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
          />
        )}

        {selectedDashboardRole === 'FPS_DEALER' && (
          <FpsDashboardView />
        )}

        {/* Global Modals */}
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
              createdBy: currentUser.name,
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
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white text-xs">
        Loading Role Dashboard...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
