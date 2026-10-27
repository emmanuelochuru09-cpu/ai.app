import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Megaphone,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Share2,
  DollarSign,
} from 'lucide-react';

export const AdGeneratorView: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [productOrService, setProductOrService] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [budget, setBudget] = useState('');
  const [tone, setTone] = useState('Persuasive & High-Converting');
  const [mainSellingPoint, setMainSellingPoint] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMissingKey, setIsMissingKey] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productOrService) {
      setError('Please provide a product or service description.');
      return;
    }

    setLoading(true);
    setError(null);
    setIsMissingKey(false);

    try {
      const res = await api.generateAd({
        businessName,
        productOrService,
        targetAudience,
        platform,
        budget,
        tone,
        mainSellingPoint,
      });
      setResult(res.result);
      refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate ad content.');
      if (err?.isMissingKey) {
        setIsMissingKey(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async (title: string, data: any, key: string) => {
    try {
      await api.saveContent({
        title,
        type: 'ad',
        platform,
        data,
      });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2500);
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs text-slate-400">
          <span>Campaign Automation</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Multi-Platform Direct Response</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          AI Advertisement Generator
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Generate high-converting headlines, ad copy, captions, and psychological angles for Instagram, Facebook, TikTok, and WhatsApp.
        </p>
      </div>

      {/* Missing API Key Warning */}
      {isMissingKey && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Gemini AI API Key Configuration Required
          </div>
          <p>
            SellPilot AI connects to Google's real Gemini API. In this environment, please make sure your <code className="bg-amber-950 px-1 py-0.5 rounded text-amber-300 font-mono">GEMINI_API_KEY</code> is set in the <strong>Settings &gt; Secrets</strong> panel to enable real server-side AI generation.
          </p>
        </div>
      )}

      {/* Error Notice */}
      {error && !isMissingKey && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Form (Left) & Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Panel (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 bg-[#0B101B] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Campaign Specifications</h2>

          {/* Business Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business / Brand Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Luxe Lagos Apparel"
            />
          </div>

          {/* Product / Service */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product or Service Description *</label>
            <textarea
              rows={3}
              value={productOrService}
              onChange={(e) => setProductOrService(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="e.g. Handcrafted ready-to-wear luxury kaftans and bespoke Senator suits tailored in Lagos with premium breathable fabrics."
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Modern professionals, wedding guests, diaspora buyers"
            />
          </div>

          {/* Platform & Budget Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ad Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="WhatsApp">WhatsApp Broadcast</option>
                <option value="Google Search">Google Search</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Budget (Optional)</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder={user?.currency === 'USD' ? '$50 / campaign' : '₦25,000 / week'}
              />
            </div>
          </div>

          {/* Desired Tone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tone of Voice</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Persuasive & High-Converting">Persuasive & High-Converting</option>
              <option value="Luxury & Exclusive">Luxury & Exclusive</option>
              <option value="Friendly, Warm & Relatable">Friendly, Warm & Relatable</option>
              <option value="Urgent & Limited-Time Promo">Urgent & Limited-Time Promo</option>
              <option value="Authoritative & Professional">Authoritative & Professional</option>
            </select>
          </div>

          {/* Main Selling Point */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Main Selling Point / Offer</label>
            <input
              type="text"
              value={mainSellingPoint}
              onChange={(e) => setMainSellingPoint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Free same-day delivery in Lagos & 15% discount for first orders"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Synthesizing Campaign Copy...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Ad Campaign Pack
              </>
            )}
          </button>
        </form>

        {/* Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-12 text-center">
              <Megaphone className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Ready to Create Your Campaign</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Fill in your product details on the left to generate tested headlines, body copy variations, social media captions, and psychological angles.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <h3 className="text-sm font-semibold text-white">Analyzing target audience and crafting ad variations...</h3>
              <p className="text-xs text-slate-400">Using Gemini 3.8 Flash model to compose direct-response copy.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Headlines Block */}
              <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">High-Converting Headlines</h3>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">4 variations</span>
                </div>
                <div className="space-y-2">
                  {result.headlines?.map((h: string, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-start justify-between gap-3 group">
                      <p className="text-xs font-semibold text-slate-200">{h}</p>
                      <button
                        onClick={() => copyToClipboard(h, `h-${idx}`)}
                        className="text-slate-400 hover:text-white shrink-0 p-1"
                        title="Copy headline"
                      >
                        {copiedKey === `h-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Captions */}
              <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{platform} Post Captions</h3>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">Ready to publish</span>
                </div>
                <div className="space-y-3">
                  {result.socialCaptions?.map((cap: string, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-lg space-y-3">
                      <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{cap}</p>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => copyToClipboard(cap, `cap-${idx}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 rounded flex items-center gap-1"
                        >
                          {copiedKey === `cap-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                        <button
                          onClick={() => handleSaveToLibrary(`${businessName} - ${platform} Caption #${idx + 1}`, { caption: cap, platform }, `save-cap-${idx}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 rounded flex items-center gap-1"
                        >
                          {savedKey === `save-cap-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Bookmark className="w-3 h-3" />}
                          Save to Library
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketing Angles & Audience Personas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-2.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">Psychological Angles</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.marketingAngles?.map((angle: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-400 font-bold">·</span>
                        <span>{angle}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-2.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">Target Audiences</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.audienceSegments?.map((seg: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-sky-400 font-bold">·</span>
                        <span>{seg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Calls to Action */}
              <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">Recommended Calls-to-Action (CTAs)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.ctas?.map((cta: string, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">"{cta}"</span>
                      <button
                        onClick={() => copyToClipboard(cta, `cta-${idx}`)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {copiedKey === `cta-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save All Button */}
              <button
                onClick={() => handleSaveToLibrary(`${businessName} Full Ad Campaign Pack`, result, 'save-full')}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {savedKey === 'save-full' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Saved Entire Pack to Content Library!
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-indigo-400" />
                    Save Complete Campaign Pack to Library
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
