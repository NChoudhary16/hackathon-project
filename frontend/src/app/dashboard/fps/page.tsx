'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/AppShell';
import { RoleDashboardSelector } from '../../../components/dashboards/RoleDashboardSelector';
import { FpsDashboardView } from '../../../components/dashboards/FpsDashboardView';

export default function FpsRoleDashboardPage() {
  const router = useRouter();

  return (
    <AppShell 
      pageTitle="Fair Price Shop (FPS) Retail Dealer" 
      pageBreadcrumb="Role Dashboards / FPS Dealer"
      allowedRoles={['FPS_DEALER', 'ADMIN']}
    >
      <div className="space-y-6">
        <RoleDashboardSelector
          selectedDashboardRole="FPS_DEALER"
          onSelectRole={(r) => {
            if (r === 'FPS_DEALER') return;
            router.push(`/dashboard/${r === 'ADMIN' ? 'admin' : r === 'GODOWN_MANAGER' ? 'manager' : r === 'QUALITY_INSPECTOR' ? 'quality' : 'dispatch'}`);
          }}
        />
        <FpsDashboardView />
      </div>
    </AppShell>
  );
}
