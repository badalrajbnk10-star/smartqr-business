import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Lock,
  Unlock,
  RefreshCw,
  Activity,
  CreditCard,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import { supabaseUrl, supabaseAnonKey, DEFAULT_PLANS } from '../../lib/supabase';

interface RealAdminBusiness {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  category: string;
  status: 'active' | 'trialing' | 'suspended' | 'expired';
  scans: number;
  registeredDate: string;
  servicesCount: number;
  menuCount: number;
  rawOpeningHours?: any;
}

export const AdminBusinesses: React.FC = () => {
  const [businesses, setBusinesses] = useState<RealAdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [planModalBiz, setPlanModalBiz] = useState<RealAdminBusiness | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState(DEFAULT_PLANS[1]?.id || DEFAULT_PLANS[0]?.id);
  const [planDurationDays, setPlanDurationDays] = useState('30');
  const [planUpdating, setPlanUpdating] = useState(false);

  const fetchRealBusinesses = async () => {
    setLoading(true);
    try {
      const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Cache-Control': 'no-cache',
      };

      const [bizRes, profilesRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/businesses?select=*&order=created_at.desc`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, { headers }),
      ]);

      const rawBiz = bizRes.ok ? await bizRes.json() : [];
      const rawProfiles = profilesRes.ok ? await profilesRes.json() : [];

      const profilesMap = new Map<string, any>();
      for (const p of rawProfiles) {
        profilesMap.set(p.id, p);
      }

      const merged: RealAdminBusiness[] = rawBiz.map((b: any) => {
        const owner = profilesMap.get(b.owner_id);
        const scans = Number(b.opening_hours?._analytics?.total_scans) || 0;
        const regDate = b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A';
        const svcs = Array.isArray(b.services) ? b.services.length : 0;
        const menu = Array.isArray(b.menu_items) ? b.menu_items.length : 0;

        return {
          id: b.id,
          name: b.name || 'Untitled Business',
          slug: b.slug,
          ownerId: b.owner_id,
          ownerName: owner?.full_name || 'Business Owner',
          ownerEmail: owner?.email || b.email || 'N/A',
          ownerPhone: owner?.phone || b.phone || 'N/A',
          category: b.city ? `${b.city}, ${b.state || ''}` : 'Local Business',
          status: b.status || 'trialing',
          scans,
          registeredDate: regDate,
          servicesCount: svcs,
          menuCount: menu,
          rawOpeningHours: b.opening_hours || {},
        };
      });

      setBusinesses(merged);
    } catch (err) {
      console.error('Failed to load businesses for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealBusinesses();
  }, []);

  const handleGrantPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planModalBiz) return;
    setPlanUpdating(true);

    const selectedPlan = DEFAULT_PLANS.find((p) => p.id === selectedPlanId) || DEFAULT_PLANS[0];
    const now = new Date();
    const days = parseInt(planDurationDays) || 30;
    const periodEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const currentHours = planModalBiz.rawOpeningHours || {};
    const updatedHours = {
      ...currentHours,
      _subscription: {
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
        amount_paise: selectedPlan.price_paise,
        status: 'active',
        utr: `ADMIN_MANUAL_${Date.now()}`,
        payment_method: 'Super Admin Manual Activation',
        activated_at: now.toISOString(),
        expires_at: periodEnd.toISOString(),
      },
      _pending_payment: null,
    };

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${planModalBiz.id}`, {
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
        setBusinesses((prev) =>
          prev.map((b) => (b.id === planModalBiz.id ? { ...b, status: 'active', rawOpeningHours: updatedHours } : b))
        );
        setActionMessage(`Business "${planModalBiz.name}" activated on ${selectedPlan.name} Plan for ${days} days.`);
        setPlanModalBiz(null);
      } else {
        setActionMessage('Failed to update plan on server.');
      }
    } catch {
      setActionMessage('Network error updating plan.');
    } finally {
      setPlanUpdating(false);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const toggleSuspension = async (biz: RealAdminBusiness) => {
    setUpdatingId(biz.id);
    const newStatus = biz.status === 'suspended' ? 'active' : 'suspended';

    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?id=eq.${biz.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === biz.id ? { ...b, status: newStatus } : b))
        );
        setActionMessage(
          `Business "${biz.name}" has been ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}. QR endpoint is updated.`
        );
      } else {
        setActionMessage(`Failed to update status on server.`);
      }
    } catch (err) {
      setActionMessage(`Network error while updating business.`);
    } finally {
      setUpdatingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const filtered = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerPhone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      b.status === statusFilter ||
      (statusFilter === 'trialing' && (b.status === 'trialing' || !b.status));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Business Profiles & Owner Management
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              <Activity className="w-3 h-3 animate-pulse" />
              Live DB Records ({businesses.length})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real registered businesses, actual telemetry scan counts, and instant suspension controls.
          </p>
        </div>

        <button
          onClick={fetchRealBusinesses}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, owner, phone or slug..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Statuses ({businesses.length})</option>
            <option value="active">Active</option>
            <option value="trialing">24h Trial</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px] bg-slate-950/50">
                <th className="py-3 px-5">Business Name & URL</th>
                <th className="py-3 px-5">Owner Details</th>
                <th className="py-3 px-5">Catalog</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Scans</th>
                <th className="py-3 px-5">Registered</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500 mb-2" />
                    <span>Loading real database profiles...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No businesses match your search filter.
                  </td>
                </tr>
              ) : (
                filtered.map((biz) => (
                  <tr key={biz.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-white text-sm">{biz.name}</p>
                      <p className="text-[11px] text-amber-400 font-mono">/b/{biz.slug}</p>
                    </td>

                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-200">{biz.ownerName}</p>
                      <p className="text-[11px] text-slate-400">{biz.ownerEmail}</p>
                      {biz.ownerPhone !== 'N/A' && (
                        <p className="text-[10px] text-slate-500 font-mono">{biz.ownerPhone}</p>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-slate-300 font-semibold">
                        {biz.servicesCount} services
                      </span>
                      {biz.menuCount > 0 && (
                        <span className="text-[10px] text-slate-500 block">
                          +{biz.menuCount} menu items
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      {biz.status === 'active' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Active Paid
                        </span>
                      ) : biz.status === 'suspended' ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          24h Trial
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-200">
                      {biz.scans}
                    </td>

                    <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                      {biz.registeredDate}
                    </td>

                    <td className="py-4 px-5 text-right space-x-2">
                      <a
                        href={`/b/${biz.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </a>

                      <button
                        onClick={() => setPlanModalBiz(biz)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Set Plan</span>
                      </button>

                      <button
                        onClick={() => toggleSuspension(biz)}
                        disabled={updatingId === biz.id}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                          biz.status === 'suspended'
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30'
                        }`}
                      >
                        {biz.status === 'suspended' ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Reactivate</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Assignment Modal */}
      {planModalBiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-5 text-white relative">
            <button
              onClick={() => setPlanModalBiz(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                Grant Access
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                Assign Plan to {planModalBiz.name}
              </h3>
              <p className="text-xs text-slate-400">
                Owner: {planModalBiz.ownerName} ({planModalBiz.ownerEmail})
              </p>
            </div>

            <form onSubmit={handleGrantPlan} className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Subscription Plan *
                </label>
                <div className="space-y-2">
                  {DEFAULT_PLANS.map((p) => {
                    const isSelected = selectedPlanId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs">{p.name} Plan</p>
                          <p className="text-[10px] text-slate-400">Up to {p.max_photos_per_business} photos</p>
                        </div>
                        <span className="font-black text-xs text-amber-400">
                          ₹{(p.price_paise / 100).toFixed(0)}/mo
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Plan Duration *
                </label>
                <select
                  value={planDurationDays}
                  onChange={(e) => setPlanDurationDays(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500"
                >
                  <option value="30">1 Month (30 Days)</option>
                  <option value="90">3 Months (90 Days)</option>
                  <option value="180">6 Months (180 Days)</option>
                  <option value="365">1 Year (365 Days)</option>
                  <option value="3650">Lifetime Access (10 Years)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={planUpdating}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {planUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Plan on Supabase...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Activate Plan Immediately</span>
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