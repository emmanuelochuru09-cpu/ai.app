import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Share2,
  Sparkles,
  Calendar,
  Video,
  Instagram,
  Facebook,
  MessageSquare,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  AlertCircle,
  Tag,
} from 'lucide-react';

export const SocialCreatorView: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [businessType, setBusinessType] = useState(user?.businessType || 'Fashion & Clothing Vendor');
  const [targetAudience, setTargetAudience] = useState('');
  const [writingStyle, setWritingStyle] = useState('Vibrant, Relatable & High-Converting');
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('Drive WhatsApp Sales Inquiries');

  const [activeTab, setActiveTab] = useState<'all' | 'instagram' | 'tiktok' | 'calendar' | 'whatsapp'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setLoading(true);
    setError(null);

    try {
      const res = await api.generateSocial({
        businessType,
        targetAudience,
        writingStyle,
        topic,
        goal,
      });
      setResult(res.result);
      refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Social media generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLibrary = async (title: string, data: any, key: string) => {
    try {
      await api.saveContent({
        title,
        type: 'social',
        data,
      });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2500);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div>
        <div className="text-xs text-slate-400">
          <span>Organic Marketing Engine</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Multi-Channel Content System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          AI Social Media Content Creator
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Instantly craft Instagram carousels, TikTok video scripts, WhatsApp broadcast copy, and a complete 7-day content calendar.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form (5 cols) & Output (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 bg-[#0B101B] border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Content Blueprint</h2>

          {/* Business Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business Category</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Fashion & Clothing Vendor">Fashion & Clothing Vendor</option>
              <option value="Restaurant & Food Vendor">Restaurant & Food Vendor</option>
              <option value="Cleaning & Facility Services">Cleaning & Facility Services</option>
              <option value="Real Estate Agent & Property">Real Estate Agent & Property</option>
              <option value="Freelancer & Creative Consultant">Freelancer & Creative Consultant</option>
              <option value="Online Retail Store">Online Retail Store</option>
              <option value="Digital Marketing Agency">Digital Marketing Agency</option>
              <option value="Beauty, Hair & Skincare">Beauty, Hair & Skincare</option>
              <option value="Tech Startup & Software">Tech Startup & Software</option>
            </select>
          </div>

          {/* Topic / Offer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Focus Topic or Product Focus</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. New weekend arrival luxury Senator collection"
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
              placeholder="e.g. Men aged 25-45 looking for prestigious event wear"
            />
          </div>

          {/* Writing Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Writing Style</label>
            <select
              value={writingStyle}
              onChange={(e) => setWritingStyle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Vibrant, Relatable & High-Converting">Vibrant, Relatable & High-Converting</option>
              <option value="Luxury, Minimalist & Elite">Luxury, Minimalist & Elite</option>
              <option value="Direct-Response & Urgency">Direct-Response & Urgency</option>
              <option value="Storytelling & Behind The Scenes">Storytelling & Behind The Scenes</option>
              <option value="Educational & Authority Building">Educational & Authority Building</option>
            </select>
          </div>

          {/* Primary Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Campaign Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Drive WhatsApp Sales Inquiries">Drive WhatsApp Sales Inquiries</option>
              <option value="Flash Sale Weekend Orders">Flash Sale Weekend Orders</option>
              <option value="Build Trust & Showcase Customer Reviews">Build Trust & Showcase Customer Reviews</option>
              <option value="Viral Reach & Social Shares">Viral Reach & Social Shares</option>
              <option value="Promote Brand Heritage">Promote Brand Heritage</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating Content Suite...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Social Content Suite
              </>
            )}
          </button>
        </form>

        {/* Results Area */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-12 text-center">
              <Share2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Content Generated Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Customize your business category and topic on the left to generate complete video scripts, Instagram posts, WhatsApp messages, and a 7-day calendar.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <h3 className="text-sm font-semibold text-white">Generating multi-channel content...</h3>
              <p className="text-xs text-slate-400">Crafting viral hooks, video scripts, and calendar pacing.</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Filter Tabs (Interactive Segmented Control) */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
                {[
                  { id: 'all', label: 'All Content' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'tiktok', label: 'TikTok Video' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'calendar', label: '7-Day Calendar' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Instagram Card */}
              {(activeTab === 'all' || activeTab === 'instagram') && result.instagramPost && (
                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Instagram Post & Carousel</h3>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${result.instagramPost.hook}\n\n${result.instagramPost.body}\n\n${result.instagramPost.hashtags?.join(' ')}`,
                          'ig-full'
                        )
                      }
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'ig-full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">Hook (Slide 1)</div>
                    <p className="text-xs font-semibold text-white">{result.instagramPost.hook}</p>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Caption Body</div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap">{result.instagramPost.body}</p>
                  </div>

                  {result.instagramPost.carouselSlides && result.instagramPost.carouselSlides.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Carousel Slide Breakdown</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.instagramPost.carouselSlides.map((slide: string, i: number) => (
                          <div key={i} className="p-2.5 bg-slate-900/40 border border-slate-800/80 rounded text-xs text-slate-300">
                            <span className="font-mono text-indigo-400 font-bold mr-1">Slide {i + 1}:</span>
                            {slide}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap gap-1.5">
                    {result.instagramPost.hashtags?.map((tag: string, i: number) => (
                      <span key={i} className="text-slate-400">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* TikTok / Short Video Script */}
              {(activeTab === 'all' || activeTab === 'tiktok') && result.tikTokConcept && (
                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">TikTok / Reels Video Concept & Script</h3>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `Hook: ${result.tikTokConcept.videoHook}\nVisual: ${result.tikTokConcept.visualScene}\nScript: ${result.tikTokConcept.audioScript}\nCTA: ${result.tikTokConcept.cta}`,
                          'tiktok-full'
                        )
                      }
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'tiktok-full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Script
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">0-3s Visual & Audio Hook</div>
                      <p className="text-xs font-bold text-white mt-1">"{result.tikTokConcept.videoHook}"</p>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Scene / Visual Action</div>
                      <p className="text-xs text-slate-300 mt-1">{result.tikTokConcept.visualScene}</p>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">Voiceover Audio Script</div>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">{result.tikTokConcept.audioScript}</p>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                      <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">Call to Action</div>
                      <p className="text-xs font-semibold text-white mt-1">{result.tikTokConcept.cta}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Broadcast */}
              {(activeTab === 'all' || activeTab === 'whatsapp') && result.whatsAppBroadcast && (
                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">WhatsApp Broadcast Promo Message</h3>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${result.whatsAppBroadcast.teaser}\n\n${result.whatsAppBroadcast.offerDetails}\n\n${result.whatsAppBroadcast.replyInstructions}`,
                          'wa-broadcast'
                        )
                      }
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                    >
                      {copiedKey === 'wa-broadcast' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy Message
                    </button>
                  </div>

                  <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-lg text-xs text-emerald-100 font-mono whitespace-pre-wrap leading-relaxed">
                    {result.whatsAppBroadcast.teaser}
                    {'\n\n'}
                    {result.whatsAppBroadcast.offerDetails}
                    {'\n\n'}
                    {result.whatsAppBroadcast.replyInstructions}
                  </div>
                </div>
              )}

              {/* 7-Day Content Calendar */}
              {(activeTab === 'all' || activeTab === 'calendar') && result.weeklyCalendar && (
                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">7-Day High-Conversion Content Calendar</h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {result.weeklyCalendar.map((item: any, i: number) => (
                      <div key={i} className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold font-mono text-indigo-400 w-16">{item.day}</span>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{item.theme}</div>
                            <div className="text-[11px] text-slate-400">{item.captionOutline}</div>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0 font-medium">{item.contentType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={() => handleSaveToLibrary(`${user?.businessName} Social Media Toolkit`, result, 'save-social')}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {savedKey === 'save-social' ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Saved To Content Library!
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-indigo-400" />
                    Save Full Social Media Suite to Library
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
