import React, { useState } from 'react';
import {
  Building,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
  Unlock
} from 'lucide-react';

interface MockAdminBusiness {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  category: string;
  status: 'active' | 'trialing' | 'suspended';
  scans: number;
  registeredDate: string;
}

export const AdminBusinesses: React.FC = () => {
  const [businesses, setBusinesses] = useState<MockAdminBusiness[]>([
    {
      id: 'biz-1',
      name: 'The Grand Heritage Hotel & Dine',
      slug: 'grand-heritage',
      ownerName: 'Rajesh Sharma',
      ownerEmail: 'owner@hotelgrand.in',
      category: 'Hotels & Lodges',
      status: 'active',
      scans: 148,
      registeredDate: '2026-11-01',
    },
    {
      id: 'biz-2',
      name: 'Spice Garden Family Restaurant',
      slug: 'spice-garden',
      ownerName: 'Amit Verma',
      ownerEmail: 'amit@spicegarden.com',
      category: 'Restaurants',
      status: 'trialing',
      scans: 42,
      registeredDate: '2026-11-04',
    },
    {
      id: 'biz-3',
      name: 'Dr. Mehta Dental & Implant Clinic',
      slug: 'dr-mehta-dental',
      ownerName: 'Dr. S. Mehta',
      ownerEmail: 'clinic@mehtadental.in',
      category: 'Hospitals & Clinics',
      status: 'active',
      scans: 310,
      registeredDate: '2026-10-15',
    },
    {
      id: 'biz-4',
      name: 'Apex IIT-JEE Coaching Academy',
      slug: 'apex-academy',
      ownerName: 'Sunil Choudhary',
      ownerEmail: 'info@apexacademy.org',
      category: 'Coaching & Education',
      status: 'suspended',
      scans: 85,
      registeredDate: '2026-10-02',
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const toggleSuspension = (bizId: string) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === bizId) {
          const newStatus = b.status === 'suspended' ? 'active' : 'suspended';
          setActionMessage(
            `Business "${b.name}" has been ${newStatus === 'suspended' ? 'suspended' : 'reactivated'}. QR code destination preserved.`
          );
          setTimeout(() => setActionMessage(null), 4000);
          return { ...b, status: newStatus };
        }
        return b;
      })
    );
  };

  const filtered = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Business Profiles & Owner Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            View, audit, and manage all registered businesses and their dynamic QR states.
          </p>
        </div>
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
            placeholder="Search business, owner or email..."
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
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
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
                <th className="py-3 px-5">Business Name & Category</th>
                <th className="py-3 px-5">Owner</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Scans</th>
                <th className="py-3 px-5">Registered</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((biz) => (
                <tr key={biz.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-5">
                    <p className="font-bold text-white text-sm">{biz.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">/b/{biz.slug} • {biz.category}</p>
                  </td>

                  <td className="py-4 px-5">
                    <p className="font-semibold text-slate-200">{biz.ownerName}</p>
                    <p className="text-[11px] text-slate-500">{biz.ownerEmail}</p>
                  </td>

                  <td className="py-4 px-5">
                    {biz.status === 'active' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        Active
                      </span>
                    ) : biz.status === 'trialing' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                        24h Trial
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                        Suspended
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5 font-bold text-slate-200">{biz.scans}</td>

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
                      onClick={() => toggleSuspension(biz.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
