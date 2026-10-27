import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  X,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Check,
  ShieldCheck,
  Building,
  User,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose, onSuccess }) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Fashion & Clothing Vendor');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        onSuccess();
        onClose();
      } else if (mode === 'register') {
        await register({
          email,
          pass: password,
          fullName,
          businessName,
          businessType,
          currency,
        });
        onSuccess();
        onClose();
      } else if (mode === 'forgot') {
        const res = await api.resetPassword({ email, newPassword: password });
        setSuccessMsg(res.message);
        setMode('login');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setLoading(true);
    setError(null);
    try {
      await login(demoEmail, demoPass);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B101B] border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm mb-3 shadow-sm">
            SP
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' && 'Sign in to SellPilot AI'}
            {mode === 'register' && 'Create your business account'}
            {mode === 'forgot' && 'Reset your account password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Enter your credentials to access your marketing workspace.'}
            {mode === 'register' && 'Start generating AI ads, websites, and managing customer leads.'}
            {mode === 'forgot' && 'Provide your email and a new password to restore access.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="e.g. Amara Kalu"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  placeholder="e.g. Luxe Lagos Apparel"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Business Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Fashion & Clothing Vendor">Fashion & Clothing</option>
                    <option value="Restaurant & Food Vendor">Food & Restaurant</option>
                    <option value="Cleaning & Facility Services">Cleaning Services</option>
                    <option value="Real Estate Agent & Property">Real Estate</option>
                    <option value="Freelancer & Creative Consultant">Freelancer</option>
                    <option value="Online Retail Store">Online Store</option>
                    <option value="Digital Marketing Agency">Marketing Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="NGN">₦ NGN</option>
                    <option value="USD">$ USD</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@business.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                {mode === 'forgot' ? 'New Password *' : 'Password *'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              'Sign In to Dashboard'
            ) : mode === 'register' ? (
              'Create Account Free'
            ) : (
              'Reset Password & Continue'
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="text-center text-xs text-slate-400 pt-1">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Sign in
              </button>
            </span>
          )}
        </div>

        {/* Instant Evaluation Demo Credentials */}
        <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Instant Evaluation Shortcuts
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('demo@sellpilot.ai', 'password123')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-left rounded-lg text-[11px] text-slate-200 transition-colors"
            >
              <div className="font-bold text-white">Amara Kalu</div>
              <div className="text-slate-400">Fashion Vendor (Pro)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('emmanuelochuru09@gmail.com', 'AdminPass123!')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-left rounded-lg text-[11px] text-slate-200 transition-colors"
            >
              <div className="font-bold text-amber-400">Admin Account</div>
              <div className="text-slate-400">System Owner</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
