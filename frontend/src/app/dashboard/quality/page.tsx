'use client';

import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { QualityDashboardView } from '../../../components/dashboards/QualityDashboardView';

export default function QualityRoleDashboardPage() {
  return (
    <AppShell 
      pageTitle="Quality & AGMARK Lab Inspector" 
      pageBreadcrumb="Role Dashboards / Quality Inspector"
      allowedRoles={['QUALITY_INSPECTOR', 'ADMIN']}
    >
      <div className="space-y-6">
        <QualityDashboardView />
      </div>
    </AppShell>
  );
}
