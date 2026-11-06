import React, { useState, useEffect } from 'react';
import { QrCode, Search, ExternalLink, RefreshCw, Activity } from 'lucide-react';
import { supabaseUrl, supabaseAnonKey } from '../../lib/supabase';

interface RealQRCodeRecord {
  id: string;
  businessName: string;
  slug: string;
  permanentUrl: string;
  ownerName: string;
  ownerPhone: string;
  scans: number;
  status: 'active' | 'trialing' | 'suspended';
  created: string;
}

export const AdminQRCodes: React.FC = () => {
  const [qrs, setQrs] = useState<RealQRCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchRealQRCodes = async () => {
    setLoading(true);
    try {
      const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Cache-Control': 'no-cache',
      };

      const [bizRes, profilesRes, qrRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/businesses?select=*&order=created_at.desc`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, { headers }),
        fetch(`${supabaseUrl}/rest/v1/qr_codes?select=*`, { headers }),
      ]);

      const rawBiz = bizRes.ok ? await bizRes.json() : [];
      const rawProfiles = profilesRes.ok ? await profilesRes.json() : [];
      const rawQRs = qrRes.ok ? await qrRes.json() : [];

      const profilesMap = new Map<string, any>();
      for (const p of rawProfiles) profilesMap.set(p.id, p);

      const qrMap = new Map<string, any>();
      for (const q of rawQRs) qrMap.set(q.business_id, q);

      const records: RealQRCodeRecord[] = rawBiz.map((b: any) => {
        const owner = profilesMap.get(b.owner_id);
        const qr = qrMap.get(b.id);
        const scans = Number(b.opening_hours?._analytics?.total_scans) || Number(qr?.total_scans) || 0;
        const regDate = b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A';

        return {
          id: qr?.id || `qr-${b.id}`,
          businessName: b.name || 'Untitled Business',
          slug: b.slug,
          permanentUrl: `${window.location.origin}/b/${b.slug}`,
          ownerName: owner?.full_name || 'Business Owner',
          ownerPhone: owner?.phone || b.phone || 'N/A',
          scans,
          status: b.status || 'trialing',
          created: regDate,
        };
      });

      setQrs(records);
    } catch (err) {
      console.error('Failed to load real QR codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealQRCodes();
  }, []);

  const filtered = qrs.filter(
    (q) =>
      q.businessName.toLowerCase().includes(search.toLowerCase()) ||
      q.slug.toLowerCase().includes(search.toLowerCase()) ||
      q.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      q.ownerPhone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Permanent Dynamic QR Code Registry
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
              <Activity className="w-3 h-3 animate-pulse" />
              Live QR Routes ({qrs.length})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Permanent dynamic endpoints allocated to registered business profiles.
          </p>
        </div>

        <button
          onClick={fetchRealQRCodes}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, slug, or owner phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px] bg-slate-950/50">
                <th className="py-3 px-5">Business & Permanent URL</th>
                <th className="py-3 px-5">Owner</th>
                <th className="py-3 px-5">Total Scans</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Created</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-500 mb-2" />
                    <span>Loading real QR registry...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No QR records match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((qr) => (
                  <tr key={qr.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-white text-sm">{qr.businessName}</p>
                      <p className="text-[11px] text-brand-400 font-mono">{qr.permanentUrl}</p>
                    </td>

                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-200">{qr.ownerName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{qr.ownerPhone}</p>
                    </td>

                    <td className="py-4 px-5">
                      <span className="font-black text-white text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                        {qr.scans} scans
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      {qr.status === 'active' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          Active Paid
                        </span>
                      ) : qr.status === 'suspended' ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          24h Trial
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                      {qr.created}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <a
                        href={`/b/${qr.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-lg font-semibold text-[11px] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Visit QR Page</span>
                      </a>
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