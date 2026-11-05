import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Building,
  CreditCard,
  QrCode,
  FileText,
  Settings,
  LifeBuoy,
  LogOut,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SuperAdminLayout: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If unauthorized, show security block
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Access Restricted</h2>
          <p className="text-sm text-slate-400">
            You must be an authorized Super Administrator to access this control panel. All unauthorized attempts are logged for security.
          </p>
          <div className="pt-2">
            <Link
              to="/super-admin/login"
              className="inline-block w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-colors"
            >
              Go to Super Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminNav = [
    { name: 'Dashboard Overview', href: '/super-admin', icon: TrendingUp },
    { name: 'Business Owners', href: '/super-admin/businesses', icon: Building },
    { name: 'Plans & Pricing', href: '/super-admin/plans', icon: CreditCard },
    { name: 'Razorpay Payments', href: '/super-admin/payments', icon: CreditCard },
    { name: 'QR Code Directory', href: '/super-admin/qr-codes', icon: QrCode },
    { name: 'Support Requests', href: '/super-admin/support', icon: LifeBuoy },
    { name: 'Security Audit Logs', href: '/super-admin/audit', icon: FileText },
    { name: 'Platform Settings', href: '/super-admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/super-admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-slate-900 border-r border-slate-800 shrink-0">
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">
                SUPER<span className="text-amber-400">ADMIN</span>
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold -mt-1 block">
                Control Panel
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
            ROOT
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Admin User Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
            <p className="text-[11px] text-amber-400/80 truncate font-mono">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out from Super Admin"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Platform System
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-slate-300">
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
              <span className="font-extrabold text-white text-base">Super Admin</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1">
              {adminNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                    location.pathname === item.href ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
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
