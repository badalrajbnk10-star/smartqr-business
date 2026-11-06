import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { DEFAULT_PLANS } from '../../lib/supabase';

export const Pricing: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Transparent & Affordable
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Simple Plans Tailored for Your Growth
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Start with a full <strong>24-hour free trial</strong>. Then continue easily with direct UPI QR payments (GPay, PhonePe, Paytm, BHIM) and instant WhatsApp activation.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {DEFAULT_PLANS.map((plan) => {
          const isPopular = plan.slug === 'professional';
          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                isPopular
                  ? 'bg-slate-900 text-white shadow-2xl ring-2 ring-brand-500 scale-105 relative'
                  : 'bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[11px] font-extrabold uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Most Popular Choice
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className={`text-xl font-bold ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mt-1 ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                    {plan.max_businesses === 1 ? 'Ideal for single outlets & clinics' : `Manage up to ${plan.max_businesses} business branches`}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    ₹{(plan.price_paise / 100).toFixed(0)}
                  </span>
                  <span className={`text-sm ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                    / month
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/20">
                  <p className={`text-xs font-semibold mb-3 ${isPopular ? 'text-brand-300' : 'text-slate-700'}`}>
                    Included in this plan:
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-brand-400' : 'text-emerald-600'}`} />
                        <span className={isPopular ? 'text-slate-300' : 'text-slate-600'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  to={`/register?plan=${plan.slug}`}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isPopular
                      ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>Start 24h Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className={`text-[11px] text-center mt-2.5 ${isPopular ? 'text-slate-400' : 'text-slate-400'}`}>
                  No advance payment today. 24 hours full access.
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* UPI AutoPay Guarantee */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Direct & Secure UPI Payments
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Pay smoothly with Google Pay, PhonePe, Paytm, or BHIM. Fast 12-digit UTR verification and direct WhatsApp support (+91 9931782577).
            </p>
          </div>
        </div>
        <Link
          to="/register"
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shrink-0 transition-colors"
        >
          Try Free for 24 Hours
        </Link>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm">
            Everything you need to know about SmartQR subscriptions and dynamic QR codes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              Do I have to re-print my QR code when renewing?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Never!</strong> Your QR code contains a permanent dynamic link. Even if your subscription expires and you renew later, your printed table stands and stickers continue to work automatically without any change.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              What happens during the 24-hour free trial?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You get complete access to all features, profile editing, QR customization, and printable PDF exports. Your public page works live immediately.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              Can I cancel my subscription anytime?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes, you can cancel directly from your owner dashboard or revoke the UPI AutoPay mandate from your Google Pay/PhonePe app anytime without questions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              Can I upgrade to Business Plus later?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes, you can easily upgrade your plan anytime from your dashboard as your business expands to multiple locations or menus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
