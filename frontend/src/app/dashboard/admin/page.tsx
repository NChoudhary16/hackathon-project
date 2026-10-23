'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/AppShell';
import { RoleDashboardSelector } from '../../../components/dashboards/RoleDashboardSelector';
import { AdminDashboardView } from '../../../components/dashboards/AdminDashboardView';

export default function AdminRoleDashboardPage() {
  const router = useRouter();

  return (
    <AppShell 
      pageTitle="State Administrator Command" 
      pageBreadcrumb="Role Dashboards / State Admin"
      allowedRoles={['ADMIN']}
    >
      <div className="space-y-6">
        <RoleDashboardSelector
          selectedDashboardRole="ADMIN"
          onSelectRole={(r) => {
            if (r === 'ADMIN') return;
            router.push(`/dashboard/${r === 'GODOWN_MANAGER' ? 'manager' : r === 'QUALITY_INSPECTOR' ? 'quality' : r === 'DISPATCH_OFFICER' ? 'dispatch' : 'fps'}`);
          }}
        />
        <AdminDashboardView />
      </div>
    </AppShell>
  );
}
