import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { WebsiteDraft } from '../types';
import { api } from '../api';
import {
  Globe,
  Sparkles,
  ExternalLink,
  Smartphone,
  Monitor,
  Check,
  RefreshCw,
  AlertCircle,
  Plus,
  Trash2,
  Share2,
  Lock,
} from 'lucide-react';

export const WebsiteGeneratorView: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [websites, setWebsites] = useState<WebsiteDraft[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<WebsiteDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishSuccessUrl, setPublishSuccessUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [error, setError] = useState<string | null>(null);

  // New Generation Form inputs
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [industry, setIndustry] = useState(user?.businessType || 'Fashion & Clothing');
  const [description, setDescription] = useState('');
  const [keyOfferings, setKeyOfferings] = useState('');
  const [phone, setPhone] = useState('+234 803 241 8892');
  const [whatsapp, setWhatsapp] = useState('2348032418892');
  const [preferredColor, setPreferredColor] = useState('#2563EB');

  const loadWebsites = async () => {
    setLoading(true);
    try {
      const res = await api.getWebsites();
      setWebsites(res.websites || []);
      if (res.websites && res.websites.length > 0 && !selectedWebsite) {
        setSelectedWebsite(res.websites[0]);
      }
    } catch (err: any) {
      console.error('Failed to load websites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebsites();
  }, []);

  const handleGenerateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.plan === 'free') {
      setError('The Business Website Generator requires a Pro or Business subscription. Please upgrade to create and publish websites.');
      return;
    }

    setGenerating(true);
    setError(null);
    setPublishSuccessUrl(null);

    try {
      const res = await api.generateWebsite({
        businessName,
        industry,
        description,
        keyOfferings,
        phone,
        whatsapp,
        preferredColor,
      });
      setSelectedWebsite(res.website);
      setWebsites((prev) => [res.website, ...prev]);
      refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate website draft.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedWebsite) return;
    setPublishing(true);
    setError(null);

    try {
      const res = await api.publishWebsite(selectedWebsite.id);
      setSelectedWebsite(res.website);
      setPublishSuccessUrl(res.liveUrl);
      setWebsites((prev) => prev.map((w) => (w.id === res.website.id ? res.website : w)));
    } catch (err: any) {
      setError(err?.message || 'Failed to publish website.');
    } finally {
      setPublishing(false);
    }
  };

  const handleUpdateField = async (field: string, value: any) => {
    if (!selectedWebsite) return;
    const updated = { ...selectedWebsite, [field]: value };
    setSelectedWebsite(updated);
    try {
      await api.updateWebsite(selectedWebsite.id, { [field]: value });
      setWebsites((prev) => prev.map((w) => (w.id === selectedWebsite.id ? updated : w)));
    } catch (err) {
      console.error('Failed to autosave website edit:', err);
    }
  };

  const isFreePlan = user?.plan === 'free';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs text-slate-400">
            <span>Online Presence Engine</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Mobile-First Instant Website & Hosting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Business Website Generator & Publisher
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Create high-converting, mobile-ready websites with services, pricing, customer reviews, and direct WhatsApp sales links.
          </p>
        </div>

        {selectedWebsite && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded transition-colors ${previewMode === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                title="Desktop Viewport"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded transition-colors ${previewMode === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
                title="Mobile Viewport"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handlePublish}
              disabled={publishing || isFreePlan}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {publishing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Publishing to Live URL...
                </>
              ) : selectedWebsite.isPublished ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  Update Published Site
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  Publish Live Website
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Free Plan Lock Banner */}
      {isFreePlan && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-indigo-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Website Generator is a Pro & Business feature.</span>
              <p className="text-indigo-300 mt-0.5">Upgrade your subscription to create and host live websites with your own WhatsApp ordering flow.</p>
            </div>
          </div>
          <button
            onClick={() => (window.location.hash = '#billing')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shrink-0 whitespace-nowrap"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Published URL banner */}
      {selectedWebsite?.isPublished && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Your website is LIVE on SellPilot hosting!</span>
              <p className="text-emerald-300 font-mono mt-0.5">/site/{selectedWebsite.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/site/${selectedWebsite.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              Open Live Site
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Layout: Builder / Editor & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Website Generation & Edit Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Generator Tab / Controls */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              {selectedWebsite ? 'Edit Website Content' : 'Generate New Website Draft'}
            </h2>

            {!selectedWebsite ? (
              <form onSubmit={handleGenerateWebsite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Story & Offering</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Tell AI about your products, quality, and what sets your business apart..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="e.g. 2348032418892"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={preferredColor}
                        onChange={(e) => setPreferredColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono text-slate-300">{preferredColor}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generating || isFreePlan}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating Website Structure & Copy...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Website Draft
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={selectedWebsite.businessName}
                    onChange={(e) => handleUpdateField('businessName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={selectedWebsite.tagline}
                    onChange={(e) => handleUpdateField('tagline', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Main Headline</label>
                  <input
                    type="text"
                    value={selectedWebsite.heroHeadline}
                    onChange={(e) => handleUpdateField('heroHeadline', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={selectedWebsite.heroSubheadline}
                    onChange={(e) => handleUpdateField('heroSubheadline', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">About Story</label>
                  <textarea
                    rows={4}
                    value={selectedWebsite.aboutStory}
                    onChange={(e) => handleUpdateField('aboutStory', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Order Phone</label>
                    <input
                      type="text"
                      value={selectedWebsite.whatsapp}
                      onChange={(e) => handleUpdateField('whatsapp', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Theme Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedWebsite.themeColor}
                        onChange={(e) => handleUpdateField('themeColor', e.target.value)}
                        className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono text-slate-300">{selectedWebsite.themeColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug</label>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono">
                    <span>/site/</span>
                    <input
                      type="text"
                      value={selectedWebsite.slug}
                      onChange={(e) => handleUpdateField('slug', e.target.value)}
                      className="bg-transparent text-white focus:outline-none flex-1 ml-1"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedWebsite(null)}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                >
                  + Generate Another Draft
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Responsive Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {selectedWebsite ? (
            <div
              className={`w-full transition-all duration-300 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${
                previewMode === 'mobile' ? 'max-w-sm border-4 border-slate-700' : 'max-w-full'
              }`}
            >
              {/* Browser Mockup Chrome Header */}
              <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="font-mono text-[11px] text-slate-400 truncate max-w-xs">
                  sellpilot.app/site/{selectedWebsite.slug}
                </div>
                <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  {selectedWebsite.isPublished ? 'Live' : 'Preview'}
                </div>
              </div>

              {/* Simulated Website Content Canvas */}
              <div className="bg-white text-slate-800 max-h-[680px] overflow-y-auto">
                {/* Navbar */}
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="font-extrabold text-sm text-slate-900 tracking-tight">{selectedWebsite.businessName}</div>
                  <a
                    href={`https://wa.me/${selectedWebsite.whatsapp}?text=Hello%20${selectedWebsite.businessName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-white px-3 py-1.5 rounded-md shadow-sm"
                    style={{ backgroundColor: selectedWebsite.themeColor }}
                  >
                    WhatsApp Us
                  </a>
                </div>

                {/* Hero */}
                <div className="px-6 py-12 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
                  <span
                    className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-slate-200 mb-3"
                    style={{ color: selectedWebsite.themeColor }}
                  >
                    {selectedWebsite.industry}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-lg mx-auto">
                    {selectedWebsite.heroHeadline}
                  </h1>
                  <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                    {selectedWebsite.heroSubheadline}
                  </p>
                  <div className="mt-5 flex justify-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white rounded-lg text-xs font-bold shadow-sm">
                      <span>💬</span> Inquire on WhatsApp
                    </span>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="p-6 border-b border-slate-200">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Featured Offerings</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedWebsite.tagline}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedWebsite.services || []).map((srv, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-slate-900">{srv.title}</h3>
                          <span className="text-xs font-mono font-bold" style={{ color: selectedWebsite.themeColor }}>
                            {srv.price}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{srv.description}</p>
                        <ul className="text-[10px] text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                          {(srv.features || []).map((f, fi) => (
                            <li key={fi} className="flex items-center gap-1">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* About Section */}
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide text-center mb-3">About Us</h2>
                  <p className="text-xs text-slate-700 leading-relaxed text-center max-w-md mx-auto">
                    {selectedWebsite.aboutStory}
                  </p>
                </div>

                {/* Testimonials */}
                {(selectedWebsite.testimonials || []).length > 0 && (
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide text-center mb-4">Customer Trust</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedWebsite.testimonials.map((t, idx) => (
                        <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
                          <p className="italic text-slate-600">"{t.quote}"</p>
                          <div className="mt-2 font-bold text-slate-900 text-[11px]">{t.name}</div>
                          <div className="text-[10px] text-slate-400">{t.role}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="p-6 bg-slate-900 text-white text-center text-xs space-y-2">
                  <div className="font-bold">{selectedWebsite.businessName}</div>
                  <div className="text-slate-400 text-[11px]">📍 {selectedWebsite.address}</div>
                  <div className="text-[10px] text-slate-500 pt-3 border-t border-slate-800">
                    Powered by SellPilot AI Website Engine
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-16 text-center max-w-md">
              <Globe className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Website Selected</h3>
              <p className="text-xs text-slate-400 mt-1">
                Fill in the details on the left to generate your first website draft.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
