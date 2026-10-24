'use client';

import React from 'react';
import { AppShell } from '../../../components/AppShell';
import { AdminDashboardView } from '../../../components/dashboards/AdminDashboardView';

export default function AdminRoleDashboardPage() {
  return (
    <AppShell
      pageTitle="State Administrator Command"
      pageBreadcrumb="Dashboard / State Admin"
      allowedRoles={['ADMIN']}
    >
      <AdminDashboardView />
    </AppShell>
  );
}
