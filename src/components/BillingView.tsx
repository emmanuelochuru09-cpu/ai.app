import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  Globe,
  Sparkles,
  Users,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const BillingView: React.FC = () => {
  const { user, plansConfig, refreshUser } = useAuth();
  const [currency, setCurrency] = useState<'NGN' | 'USD'>(user?.currency || 'NGN');
  const [billingProvider, setBillingProvider] = useState<'Paystack' | 'Flutterwave'>('Paystack');

  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paymentModalData, setPaymentModalData] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currencySymbol = currency === 'USD' ? '$' : '₦';

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      subtitle: 'For entrepreneurs and new businesses starting out',
      priceNGN: 0,
      priceUSD: 0,
      aiCredits: plansConfig?.free?.aiCredits || 25,
      features: [
        '25 monthly AI marketing credits',
        'Basic AI advertisement generator',
        'Social media caption drafts',
        'Essential customer CRM (up to 20 leads)',
        'Standard dashboard analytics',
      ],
      limitations: [
        'No business website generator',
        'No multi-channel 7-day calendar',
        'Community support only',
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro Growth',
      subtitle: 'For active vendors, online stores & freelancers scaling sales',
      priceNGN: plansConfig?.pro?.priceNGN || 15000,
      priceUSD: plansConfig?.pro?.priceUSD || 19,
      aiCredits: plansConfig?.pro?.aiCredits || 300,
      features: [
        '300 monthly AI marketing credits',
        'Full AI Advertisement Generator (All channels)',
        'Viral TikTok video concepts & scripts',
        '7-Day social content calendar',
        'Business Website Generator & Live Hosting',
        'Unlimited CRM Leads & WhatsApp click-to-chat',
        'Direct WhatsApp business reply suite',
        'CSV Export for customer data',
      ],
      limitations: ['Single business profile'],
      popular: true,
    },
    {
      id: 'business',
      name: 'Business Scale',
      subtitle: 'For established brands, agencies & multi-location companies',
      priceNGN: plansConfig?.business?.priceNGN || 45000,
      priceUSD: plansConfig?.business?.priceUSD || 49,
      aiCredits: plansConfig?.business?.aiCredits || 2500,
      features: [
        '2,500 monthly AI marketing credits',
        'Everything in Pro Growth',
        'Team collaboration & multi-seat access',
        'Multiple business profiles & brands',
        'Up to 15 live hosted business websites',
        'Priority AI model processing',
        'Dedicated VIP WhatsApp onboarding support',
        'Advanced revenue & acquisition reporting',
      ],
      limitations: [],
      popular: false,
    },
  ];

  const handleInitiateUpgrade = async (planId: string) => {
    if (planId === 'free' || planId === user?.plan) return;
    setProcessingPlan(planId);
    setError(null);
    setSuccessMessage(null);

    try {
      const initData = await api.initBilling({
        plan: planId,
        provider: billingProvider,
        currency,
      });
      setPaymentModalData(initData);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize payment.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleSimulatePaymentConfirmation = async () => {
    if (!paymentModalData) return;
    setVerifying(true);
    setError(null);

    try {
      // Calls server-side verification endpoint
      const result = await api.verifyBilling(paymentModalData.reference);
      setSuccessMessage(result.message);
      setPaymentModalData(null);
      await refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Payment verification failed on the server.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs text-slate-400">
            <span>Subscription & Billing</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Current Plan: <span className="font-bold text-white capitalize">{user?.plan}</span></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Predictable Pricing for Growing Businesses
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Choose a plan tailored to your sales volume. Upgrade or downgrade anytime with local Nigerian or international payment cards.
          </p>
        </div>

        {/* Currency Switcher (Interactive Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setCurrency('NGN')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              currency === 'NGN' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            ₦ NGN (Nigeria)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              currency === 'USD' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            $ USD (Global)
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Current Subscription Status Strip */}
      <div className="bg-[#0B101B] border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Active Subscription Status</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-xl font-bold text-white capitalize">{user?.plan} Tier</h2>
            <span className="text-xs text-slate-400">
              ({user ? user.aiCreditsLimit - user.aiCreditsUsed : 0} credits remaining this cycle)
            </span>
          </div>
          {user?.planExpiresAt && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Next renewal on: {new Date(user.planExpiresAt).toLocaleDateString()}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">Supported Gateways</div>
            <div className="text-xs font-bold text-slate-300">Paystack · Flutterwave · Cards · USSD</div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => {
          const isCurrent = user?.plan === p.id;
          const price = currency === 'USD' ? p.priceUSD : p.priceNGN;

          return (
            <div
              key={p.id}
              className={`bg-[#0B101B] border rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                p.popular
                  ? 'border-indigo-500/80 shadow-lg shadow-indigo-950/20'
                  : 'border-slate-800'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{p.subtitle}</p>
                </div>

                <div className="py-2 border-y border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                      {currencySymbol}{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ month</span>
                  </div>
                  <div className="text-xs text-indigo-400 font-mono mt-1 tabular-nums">
                    {p.aiCredits.toLocaleString()} AI generation credits / mo
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2">
                  <div className="text-xs font-semibold text-slate-300">Included capabilities:</div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {p.limitations.map((l, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-500">
                        <span className="text-slate-600 font-bold">✕</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-xs font-bold cursor-default"
                  >
                    Current Plan
                  </button>
                ) : p.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold cursor-default"
                  >
                    Included
                  </button>
                ) : (
                  <button
                    onClick={() => handleInitiateUpgrade(p.id)}
                    disabled={processingPlan === p.id}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                      p.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                    }`}
                  >
                    {processingPlan === p.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Initializing Gateway...
                      </>
                    ) : (
                      <>
                        Upgrade to {p.name}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paystack / Flutterwave Secure Checkout Simulation Modal */}
      {paymentModalData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Paystack / Card Checkout
                </h3>
              </div>
              <button onClick={() => setPaymentModalData(null)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Email:</span>
                <span className="font-semibold text-white">{paymentModalData.userEmail}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Selected Plan:</span>
                <span className="font-semibold text-white capitalize">{paymentModalData.plan} Tier</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Payment Reference:</span>
                <span className="font-mono text-indigo-400">{paymentModalData.reference}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span className="text-sm font-bold text-white">Total Amount Due:</span>
                <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                  {paymentModalData.currency === 'USD' ? '$' : '₦'}
                  {paymentModalData.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/30 border border-indigo-800/30 rounded-lg text-[11px] text-indigo-200 leading-relaxed">
              <strong>Server Verification Protection:</strong> Once submitted, SellPilot verifies the transaction with the payment gateway on our server before granting subscription credits.
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalData(null)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatePaymentConfirmation}
                disabled={verifying}
                className="w-1/2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Verifying on Server...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Confirm & Activate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
