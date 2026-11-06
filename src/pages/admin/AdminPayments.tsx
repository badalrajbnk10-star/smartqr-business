import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  RefreshCw,
  Activity,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  MessageCircle,
  Plus,
  X,
  Sparkles,
  ArrowRight,
  QrCode,
  Edit2,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabaseUrl, supabaseAnonKey, DEFAULT_PLANS } from '../../lib/supabase';
import { fetchPlatformSettings, savePlatformSettings, DEFAULT_PLATFORM_SETTINGS, PlatformSettings } from '../../lib/settings';

interface PendingPaymentItem {
  businessId: string;
  businessName: string;
  businessSlug: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  planId: string;
  planName: string;
  amountPaise: number;
  utr: string;
  submittedAt: string;
  rawOpeningHours: any;
}

interface CapturedPaymentRecord {
  id: string;
  businessId?: string;
  businessName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planName: string;
  amountPaise: number;
  utr: string;
  method: string;
  status: 'captured' | 'pending';
  date: string;
  expiresAt?: string;
  isExpired?: boolean;
  daysRemaining?: number;
  rawOpeningHours?: any;
}

interface SimpleBusinessOption {
  id: string;
  name: string;
  slug: string;
  status: string;
  ownerName: string;
  rawOpeningHours: any;
}

export const AdminPayments: React.FC = () => {
  const [pendingPayments, setPendingPayments] = useState<PendingPaymentItem[]>([]);
  const [capturedPayments, setCapturedPayments] = useState<CapturedPaymentRecord[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<SimpleBusinessOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Platform Settings (UPI ID & Payee Name)
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [showEditUpiModal, setShowEditUpiModal] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [newPayeeName, setNewPayeeName] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);

  // Manual Activation Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualBizId, setManualBizId] = useState('');
  const [manualPlanId, setManualPlanId] = useState(DEFAULT_PLANS[1]?.id || DEFAULT_PLANS[0]?.id);
  const [manualDurationDays, setManualDurationDays] = useState('30');
  const [manualNote, setManualNote] = useState('');
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const fetchRealData = async () => {
    setLoading(true);
    try {
      // 1. Fetch current UPI platform settings
      const currentSettings = await fetchPlatformSettings();
      setSettings(currentSettings);
      setNewUpiId(currentSettings.upi_id);
      setNewPayeeName(currentSettings.payee_name);

      const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Cache-Control': 'no-cache',
      };

      const [bizRes, profilesRes, subsRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/businesses?select=*&order=created_at.desc`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/subscriptions?select=*`, { headers }).catch(() => null),
      ]);

      const businesses = bizRes.ok ? await bizRes.json() : [];
      const profiles = profilesRes.ok ? await profilesRes.json() : [];
      const subs = subsRes && subsRes.ok ? await subsRes.json() : [];

      const profilesMap = new Map<string, any>();
      for (const p of profiles) profilesMap.set(p.id, p);

      const pending: PendingPaymentItem[] = [];
      const captured: CapturedPaymentRecord[] = [];
      const bizOptions: SimpleBusinessOption[] = [];

      for (const b of businesses) {
        const owner = profilesMap.get(b.owner_id);
        const ownerName = owner?.full_name || 'Business Owner';
        const ownerEmail = owner?.email || b.email || 'N/A';
        const ownerPhone = owner?.phone || b.phone || 'N/A';
        const openingHours = b.opening_hours || {};

        bizOptions.push({
          id: b.id,
          name: b.name || 'Untitled Business',
          slug: b.slug,
          status: b.status || 'trialing',
          ownerName,
          rawOpeningHours: openingHours,
        });

        // 1. Check for Pending Manual Payment Submission
        const pPay = openingHours._pending_payment;
        if (pPay && pPay.status === 'pending') {
          pending.push({
            businessId: b.id,
            businessName: b.name || 'Untitled Business',
            businessSlug: b.slug,
            ownerName: pPay.customer_name || ownerName,
            ownerEmail: pPay.customer_email || ownerEmail,
            ownerPhone: pPay.customer_phone || ownerPhone,
            planId: pPay.plan_id || DEFAULT_PLANS[0].id,
            planName: pPay.plan_name || 'Starter',
            amountPaise: Number(pPay.amount_paise) || 9900,
            utr: pPay.utr || 'N/A',
            submittedAt: pPay.submitted_at || b.updated_at || b.created_at,
            rawOpeningHours: openingHours,
          });
        }

        // 2. Check for Captured Active/Expired Subscriptions
        const activeSub = openingHours._subscription;
        if (activeSub || b.status === 'active') {
          const expiresAtStr = activeSub?.expires_at;
          const isExpired = expiresAtStr ? Date.now() >= new Date(expiresAtStr).getTime() : b.status === 'expired';
          const diffMs = expiresAtStr ? new Date(expiresAtStr).getTime() - Date.now() : 0;
          const daysRemaining = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

          captured.push({
            id: `biz-sub-${b.id}`,
            businessId: b.id,
            businessName: b.name,
            customerName: ownerName,
            customerEmail: ownerEmail,
            customerPhone: ownerPhone,
            planName: activeSub?.plan_name || 'Starter Plan',
            amountPaise: Number(activeSub?.amount_paise) || 9900,
            utr: activeSub?.utr || activeSub?.payment_id || `UPI-${b.id.substring(0, 8)}`,
            method: activeSub?.payment_method || 'Manual UPI Transfer',
            status: 'captured',
            date: activeSub?.activated_at ? new Date(activeSub.activated_at).toLocaleString() : new Date(b.created_at).toLocaleString(),
            expiresAt: expiresAtStr,
            isExpired,
            daysRemaining,
            rawOpeningHours: openingHours,
          });
        }
      }

      // Add records from subscriptions table if any
      for (const s of subs) {
        if (s.status === 'active') {
          const owner = profilesMap.get(s.business_owner_id);
          captured.push({
            id: s.id,
            businessName: 'Business Profile',
            customerName: owner?.full_name || 'Business Owner',
            customerEmail: owner?.email || 'N/A',
            customerPhone: owner?.phone || 'N/A',
            planName: 'AutoPay Subscription',
            amountPaise: s.price_paise || 9900,
            utr: s.razorpay_payment_id || `sub_${s.id.substring(0, 8)}`,
            method: 'UPI AutoPay',
            status: 'captured',
            date: s.created_at ? new Date(s.created_at).toLocaleString() : 'N/A',
            daysRemaining: 30,
            isExpired: false,
          });
        }
      }

      setPendingPayments(pending);
      setCapturedPayments(captured);
      setAllBusinesses(bizOptions);
      if (bizOptions.length > 0 && !manualBizId) {
        setManualBizId(bizOptions[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2500);
  };

  // Save new UPI ID directly from Super Admin
  const handleSaveUpiQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpiId.trim()) return;
    setSavingUpi(true);

    const res = await savePlatformSettings({
      upi_id: newUpiId.trim(),
      payee_name: newPayeeName.trim() || 'Badal Sarkar',
    });

    setSavingUpi(false);
    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setSettings((prev) => ({
        ...prev,
        upi_id: newUpiId.trim(),
        payee_name: newPayeeName.trim() || 'Badal Sarkar',
      }));
      setShowEditUpiModal(false);
      setActionSuccess(`UPI ID updated to "${newUpiId.trim()}". All customer QR codes will use this UPI ID.`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Approve & Start 1-Month (30 Days) Timer
  const handleApprovePayment = async (item: PendingPaymentItem) => {
    setProcessingId(item.businessId);
    setActionError(null);
    setActionSuccess(null);

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updatedHours = {
      ...item.rawOpeningHours,
      _subscription: {
        plan_id: item.planId,
        plan_name: item.planName,
        amount_paise: item.amountPaise,
        status: 'active',
        utr: item.utr,
        payment_method: 'Manual UPI Transfer',
        activated_at: now.toISOString(),
        expires_at: periodEnd.toISOString(),
      },
      _pending_payment: null, // Clear pending state
    };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${item.businessId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'active',
          opening_hours: updatedHours,
        }),
      });

      if (res.ok) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setActionSuccess(
          `Payment verified & approved! "${item.businessName}" is now ACTIVE. 1-Month Timer (30 Days) started.`
        );
        await fetchRealData();
      } else {
        setActionError('Failed to activate business status on Supabase server.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error while approving payment.');
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  // Reject Manual Payment
  const handleRejectPayment = async (item: PendingPaymentItem) => {
    if (!window.confirm(`Are you sure you want to reject UTR "${item.utr}" for "${item.businessName}"?`)) {
      return;
    }

    setProcessingId(item.businessId);
    setActionError(null);
    setActionSuccess(null);

    const updatedHours = {
      ...item.rawOpeningHours,
      _pending_payment: {
        ...item.rawOpeningHours?._pending_payment,
        status: 'rejected',
        rejected_at: new Date().toISOString(),
      },
    };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${item.businessId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          opening_hours: updatedHours,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Payment rejected for "${item.businessName}".`);
        await fetchRealData();
      } else {
        setActionError('Failed to update rejection status.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Super Admin: Extend or Modify Timer for ANY Business
  const handleExtendValidity = async (record: CapturedPaymentRecord, extraDays: number) => {
    if (!record.businessId) return;
    setProcessingId(record.businessId);

    const currentExpiry = record.expiresAt ? new Date(record.expiresAt).getTime() : Date.now();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiry = new Date(baseTime + extraDays * 24 * 60 * 60 * 1000);

    const updatedHours = {
      ...(record.rawOpeningHours || {}),
      _subscription: {
        ...(record.rawOpeningHours?._subscription || {}),
        status: 'active',
        expires_at: newExpiry.toISOString(),
      },
    };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${record.businessId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'active',
          opening_hours: updatedHours,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Extended validity by ${extraDays} days for "${record.businessName}".`);
        await fetchRealData();
      }
    } catch {
      setActionError('Failed to extend validity.');
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Super Admin: Instantly Pause/Expire Subscription
  const handleExpireImmediately = async (record: CapturedPaymentRecord) => {
    if (!record.businessId) return;
    if (!window.confirm(`Expire & pause public services for "${record.businessName}" right now?`)) return;

    setProcessingId(record.businessId);

    const updatedHours = {
      ...(record.rawOpeningHours || {}),
      _subscription: {
        ...(record.rawOpeningHours?._subscription || {}),
        status: 'expired',
        expires_at: new Date(Date.now() - 1000).toISOString(),
      },
    };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${record.businessId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'expired',
          opening_hours: updatedHours,
        }),
      });

      if (res.ok) {
        setActionSuccess(`Business "${record.businessName}" expired and paused.`);
        await fetchRealData();
      }
    } catch {
      setActionError('Failed to expire business.');
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Super Admin: Direct Manual Business Activation
  const handleManualActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBizId) return;

    setManualSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    const targetBiz = allBusinesses.find((b) => b.id === manualBizId);
    const selectedPlan = DEFAULT_PLANS.find((p) => p.id === manualPlanId) || DEFAULT_PLANS[0];

    const now = new Date();
    const days = parseInt(manualDurationDays) || 30;
    const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const currentHours = targetBiz?.rawOpeningHours || {};
    const updatedHours = {
      ...currentHours,
      _subscription: {
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        amount_paise: selectedPlan.price_paise,
        status: 'active',
        utr: manualNote.trim() || `ADMIN_GRANTED_${Date.now()}`,
        payment_method: 'Super Admin Manual Grant',
        activated_at: now.toISOString(),
        expires_at: periodEnd.toISOString(),
      },
      _pending_payment: null,
    };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${manualBizId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'active',
          opening_hours: updatedHours,
        }),
      });

      if (res.ok) {
        setShowManualModal(false);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setActionSuccess(
          `Success! "${targetBiz?.name}" manually activated on ${selectedPlan.name} Plan for ${days} days.`
        );
        setManualNote('');
        await fetchRealData();
      } else {
        setActionError('Failed to grant plan access on Supabase server.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Network error.');
    } finally {
      setManualSubmitting(false);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const filteredCaptured = capturedPayments.filter(
    (p) =>
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      p.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      p.utr.toLowerCase().includes(search.toLowerCase()) ||
      p.customerPhone.toLowerCase().includes(search.toLowerCase())
  );

  const totalCapturedRupees = capturedPayments.reduce((sum, p) => sum + p.amountPaise / 100, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              UPI Manual Payments & Timer Management
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              <Activity className="w-3 h-3 animate-pulse" />
              Live Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic UPI engine: change UPI ID, verify UTR, start 1-month timers, and manage service expirations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEditUpiModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Change Official UPI ID</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>+ Activate Any Business</span>
          </button>

          <button
            onClick={fetchRealData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Active UPI ID Announcement Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Active QR Code UPI Target
              </span>
              <span className="text-xs font-bold text-white font-mono bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-700">
                {settings.upi_id}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Payee Name: <strong className="text-white">{settings.payee_name}</strong> | All QR codes generated for customers will pay to this UPI ID.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowEditUpiModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit UPI ID</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Captured Revenue</span>
          <p className="text-3xl font-black text-emerald-400">
            ₹{totalCapturedRupees.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-500">Live verified customer payments</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Pending UTR Approvals</span>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-amber-400">{pendingPayments.length}</p>
            {pendingPayments.length > 0 && (
              <span className="text-xs font-bold text-amber-300 animate-pulse">Action Required</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">Awaiting Super Admin verification</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Active Paid Subscriptions</span>
          <p className="text-3xl font-black text-white">
            {capturedPayments.filter((p) => !p.isExpired).length}
          </p>
          <p className="text-[11px] text-slate-500">Timers currently running</p>
        </div>
      </div>

      {/* SECTION 1: Pending Manual UPI Payment Requests */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Pending Manual UPI Payment Requests
              </h2>
              <p className="text-xs text-slate-400">
                Customers who paid via UPI and submitted their 12-digit UTR number. Click "Approve & Start 1-Month Timer" to resume their services.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            {pendingPayments.length} Pending
          </span>
        </div>

        {pendingPayments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-slate-800 rounded-2xl">
            <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="text-xs font-bold text-slate-300">No Pending Approvals</p>
            <p className="text-[11px] text-slate-500">
              All submitted payments have been verified and processed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] bg-slate-950/60">
                  <th className="py-3 px-4">Business & Owner</th>
                  <th className="py-3 px-4">Selected Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Customer UTR</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right">Verification & Timer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pendingPayments.map((item) => (
                  <tr key={item.businessId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-sm">{item.businessName}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.ownerName} • {item.ownerPhone}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">/b/{item.businessSlug}</p>
                    </td>

                    <td className="py-4 px-4 font-bold text-amber-400">
                      {item.planName} Plan
                    </td>

                    <td className="py-4 px-4 font-black text-white text-sm">
                      ₹{(item.amountPaise / 100).toFixed(0)}
                    </td>

                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono font-bold text-amber-300 text-xs">
                        <span>{item.utr}</span>
                        <button
                          onClick={() => handleCopyUtr(item.utr)}
                          title="Copy UTR"
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedUtr === item.utr ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-[11px] text-slate-400 font-mono">
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : 'N/A'}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        {/* WhatsApp Customer Link */}
                        {item.ownerPhone && item.ownerPhone !== 'N/A' && (
                          <a
                            href={`https://wa.me/${item.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${item.ownerName}, Badal Sarkar here from SmartQR. Confirming receipt for your payment of ₹${(
                                item.amountPaise / 100
                              ).toFixed(0)} with UTR: ${item.utr}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        {/* Approve Button */}
                        <button
                          onClick={() => handleApprovePayment(item)}
                          disabled={processingId === item.businessId}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-md shadow-emerald-500/20"
                        >
                          {processingId === item.businessId ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          <span>Approve & Start 1-Mo Timer</span>
                        </button>

                        {/* Reject Button */}
                        <button
                          onClick={() => handleRejectPayment(item)}
                          disabled={processingId === item.businessId}
                          className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-500/30 transition-colors"
                          title="Reject Payment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Verified & Active Subscriptions with Validity Timers */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Subscriptions & 1-Month Validity Timers
            </h2>
            <p className="text-xs text-slate-400">
              Live timers for all businesses. When timer reaches 0, services and QR code automatically stop until renewal.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, owner, or UTR..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] bg-slate-950/60">
                <th className="py-3 px-4">Business & Customer</th>
                <th className="py-3 px-4">Plan Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reference / UTR</th>
                <th className="py-3 px-4">Validity Timer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Super Admin Timer Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading real records...</span>
                  </td>
                </tr>
              ) : capturedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="font-bold text-slate-300">No Active Subscriptions Yet</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      When customers submit a manual payment or you activate a business, verified records and countdown timers will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCaptured.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-sm">{pay.businessName}</p>
                      <p className="text-[11px] text-slate-400">
                        {pay.customerName} • {pay.customerPhone}
                      </p>
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-200">
                      {pay.planName}
                    </td>

                    <td className="py-4 px-4 font-black text-emerald-400 text-sm">
                      ₹{(pay.amountPaise / 100).toFixed(0)}
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-amber-300">
                      {pay.utr}
                    </td>

                    {/* Timer Cell */}
                    <td className="py-4 px-4">
                      {pay.isExpired ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase">
                          Expired (Services Paused)
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>{pay.daysRemaining} Days Left</span>
                          </span>
                          {pay.expiresAt && (
                            <p className="text-[10px] text-slate-500 font-mono">
                              Until {new Date(pay.expiresAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {pay.isExpired ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                          Inactive
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Timer Actions */}
                    <td className="py-4 px-4 text-right">
                      {pay.businessId ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleExtendValidity(pay, 30)}
                            disabled={processingId === pay.businessId}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-colors"
                            title="Add 1 Month (30 Days)"
                          >
                            +30 Days
                          </button>

                          <button
                            onClick={() => handleExtendValidity(pay, 7)}
                            disabled={processingId === pay.businessId}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-colors"
                            title="Add 7 Days Free Trial"
                          >
                            +7 Days
                          </button>

                          {!pay.isExpired && (
                            <button
                              onClick={() => handleExpireImmediately(pay)}
                              disabled={processingId === pay.businessId}
                              className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-[10px] font-bold transition-colors"
                              title="Expire & Stop Services Immediately"
                            >
                              Pause Now
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono">Gateway Mandate</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Quick UPI Change Modal */}
      {showEditUpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-white relative">
            <button
              onClick={() => setShowEditUpiModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                Change UPI Target
              </span>
              <h3 className="text-xl font-black text-white">
                Update Official UPI ID
              </h3>
              <p className="text-xs text-slate-400">
                Enter any new UPI ID. All customer QR codes across the website will immediately point to this UPI ID.
              </p>
            </div>

            <form onSubmit={handleSaveUpiQuick} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New UPI ID *
                </label>
                <input
                  type="text"
                  required
                  value={newUpiId}
                  onChange={(e) => setNewUpiId(e.target.value.trim())}
                  placeholder="e.g. 9931782577@ybl or badal@paytm"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payee Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPayeeName}
                  onChange={(e) => setNewPayeeName(e.target.value)}
                  placeholder="e.g. Badal Sarkar"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingUpi}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {savingUpi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating across servers...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Update QR Code Live</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Direct Manual Business Activation */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-white relative">
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                Super Admin Direct Access
              </span>
              <h3 className="text-xl font-black text-white">
                Manually Activate Business Plan
              </h3>
              <p className="text-xs text-slate-400">
                Grant instant plan access and start timer for any registered business.
              </p>
            </div>

            <form onSubmit={handleManualActivationSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Business *
                </label>
                <select
                  required
                  value={manualBizId}
                  onChange={(e) => setManualBizId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
                >
                  {allBusinesses.length === 0 ? (
                    <option value="">No businesses registered yet</option>
                  ) : (
                    allBusinesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.ownerName} - {b.status})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Plan *
                  </label>
                  <select
                    value={manualPlanId}
                    onChange={(e) => setManualPlanId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    {DEFAULT_PLANS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{(p.price_paise / 100).toFixed(0)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Timer Duration *
                  </label>
                  <select
                    value={manualDurationDays}
                    onChange={(e) => setManualDurationDays(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="30">1 Month (30 Days)</option>
                    <option value="90">3 Months (90 Days)</option>
                    <option value="180">6 Months (180 Days)</option>
                    <option value="365">1 Year (365 Days)</option>
                    <option value="3650">Lifetime (10 Years)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reference Note / UTR (Optional)
                </label>
                <input
                  type="text"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="e.g. Paid in Cash / Direct PhonePe UTR / VIP Client"
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={manualSubmitting || !manualBizId}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {manualSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Activating Business & Starting Timer...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Grant Plan Access & Start Timer</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
