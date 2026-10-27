import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Megaphone,
  Share2,
  Users,
  Globe,
  MessageSquare,
  Bot,
  BookmarkCheck,
  CreditCard,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, className = '' }) => {
  const { user } = useAuth();
  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ads', label: 'AI Ad Generator', icon: Megaphone },
    { id: 'social', label: 'Social Media Creator', icon: Share2 },
    { id: 'leads', label: 'Customer Leads CRM', icon: Users },
    { id: 'website', label: 'Website Builder & Host', icon: Globe },
    { id: 'whatsapp', label: 'WhatsApp Suite', icon: MessageSquare },
    { id: 'assistant', label: 'AI Business Advisor', icon: Bot },
    { id: 'library', label: 'Saved Content Library', icon: BookmarkCheck },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
    { id: 'settings', label: 'Business Profile', icon: Sliders },
  ];

  if (user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Portal', icon: ShieldCheck });
  }

  const remainingCredits = Math.max(0, user.aiCreditsLimit - user.aiCreditsUsed);
  const creditPercent = Math.min(100, Math.round((user.aiCreditsUsed / user.aiCreditsLimit) * 100));

  return (
    <aside className={`w-64 bg-[#0B101B] border-r border-slate-800 flex flex-col shrink-0 select-none ${className}`}>
      {/* Business Brand Kicker */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="text-xs text-slate-400 truncate">WORKSPACE</div>
        <div className="text-sm font-bold text-white truncate mt-0.5">{user.businessName}</div>
        <div className="text-xs text-slate-400 truncate">{user.businessType}</div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* AI Usage & Tier Box */}
      <div className="p-4 border-t border-slate-800 bg-[#070A12]/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-semibold text-slate-300 capitalize">{user.plan} Plan</span>
          <span className="font-mono tabular-nums">{remainingCredits} credits</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              creditPercent > 90 ? 'bg-amber-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${creditPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <button
            onClick={() => onNavigate('billing')}
            className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Upgrade Plan →
          </button>
          <span className="text-[10px] text-slate-400 tabular-nums">{user.aiCreditsUsed}/{user.aiCreditsLimit} used</span>
        </div>
      </div>
    </aside>
  );
};
