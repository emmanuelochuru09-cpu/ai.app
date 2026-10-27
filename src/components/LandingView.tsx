import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Megaphone,
  Share2,
  Users,
  Globe,
  MessageSquare,
  Bot,
  Zap,
  TrendingUp,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

interface LandingViewProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigate: (view: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onOpenAuth, onNavigate }) => {
  return (
    <div className="space-y-24 pb-24">
      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Unboxed clean metadata kicker */}
          <div className="text-xs font-semibold text-indigo-400 tracking-wide uppercase">
            <span>Built For Small Businesses & Vendors</span>
            <span aria-hidden="true" className="mx-2 text-slate-600">·</span>
            <span>Nigeria & Global Commerce</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
            Turn Your Business Into a <span className="text-indigo-400">Sales Machine.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SellPilot AI is the intelligent growth engine designed for fashion vendors, restaurants, cleaning services, freelancers, and online retailers to generate high-converting ads, publish websites, and close WhatsApp sales.
          </p>

          {/* CTA Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              Start Growing Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold text-sm transition-colors"
            >
              Explore Live Demo
            </button>
          </div>

          <div className="text-xs text-slate-500 pt-1">
            <span>No credit card required</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>25 free AI credits monthly</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Works on mobile phones</span>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-[#0B101B] shadow-2xl">
          <img
            src="/src/assets/images/hero_business_dashboard_1793117713788.jpg"
            alt="SellPilot AI Business Growth Dashboard"
            className="w-full h-auto object-cover max-h-[540px]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Proof KPI Strip Below Hero */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 max-w-5xl mx-auto">
          <div className="p-4 bg-[#0B101B] border border-slate-800 rounded-xl text-center">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">4.8x</div>
            <div className="text-xs text-slate-400 mt-1">Faster WhatsApp conversions</div>
          </div>
          <div className="p-4 bg-[#0B101B] border border-slate-800 rounded-xl text-center">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">60 sec</div>
            <div className="text-xs text-slate-400 mt-1">To generate complete ad suite</div>
          </div>
          <div className="p-4 bg-[#0B101B] border border-slate-800 rounded-xl text-center">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">100%</div>
            <div className="text-xs text-slate-400 mt-1">Mobile responsive websites</div>
          </div>
          <div className="p-4 bg-[#0B101B] border border-slate-800 rounded-xl text-center">
            <div className="text-2xl font-bold font-mono text-white tabular-nums">₦ & $</div>
            <div className="text-xs text-slate-400 mt-1">Nigerian & international billing</div>
          </div>
        </div>
      </section>

      {/* 2. Core Capabilities Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Features & Tooling</div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Everything You Need to Attract & Close Buyers</h2>
          <p className="text-sm text-slate-400">
            A cohesive platform replacing disconnected tools with unified AI marketing, lead tracking, and website hosting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">01. AI Advertisement Generator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Creates attention-grabbing headlines, Instagram & Facebook body copy, psychological marketing angles, and targeted audience segments tailored to your exact budget.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              Includes Instagram, Facebook, TikTok, WhatsApp copy formats
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800/40 text-sky-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">02. Viral Social Media Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate 7-day content calendars, short-form TikTok & Reels video scripts with 3-second hooks, and persuasive product descriptions that engage buyers.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              Day-by-day outlines, carousel slides, and trending hashtag mixes
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">03. WhatsApp Conversion Suite</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prepare objection handlers when customers say "it's too expensive", draft instant replies, gentle follow-up reminders, and catalog drop announcements.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              1-click copy with pre-filled WhatsApp web & mobile links
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 text-purple-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">04. Business Website Generator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Type your business details and launch a professional, hosted website with services, pricing cards, customer testimonials, and direct WhatsApp checkout buttons.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              Instant live hosting at sellpilot.app/site/:slug
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/40 text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">05. Customer Lead CRM</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log inquiries from WhatsApp, Instagram, or walk-ins. Track statuses (New, Contacted, Interested, Converted), set follow-up dates, and calculate real pipeline value.
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              Kanban pipeline, CSV export, and verified sales revenue
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">06. Dedicated AI Business Advisor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask strategic business questions anytime: "How can I improve my product descriptions?", "What promotion should I run?", "How do I double my order volume?".
            </p>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
              Personalized advice based on your industry and country
            </div>
          </div>
        </div>
      </section>

      {/* 3. Solutions by Industry Section */}
      <section id="solutions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Target Industries</div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Tailored for Real Businesses</h2>
          <p className="text-sm text-slate-400">
            SellPilot AI adapts its tone, copy, and sales workflows to your specific commercial niche.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 bg-[#0B101B] border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-sm font-bold text-white">Fashion & Clothing Boutiques</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Showcase native wear, luxury kaftans, and bridal attire. Generate Instagram carousels and handle sizes and fabric inquiries on WhatsApp.
            </p>
          </div>

          <div className="p-5 bg-[#0B101B] border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-sm font-bold text-white">Restaurants & Food Vendors</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Promote daily lunch menus, party jollof catering, and express weekend deliveries with appetizing social captions.
            </p>
          </div>

          <div className="p-5 bg-[#0B101B] border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-sm font-bold text-white">Cleaning & Facility Services</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Acquire residential and corporate office cleaning contracts with professional service quote websites and follow-up templates.
            </p>
          </div>

          <div className="p-5 bg-[#0B101B] border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-sm font-bold text-white">Real Estate & Property Agents</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Craft compelling property listing descriptions, video tour scripts for TikTok, and manage high-value investor leads.
            </p>
          </div>

          <div className="p-5 bg-[#0B101B] border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-sm font-bold text-white">Freelancers & Creative Consultants</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Position yourself as an authority, publish a sleek client portfolio website, and convert DMs into retainer projects.
            </p>
          </div>

          <div className="p-5 bg-[#0B101B] border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-sm font-bold text-white">Online Stores & Vendors</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drive seasonal flash sales, manage WhatsApp customer orders, and write converting product descriptions that sell out inventory.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Attributable Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Customer Proof</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Trusted By Ambitious Founders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "We used SellPilot's WhatsApp objection script when customers asked why our bespoke Senator wear costs ₦65k. We closed 7 orders in one weekend that we would have previously lost."
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-xs font-bold text-white">Amara Kalu</div>
              <div className="text-[11px] text-slate-400">Founder, Luxe Lagos Apparel</div>
            </div>
          </div>

          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "Generated our entire cleaning service website in under 2 minutes. The WhatsApp inquiry button connected directly to our business phone, bringing us 14 new office contracts."
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-xs font-bold text-white">Tunde Bakare</div>
              <div className="text-[11px] text-slate-400">Managing Director, CleanPro Services</div>
            </div>
          </div>

          <div className="bg-[#0B101B] border border-slate-800 rounded-2xl p-6 space-y-4">
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "The TikTok video scripts and 7-day calendar took the stress out of our social media marketing. Our engagement tripled, and every post now directs customers to order."
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <div className="text-xs font-bold text-white">Chisom Eze</div>
              <div className="text-[11px] text-slate-400">Creative Lead, Glow Essentials Store</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-950 via-[#0B101B] to-slate-900 border border-indigo-800/40 rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Turn Your Business Into a Sales Machine?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join hundreds of vendors, boutique owners, and entrepreneurs growing their customer base with intelligent AI automation.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-semibold text-sm transition-colors"
            >
              Sign In to Your Workspace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
