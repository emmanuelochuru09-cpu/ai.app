import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, UserCircle, LogOut, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tighter">
              SP
            </div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              SellPilot <span className="text-indigo-400">AI</span>
            </span>
          </button>
        </div>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {!user ? (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`whitespace-nowrap transition-colors hover:text-white ${currentView === 'landing' ? 'text-white' : 'text-slate-400'}`}
              >
                Overview
              </button>
              <button
                onClick={() => onNavigate('pricing')}
                className={`whitespace-nowrap transition-colors hover:text-white ${currentView === 'pricing' ? 'text-white' : 'text-slate-400'}`}
              >
                Pricing & Plans
              </button>
              <a
                href="#features"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('landing');
                  setTimeout(() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="whitespace-nowrap transition-colors hover:text-white text-slate-400"
              >
                Capabilities
              </a>
              <a
                href="#solutions"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('landing');
                  setTimeout(() => {
                    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="whitespace-nowrap transition-colors hover:text-white text-slate-400"
              >
                Vendors & Agencies
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`whitespace-nowrap transition-colors hover:text-white ${currentView === 'dashboard' ? 'text-white font-semibold' : 'text-slate-400'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('ads')}
                className={`whitespace-nowrap transition-colors hover:text-white ${currentView === 'ads' ? 'text-white font-semibold' : 'text-slate-400'}`}
              >
                AI Ads
              </button>
              <button
                onClick={() => onNavigate('social')}
                className={`whitespace-nowrap transition-colors hover:text-white ${currentView === 'social' ? 'text-white font-semibold' : 'text-slate-400'}`}
              >
                Social Studio
              </button>
              <button
                onClick={() => onNavigate('leads')}
                className={`whitespace-nowrap transition-colors hover:text-white ${currentView === 'leads' ? 'text-white font-semibold' : 'text-slate-400'}`}
              >
                CRM Leads
              </button>
              <button
                onClick={() => onNavigate('website')}
                className={`whitespace-nowrap transition-colors hover:text-white ${currentView === 'website' ? 'text-white font-semibold' : 'text-slate-400'}`}
              >
                Website Builder
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {!user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
              >
                Get Started Free
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    currentView === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-amber-400 hover:bg-amber-500/10'
                  }`}
                  title="Administrator Portal"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('billing')}
                className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 transition-colors whitespace-nowrap hidden sm:flex items-center gap-1"
              >
                <span className="text-slate-400 capitalize">{user.plan}</span>
                <span className="text-indigo-400 tabular-nums">({user.aiCreditsLimit - user.aiCreditsUsed} left)</span>
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                title="Account Settings"
              >
                <UserCircle className="w-5 h-5" />
              </button>

              <button
                onClick={logout}
                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
