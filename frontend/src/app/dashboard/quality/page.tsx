'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/AppShell';
import { RoleDashboardSelector } from '../../../components/dashboards/RoleDashboardSelector';
import { QualityDashboardView } from '../../../components/dashboards/QualityDashboardView';

export default function QualityRoleDashboardPage() {
  const router = useRouter();

  return (
    <AppShell 
      pageTitle="Quality & AGMARK Lab Inspector" 
      pageBreadcrumb="Role Dashboards / Quality Inspector"
      allowedRoles={['QUALITY_INSPECTOR', 'ADMIN']}
    >
      <div className="space-y-6">
        <RoleDashboardSelector
          selectedDashboardRole="QUALITY_INSPECTOR"
          onSelectRole={(r) => {
            if (r === 'QUALITY_INSPECTOR') return;
            router.push(`/dashboard/${r === 'ADMIN' ? 'admin' : r === 'GODOWN_MANAGER' ? 'manager' : r === 'DISPATCH_OFFICER' ? 'dispatch' : 'fps'}`);
          }}
        />
        <QualityDashboardView />
      </div>
    </AppShell>
  );
}
