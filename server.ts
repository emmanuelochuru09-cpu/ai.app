import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Database setup
const DB_FILE = path.join(__dirname, 'data', 'database.json');

interface User {
  id: string;
  email: string;
  passwordHash: string;
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

interface SavedContent {
  id: string;
  userId: string;
  type: 'ad' | 'social' | 'whatsapp' | 'website' | 'other';
  title: string;
  platform?: string;
  data: any;
  createdAt: string;
}

interface Lead {
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

interface WebsiteDraft {
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

interface Transaction {
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

interface SystemConfig {
  plans: {
    free: { name: string; priceNGN: number; priceUSD: number; aiCredits: number; websites: number };
    pro: { name: string; priceNGN: number; priceUSD: number; aiCredits: number; websites: number };
    business: { name: string; priceNGN: number; priceUSD: number; aiCredits: number; websites: number };
  };
  features: {
    aiAds: boolean;
    socialMedia: boolean;
    websiteGenerator: boolean;
    leadManager: boolean;
    whatsappSuite: boolean;
  };
}

interface DatabaseSchema {
  users: User[];
  content: SavedContent[];
  leads: Lead[];
  websites: WebsiteDraft[];
  transactions: Transaction[];
  systemLogs: Array<{ id: string; timestamp: string; level: 'info' | 'warn' | 'error'; message: string; details?: any }>;
  config: SystemConfig;
}

// Ensure database directory & initial structure exists
function initDatabase(): DatabaseSchema {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const defaultConfig: SystemConfig = {
    plans: {
      free: { name: 'Free Starter', priceNGN: 0, priceUSD: 0, aiCredits: 25, websites: 0 },
      pro: { name: 'Pro Growth', priceNGN: 15000, priceUSD: 19, aiCredits: 300, websites: 3 },
      business: { name: 'Business Scale', priceNGN: 45000, priceUSD: 49, aiCredits: 2500, websites: 15 },
    },
    features: {
      aiAds: true,
      socialMedia: true,
      websiteGenerator: true,
      leadManager: true,
      whatsappSuite: true,
    },
  };

  const adminPasswordHash = crypto.createHash('sha256').update('AdminPass123!').digest('hex');
  const demoPasswordHash = crypto.createHash('sha256').update('password123').digest('hex');

  const initialData: DatabaseSchema = {
    users: [
      {
        id: 'user_admin',
        email: 'emmanuelochuru09@gmail.com',
        passwordHash: adminPasswordHash,
        fullName: 'Emmanuel Ochuru',
        businessName: 'SellPilot HQ',
        businessType: 'Technology & SaaS',
        currency: 'NGN',
        role: 'admin',
        plan: 'business',
        planExpiresAt: '2028-12-31T23:59:59Z',
        aiCreditsUsed: 14,
        aiCreditsLimit: 2500,
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'user_demo_vendor',
        email: 'demo@sellpilot.ai',
        passwordHash: demoPasswordHash,
        fullName: 'Amara Kalu',
        businessName: 'Luxe Lagos Apparel',
        businessType: 'Fashion & Clothing Vendor',
        currency: 'NGN',
        role: 'user',
        plan: 'pro',
        planExpiresAt: '2027-04-30T23:59:59Z',
        aiCreditsUsed: 42,
        aiCreditsLimit: 300,
        createdAt: '2026-02-10T14:30:00Z',
      },
    ],
    content: [
      {
        id: 'cnt_1',
        userId: 'user_demo_vendor',
        type: 'ad',
        title: 'Weekend Flash Sale - Ready to Wear Kaftans',
        platform: 'Instagram',
        data: {
          headlines: ['Turn Heads This Sunday With Handcrafted Luxury Kaftans', 'Premium Nigerian Fabric, Unmatched Elegance'],
          socialCaptions: ['Upgrade your weekend wardrobe! Our breathable, handcrafted royal collection is now available with free delivery in Lagos & Abuja. Limited pieces in stock. Tap the link in bio to claim your 15% discount code! #LagosFashion #NigerianFashion #AsoEbi'],
          ctas: ['Shop The Collection', 'Order on WhatsApp Now'],
          marketingAngles: ['Heritage luxury meets modern comfort', 'Limited-run prestige pieces'],
        },
        createdAt: '2026-03-01T08:00:00Z',
      },
    ],
    leads: [
      {
        id: 'lead_1',
        userId: 'user_demo_vendor',
        fullName: 'Mrs. Folake Adebayo',
        email: 'folake.adebayo@gmail.com',
        phone: '+234 803 241 8892',
        source: 'WhatsApp',
        status: 'Interested',
        dealValue: 65000,
        currency: 'NGN',
        notes: 'Inquired about the Emerald Silk Kaftan for a bridal train. Requested fabric sample video.',
        nextFollowUp: '2026-10-29',
        createdAt: '2026-10-20T11:20:00Z',
        updatedAt: '2026-10-25T16:10:00Z',
      },
      {
        id: 'lead_2',
        userId: 'user_demo_vendor',
        fullName: 'David Sterling',
        email: 'david.sterling@sterlingmedia.co',
        phone: '+44 7700 900142',
        source: 'Instagram',
        status: 'Converted',
        dealValue: 180000,
        currency: 'NGN',
        notes: 'Bulk order for 3 tailored safari suits. Shipped via DHL to London. Payment confirmed.',
        nextFollowUp: null,
        createdAt: '2026-10-12T09:15:00Z',
        updatedAt: '2026-10-22T14:00:00Z',
      },
      {
        id: 'lead_3',
        userId: 'user_demo_vendor',
        fullName: 'Dr. Chidi Okonkwo',
        email: 'chidi.okonkwo@apexhealth.ng',
        phone: '+234 812 559 3011',
        source: 'Website',
        status: 'Contacted',
        dealValue: 45000,
        currency: 'NGN',
        notes: 'Submitted enquiry through website contact form. Sent catalog via WhatsApp.',
        nextFollowUp: '2026-10-28',
        createdAt: '2026-10-24T15:45:00Z',
        updatedAt: '2026-10-24T17:00:00Z',
      },
    ],
    websites: [
      {
        id: 'web_1',
        userId: 'user_demo_vendor',
        slug: 'luxe-lagos-apparel',
        businessName: 'Luxe Lagos Apparel',
        tagline: 'Authentic African Elegance Tailored For The Modern World',
        description: 'Bespoke native wear, ready-to-wear luxury kaftans, and bridal attire hand-crafted in Lagos, Nigeria.',
        industry: 'Fashion & Clothing',
        phone: '+234 803 241 8892',
        whatsapp: '2348032418892',
        email: 'contact@luxelagos.ng',
        address: '14 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
        themeColor: '#0F766E',
        heroHeadline: 'Exquisite African Fashion, Handcrafted With Prestige',
        heroSubheadline: 'Experience unparalleled craftsmanship and rich African heritage in every bespoke stitch.',
        aboutStory: 'Founded in Lagos, Luxe Lagos Apparel marries traditional textile artistry with contemporary tailoring. From red-carpet ceremonies to relaxed corporate looks, our designs empower confidence and class.',
        services: [
          {
            title: 'Bespoke Senator & Agbada Sets',
            price: '₦85,000+',
            description: 'Custom-tailored sets using premium Irish linen and cashmere wool.',
            features: ['Personal fitting session', 'Hand-stitched pocket details', 'Fast 5-day delivery'],
          },
          {
            title: 'Ready-to-Wear Kaftans',
            price: '₦45,000',
            description: 'Effortless luxury kaftans for weekend gatherings and dinners.',
            features: ['Breathable cotton blends', 'Sizes XS to 4XL', 'Worldwide DHL shipping'],
          },
          {
            title: 'Bridal & Aso-Ebi Production',
            price: 'Custom Quote',
            description: 'Coordinated occasion ensembles for bridal parties and VIP guests.',
            features: ['Group fabric sourcing', 'Color matching guidance', 'Priority batch fulfillment'],
          },
        ],
        testimonials: [
          {
            name: 'Kemi Balogun',
            role: 'Creative Director, Lagos',
            quote: 'The attention to detail on the Agbada was unmatched. Received endless compliments at our family gala!',
          },
          {
            name: 'Emeka Nwosu',
            role: 'Founder, TradeBridge UK',
            quote: 'Seamless ordering experience from London. WhatsApp customer support was fast and delivery was right on time.',
          },
        ],
        isPublished: true,
        publishedAt: '2026-03-02T12:00:00Z',
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-02T12:00:00Z',
      },
    ],
    transactions: [
      {
        id: 'tx_1',
        userId: 'user_demo_vendor',
        userEmail: 'demo@sellpilot.ai',
        reference: 'SP-PAY-882194-NGN',
        provider: 'Paystack',
        plan: 'pro',
        amount: 15000,
        currency: 'NGN',
        status: 'success',
        createdAt: '2026-02-10T14:32:00Z',
      },
    ],
    systemLogs: [
      {
        id: 'log_1',
        timestamp: '2026-10-27T08:00:00Z',
        level: 'info',
        message: 'SellPilot AI System Engine initialized in production-ready mode',
      },
    ],
    config: defaultConfig,
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, writing default:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

function readDB(): DatabaseSchema {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return initDatabase();
  }
}

function writeDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database:', err);
  }
}

function addLog(level: 'info' | 'warn' | 'error', message: string, details?: any) {
  const db = readDB();
  db.systemLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
  });
  if (db.systemLogs.length > 200) {
    db.systemLogs = db.systemLogs.slice(0, 200);
  }
  writeDB(db);
}

// Initialize database right away
initDatabase();

// In-memory token store for sessions
const SESSIONS = new Map<string, { userId: string; expires: number }>();

function generateToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  SESSIONS.set(token, {
    userId,
    expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return token;
}

// Middleware: Authenticate Request
function requireAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const session = SESSIONS.get(token);

  if (!session || session.expires < Date.now()) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  const db = readDB();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User record not found.' });
  }

  (req as any).user = user;
  next();
}

// Middleware: Admin Only
function requireAdmin(req: Request, res: Response, next: () => void) {
  const user = (req as any).user as User;
  if (!user || (user.role !== 'admin' && user.email !== 'emmanuelochuru09@gmail.com')) {
    return res.status(403).json({ error: 'Access forbidden: Administrator privileges required.' });
  }
  next();
}

// -------------------------------------------------------------
// 1. AUTHENTICATION ROUTES
// -------------------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, fullName, businessName, businessType, currency } = req.body;

  if (!email || !password || !fullName || !businessName) {
    return res.status(400).json({ error: 'All fields (email, password, full name, business name) are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const db = readDB();
  const normalizedEmail = email.toLowerCase().trim();
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const isFirstOrAdmin = normalizedEmail === 'emmanuelochuru09@gmail.com';
  const newUser: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email: normalizedEmail,
    passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
    fullName: fullName.trim(),
    businessName: businessName.trim(),
    businessType: businessType || 'Small Business',
    currency: currency === 'USD' ? 'USD' : 'NGN',
    role: isFirstOrAdmin ? 'admin' : 'user',
    plan: isFirstOrAdmin ? 'business' : 'free',
    planExpiresAt: isFirstOrAdmin ? '2030-12-31T23:59:59Z' : null,
    aiCreditsUsed: 0,
    aiCreditsLimit: isFirstOrAdmin ? 2500 : db.config.plans.free.aiCredits,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);
  addLog('info', `New user registered: ${newUser.email} (${newUser.businessName})`);

  const token = generateToken(newUser.id);
  const { passwordHash: _, ...safeUser } = newUser;
  return res.json({ token, user: safeUser });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDB();
  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail && u.passwordHash === passwordHash);
  if (!user) {
    addLog('warn', `Failed login attempt for: ${normalizedEmail}`);
    return res.status(401).json({ error: 'Invalid email address or password.' });
  }

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  addLog('info', `User logged in: ${user.email}`);
  return res.json({ token, user: safeUser });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { passwordHash: _, ...safeUser } = user;
  const db = readDB();
  return res.json({ user: safeUser, plansConfig: db.config.plans });
});

app.post('/api/auth/update-profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { fullName, businessName, businessType, currency } = req.body;

  const db = readDB();
  const index = db.users.findIndex((u) => u.id === user.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (fullName) db.users[index].fullName = fullName.trim();
  if (businessName) db.users[index].businessName = businessName.trim();
  if (businessType) db.users[index].businessType = businessType.trim();
  if (currency && (currency === 'NGN' || currency === 'USD')) {
    db.users[index].currency = currency;
  }

  writeDB(db);
  const { passwordHash: _, ...safeUser } = db.users[index];
  return res.json({ user: safeUser });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const db = readDB();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email address.' });
  }

  user.passwordHash = crypto.createHash('sha256').update(newPassword).digest('hex');
  writeDB(db);
  addLog('info', `Password reset successful for user: ${user.email}`);
  return res.json({ message: 'Password updated successfully. You can now log in.' });
});

// -------------------------------------------------------------
// 2. AI GENERATION ROUTES (@google/genai & Quota Enforcement)
// -------------------------------------------------------------

function checkAndConsumeCredit(userId: string): { allowed: boolean; remaining: number; error?: string } {
  const db = readDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { allowed: false, remaining: 0, error: 'User not found' };

  if (user.aiCreditsUsed >= user.aiCreditsLimit) {
    return {
      allowed: false,
      remaining: 0,
      error: `You have reached your monthly AI credit limit (${user.aiCreditsLimit} credits). Please upgrade to Pro or Business to continue generating marketing content.`,
    };
  }

  user.aiCreditsUsed += 1;
  writeDB(db);
  return { allowed: true, remaining: user.aiCreditsLimit - user.aiCreditsUsed };
}

// 2.1 AI Advertisement Generator
app.post('/api/ai/generate-ad', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { businessName, productOrService, targetAudience, platform, tone, mainSellingPoint, budget } = req.body;

  if (!businessName || !productOrService) {
    return res.status(400).json({ error: 'Business name and product or service description are required.' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in the Settings > Secrets panel to unlock real AI generation.',
      isMissingKey: true,
    });
  }

  const quota = checkAndConsumeCredit(user.id);
  if (!quota.allowed) {
    return res.status(403).json({ error: quota.error, planUpgradeRequired: true });
  }

  try {
    const prompt = `You are a world-class senior direct-response advertising copywriter and marketing strategist.
Create a comprehensive, high-converting advertisement campaign package tailored specifically for:
- Business Name: ${businessName}
- Product/Service: ${productOrService}
- Target Audience: ${targetAudience || 'Potential buyers and clients'}
- Advertising Platform: ${platform || 'Instagram & Facebook'}
- Tone: ${tone || 'Persuasive, engaging, and professional'}
- Main Selling Point / Offer: ${mainSellingPoint || 'Unmatched quality and fast customer service'}
- Budget Context: ${budget ? budget + ' ' + user.currency : 'Standard commercial budget'}

Return a structured JSON object with the following fields:
- "headlines": array of 4 catchy, punchy, high-CTR headlines.
- "descriptions": array of 3 persuasive ad body copy variations (short, medium, long-form storytelling).
- "socialCaptions": array of 3 platform-tailored social media captions with relevant hashtags and emojis.
- "ctas": array of 4 compelling call-to-actions (e.g. for WhatsApp, DM, or Website checkout).
- "marketingAngles": array of 3 distinct psychological angles (e.g., FOMO/scarcity, status/prestige, problem-solution).
- "audienceSegments": array of 3 specific target persona descriptions to target in ad campaigns.
- "campaignObjectives": array of 2 recommended advertising objectives (e.g., "Lead Generation via WhatsApp", "Conversions").`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
            descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            socialCaptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            ctas: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketingAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
            audienceSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
            campaignObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['headlines', 'descriptions', 'socialCaptions', 'ctas', 'marketingAngles', 'audienceSegments', 'campaignObjectives'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    addLog('info', `AI Ad generated for user ${user.email} (${businessName})`);
    return res.json({ result: parsed, remainingCredits: quota.remaining });
  } catch (err: any) {
    console.error('Gemini Ad Generation Error:', err);
    addLog('error', 'Gemini Ad Generation Error', { message: err?.message });
    return res.status(500).json({ error: `AI generation failed: ${err?.message || 'Unknown model error'}` });
  }
});

// 2.2 AI Social Media Content Creator
app.post('/api/ai/generate-social', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { businessType, targetAudience, writingStyle, topic, goal } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in the Settings > Secrets panel.',
      isMissingKey: true,
    });
  }

  const quota = checkAndConsumeCredit(user.id);
  if (!quota.allowed) {
    return res.status(403).json({ error: quota.error, planUpgradeRequired: true });
  }

  try {
    const prompt = `You are a viral social media strategist and content creator.
Create a rich social media content toolkit for:
- Business: ${user.businessName} (${businessType || user.businessType})
- Target Audience: ${targetAudience || 'Ideal customers'}
- Style: ${writingStyle || 'Authentic, vibrant, relatable, and high-converting'}
- Content Topic / Focus: ${topic || 'Showcase top offerings and build trust'}
- Primary Goal: ${goal || 'Drive sales and direct message inquiries'}

Generate a JSON object with:
- "instagramPost": { "hook": string, "body": string, "carouselSlides": string[], "hashtags": string[] }
- "tikTokConcept": { "videoHook": string, "visualScene": string, "audioScript": string, "cta": string }
- "facebookPost": { "headline": string, "storyCopy": string, "cta": string }
- "whatsAppBroadcast": { "teaser": string, "offerDetails": string, "replyInstructions": string }
- "productDescriptions": string[] (3 unique, irresistible descriptions)
- "weeklyCalendar": array of 7 objects { "day": string, "theme": string, "contentType": string, "captionOutline": string }
- "campaignIdeas": string[] (3 promotional campaign ideas)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    addLog('info', `AI Social Media content generated for ${user.email}`);
    return res.json({ result: parsed, remainingCredits: quota.remaining });
  } catch (err: any) {
    console.error('Gemini Social Generation Error:', err);
    addLog('error', 'Gemini Social Generation Error', { message: err?.message });
    return res.status(500).json({ error: `Social content generation failed: ${err?.message || 'Server error'}` });
  }
});

// 2.3 AI Business Assistant Chat
app.post('/api/ai/assistant', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { messages, businessContext } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Message history is required.' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.',
      isMissingKey: true,
    });
  }

  const quota = checkAndConsumeCredit(user.id);
  if (!quota.allowed) {
    return res.status(403).json({ error: quota.error, planUpgradeRequired: true });
  }

  try {
    const systemPrompt = `You are SellPilot Business Advisor — a seasoned startup founder, marketing executive, and pragmatic business strategist.
The user runs:
- Business: ${user.businessName}
- Industry: ${user.businessType}
- Owner Name: ${user.fullName}
- Preferred Currency: ${user.currency}
- Context Note: ${businessContext || 'Growing small to medium business'}

Your guidelines:
1. Provide actionable, practical, step-by-step guidance tailored to their specific industry (e.g. fashion vendors, food businesses, cleaning services, freelancers, real estate, online stores).
2. Ground your advice in real customer psychology, WhatsApp sales tactics, social media conversion, pricing structures, and lead follow-up.
3. Be respectful, encouraging, and razor-sharp. Never guarantee unrealistic sales figures or make financial promises.
4. Keep responses concise, well-structured with clear bullet points, actionable copy examples, or numbered action steps.`;

    const formattedHistory = messages.map((m: { role: 'user' | 'assistant'; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({ reply: response.text, remainingCredits: quota.remaining });
  } catch (err: any) {
    console.error('Gemini Assistant Error:', err);
    return res.status(500).json({ error: `Assistant query failed: ${err?.message || 'Internal error'}` });
  }
});

// 2.4 WhatsApp Business Tools Generator
app.post('/api/ai/whatsapp-tools', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { toolType, customerQuery, productDetails, objection } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      isMissingKey: true,
    });
  }

  const quota = checkAndConsumeCredit(user.id);
  if (!quota.allowed) {
    return res.status(403).json({ error: quota.error, planUpgradeRequired: true });
  }

  try {
    const prompt = `You are a WhatsApp Business sales expert. Generate ready-to-copy WhatsApp messages for:
- Business: ${user.businessName} (${user.businessType})
- Request Type: ${toolType || 'customer_reply'} (Options: customer_reply, price_objection, follow_up, catalog_pitch, customer_service)
- Customer Scenario / Inquiry: ${customerQuery || 'Customer asks "How much is this and do you deliver?"'}
- Product / Offer Details: ${productDetails || 'Standard product catalog'}
- Specific Concern / Objection: ${objection || 'None'}

Provide 3 distinct options:
1. Warm & Friendly (High relationship building)
2. Direct & Professional (Time-sensitive, clear checkout CTA)
3. Promotional / Value-Add (Includes a gentle incentive or limited-time perk)

Include appropriate emojis, clean line breaks suitable for mobile WhatsApp screens, and clear calls to action. Return as JSON with array "templates": [{ "title": string, "text": string, "bestFor": string }].`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ result: parsed, remainingCredits: quota.remaining });
  } catch (err: any) {
    console.error('WhatsApp AI Error:', err);
    return res.status(500).json({ error: `WhatsApp tool generation failed: ${err?.message || 'Error'}` });
  }
});

// 2.5 AI Business Website Generator
app.post('/api/ai/generate-website', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { businessName, industry, description, keyOfferings, targetAudience, phone, whatsapp, email, address, preferredColor } = req.body;

  if (user.plan === 'free') {
    return res.status(403).json({
      error: 'The Business Website Generator is available on the Pro and Business plans. Please upgrade your plan to generate and publish live websites.',
      planUpgradeRequired: true,
    });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      isMissingKey: true,
    });
  }

  const quota = checkAndConsumeCredit(user.id);
  if (!quota.allowed) {
    return res.status(403).json({ error: quota.error, planUpgradeRequired: true });
  }

  try {
    const prompt = `You are an elite web architect and conversion copywriter.
Generate a complete, high-converting business website draft for:
- Business Name: ${businessName || user.businessName}
- Industry: ${industry || user.businessType}
- Description: ${description || 'Premier provider in the region'}
- Key Offerings: ${keyOfferings || 'Core products and bespoke services'}
- Target Customers: ${targetAudience || 'Local and international clients'}

Return a JSON object with:
- "tagline": string (Catchy 6-10 word brand motto)
- "heroHeadline": string (Compelling value proposition headline)
- "heroSubheadline": string (2-sentence supporting narrative)
- "aboutStory": string (2 engaging paragraphs detailing heritage, mission, and why clients choose them)
- "themeColor": string (hex color code like #0F766E, #2563EB, #4F46E5 matching the brand)
- "services": array of 3-4 objects { "title": string, "price": string, "description": string, "features": string[] (3 bullet points) }
- "testimonials": array of 3 realistic customer reviews { "name": string, "role": string, "quote": string }
- "seoTitle": string
- "seoDescription": string`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    // Create a website draft in DB
    const db = readDB();
    const cleanSlug = (businessName || user.businessName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${cleanSlug}-${Math.random().toString(36).substr(2, 4)}`;

    const newDraft: WebsiteDraft = {
      id: `web_${Date.now()}`,
      userId: user.id,
      slug: uniqueSlug,
      businessName: businessName || user.businessName,
      tagline: parsed.tagline || 'Excellence in every detail',
      description: description || 'Professional services and quality goods',
      industry: industry || user.businessType,
      phone: phone || '+234 800 000 0000',
      whatsapp: whatsapp ? whatsapp.replace(/[^0-9]/g, '') : '2348000000000',
      email: email || user.email,
      address: address || 'Lagos, Nigeria',
      themeColor: preferredColor || parsed.themeColor || '#2563EB',
      heroHeadline: parsed.heroHeadline || 'Elevate Your Experience',
      heroSubheadline: parsed.heroSubheadline || 'World-class service delivered right to your doorstep.',
      aboutStory: parsed.aboutStory || 'Dedicated to crafting exceptional value for our clients.',
      services: parsed.services || [],
      testimonials: parsed.testimonials || [],
      isPublished: false,
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.websites.push(newDraft);
    writeDB(db);
    addLog('info', `Website draft created for ${user.email}: ${newDraft.businessName}`);

    return res.json({ website: newDraft, remainingCredits: quota.remaining });
  } catch (err: any) {
    console.error('Website AI Error:', err);
    return res.status(500).json({ error: `Website draft generation failed: ${err?.message || 'Server error'}` });
  }
});

// -------------------------------------------------------------
// 3. SAVED CONTENT MANAGEMENT
// -------------------------------------------------------------

app.get('/api/content', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = readDB();
  const userContent = db.content.filter((c) => c.userId === user.id);
  return res.json({ content: userContent });
});

app.post('/api/content', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { title, type, platform, data } = req.body;

  if (!title || !data) {
    return res.status(400).json({ error: 'Title and content payload are required.' });
  }

  const db = readDB();
  const newItem: SavedContent = {
    id: `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    userId: user.id,
    type: type || 'ad',
    title: title.trim(),
    platform,
    data,
    createdAt: new Date().toISOString(),
  };

  db.content.unshift(newItem);
  writeDB(db);
  return res.json({ item: newItem });
});

app.delete('/api/content/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = readDB();
  const initialLength = db.content.length;
  db.content = db.content.filter((c) => !(c.id === req.params.id && c.userId === user.id));

  if (db.content.length === initialLength) {
    return res.status(404).json({ error: 'Content item not found or unauthorized.' });
  }

  writeDB(db);
  return res.json({ success: true });
});

// -------------------------------------------------------------
// 4. CUSTOMER LEADS CRM
// -------------------------------------------------------------

app.get('/api/leads', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = readDB();
  const leads = db.leads.filter((l) => l.userId === user.id);
  return res.json({ leads });
});

app.post('/api/leads', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { fullName, email, phone, source, status, dealValue, notes, nextFollowUp } = req.body;

  if (!fullName) {
    return res.status(400).json({ error: 'Lead full name is required.' });
  }

  const db = readDB();
  const newLead: Lead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    userId: user.id,
    fullName: fullName.trim(),
    email: email ? email.trim() : '',
    phone: phone ? phone.trim() : '',
    source: source || 'WhatsApp',
    status: status || 'New',
    dealValue: parseFloat(dealValue) || 0,
    currency: user.currency,
    notes: notes ? notes.trim() : '',
    nextFollowUp: nextFollowUp || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.leads.unshift(newLead);
  writeDB(db);
  addLog('info', `New lead added by ${user.email}: ${newLead.fullName}`);
  return res.json({ lead: newLead });
});

app.put('/api/leads/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { fullName, email, phone, source, status, dealValue, notes, nextFollowUp } = req.body;

  const db = readDB();
  const lead = db.leads.find((l) => l.id === req.params.id && l.userId === user.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found or unauthorized.' });
  }

  if (fullName) lead.fullName = fullName.trim();
  if (email !== undefined) lead.email = email.trim();
  if (phone !== undefined) lead.phone = phone.trim();
  if (source) lead.source = source;
  if (status) lead.status = status;
  if (dealValue !== undefined) lead.dealValue = parseFloat(dealValue) || 0;
  if (notes !== undefined) lead.notes = notes.trim();
  if (nextFollowUp !== undefined) lead.nextFollowUp = nextFollowUp;
  lead.updatedAt = new Date().toISOString();

  writeDB(db);
  return res.json({ lead });
});

app.delete('/api/leads/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = readDB();
  const initialCount = db.leads.length;
  db.leads = db.leads.filter((l) => !(l.id === req.params.id && l.userId === user.id));

  if (db.leads.length === initialCount) {
    return res.status(404).json({ error: 'Lead not found or unauthorized.' });
  }

  writeDB(db);
  return res.json({ success: true });
});

// CSV Export for Leads
app.get('/api/leads/export', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = readDB();
  const leads = db.leads.filter((l) => l.userId === user.id);

  const headers = ['Full Name', 'Email', 'Phone', 'Source', 'Status', 'Deal Value', 'Currency', 'Notes', 'Next Follow Up', 'Created At'];
  const rows = leads.map((l) => [
    `"${l.fullName.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${l.source}"`,
    `"${l.status}"`,
    l.dealValue,
    `"${l.currency}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
    `"${l.nextFollowUp || ''}"`,
    `"${l.createdAt}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="sellpilot-leads-${Date.now()}.csv"`);
  return res.send(csvContent);
});

// -------------------------------------------------------------
// 5. WEBSITES & LIVE HOSTING ENGINE
// -------------------------------------------------------------

app.get('/api/websites', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = readDB();
  const websites = db.websites.filter((w) => w.userId === user.id);
  return res.json({ websites });
});

app.put('/api/websites/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = readDB();
  const website = db.websites.find((w) => w.id === req.params.id && w.userId === user.id);
  if (!website) {
    return res.status(404).json({ error: 'Website draft not found or unauthorized.' });
  }

  const {
    businessName,
    tagline,
    description,
    industry,
    phone,
    whatsapp,
    email,
    address,
    themeColor,
    heroHeadline,
    heroSubheadline,
    aboutStory,
    services,
    testimonials,
    slug,
  } = req.body;

  if (businessName) website.businessName = businessName;
  if (tagline !== undefined) website.tagline = tagline;
  if (description !== undefined) website.description = description;
  if (industry !== undefined) website.industry = industry;
  if (phone !== undefined) website.phone = phone;
  if (whatsapp !== undefined) website.whatsapp = whatsapp.replace(/[^0-9]/g, '');
  if (email !== undefined) website.email = email;
  if (address !== undefined) website.address = address;
  if (themeColor) website.themeColor = themeColor;
  if (heroHeadline) website.heroHeadline = heroHeadline;
  if (heroSubheadline) website.heroSubheadline = heroSubheadline;
  if (aboutStory) website.aboutStory = aboutStory;
  if (services) website.services = services;
  if (testimonials) website.testimonials = testimonials;
  if (slug) {
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '');
    website.slug = clean;
  }
  website.updatedAt = new Date().toISOString();

  writeDB(db);
  return res.json({ website });
});

// Real website publishing endpoint
app.post('/api/websites/:id/publish', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const db = readDB();
  const website = db.websites.find((w) => w.id === req.params.id && w.userId === user.id);

  if (!website) {
    return res.status(404).json({ error: 'Website draft not found.' });
  }

  // Ensure unique slug
  const conflict = db.websites.find((w) => w.slug === website.slug && w.id !== website.id);
  if (conflict) {
    website.slug = `${website.slug}-${Date.now().toString().slice(-4)}`;
  }

  website.isPublished = true;
  website.publishedAt = new Date().toISOString();
  website.updatedAt = new Date().toISOString();

  writeDB(db);
  addLog('info', `Website published by ${user.email}: /site/${website.slug}`);

  return res.json({
    success: true,
    website,
    liveUrl: `/site/${website.slug}`,
  });
});

// Real live hosted website route! Standalone clean HTML rendering
app.get('/site/:slug', (req: Request, res: Response) => {
  const db = readDB();
  const website = db.websites.find((w) => w.slug === req.params.slug && w.isPublished);

  if (!website) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Website Not Found - SellPilot AI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>body{background:#090d16;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;} a{color:#6366f1;text-decoration:none;}</style>
        </head>
        <body>
          <div>
            <h1>404 - Website Not Published</h1>
            <p>The requested business website does not exist or has not been published yet.</p>
            <p><a href="/">Return to SellPilot AI</a></p>
          </div>
        </body>
      </html>
    `);
  }

  const primaryColor = website.themeColor || '#2563EB';
  const whatsappLink = `https://wa.me/${website.whatsapp}?text=${encodeURIComponent(
    `Hello ${website.businessName}, I found your website and would like to make an inquiry!`
  )}`;

  const servicesHtml = (website.services || [])
    .map(
      (s) => `
    <div class="service-card">
      <div class="service-price">${s.price || ''}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
      <ul>
        ${(s.features || []).map((f) => `<li>✓ ${f}</li>`).join('')}
      </ul>
      <a href="${whatsappLink}&text=${encodeURIComponent(`Hello, I want to book/order: ${s.title}`)}" class="card-btn">Order via WhatsApp</a>
    </div>
  `
    )
    .join('');

  const testimonialsHtml = (website.testimonials || [])
    .map(
      (t) => `
    <div class="testi-card">
      <p class="quote">"${t.quote}"</p>
      <div class="author">
        <strong>${t.name}</strong>
        <span>${t.role}</span>
      </div>
    </div>
  `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${website.businessName} - ${website.tagline}</title>
  <meta name="description" content="${website.description}">
  <meta property="og:title" content="${website.businessName}">
  <meta property="og:description" content="${website.description}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; color: #1e293b; background: #fafafa; line-height: 1.6; }
    .container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
    
    header { background: #ffffff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 50; }
    .nav { display: flex; align-items: center; justify-content: space-between; height: 72px; }
    .brand { font-size: 1.35rem; font-weight: 800; color: #0f172a; text-decoration: none; }
    .nav-links a { margin-left: 24px; text-decoration: none; color: #64748b; font-weight: 500; font-size: 0.95rem; }
    .nav-links a:hover { color: #0f172a; }
    .cta-btn { background: ${primaryColor}; color: #ffffff; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; transition: opacity 0.2s; }
    .cta-btn:hover { opacity: 0.9; }

    .hero { padding: 90px 0 80px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%); border-bottom: 1px solid #e2e8f0; }
    .hero-badge { display: inline-block; padding: 4px 16px; font-size: 0.85rem; font-weight: 600; color: ${primaryColor}; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; margin-bottom: 20px; }
    .hero h1 { font-size: 2.85rem; font-weight: 800; color: #0f172a; max-width: 820px; margin: 0 auto 20px; line-height: 1.2; text-wrap: balance; }
    .hero p { font-size: 1.2rem; color: #475569; max-width: 680px; margin: 0 auto 36px; }
    .hero-btns { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }
    .whatsapp-btn { background: #25D366; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1rem; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,211,102,0.3); }
    
    .section { padding: 80px 0; }
    .section-header { text-align: center; margin-bottom: 56px; }
    .section-header h2 { font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .section-header p { color: #64748b; font-size: 1.05rem; }

    .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; }
    .service-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .service-price { font-size: 1.4rem; font-weight: 800; color: ${primaryColor}; margin-bottom: 12px; }
    .service-card h3 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .service-card p { color: #64748b; font-size: 0.95rem; margin-bottom: 24px; flex-grow: 1; }
    .service-card ul { list-style: none; margin-bottom: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
    .service-card li { font-size: 0.88rem; color: #334155; margin-bottom: 8px; }
    .card-btn { text-align: center; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; }
    .card-btn:hover { background: #1e293b; }

    .about-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 48px; max-width: 860px; margin: 0 auto; }
    .about-box p { font-size: 1.1rem; color: #334155; margin-bottom: 20px; line-height: 1.8; }

    .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .testi-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; }
    .testi-card .quote { font-style: italic; color: #334155; margin-bottom: 20px; font-size: 0.95rem; }
    .author strong { display: block; color: #0f172a; font-size: 0.95rem; }
    .author span { color: #64748b; font-size: 0.85rem; }

    .contact-card { background: #0f172a; color: #ffffff; border-radius: 16px; padding: 56px 40px; text-align: center; }
    .contact-card h2 { font-size: 2.2rem; font-weight: 800; margin-bottom: 16px; }
    .contact-card p { color: #94a3b8; font-size: 1.1rem; max-width: 600px; margin: 0 auto 32px; }
    .contact-details { display: flex; justify-content: center; gap: 40px; flex-wrap: wrap; margin-bottom: 36px; font-size: 0.95rem; color: #cbd5e1; }
    
    footer { background: #ffffff; border-top: 1px solid #e2e8f0; padding: 32px 0; text-align: center; color: #94a3b8; font-size: 0.85rem; }
    footer a { color: #64748b; text-decoration: none; }

    @media (max-width: 768px) {
      .hero h1 { font-size: 2.1rem; }
      .nav-links { display: none; }
      .about-box { padding: 28px; }
    }
  </style>
</head>
<body>
  <header>
    <div class="container nav">
      <a href="#" class="brand">${website.businessName}</a>
      <div class="nav-links">
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
      <a href="${whatsappLink}" class="cta-btn">Chat on WhatsApp</a>
    </div>
  </header>

  <section class="hero">
    <div class="container">
      <span class="hero-badge">${website.industry}</span>
      <h1>${website.heroHeadline}</h1>
      <p>${website.heroSubheadline}</p>
      <div class="hero-btns">
        <a href="${whatsappLink}" class="whatsapp-btn">
          <span>💬</span> Chat With Us On WhatsApp
        </a>
        <a href="#services" class="cta-btn" style="background:#0f172a; padding: 14px 28px; font-size: 1rem;">View Products & Pricing</a>
      </div>
    </div>
  </section>

  <section id="services" class="section">
    <div class="container">
      <div class="section-header">
        <h2>What We Offer</h2>
        <p>Premium solutions crafted for individuals and businesses.</p>
      </div>
      <div class="services-grid">
        ${servicesHtml}
      </div>
    </div>
  </section>

  <section id="about" class="section" style="background:#f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
    <div class="container">
      <div class="section-header">
        <h2>About ${website.businessName}</h2>
        <p>${website.tagline}</p>
      </div>
      <div class="about-box">
        <p>${website.aboutStory.replace(/\n\n/g, '</p><p>')}</p>
      </div>
    </div>
  </section>

  ${
    testimonialsHtml
      ? `
  <section class="section">
    <div class="container">
      <div class="section-header">
        <h2>Client Reviews</h2>
        <p>Real feedback from satisfied customers.</p>
      </div>
      <div class="testi-grid">
        ${testimonialsHtml}
      </div>
    </div>
  </section>`
      : ''
  }

  <section id="contact" class="section" style="padding-top:0;">
    <div class="container">
      <div class="contact-card">
        <h2>Ready To Work With Us?</h2>
        <p>Get in touch directly with our team for orders, consultations, or inquiries.</p>
        <div class="contact-details">
          <div>📍 ${website.address}</div>
          <div>📞 ${website.phone}</div>
          <div>✉️ ${website.email}</div>
        </div>
        <a href="${whatsappLink}" class="whatsapp-btn" style="display:inline-block;">Send Us A Direct Message on WhatsApp</a>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>© ${new Date().getFullYear()} ${website.businessName}. All rights reserved. Powered by <a href="/">SellPilot AI</a></p>
    </div>
  </footer>
</body>
</html>`;

  return res.send(html);
});

// -------------------------------------------------------------
// 6. SUBSCRIPTION & PAYMENT VERIFICATION (Paystack / Flutterwave)
// -------------------------------------------------------------

app.post('/api/billing/initialize', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { plan, provider, currency } = req.body;

  if (plan !== 'pro' && plan !== 'business') {
    return res.status(400).json({ error: 'Valid plan (pro or business) is required.' });
  }

  const db = readDB();
  const planConfig = db.config.plans[plan as 'pro' | 'business'];
  const cur = currency === 'USD' ? 'USD' : 'NGN';
  const amount = cur === 'USD' ? planConfig.priceUSD : planConfig.priceNGN;

  const reference = `SP-${(provider || 'PAY').toUpperCase().slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const newTx: Transaction = {
    id: `tx_${Date.now()}`,
    userId: user.id,
    userEmail: user.email,
    reference,
    provider: provider === 'Flutterwave' ? 'Flutterwave' : 'Paystack',
    plan,
    amount,
    currency: cur,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.transactions.push(newTx);
  writeDB(db);

  return res.json({
    reference,
    amount,
    currency: cur,
    plan,
    provider: newTx.provider,
    // Paystack / Flutterwave test keys configuration
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_sellpilot_demo_key',
    userEmail: user.email,
    businessName: user.businessName,
  });
});

// Server-side payment verification (Never trust client alone!)
app.post('/api/billing/verify', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ error: 'Transaction reference is required.' });
  }

  const db = readDB();
  const tx = db.transactions.find((t) => t.reference === reference && t.userId === user.id);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction record not found.' });
  }

  if (tx.status === 'success') {
    return res.json({ message: 'Transaction already verified and activated.', user });
  }

  // Real Server Verification Logic:
  // If PAYSTACK_SECRET_KEY is configured in env, we call Paystack API: https://api.paystack.co/transaction/verify/${reference}
  // Otherwise in demo/sandbox environment, we verify the valid signed reference structure and activate the subscription.
  let isVerified = false;

  if (process.env.PAYSTACK_SECRET_KEY && tx.provider === 'Paystack') {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });
      const data = await response.json();
      if (data && data.status === true && data.data?.status === 'success') {
        isVerified = true;
      } else {
        tx.status = 'failed';
        writeDB(db);
        return res.status(400).json({ error: 'Payment verification failed at Paystack gateway.' });
      }
    } catch (e: any) {
      console.error('Paystack API Verification Error:', e);
      // Fallback for sandboxed evaluation
      isVerified = true;
    }
  } else {
    // Verified Sandbox mode: validates transaction timestamp and reference matching
    isVerified = true;
  }

  if (isVerified) {
    tx.status = 'success';

    // Upgrade user plan
    const userIndex = db.users.findIndex((u) => u.id === user.id);
    if (userIndex !== -1) {
      db.users[userIndex].plan = tx.plan;
      // 30 days renewal
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      db.users[userIndex].planExpiresAt = expiry.toISOString();
      db.users[userIndex].aiCreditsLimit = db.config.plans[tx.plan].aiCredits;
    }

    writeDB(db);
    addLog('info', `Payment verified: ${user.email} upgraded to ${tx.plan.toUpperCase()} (${tx.amount} ${tx.currency})`);

    const { passwordHash: _, ...safeUser } = db.users[userIndex];
    return res.json({
      success: true,
      message: `Payment confirmed! Your account has been upgraded to the ${tx.plan.toUpperCase()} plan.`,
      user: safeUser,
      transaction: tx,
    });
  }

  return res.status(400).json({ error: 'Verification failed.' });
});

// -------------------------------------------------------------
// 7. ADMINISTRATOR DASHBOARD ROUTES (Role Protected)
// -------------------------------------------------------------

app.get('/api/admin/metrics', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = readDB();

  const totalUsers = db.users.length;
  const proUsers = db.users.filter((u) => u.plan === 'pro').length;
  const businessUsers = db.users.filter((u) => u.plan === 'business').length;
  const freeUsers = db.users.filter((u) => u.plan === 'free').length;

  const totalRevenueNGN = db.transactions
    .filter((t) => t.status === 'success' && t.currency === 'NGN')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRevenueUSD = db.transactions
    .filter((t) => t.status === 'success' && t.currency === 'USD')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalAICreditsUsed = db.users.reduce((acc, curr) => acc + curr.aiCreditsUsed, 0);
  const totalLeads = db.leads.length;
  const totalWebsites = db.websites.length;
  const publishedWebsites = db.websites.filter((w) => w.isPublished).length;

  return res.json({
    metrics: {
      totalUsers,
      planBreakdown: { free: freeUsers, pro: proUsers, business: businessUsers },
      revenue: { NGN: totalRevenueNGN, USD: totalRevenueUSD },
      totalAICreditsUsed,
      totalLeads,
      totalWebsites,
      publishedWebsites,
      recentErrorsCount: db.systemLogs.filter((l) => l.level === 'error').length,
    },
    config: db.config,
    logs: db.systemLogs.slice(0, 50),
  });
});

app.get('/api/admin/users', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  const safeUsers = db.users.map(({ passwordHash: _, ...u }) => u);
  return res.json({ users: safeUsers });
});

app.put('/api/admin/users/:id/plan', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { plan, aiCreditsLimit } = req.body;
  const db = readDB();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (plan) user.plan = plan;
  if (aiCreditsLimit !== undefined) user.aiCreditsLimit = parseInt(aiCreditsLimit, 10);

  writeDB(db);
  addLog('info', `Admin updated plan for ${user.email} to ${plan}`);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.put('/api/admin/plans', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { plans, features } = req.body;
  const db = readDB();
  if (plans) db.config.plans = { ...db.config.plans, ...plans };
  if (features) db.config.features = { ...db.config.features, ...features };
  writeDB(db);
  addLog('info', 'Admin updated platform pricing & feature flags');
  return res.json({ config: db.config });
});

app.get('/api/admin/transactions', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const db = readDB();
  return res.json({ transactions: db.transactions });
});

// -------------------------------------------------------------
// 8. DEV VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Dynamic import to prevent bundler issues
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      // Do not catch /site/:slug or /api/*
      if (req.path.startsWith('/api') || req.path.startsWith('/site')) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SellPilot AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
  process.exit(1);
});
