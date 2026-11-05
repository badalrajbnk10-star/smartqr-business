import React, { useState } from 'react';
import { QrCode, Search, ExternalLink, ShieldCheck, Eye } from 'lucide-react';

export const AdminQRCodes: React.FC = () => {
  const [qrs] = useState([
    {
      id: 'qr-1',
      businessName: 'The Grand Heritage Hotel & Dine',
      slug: 'grand-heritage',
      permanentUrl: `${window.location.origin}/b/grand-heritage`,
      owner: 'Rajesh Sharma',
      scans: 148,
      status: 'active',
      created: '2026-11-01',
    },
    {
      id: 'qr-2',
      businessName: 'Spice Garden Family Restaurant',
      slug: 'spice-garden',
      permanentUrl: `${window.location.origin}/b/spice-garden`,
      owner: 'Amit Verma',
      scans: 42,
      status: 'trialing',
      created: '2026-11-04',
    },
    {
      id: 'qr-3',
      businessName: 'Dr. Mehta Dental Clinic',
      slug: 'dr-mehta-dental',
      permanentUrl: `${window.location.origin}/b/dr-mehta-dental`,
      owner: 'Dr. S. Mehta',
      scans: 310,
      status: 'active',
      created: '2026-10-15',
    },
  ]);

  const [search, setSearch] = useState('');

  const filtered = qrs.filter(
    (q) =>
      q.businessName.toLowerCase().includes(search.toLowerCase()) ||
      q.slug.toLowerCase().includes(search.toLowerCase()) ||
      q.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Permanent Dynamic QR Code Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Permanent dynamic endpoints allocated to registered business profiles.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px] bg-slate-950/50">
                <th className="py-3 px-5">Business & Owner</th>
                <th className="py-3 px-5">Permanent Destination URL</th>
                <th className="py-3 px-5">Total Scans</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-5">
                    <p className="font-bold text-white text-sm">{q.businessName}</p>
                    <p className="text-[11px] text-slate-500">Owner: {q.owner}</p>
                  </td>

                  <td className="py-4 px-5 font-mono text-[11px] text-amber-400">
                    {q.permanentUrl}
                  </td>

                  <td className="py-4 px-5 font-bold text-white">{q.scans}</td>

                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {q.status}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <a
                      href={q.permanentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Test Scan</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
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
