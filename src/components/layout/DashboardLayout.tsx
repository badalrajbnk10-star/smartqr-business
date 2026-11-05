import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  Building2,
  Image as ImageIcon,
  QrCode,
  UtensilsCrossed,
  CreditCard,
  BarChart3,
  ExternalLink,
  LogOut,
  Clock,
  Sparkles,
  AlertTriangle,
  Menu,
  X,
  ChevronDown,
  PlusCircle,
  HelpCircle,
  Lock,
  Check,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { DEFAULT_PLANS } from '../../lib/supabase';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { Plan } from '../../types/database';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    businesses,
    currentBusiness,
    setCurrentBusiness,
    trialRemainingTime,
    subscription,
    activePlan,
    upgradeSubscription,
    loading: bizLoading
  } = useBusiness();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [businessDropdownOpen, setBusinessDropdownOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paywallError, setPaywallError] = useState<string | null>(null);

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Business Profile', href: '/dashboard/profile', icon: Building2 },
    { name: 'Photo Gallery', href: '/dashboard/media', icon: ImageIcon },
    { name: 'Menu & Services', href: '/dashboard/catalog', icon: UtensilsCrossed },
    { name: 'QR Designer & Print', href: '/dashboard/qr', icon: QrCode },
    { name: 'Subscription & Plans', href: '/dashboard/subscription', icon: CreditCard },
    { name: 'Scan Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Help & Support', href: '/support', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isTrial = subscription?.status === 'trialing';
  const isSuspended = currentBusiness?.status === 'suspended' || 
    (currentBusiness?.status !== 'active' && subscription?.status !== 'active' && trialRemainingTime.isExpired);

  const handlePaywallSubscribe = async (plan: Plan) => {
    setLoadingPlan(plan.id);
    setPaywallError(null);

    await openRazorpayCheckout({
      planName: plan.name,
      amountPaise: plan.price_paise,
      customerName: user?.full_name || 'Business Owner',
      customerEmail: user?.email || 'owner@smartqr.in',
      customerPhone: user?.phone || '',
      onSuccess: async (res) => {
        const activated = await upgradeSubscription(plan.id, res);
        setLoadingPlan(null);
        if (activated) {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
        } else {
          setPaywallError('Payment verification failed on server. Please contact support.');
        }
      },
      onFailure: (err) => {
        setLoadingPlan(null);
        setPaywallError(err.message || 'Payment mandate was cancelled or rejected.');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar - Sticky and fixed to screen height */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Smart<span className="text-brand-400">QR</span>
            </span>
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Owner
          </span>
        </div>

        {/* Business Selector */}
        <div className="p-4 border-b border-slate-800 relative shrink-0">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Current Business
          </label>
          <button
            onClick={() => setBusinessDropdownOpen(!businessDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition-colors"
          >
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">
                {currentBusiness?.name || 'My Business'}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                Status: {isSuspended ? 'Suspended' : currentBusiness?.status || 'Active'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
          </button>

          {/* Dropdown for multi-business */}
          {businessDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
              {businesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => {
                    setCurrentBusiness(biz);
                    setBusinessDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-700/80 transition-colors flex items-center justify-between ${
                    biz.id === currentBusiness?.id ? 'text-brand-400 bg-slate-700/50' : 'text-slate-300'
                  }`}
                >
                  <span className="truncate">{biz.name}</span>
                  {biz.id === currentBusiness?.id && <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>}
                </button>
              ))}
              <div className="border-t border-slate-700/60 mt-1 pt-1">
                <Link
                  to="/dashboard/profile?new=true"
                  onClick={() => setBusinessDropdownOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-brand-400 hover:bg-slate-700/80 flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add New Business Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            const isLockTarget = isSuspended && link.href !== '/dashboard/subscription' && link.href !== '/support';
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                to={link.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{link.name}</span>
                </div>
                {isLockTarget && (
                  <span title="Subscription required">
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1.5" />
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* View Live Public QR Page button */}
        {currentBusiness && (
          <div className="p-4 border-t border-slate-800 shrink-0">
            <a
              href={`/b/${currentBusiness.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-brand-400 hover:text-brand-300 text-xs font-semibold border border-slate-700/50 transition-all"
            >
              <span className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Live Customer Page
              </span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area - Expands naturally with window scroll */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate">
              {currentBusiness?.name || 'Business Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 24h Free Trial or Subscription Status Pill */}
            {isTrial && !trialRemainingTime.isExpired ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-800">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>
                  Trial Ends in: <strong>{trialRemainingTime.hours}h {trialRemainingTime.minutes}m</strong>
                </span>
                <Link
                  to="/dashboard/subscription"
                  className="ml-1 text-[11px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded-full font-bold transition-colors"
                >
                  Activate UPI AutoPay
                </Link>
              </div>
            ) : isSuspended ? (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full text-xs font-semibold text-red-800">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Trial Expired • Suspended</span>
                <Link
                  to="/dashboard/subscription"
                  className="ml-1 text-[11px] bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded-full font-bold"
                >
                  Unlock with Plan
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active: {activePlan?.name || 'Professional'}</span>
              </div>
            )}

            {/* View QR Code Quick Button */}
            {!isSuspended && (
              <Link
                to="/dashboard/qr"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl transition-all"
              >
                <QrCode className="w-3.5 h-3.5" />
                Download QR
              </Link>
            )}
          </div>
        </header>

        {/* Trial Expired Alert Banner */}
        {isSuspended && (
          <div className="bg-red-600 text-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm font-medium gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                Your 24-hour free trial has ended. Your public QR business page is temporarily paused.
              </span>
            </div>
            <Link
              to="/dashboard/subscription"
              className="px-3 py-1.5 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 shrink-0 transition-colors"
            >
              Choose Plan (From ₹99/mo)
            </Link>
          </div>
        )}

        {/* Sub-view Content Outlet or Paywall Lock Screen */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {bizLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : isSuspended && location.pathname !== '/dashboard/subscription' && location.pathname !== '/support' ? (
            /* Hard Paywall: Lock entire dashboard until a plan is unlocked */
            <div className="max-w-5xl mx-auto space-y-8 py-4">
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                  <Lock className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  24-Hour Free Trial Completed
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Aapka 24-ghante ka free testing trial poora ho chuka hai. <strong>Aapka daala hua sabhi business data database me surakshit hai.</strong> Apna dashboard unblock karne aur live QR page chalu rakhne ke liye neeche se apna plan choose karein.
                </p>
              </div>

              {paywallError && (
                <div className="max-w-xl mx-auto p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{paywallError}</span>
                </div>
              )}

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DEFAULT_PLANS.map((plan) => {
                  const isPopular = plan.slug === 'professional';
                  const isProcessing = loadingPlan === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-3xl p-6 flex flex-col justify-between transition-all ${
                        isPopular
                          ? 'bg-slate-900 text-white shadow-xl ring-2 ring-brand-500 relative'
                          : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Recommended for Growth</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-black tracking-tight">{plan.name}</h3>
                          <p className={`text-xs mt-1 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                            {plan.slug === 'starter' && 'Best for individual CSC centers & small shops'}
                            {plan.slug === 'professional' && 'Best for retail, restaurants, clinics & salons'}
                            {plan.slug === 'business_plus' && 'Best for multi-outlet brands & hotels'}
                          </p>
                        </div>

                        <div className="pt-2">
                          <span className="text-3xl font-black">₹{(plan.price_paise / 100).toFixed(0)}</span>
                          <span className={`text-xs ml-1 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                            /month (UPI AutoPay)
                          </span>
                        </div>

                        <ul className="space-y-2.5 pt-4 border-t border-slate-200/20 text-xs">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-brand-400' : 'text-emerald-600'}`} />
                              <span className={isPopular ? 'text-slate-200' : 'text-slate-700'}>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={() => handlePaywallSubscribe(plan)}
                          disabled={loadingPlan !== null}
                          className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                            isPopular
                              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          <span>{isProcessing ? 'Opening UPI Mandate...' : `Unlock ${plan.name} Plan`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/dashboard/subscription"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 underline"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Go to full subscription and invoice management page</span>
                </Link>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-slate-300">
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
              <span className="font-extrabold text-lg text-white">SmartQR Business</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-md text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    location.pathname === link.href ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button onClick={handleLogout} className="w-full text-center py-2 text-xs font-semibold text-red-400">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
