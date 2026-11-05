import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QrCode, Menu, X, ArrowRight, ShieldCheck, Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isOwner, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Smart<span className="text-brand-600">QR</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 -mt-1">
                Business Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
              Pricing & Plans
            </Link>
            <Link to="/b/grand-heritage" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Live Demo
            </Link>
            <Link to="/support" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">
              Support
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {isOwner && (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
                  >
                    Owner Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {isSuperAdmin && (
                  <Link
                    to="/super-admin"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-900 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-sm transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 transition-all hover:scale-[1.02]"
                >
                  <span>Start 24h Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Pricing & Plans
          </Link>
          <Link
            to="/b/grand-heritage"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-amber-700 hover:bg-amber-50"
          >
            Live Customer Demo
          </Link>
          <Link
            to="/support"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Support
          </Link>
          <div className="pt-4 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block text-center w-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-brand-600 rounded-xl"
                >
                  Start 24h Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
