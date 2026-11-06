import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  ShieldCheck,
  Clock,
  Check,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PLANS } from '../../lib/supabase';
import { openRazorpayCheckout } from '../../lib/razorpay';
import { Plan } from '../../types/database';

export const SubscriptionBilling: React.FC = () => {
  const { user } = useAuth();
  const {
    subscription,
    activePlan,
    trialRemainingTime,
    upgradeSubscription,
    currentBusiness
  } = useBusiness();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTrial = subscription?.status === 'trialing';
  const isSuspended = currentBusiness?.status === 'suspended' || trialRemainingTime.isExpired;

  const handleSubscribe = async (plan: Plan) => {
    setLoadingPlan(plan.id);
    setErrorMessage(null);
    setSuccessMessage(null);

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
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setSuccessMessage(`UPI AutoPay Mandate authorized successfully! ${plan.name} plan is now active.`);
        } else {
          setErrorMessage('Payment verification failed on the server. Please check your bank.');
        }
      },
      onFailure: (err) => {
        setLoadingPlan(null);
        setErrorMessage(err.message || 'Payment mandate was cancelled or rejected.');
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Subscription & UPI AutoPay Mandate
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your recurring monthly plan and automatic UPI AutoPay mandate.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Current Subscription Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Active Billing State
          </span>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900">
              {activePlan?.name || 'Starter'} Plan
            </h2>
            {isTrial && !trialRemainingTime.isExpired ? (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Trialing ({trialRemainingTime.hours}h {trialRemainingTime.minutes}m Left)
              </span>
            ) : isSuspended ? (
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Suspended (Renewal Required)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Active AutoPay
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 max-w-lg">
            {isTrial
              ? 'You are enjoying 24 hours of unrestricted free trial. Choose a monthly plan below to authorize your UPI mandate and keep your QR profile running 24/7.'
              : 'Your monthly subscription is active with Razorpay UPI AutoPay. Next billing period auto-renews at the end of the month.'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-3xl font-extrabold text-slate-900">
            ₹{((activePlan?.price_paise || 9900) / 100).toFixed(0)}
          </p>
          <p className="text-xs text-slate-400">per month (incl. GST)</p>
        </div>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Available Subscription Plans (UPI AutoPay)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEFAULT_PLANS.map((plan) => {
            const isCurrent = activePlan?.id === plan.id && subscription?.status === 'active';
            const isPopular = plan.slug === 'professional';

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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-3 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-lg">{plan.name}</h4>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-black">₹{(plan.price_paise / 100).toFixed(0)}</span>
                      <span className="text-xs opacity-70">/ month</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs pt-2 border-t border-slate-200/20">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="opacity-90">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Current Active Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loadingPlan === plan.id}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isPopular
                          ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>{loadingPlan === plan.id ? 'Connecting Gateway...' : 'Authorize AutoPay'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" />
          Payment Invoices & Receipts
        </h3>

        {subscription?.status === 'active' && subscription?.plan_id !== 'plan-trial' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Description</th>
                  <th className="py-2.5">Amount</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 font-mono">{new Date(subscription.created_at || Date.now()).toLocaleDateString()}</td>
                  <td className="py-3 font-medium">SmartQR {activePlan?.name || 'Starter'} Monthly Subscription</td>
                  <td className="py-3 font-bold text-slate-900">₹{((activePlan?.price_paise || 9900) / 100).toFixed(2)}</td>
                  <td className="py-3">UPI AutoPay</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      Captured
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => alert(`Tax invoice generated for ${activePlan?.name || 'Starter'} plan.`)}
                      className="text-brand-600 font-bold hover:underline"
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Clock className="w-6 h-6 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No payment invoices yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Your business is currently operating on the 24-Hour Free Trial (₹0.00). Invoices and GST receipts will appear here automatically once you authorize a paid AutoPay plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
