export interface User {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  businessType: string;
  currency: 'NGN' | 'USD';
  role: 'admin' | 'user';
  plan: 'free' | 'pro' | 'business';
  planExpiresAt: string | null;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  createdAt: string;
}

export interface Lead {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  source: 'WhatsApp' | 'Instagram' | 'Facebook' | 'Website' | 'Walk-in' | 'Referral' | 'Other';
  status: 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Not interested';
  dealValue: number;
  currency: 'NGN' | 'USD';
  notes: string;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedContent {
  id: string;
  userId: string;
  type: 'ad' | 'social' | 'whatsapp' | 'website' | 'other';
  title: string;
  platform?: string;
  data: any;
  createdAt: string;
}

export interface WebsiteDraft {
  id: string;
  userId: string;
  slug: string;
  businessName: string;
  tagline: string;
  description: string;
  industry: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  themeColor: string;
  heroHeadline: string;
  heroSubheadline: string;
  aboutStory: string;
  services: Array<{ title: string; price: string; description: string; features: string[] }>;
  testimonials: Array<{ name: string; role: string; quote: string }>;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanConfigItem {
  name: string;
  priceNGN: number;
  priceUSD: number;
  aiCredits: number;
  websites: number;
}

export interface SystemConfig {
  plans: {
    free: PlanConfigItem;
    pro: PlanConfigItem;
    business: PlanConfigItem;
  };
  features: {
    aiAds: boolean;
    socialMedia: boolean;
    websiteGenerator: boolean;
    leadManager: boolean;
    whatsappSuite: boolean;
  };
}

export interface AdminMetrics {
  totalUsers: number;
  planBreakdown: { free: number; pro: number; business: number };
  revenue: { NGN: number; USD: number };
  totalAICreditsUsed: number;
  totalLeads: number;
  totalWebsites: number;
  publishedWebsites: number;
  recentErrorsCount: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  reference: string;
  provider: 'Paystack' | 'Flutterwave';
  plan: 'pro' | 'business';
  amount: number;
  currency: 'NGN' | 'USD';
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
}
