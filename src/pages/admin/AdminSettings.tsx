import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, CheckCircle2, AlertCircle, QrCode, RefreshCw, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { fetchPlatformSettings, savePlatformSettings, DEFAULT_PLATFORM_SETTINGS } from '../../lib/settings';

export const AdminSettings: React.FC = () => {
  const [websiteName, setWebsiteName] = useState(DEFAULT_PLATFORM_SETTINGS.website_name);
  const [supportEmail, setSupportEmail] = useState(DEFAULT_PLATFORM_SETTINGS.support_email);
  const [supportPhone, setSupportPhone] = useState(DEFAULT_PLATFORM_SETTINGS.support_phone);
  const [upiId, setUpiId] = useState(DEFAULT_PLATFORM_SETTINGS.upi_id);
  const [payeeName, setPayeeName] = useState(DEFAULT_PLATFORM_SETTINGS.payee_name);
  const [trialHours, setTrialHours] = useState('24');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    fetchPlatformSettings().then((s) => {
      setWebsiteName(s.website_name);
      setSupportEmail(s.support_email);
      setSupportPhone(s.support_phone);
      setUpiId(s.upi_id);
      setPayeeName(s.payee_name);
      setTrialHours(s.trial_duration_hours.toString());
    });

    const handler = (e: any) => {
      const s = e.detail;
      if (s) {
        setWebsiteName(s.website_name);
        setSupportEmail(s.support_email);
        setSupportPhone(s.support_phone);
        setUpiId(s.upi_id);
        setPayeeName(s.payee_name);
      }
    };
    window.addEventListener('smartqr_settings_updated', handler);
    return () => window.removeEventListener('smartqr_settings_updated', handler);
  }, []);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const cleanUpiUri = `upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(
    payeeName.trim()
  )}&am=99.00&cu=INR&tn=SmartQR%20Test%20Payment`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    const res = await savePlatformSettings({
      website_name: websiteName,
      support_email: supportEmail,
      support_phone: supportPhone,
      upi_id: upiId.trim(),
      payee_name: payeeName.trim(),
      trial_duration_hours: parseInt(trialHours) || 24,
    });

    setSaving(false);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSavedSuccess(true);
      if (res.settings) {
        setUpiId(res.settings.upi_id);
        setPayeeName(res.settings.payee_name);
      }
      setTimeout(() => setSavedSuccess(false), 5000);
    } else {
      setErrorMessage(res.error || 'Failed to update settings.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-white">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Super Admin Platform Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Set your official UPI ID, payee name, customer helpline, and manage global platform rules.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Platform UPI settings updated successfully! All customer QR codes are now generated using this UPI ID.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* UPI Gateway & Automatic QR Generator Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Official UPI ID & Automatic QR Code Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  Whatever UPI ID you enter here, the website will automatically generate its QR code for all customer payments.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 text-xs font-bold">
              Dynamic UPI Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Official UPI ID for Receiving Customer Payments *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.trim())}
                    placeholder="e.g. 9931782577@ybl or yourname@paytm"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  You can enter Google Pay, PhonePe, Paytm, BHIM, or bank UPI ID (e.g. 9931782577@ybl).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Payee Account Holder Name (Visible on UPI App) *
                </label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="e.g. Badal Sarkar"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  WhatsApp Helpline for Payment Proof Submissions *
                </label>
                <input
                  type="text"
                  required
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="e.g. +91 9931782577"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Customers will click to send payment screenshots directly to this WhatsApp number.
                </p>
              </div>
            </div>

            {/* Live Instant QR Preview Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Live Automatic QR Code Preview
              </span>
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-md">
                <QRCodeSVG value={cleanUpiUri} size={180} level="H" includeMargin={true} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white font-mono">{upiId || 'Enter UPI ID'}</p>
                <p className="text-[11px] text-slate-400">Payee: {payeeName || 'Your Name'}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 transition-colors"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Test Copy UPI ID</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-500">
                Tip: Scan this QR code with your phone right now to verify that your UPI app opens properly.
              </p>
            </div>
          </div>
        </div>

        {/* General Platform Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            General Branding & Free Trial Duration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                required
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Support Email
              </label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Free Trial Duration (Hours)
              </label>
              <input
                type="number"
                required
                value={trialHours}
                onChange={(e) => setTrialHours(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xl shadow-amber-500/20"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving to Supabase Cloud...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings & Update QR Code Live</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
