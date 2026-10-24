'use client';

import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { FpsDashboardView } from '../../../components/dashboards/FpsDashboardView';

export default function FpsRoleDashboardPage() {
  return (
    <AppShell 
      pageTitle="Fair Price Shop (FPS) Retail Dealer" 
      pageBreadcrumb="Role Dashboards / FPS Dealer"
      allowedRoles={['FPS_DEALER', 'ADMIN']}
    >
      <div className="space-y-6">
        <FpsDashboardView />
      </div>
    </AppShell>
  );
}
