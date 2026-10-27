import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { AdGeneratorView } from './components/AdGeneratorView';
import { SocialCreatorView } from './components/SocialCreatorView';
import { WebsiteGeneratorView } from './components/WebsiteGeneratorView';
import { LeadManagerView } from './components/LeadManagerView';
import { AssistantView } from './components/AssistantView';
import { WhatsAppSuiteView } from './components/WhatsAppSuiteView';
import { LibraryView } from './components/LibraryView';
import { BillingView } from './components/BillingView';
import { AdminView } from './components/AdminView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { Menu, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user signs in, switch to dashboard if on landing
  React.useEffect(() => {
    if (user && currentView === 'landing') {
      setCurrentView('dashboard');
    } else if (!user && currentView !== 'landing' && currentView !== 'pricing') {
      setCurrentView('landing');
    }
  }, [user]);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-400 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing SellPilot AI workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Workspace / Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Sidebar (visible when logged in) */}
        {user && (
          <>
            {/* Desktop Sidebar */}
            <Sidebar
              currentView={currentView}
              onNavigate={handleNavigate}
              className="hidden lg:flex"
            />

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                <div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <Sidebar
                  currentView={currentView}
                  onNavigate={handleNavigate}
                  className="relative z-10 w-72"
                />
              </div>
            )}
          </>
        )}

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Top Bar Bar with Menu button if user is authenticated */}
          {user && (
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0B101B] border-b border-slate-800">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-xs font-semibold text-slate-300 flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800"
              >
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </button>
              <div className="text-xs font-bold text-white capitalize">{currentView}</div>
            </div>
          )}

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Conditional Route Views */}
            {!user && currentView === 'landing' && (
              <LandingView onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />
            )}

            {currentView === 'pricing' && <BillingView />}

            {user && (
              <>
                {currentView === 'dashboard' && (
                  <DashboardView
                    onNavigate={handleNavigate}
                    onOpenNewLeadModal={() => handleNavigate('leads')}
                  />
                )}
                {currentView === 'ads' && <AdGeneratorView />}
                {currentView === 'social' && <SocialCreatorView />}
                {currentView === 'website' && <WebsiteGeneratorView />}
                {currentView === 'leads' && <LeadManagerView />}
                {currentView === 'assistant' && <AssistantView />}
                {currentView === 'whatsapp' && <WhatsAppSuiteView />}
                {currentView === 'library' && <LibraryView />}
                {currentView === 'billing' && <BillingView />}
                {currentView === 'admin' && <AdminView />}
                {currentView === 'settings' && <SettingsView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
