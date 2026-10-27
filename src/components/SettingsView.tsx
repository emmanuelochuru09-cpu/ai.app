import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  Sliders,
  Building,
  User,
  CreditCard,
  Check,
  RefreshCw,
  AlertCircle,
  Shield,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateUserInState } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [businessType, setBusinessType] = useState(user?.businessType || 'Small Business');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>(user?.currency || 'NGN');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await api.updateProfile({
        fullName,
        businessName,
        businessType,
        currency,
      });
      updateUserInState(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="border-b border-slate-800 pb-6">
        <div className="text-xs text-slate-400">
          <span>Account Preferences</span>
          <span aria-hidden="true" className="mx-2">·</span>
          <span>Business Identity</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Business Profile Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-xl">
          Customize your commercial branding, business category, and default accounting currency.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile and commercial configuration updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#0B101B] border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business / Commercial Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Owner Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Email (Verified)</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-500 font-mono cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Industry / Business Category</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Fashion & Clothing Vendor">Fashion & Clothing Vendor</option>
                <option value="Restaurant & Food Vendor">Restaurant & Food Vendor</option>
                <option value="Cleaning & Facility Services">Cleaning & Facility Services</option>
                <option value="Real Estate Agent & Property">Real Estate Agent & Property</option>
                <option value="Freelancer & Creative Consultant">Freelancer & Creative Consultant</option>
                <option value="Online Retail Store">Online Retail Store</option>
                <option value="Digital Marketing Agency">Digital Marketing Agency</option>
                <option value="Technology & SaaS">Technology & SaaS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              'Save Profile Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
