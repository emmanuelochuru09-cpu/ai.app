import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  DollarSign,
  Clock,
  Send,
} from 'lucide-react';

export const WhatsAppSuiteView: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [toolType, setToolType] = useState('price_objection');
  const [customerQuery, setCustomerQuery] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [objection, setObjection] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toolPresets = [
    {
      id: 'price_objection',
      label: 'Price Objection Handler',
      defaultQuery: 'Customer says: "Your price is too high, can you give me 50% discount?"',
      defaultObjection: 'Customer compares our price to cheap mass-market alternatives.',
    },
    {
      id: 'customer_reply',
      label: 'Instant First Inquiry Reply',
      defaultQuery: 'Customer sends screenshot and asks: "Is this still available and how much?"',
      defaultObjection: 'Need fast professional confirmation and clear delivery terms.',
    },
    {
      id: 'follow_up',
      label: 'Polite 24h Follow-Up',
      defaultQuery: 'Customer asked for account details yesterday but went quiet.',
      defaultObjection: 'Gentle check-in without sounding desperate or annoying.',
    },
    {
      id: 'catalog_pitch',
      label: 'Catalog & VIP Drop Pitch',
      defaultQuery: 'Announce new weekly drop to existing saved contacts.',
      defaultObjection: 'Create excitement and urgency for limited quantities.',
    },
    {
      id: 'customer_service',
      label: 'Delivery & Customer Support',
      defaultQuery: 'Customer asks for delivery tracking status or express rider contact.',
      defaultObjection: 'Reassure buyer with delivery timelines.',
    },
  ];

  const handleSelectPreset = (preset: (typeof toolPresets)[0]) => {
    setToolType(preset.id);
    setCustomerQuery(preset.defaultQuery);
    setObjection(preset.defaultObjection);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.generateWhatsAppTools({
        toolType,
        customerQuery,
        productDetails: productDetails || user?.businessName,
        objection,
      });
      setResult(res.result);
      refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate WhatsApp templates.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs text-slate-400">
          <span>Direct Conversational Commerce</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>WhatsApp Conversion Scripts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          WhatsApp Business Suite
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Convert DM chats into paid orders with ready-to-copy customer replies, price objection counters, and follow-ups.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {toolPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSelectPreset(preset)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors border ${
              toolType === preset.id
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-[#0B101B] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Panel (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 bg-[#0B101B] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Script Parameters</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Customer Message / Inquiry *</label>
            <textarea
              rows={3}
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              required
              placeholder="Paste what the customer said or asked..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Specific Objection / Goal</label>
            <input
              type="text"
              value={objection}
              onChange={(e) => setObjection(e.target.value)}
              placeholder="e.g. Needs reassurance on delivery time, fabric authenticity"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Product / Price Context (Optional)</label>
            <input
              type="text"
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
              placeholder={`e.g. ${user?.businessName} Signature Kaftan: ₦45,000`}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Crafting WhatsApp Responses...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate 3 Response Styles
              </>
            )}
          </button>

          {/* Privacy & Anti-Spam Notice */}
          <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              SellPilot complies with WhatsApp messaging guidelines. Messages are formatted for 1-to-1 customer conversations. Do not send unsolicited spam.
            </span>
          </div>
        </form>

        {/* Results Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Message Templates Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Select a scenario above or enter a customer message to generate warm, direct, and promotional WhatsApp replies.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <h3 className="text-sm font-semibold text-white">Formulating persuasive response variations...</h3>
              <p className="text-xs text-slate-400">Balancing customer warmth with confident sales psychology.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {result.templates?.map((tmpl: any, idx: number) => (
                <div key={idx} className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs font-bold text-white">{tmpl.title}</h3>
                      <div className="text-[11px] text-emerald-400 font-medium">{tmpl.bestFor}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(tmpl.text, `wa-${idx}`)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded flex items-center gap-1"
                      >
                        {copiedKey === `wa-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy
                      </button>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(tmpl.text)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded flex items-center gap-1"
                        title="Open WhatsApp with this text prefilled"
                      >
                        <Send className="w-3 h-3" />
                        Send
                      </a>
                    </div>
                  </div>

                  {/* Message Bubble Simulator */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-xs text-emerald-100 font-mono whitespace-pre-wrap leading-relaxed">
                    {tmpl.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
