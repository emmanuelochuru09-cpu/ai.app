import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lead, SavedContent, WebsiteDraft } from '../types';
import { api } from '../api';
import {
  Sparkles,
  TrendingUp,
  Users,
  Megaphone,
  CreditCard,
  Plus,
  ArrowUpRight,
  MessageSquare,
  Globe,
  FileText,
  Clock,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenNewLeadModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenNewLeadModal }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [content, setContent] = useState<SavedContent[]>([]);
  const [websites, setWebsites] = useState<WebsiteDraft[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, contentRes, webRes] = await Promise.all([
        api.getLeads(),
        api.getContent(),
        api.getWebsites(),
      ]);
      setLeads(leadsRes.leads || []);
      setContent(contentRes.content || []);
      setWebsites(webRes.websites || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user) return null;

  // Real data calculations
  const currencySymbol = user.currency === 'USD' ? '$' : '₦';
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === 'Converted');
  const activePipelineLeads = leads.filter((l) => l.status === 'Interested' || l.status === 'Contacted');

  // Real converted revenue recorded by user in CRM
  const realConvertedRevenue = convertedLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);
  // Real active pipeline value
  const realPipelineValue = activePipelineLeads.reduce((acc, curr) => acc + (curr.dealValue || 0), 0);

  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads.length / totalLeads) * 100) : 0;

  // Source breakdown
  const sourceCounts: Record<string, number> = {};
  leads.forEach((l) => {
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });

  // Published websites count
  const liveWebsitesCount = websites.filter((w) => w.isPublished).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. Welcome Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs text-slate-400">
            <span>{user.businessType}</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span className="capitalize">{user.plan} Tier</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Active Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Welcome back, {user.fullName.split(' ')[0]}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            {user.businessName} performance overview, marketing outputs, customer pipeline, and sales automation.
          </p>
        </div>

        {/* Quick Action Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('ads')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Megaphone className="w-3.5 h-3.5" />
            Generate AI Ad
          </button>
          <button
            onClick={() => onNavigate('social')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Social Content
          </button>
          <button
            onClick={onOpenNewLeadModal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Log New Lead
          </button>
        </div>
      </div>

      {/* 2. Core Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real Converted Sales */}
        <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recorded Closed Sales</span>
            <span className="text-[11px] text-emerald-400 font-medium">CRM Verified</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {currencySymbol}{realConvertedRevenue.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>{convertedLeads.length} deals closed</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>{conversionRate}% conversion</span>
          </div>
        </div>

        {/* Active Pipeline Value */}
        <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {currencySymbol}{realPipelineValue.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>{activePipelineLeads.length} in negotiation</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>Potential deals</span>
          </div>
        </div>

        {/* Customer Leads & Enquiries */}
        <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Customer Inquiries</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{totalLeads}</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>WhatsApp & Web Inbound</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <button onClick={() => onNavigate('leads')} className="text-indigo-400 hover:underline">View CRM</button>
          </div>
        </div>

        {/* AI Credits & Subscription */}
        <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monthly AI Credits</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {user.aiCreditsLimit - user.aiCreditsUsed}
            </span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">/ {user.aiCreditsLimit}</span>
          </div>
          <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
            <span className="capitalize">{user.plan} Plan</span>
            <button onClick={() => onNavigate('billing')} className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Manage Billing
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Lead Pipeline & Quick AI Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Leads & Follow-ups (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div>
                <h2 className="text-base font-bold text-white">Recent Customer Leads</h2>
                <p className="text-xs text-slate-400 mt-0.5">Direct buyer inquiries tracked across platforms.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('leads')}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  Open CRM
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading leads data...</div>
            ) : leads.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">No customer leads logged yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Start logging your inbound customer inquiries from WhatsApp, Instagram, or your website to track conversions.
                </p>
                <button
                  onClick={onOpenNewLeadModal}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log First Customer Lead
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800/80">
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Source</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Value</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3">
                          <div className="font-semibold text-slate-200">{lead.fullName}</div>
                          <div className="text-[11px] text-slate-400">{lead.phone || lead.email || 'No direct phone'}</div>
                        </td>
                        <td className="py-3 text-slate-300">{lead.source}</td>
                        <td className="py-3">
                          <span
                            className={`font-medium ${
                              lead.status === 'Converted'
                                ? 'text-emerald-400'
                                : lead.status === 'Interested'
                                ? 'text-indigo-400'
                                : lead.status === 'Contacted'
                                ? 'text-sky-400'
                                : lead.status === 'New'
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums text-slate-200">
                          {lead.dealValue > 0 ? `${currencySymbol}${lead.dealValue.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 text-right">
                          {lead.phone ? (
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${lead.fullName}, thank you for reaching out to ${user.businessName}!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              WhatsApp
                            </a>
                          ) : (
                            <button
                              onClick={() => onNavigate('leads')}
                              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Lead Source Distribution Card */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-1">Customer Channel Acquisition</h2>
            <p className="text-xs text-slate-400 mb-4">Where your leads and buyer enquiries are originating from.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['WhatsApp', 'Instagram', 'Website', 'Referral'].map((source) => {
                const count = sourceCounts[source] || 0;
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={source} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
                    <div className="text-xs text-slate-400">{source}</div>
                    <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">{count}</div>
                    <div className="text-[11px] text-indigo-400 tabular-nums mt-0.5">{pct}% of inquiries</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Automation Hub & Marketing Content (1 col) */}
        <div className="space-y-6">
          {/* Quick AI Launchpad */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">AI Growth Tools</h2>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('ads')}
                className="w-full text-left p-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-800/40 transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-md bg-indigo-900/40 border border-indigo-700/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white">AI Ad Generator</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">Headlines, captions & angles for Instagram/TikTok</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('social')}
                className="w-full text-left p-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-800/40 transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-md bg-sky-900/40 border border-sky-700/40 text-sky-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white">Social Media Studio</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">Carousels, 7-day calendar & TikTok hooks</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('whatsapp')}
                className="w-full text-left p-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-800/40 transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-md bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white">WhatsApp Business Suite</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">Customer replies, follow-ups & objection handlers</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('assistant')}
                className="w-full text-left p-3 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-800/40 transition-all flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-md bg-purple-900/40 border border-purple-700/40 text-purple-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 group-hover:text-white">AI Business Advisor</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1">Pragmatic marketing & strategy advice</div>
                </div>
              </button>
            </div>
          </div>

          {/* Website Status Card */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white">Business Website</h2>
              <Globe className="w-4 h-4 text-slate-400" />
            </div>

            {websites.length > 0 ? (
              <div className="space-y-3">
                {websites.slice(0, 1).map((w) => (
                  <div key={w.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">{w.businessName}</span>
                      <span className={`text-[11px] font-semibold ${w.isPublished ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {w.isPublished ? 'Live & Hosted' : 'Draft'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-1">/site/{w.slug}</div>

                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800 text-xs">
                      {w.isPublished ? (
                        <a
                          href={`/site/${w.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
                        >
                          Visit Live Site
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => onNavigate('website')}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Publish Now
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate('website')}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        Edit Design
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-400">
                  You haven't generated a website yet. Create a professional mobile-friendly website draft with a WhatsApp order button.
                </p>
                <button
                  onClick={() => onNavigate('website')}
                  className="mt-3 w-full py-2 text-xs font-semibold text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Generate Website Draft
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
