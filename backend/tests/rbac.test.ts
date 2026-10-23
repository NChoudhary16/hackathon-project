import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Role-Based Access Control (RBAC) API Tests', () => {
  it('Reject unauthenticated request on protected entity endpoints with invalid token', async () => {
    const res = await request(app).get('/api/users').set('authorization', 'Bearer bad.invalid.token');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Allows ADMIN to access user management endpoint', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('x-user-role', 'ADMIN');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('Denies non-admin (e.g. QUALITY_INSPECTOR) from updating user roles (403 Forbidden)', async () => {
    const res = await request(app)
      .patch('/api/users/some-user-id/role')
      .set('x-user-role', 'QUALITY_INSPECTOR')
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Access forbidden');
  });

  it('Allows QUALITY_INSPECTOR to view inventory and receipts', async () => {
    const res = await request(app)
      .get('/api/inventory')
      .set('x-user-role', 'QUALITY_INSPECTOR');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Allows DISPATCH_OFFICER to access delivery challans', async () => {
    const res = await request(app)
      .get('/api/challans')
      .set('x-user-role', 'DISPATCH_OFFICER');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('Denies DISPATCH_OFFICER from viewing audit exceptions reserved for Admin & Godown Manager', async () => {
    const res = await request(app)
      .get('/api/audit/exceptions')
      .set('x-user-role', 'DISPATCH_OFFICER');
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
