'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/AppShell';
import { RoleDashboardSelector } from '../../../components/dashboards/RoleDashboardSelector';
import { DispatchDashboardView } from '../../../components/dashboards/DispatchDashboardView';

export default function DispatchRoleDashboardPage() {
  const router = useRouter();

  return (
    <AppShell 
      pageTitle="Dispatch & Fleet Weighbridge Terminal" 
      pageBreadcrumb="Role Dashboards / Dispatch Officer"
      allowedRoles={['DISPATCH_OFFICER', 'ADMIN']}
    >
      <div className="space-y-6">
        <RoleDashboardSelector
          selectedDashboardRole="DISPATCH_OFFICER"
          onSelectRole={(r) => {
            if (r === 'DISPATCH_OFFICER') return;
            router.push(`/dashboard/${r === 'ADMIN' ? 'admin' : r === 'GODOWN_MANAGER' ? 'manager' : r === 'QUALITY_INSPECTOR' ? 'quality' : 'fps'}`);
          }}
        />
        <DispatchDashboardView />
      </div>
    </AppShell>
  );
}
