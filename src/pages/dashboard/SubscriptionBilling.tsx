import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
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
  CheckCircle2,
  Copy,
  QrCode,
  MessageCircle,
  X,
  ExternalLink
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PLANS } from '../../lib/supabase';
import { Plan } from '../../types/database';
import { fetchPlatformSettings, DEFAULT_PLATFORM_SETTINGS, PlatformSettings } from '../../lib/settings';

export const SubscriptionBilling: React.FC = () => {
  const { user } = useAuth();
  const {
    subscription,
    activePlan,
    trialRemainingTime,
    submitManualPayment,
    currentBusiness,
    refreshData
  } = useBusiness();

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatformSettings().then((s) => setPlatformSettings(s));
  }, []);

  const pendingPayment = (currentBusiness?.opening_hours as any)?._pending_payment;
  const isPending = subscription?.status === 'pending' || pendingPayment?.status === 'pending';
  const isPaidActive =
    (subscription?.status === 'active' || (currentBusiness?.opening_hours as any)?._subscription?.status === 'active') &&
    !trialRemainingTime.isExpired;
  const isExpired =
    trialRemainingTime.isExpired || currentBusiness?.status === 'expired' || subscription?.status === 'expired';
  const isTrial = !isPaidActive && !isPending && !isExpired && subscription?.status === 'trialing';

  const officialUpiId = platformSettings.upi_id || '9931782577@ybl';
  const officialPayeeName = platformSettings.payee_name || 'Badal Sarkar';
  const supportPhone = platformSettings.support_phone || '+91 9931782577';

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(officialUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleOpenPaymentModal = (plan: Plan) => {
    setSelectedPlanForPayment(plan);
    setUtrNumber('');
    setErrorMessage(null);
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPayment) return;

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 6) {
      setErrorMessage('Please enter a valid 12-digit UPI UTR / Transaction Reference Number.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const res = await submitManualPayment(selectedPlanForPayment.id, cleanUtr);
    setSubmitting(false);

    if (res.success) {
      setSelectedPlanForPayment(null);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      setSuccessMessage(
        `UTR ${cleanUtr} submitted successfully! Your ${selectedPlanForPayment.name} plan is pending verification. Admin will verify and activate your business shortly.`
      );
    } else {
      setErrorMessage(res.error || 'Failed to submit UTR. Please try again or message admin on WhatsApp.');
    }
  };

  const formatUpiUri = (plan: Plan) => {
    const amountRupees = (plan.price_paise / 100).toFixed(2);
    const note = encodeURIComponent(`SmartQR ${plan.name} Plan`);
    return `upi://pay?pa=${officialUpiId}&pn=${encodeURIComponent(officialPayeeName)}&am=${amountRupees}&cu=INR&tn=${note}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Subscription & Manual UPI Payment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Pay easily using any UPI App (GPay, PhonePe, Paytm, BHIM). Submit your 12-digit UTR for admin verification.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Subscription Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Current Billing Status
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900">
              {isPaidActive
                ? `${activePlan?.name || 'Starter'} Plan`
                : isPending
                ? `${pendingPayment?.plan_name || activePlan?.name || 'Selected'} Plan`
                : `${activePlan?.name || 'Starter'} Plan`}
            </h2>

            {isPaidActive ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Active (1-Month Timer Running)
              </span>
            ) : isPending ? (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Payment Pending Verification
              </span>
            ) : isTrial && !trialRemainingTime.isExpired ? (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5 animate-spin text-blue-600" />
                Trialing ({trialRemainingTime.hours}h {trialRemainingTime.minutes}m Left)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                Validity Expired — Public QR Paused
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
            {isPaidActive
              ? `Your monthly subscription is active. Time Remaining: ${trialRemainingTime.days} Days, ${trialRemainingTime.hours} Hours, ${trialRemainingTime.minutes} Mins, ${trialRemainingTime.seconds} Secs.`
              : isPending
              ? `You submitted UTR: ${pendingPayment?.utr || 'Pending'}. Our admin is verifying your payment with the bank. Once verified, your account is activated automatically.`
              : isTrial
              ? 'You are enjoying 24 hours of unrestricted free trial. Choose a monthly plan below and scan the UPI QR code to keep your business profile running.'
              : 'Your subscription validity has ended. Customer QR scans and profile services are paused. Scan UPI QR below to renew and resume all services instantly.'}
          </p>

          {isPending && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href={`https://wa.me/919931782577?text=${encodeURIComponent(
                  `Namaste Badal ji, I have made manual UPI payment for SmartQR ${pendingPayment?.plan_name || 'Plan'}. Business: ${
                    currentBusiness?.name || 'My Business'
                  }. UTR: ${pendingPayment?.utr}. Please verify and activate.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Send Screenshot on WhatsApp</span>
              </a>
              <button
                onClick={() => refreshData()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Status</span>
              </button>
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <p className="text-3xl font-extrabold text-slate-900">
            ₹{((activePlan?.price_paise || 9900) / 100).toFixed(0)}
          </p>
          <p className="text-xs text-slate-400">per month (manual UPI)</p>
        </div>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Choose Your Plan & Pay via UPI
          </h3>
          <span className="text-xs text-brand-600 font-semibold flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5" />
            Scan QR with GPay / PhonePe / Paytm
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEFAULT_PLANS.map((plan) => {
            const isCurrent = activePlan?.id === plan.id && isPaidActive;
            const isPendingForThis = isPending && pendingPayment?.plan_id === plan.id;
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-[10px] font-extrabold uppercase tracking-wider py-0.5 px-3 rounded-full flex items-center gap-1 shadow-md">
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
                  ) : isPendingForThis ? (
                    <button
                      onClick={() => handleOpenPaymentModal(plan)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1.5 hover:bg-amber-500/30 transition-all"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Verification Pending (Update UTR)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenPaymentModal(plan)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        isPopular
                          ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Pay ₹{(plan.price_paise / 100).toFixed(0)} via UPI QR</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual UPI Payment Modal */}
      {selectedPlanForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 text-slate-900 relative my-8">
            <button
              onClick={() => setSelectedPlanForPayment(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                Manual UPI Transfer
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Pay for {selectedPlanForPayment.name} Plan
              </h3>
              <p className="text-xs text-slate-500">
                Scan with Google Pay, PhonePe, Paytm, or BHIM
              </p>
            </div>

            {/* Dynamic UPI QR Code Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-inner">
                <QRCodeSVG
                  value={formatUpiUri(selectedPlanForPayment)}
                  size={190}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{(selectedPlanForPayment.price_paise / 100).toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ 1 Month Access</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Payee: <strong className="text-slate-800">{officialPayeeName}</strong>
                </p>
              </div>

              {/* Mobile Deep Link */}
              <a
                href={formatUpiUri(selectedPlanForPayment)}
                className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors sm:hidden"
              >
                <span>Tap to Pay with UPI App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* UPI ID Copy Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Official UPI ID</p>
                <p className="font-mono font-bold text-slate-800">{officialUpiId}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy UPI</span>
                  </>
                )}
              </button>
            </div>

            {/* Form: UTR Submission */}
            <form onSubmit={handleSubmitUtr} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  12-Digit UPI UTR / Transaction Reference Number *
                </label>
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                  placeholder="e.g. 412384759201"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Check your Google Pay / PhonePe / Paytm receipt for the 12-digit UTR/Ref number.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting UTR...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Payment for Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <a
                  href={`https://wa.me/919931782577?text=${encodeURIComponent(
                    `Namaste Badal ji, I am paying ₹${(selectedPlanForPayment.price_paise / 100).toFixed(0)} for SmartQR ${
                      selectedPlanForPayment.name
                    } Plan. Business: ${currentBusiness?.name || 'My Business'}. UTR: ${utrNumber || '(Will send screenshot)'}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send Screenshot directly on WhatsApp (+91 9931782577)</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice History */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-600" />
          Payment Receipts & Verification History
        </h3>

        {isPaidActive ? (
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
                  <td className="py-3 font-mono">{new Date(subscription?.created_at || Date.now()).toLocaleDateString()}</td>
                  <td className="py-3 font-medium">SmartQR {activePlan?.name || 'Starter'} Monthly Access</td>
                  <td className="py-3 font-bold text-slate-900">₹{((activePlan?.price_paise || 9900) / 100).toFixed(2)}</td>
                  <td className="py-3 font-mono text-[11px]">UPI Manual Transfer</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      Verified & Active
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => alert(`Verified receipt for ${activePlan?.name || 'Starter'} plan.`)}
                      className="text-brand-600 font-bold hover:underline"
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : isPending ? (
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Payment Verification in Progress</span>
            </div>
            <p className="text-amber-700 text-[11px]">
              UTR: <strong className="font-mono">{pendingPayment?.utr}</strong> | Plan: <strong>{pendingPayment?.plan_name}</strong> | Amount: <strong>₹{((pendingPayment?.amount_paise || 9900) / 100).toFixed(0)}</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Admin verifies payments within 15 to 30 minutes. You will see your invoice and active badge right here once approved.
            </p>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Clock className="w-6 h-6 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No payment invoices yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Your business is operating on the 24-Hour Free Trial (₹0.00). After making a manual UPI payment, your verified receipt and invoice will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
