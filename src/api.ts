import { User, Lead, SavedContent, WebsiteDraft, SystemConfig, AdminMetrics, SystemLog, Transaction } from './types';

const TOKEN_KEY = 'sellpilot_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const error: any = new Error(errorMsg);
    error.status = response.status;
    error.isMissingKey = data?.isMissingKey;
    error.planUpgradeRequired = data?.planUpgradeRequired;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  register: (body: any) => request<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<{ user: User; plansConfig: Record<string, any> }>('/api/auth/me'),
  updateProfile: (body: any) => request<{ user: User }>('/api/auth/update-profile', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: any) => request<{ message: string }>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // AI Generation
  generateAd: (body: any) => request<{ result: any; remainingCredits: number }>('/api/ai/generate-ad', { method: 'POST', body: JSON.stringify(body) }),
  generateSocial: (body: any) => request<{ result: any; remainingCredits: number }>('/api/ai/generate-social', { method: 'POST', body: JSON.stringify(body) }),
  askAssistant: (messages: any[], businessContext?: string) =>
    request<{ reply: string; remainingCredits: number }>('/api/ai/assistant', { method: 'POST', body: JSON.stringify({ messages, businessContext }) }),
  generateWhatsAppTools: (body: any) =>
    request<{ result: any; remainingCredits: number }>('/api/ai/whatsapp-tools', { method: 'POST', body: JSON.stringify(body) }),
  generateWebsite: (body: any) =>
    request<{ website: WebsiteDraft; remainingCredits: number }>('/api/ai/generate-website', { method: 'POST', body: JSON.stringify(body) }),

  // Saved Content
  getContent: () => request<{ content: SavedContent[] }>('/api/content'),
  saveContent: (body: any) => request<{ item: SavedContent }>('/api/content', { method: 'POST', body: JSON.stringify(body) }),
  deleteContent: (id: string) => request<{ success: boolean }>(`/api/content/${id}`, { method: 'DELETE' }),

  // Leads CRM
  getLeads: () => request<{ leads: Lead[] }>('/api/leads'),
  createLead: (body: any) => request<{ lead: Lead }>('/api/leads', { method: 'POST', body: JSON.stringify(body) }),
  updateLead: (id: string, body: any) => request<{ lead: Lead }>(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLead: (id: string) => request<{ success: boolean }>(`/api/leads/${id}`, { method: 'DELETE' }),

  // Websites
  getWebsites: () => request<{ websites: WebsiteDraft[] }>('/api/websites'),
  updateWebsite: (id: string, body: any) => request<{ website: WebsiteDraft }>(`/api/websites/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  publishWebsite: (id: string) => request<{ success: boolean; website: WebsiteDraft; liveUrl: string }>(`/api/websites/${id}/publish`, { method: 'POST' }),

  // Billing
  initBilling: (body: { plan: string; provider?: string; currency?: string }) =>
    request<{ reference: string; amount: number; currency: string; plan: string; provider: string; publicKey: string; userEmail: string; businessName: string }>(
      '/api/billing/initialize',
      { method: 'POST', body: JSON.stringify(body) }
    ),
  verifyBilling: (reference: string) =>
    request<{ success: boolean; message: string; user: User; transaction: Transaction }>('/api/billing/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    }),

  // Admin
  getAdminMetrics: () => request<{ metrics: AdminMetrics; config: SystemConfig; logs: SystemLog[] }>('/api/admin/metrics'),
  getAdminUsers: () => request<{ users: User[] }>('/api/admin/users'),
  updateUserPlan: (userId: string, body: { plan: string; aiCreditsLimit?: number }) =>
    request<{ user: User }>(`/api/admin/users/${userId}/plan`, { method: 'PUT', body: JSON.stringify(body) }),
  updatePlansConfig: (body: { plans?: any; features?: any }) =>
    request<{ config: SystemConfig }>('/api/admin/plans', { method: 'PUT', body: JSON.stringify(body) }),
  getAdminTransactions: () => request<{ transactions: Transaction[] }>('/api/admin/transactions'),
};
