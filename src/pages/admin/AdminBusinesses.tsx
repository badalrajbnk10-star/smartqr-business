import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Lock,
  Unlock,
  RefreshCw,
  Activity
} from 'lucide-react';
import { supabaseUrl, supabaseAnonKey } from '../../lib/supabase';

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
}

export const AdminBusinesses: React.FC = () => {
  const [businesses, setBusinesses] = useState<RealAdminBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    </div>
  );
};