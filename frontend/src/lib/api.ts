/**
 * StockFlow iPDS - Unified API Client
 * Connects Next.js Frontend with Express + Prisma + PostgreSQL Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('stockflow_jwt_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('stockflow_jwt_token', token);
      } else {
        localStorage.removeItem('stockflow_jwt_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('stockflow_jwt_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.error || json?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return json as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // 1. Health & Status
  async checkHealth(): Promise<{ success: boolean; status?: string; service?: string }> {
    return this.request('/health');
  }

  // 2. Authentication
  async login(credentials: { email: string; password?: string; role?: string }) {
    return this.request<{ success: boolean; data: { token: string; user: any } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; data: any }>('/auth/me');
  }

  // 3. Inventory
  async getInventory(params?: { godownId?: string; status?: string; qualityGrade?: string; commodityId?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, String(val));
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: any[]; count: number }>(`/inventory${qs}`);
  }

  async getInventorySummary(godownId?: string) {
    const qs = godownId ? `?godownId=${encodeURIComponent(godownId)}` : '';
    return this.request<{ success: boolean; data: any }>(`/inventory/summary${qs}`);
  }

  async updateBatchStatus(batchId: string, status: string, reason?: string) {
    return this.request<{ success: boolean; message: string; data: any }>(`/inventory/${batchId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  async updateBatchQuality(batchId: string, grade: string, moisture: number, labReport: string) {
    return this.request<{ success: boolean; message: string; data: any }>(`/inventory/${batchId}/quality`, {
      method: 'PATCH',
      body: JSON.stringify({ qualityGrade: grade, moisturePercent: moisture, labReportNo: labReport }),
    });
  }

  // 4. Receipts
  async getReceipts(godownId?: string) {
    const qs = godownId ? `?godownId=${encodeURIComponent(godownId)}` : '';
    return this.request<{ success: boolean; data: any[]; count: number }>(`/receipts${qs}`);
  }

  async createReceipt(payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/receipts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 5. FIFO Engine
  async calculateFifo(payload: { godownId?: string; commodityId?: string; commodityCode?: string; requestedKg?: number; requestedMt?: number; bypassFifo?: boolean; targetBatchId?: string }) {
    return this.request<{ success: boolean; data: any }>('/fifo/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getFifoEligible(params?: { godownId?: string; commodityId?: string }) {
    const query = new URLSearchParams();
    if (params?.godownId) query.append('godownId', params.godownId);
    if (params?.commodityId) query.append('commodityId', params.commodityId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: any[]; count: number }>(`/fifo/eligible${qs}`);
  }

  // 6. Challans / Dispatches
  async getChallans(godownId?: string) {
    const qs = godownId ? `?godownId=${encodeURIComponent(godownId)}` : '';
    return this.request<{ success: boolean; data: any[]; count: number }>(`/challans${qs}`);
  }

  async createChallan(payload: any) {
    return this.request<{ success: boolean; message: string; data: any }>('/challans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateChallanStatus(challanId: string, status: string, notes?: string) {
    return this.request<{ success: boolean; message: string; data: any }>(`/challans/${challanId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // 7. Movements / Audit Ledger
  async getMovements(params?: { godownId?: string; batchId?: string; type?: string; limit?: number }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.append(key, String(val));
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; data: any[]; count: number }>(`/movements${qs}`);
  }

  // 8. Master Entities
  async getGodowns() {
    return this.request<{ success: boolean; data: any[] }>('/godowns');
  }

  async getCommodities() {
    return this.request<{ success: boolean; data: any[] }>('/commodities');
  }

  async getSuppliers() {
    return this.request<{ success: boolean; data: any[] }>('/suppliers');
  }

  async getFairPriceShops() {
    return this.request<{ success: boolean; data: any[] }>('/fps');
  }

  // 9. Reports
  async getAgeingReport(godownId?: string) {
    const qs = godownId ? `?godownId=${encodeURIComponent(godownId)}` : '';
    return this.request<{ success: boolean; data: any }>(`/reports/ageing${qs}`);
  }

  async getComplianceReport(godownId?: string) {
    const qs = godownId ? `?godownId=${encodeURIComponent(godownId)}` : '';
    return this.request<{ success: boolean; data: any }>(`/reports/fifo-compliance${qs}`);
  }

  async getAuditLogs() {
    return this.request<{ success: boolean; data: any[] }>('/audit');
  }
}

export const api = new ApiClient();
