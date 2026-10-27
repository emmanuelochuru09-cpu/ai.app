import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminMetrics, SystemConfig, SystemLog, Transaction, User } from '../types';
import { api } from '../api';
import {
  ShieldCheck,
  Users,
  CreditCard,
  DollarSign,
  Activity,
  AlertTriangle,
  Settings,
  RefreshCw,
  Check,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Save,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans' | 'transactions' | 'logs'>('overview');
  const [savingPlan, setSavingPlan] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, usersRes, txRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getAdminTransactions(),
      ]);
      setMetrics(metricsRes.metrics);
      setConfig(metricsRes.config);
      setLogs(metricsRes.logs || []);
      setUsersList(usersRes.users || []);
      setTransactions(txRes.transactions || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUpdateUserPlan = async (userId: string, newPlan: string) => {
    try {
      const res = await api.updateUserPlan(userId, { plan: newPlan });
      setUsersList((prev) => prev.map((u) => (u.id === userId ? res.user : u)));
    } catch (err: any) {
      alert(`Failed to update user plan: ${err.message}`);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSavingPlan(true);
    try {
      const res = await api.updatePlansConfig({ plans: config.plans, features: config.features });
      setConfig(res.config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`Config update failed: ${err.message}`);
    } finally {
      setSavingPlan(false);
    }
  };

  if (user?.role !== 'admin' && user?.email !== 'emmanuelochuru09@gmail.com') {
    return (
      <div className="p-12 text-center max-w-md mx-auto">
        <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400 mt-1">
          Only the authorized system owner can access this management portal.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>SellPilot System Command</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Owner: {user.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Monitor real platform registrations, subscription revenue, AI credit usage, system error logs, and feature limits.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'Accounts' },
            { id: 'plans', label: 'Pricing & Limits' },
            { id: 'transactions', label: 'Payments' },
            { id: 'logs', label: 'Error Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading system management metrics...</div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Registered Accounts</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                    {metrics.totalUsers}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    {metrics.planBreakdown.pro} Pro · {metrics.planBreakdown.business} Business · {metrics.planBreakdown.free} Free
                  </div>
                </div>

                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Verified Revenue (NGN)</span>
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-2 tabular-nums">
                    ₦{metrics.revenue.NGN.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Paystack & Flutterwave collections</div>
                </div>

                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Total AI Generations</span>
                    <Activity className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                    {metrics.totalAICreditsUsed}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">Across Ads, Social & Website engines</div>
                </div>

                <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Hosted Websites & Leads</span>
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2 tabular-nums">
                    {metrics.publishedWebsites} live / {metrics.totalLeads} leads
                  </div>
                  <div className="text-xs text-slate-400 mt-2">CRM buyer records active</div>
                </div>
              </div>

              {/* Quick Log Digest */}
              <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live System Activity</h3>
                  <button onClick={loadAdminData} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                  </button>
                </div>
                <div className="space-y-2">
                  {logs.slice(0, 5).map((l) => (
                    <div key={l.id} className="text-xs flex items-center justify-between py-1.5 border-b border-slate-800/40">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            l.level === 'error' ? 'bg-red-400' : l.level === 'warn' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                        />
                        <span className="text-slate-200">{l.message}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                        {new Date(l.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTERED ACCOUNTS */}
          {activeTab === 'users' && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">User / Business</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Plan</th>
                      <th className="py-3 px-4 font-semibold">AI Credits Used</th>
                      <th className="py-3 px-4 font-semibold">Joined Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Adjust Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{u.fullName}</div>
                          <div className="text-[11px] text-slate-400">{u.businessName}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-4 text-slate-400">{u.businessType}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold capitalize ${
                              u.plan === 'business'
                                ? 'text-purple-400'
                                : u.plan === 'pro'
                                ? 'text-indigo-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {u.plan}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                          {u.aiCreditsUsed} / {u.aiCreditsLimit}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={u.plan}
                            onChange={(e) => handleUpdateUserPlan(u.id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="business">Business</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & LIMITS CONFIGURATION */}
          {activeTab === 'plans' && config && (
            <form onSubmit={handleSaveConfig} className="bg-[#0B101B] border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Subscription Tier Pricing & Usage Limits</h3>
                  <p className="text-xs text-slate-400">Configure public pricing in NGN and USD, plus credit allowances.</p>
                </div>
                {saveSuccess && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Changes saved!
                  </span>
                )}
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Starter */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Free Starter Plan</h4>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Monthly AI Credits</label>
                    <input
                      type="number"
                      value={config.plans.free.aiCredits}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          plans: {
                            ...config.plans,
                            free: { ...config.plans.free, aiCredits: parseInt(e.target.value, 10) || 0 },
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Pro Growth */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Pro Growth Plan</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Price (₦ NGN)</label>
                      <input
                        type="number"
                        value={config.plans.pro.priceNGN}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            plans: {
                              ...config.plans,
                              pro: { ...config.plans.pro, priceNGN: parseInt(e.target.value, 10) || 0 },
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Price ($ USD)</label>
                      <input
                        type="number"
                        value={config.plans.pro.priceUSD}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            plans: {
                              ...config.plans,
                              pro: { ...config.plans.pro, priceUSD: parseInt(e.target.value, 10) || 0 },
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Monthly AI Credits</label>
                    <input
                      type="number"
                      value={config.plans.pro.aiCredits}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          plans: {
                            ...config.plans,
                            pro: { ...config.plans.pro, aiCredits: parseInt(e.target.value, 10) || 0 },
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Business Scale */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Business Scale Plan</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Price (₦ NGN)</label>
                      <input
                        type="number"
                        value={config.plans.business.priceNGN}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            plans: {
                              ...config.plans,
                              business: { ...config.plans.business, priceNGN: parseInt(e.target.value, 10) || 0 },
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Price ($ USD)</label>
                      <input
                        type="number"
                        value={config.plans.business.priceUSD}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            plans: {
                              ...config.plans,
                              business: { ...config.plans.business, priceUSD: parseInt(e.target.value, 10) || 0 },
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Monthly AI Credits</label>
                    <input
                      type="number"
                      value={config.plans.business.aiCredits}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          plans: {
                            ...config.plans,
                            business: { ...config.plans.business, aiCredits: parseInt(e.target.value, 10) || 0 },
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={savingPlan}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {savingPlan ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Pricing Configuration
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">User Email</th>
                      <th className="py-3 px-4 font-semibold">Reference</th>
                      <th className="py-3 px-4 font-semibold">Gateway</th>
                      <th className="py-3 px-4 font-semibold">Plan</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 text-white font-medium">{tx.userEmail}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-indigo-400">{tx.reference}</td>
                        <td className="py-3 px-4 text-slate-300">{tx.provider}</td>
                        <td className="py-3 px-4 capitalize font-semibold text-slate-200">{tx.plan}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-bold">
                          {tx.currency === 'USD' ? '$' : '₦'}{tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-bold text-[11px] ${
                              tx.status === 'success' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {tx.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM ERROR LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">System Operation & Error Audit Trail</h3>
                <span className="text-xs text-slate-400 font-mono tabular-nums">{logs.length} events logged</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      log.level === 'error'
                        ? 'bg-red-950/20 border-red-800/40 text-red-300'
                        : log.level === 'warn'
                        ? 'bg-amber-950/20 border-amber-800/40 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold mr-2 uppercase text-[10px]">[{log.level}]</span>
                      <span>{log.message}</span>
                      {log.details && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
