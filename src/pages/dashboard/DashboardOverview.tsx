import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Eye,
  TrendingUp,
  Star,
  Clock,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Printer,
  Edit,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const DashboardOverview: React.FC = () => {
  const { currentBusiness, trialRemainingTime, subscription, activePlan } = useBusiness();

  const isTrial = subscription?.status === 'trialing';
  const isSuspended = currentBusiness?.status === 'suspended' || 
    (currentBusiness?.status !== 'active' && subscription?.status !== 'active' && trialRemainingTime.isExpired);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>SmartQR Digital Profile Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome{currentBusiness?.name ? `, ${currentBusiness.name}` : ''}!
            </h1>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              {currentBusiness
                ? 'Your dynamic QR code is live. Customers scanning your QR can instantly view your profile, contact you on WhatsApp, and leave 5-star Google Reviews.'
                : 'Welcome to your SmartQR business management dashboard. Get started by setting up your business profile and dynamic QR code below.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {currentBusiness ? (
              <>
                <a
                  href={`/b/${currentBusiness.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-brand-700 font-bold text-xs shadow-md hover:bg-brand-50 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Customer Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Link
                  to="/dashboard/qr"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-900/60 hover:bg-brand-900 text-white font-bold text-xs border border-white/20 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print QR Stand</span>
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard/profile"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-brand-700 font-bold text-xs shadow-md hover:bg-brand-50 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Create Business Profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* If No Business Profile Created Yet */}
      {!currentBusiness && (
        <div className="bg-white border-2 border-dashed border-brand-200 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Setup Your First Business Profile</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't set up your digital business profile yet. Add your business name, contact details, opening hours, photos, and generate your custom QR code stand.
            </p>
          </div>
          <div>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Create Business Profile Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Trial Countdown or Plan Status Card */}
      {isTrial && !trialRemainingTime.isExpired ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                24-Hour Free Trial in Progress ({trialRemainingTime.hours} Hours {trialRemainingTime.minutes} Minutes Remaining)
              </h3>
              <p className="text-xs text-amber-700">
                Authorize your UPI AutoPay mandate before the trial ends to keep your public QR landing page active without interruption.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/subscription"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-sm transition-colors"
          >
            Authorize UPI AutoPay (₹99/mo)
          </Link>
        </div>
      ) : isSuspended ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-900">Public QR Page Suspended</h3>
              <p className="text-xs text-red-700">
                Your free trial or billing period has expired. Re-activate your subscription to resume your public business profile.
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/subscription"
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-sm transition-colors"
          >
            Re-activate Now
          </Link>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800">
              Subscription Active: <strong>{activePlan?.name || 'Professional'} Plan</strong> (Recurring AutoPay Enabled)
            </span>
          </div>
          <Link to="/dashboard/subscription" className="text-xs font-bold text-emerald-700 hover:underline">
            Manage Billing
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total QR Scans</span>
            <QrCode className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {currentBusiness?.qr_code?.total_scans ?? 0}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Real-time scan counter
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Google Review Taps</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {(currentBusiness?.opening_hours as any)?._analytics?.review_clicks ?? 0}
          </p>
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            {currentBusiness?.google_review_url ? 'Direct review redirect' : 'Add review link in Profile'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">WhatsApp Queries</span>
            <Eye className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {(currentBusiness?.opening_hours as any)?._analytics?.whatsapp_clicks ?? 0}
          </p>
          <span className="text-[11px] text-slate-500">Direct 1-tap WhatsApp chat</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Profile Completeness</span>
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">95%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-brand-600 h-full rounded-full w-[95%]"></div>
          </div>
        </div>
      </div>

      {/* Quick Setup Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900">Recommended Steps to Maximize Scans</h2>
          <div className="space-y-3">
            <Link
              to="/dashboard/profile"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600">
                    Verify Google Review Link
                  </h4>
                  <p className="text-[11px] text-slate-500">Make sure your Google Place review link is up to date.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
            </Link>

            <Link
              to="/dashboard/qr"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600">
                    Print Table Stand or Sticker PDF
                  </h4>
                  <p className="text-[11px] text-slate-500">Download high-DPI printable PDF ready for the counter.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
            </Link>

            <Link
              to="/dashboard/catalog"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600">
                    Update Menu Items & Price List
                  </h4>
                  <p className="text-[11px] text-slate-500">Ensure current prices and specialties are shown to diners.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
            </Link>
          </div>
        </div>

        {/* Permanent URL Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Permanent Dynamic URL
            </span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 break-all">
              {currentBusiness?.qr_code?.permanent_url || (currentBusiness?.slug ? `${window.location.origin}/b/${currentBusiness.slug}` : 'No active QR code')}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This permanent link will never change, ensuring all your printed collateral keeps working forever.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/dashboard/qr"
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Customize & Download QR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
