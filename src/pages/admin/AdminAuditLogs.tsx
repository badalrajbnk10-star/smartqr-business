import React, { useState } from 'react';
import { FileText, Shield, Clock } from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const [logs] = useState([
    {
      id: 'log-1',
      actor: 'Master Super Admin (admin@smartqr.in)',
      action: 'UPDATE_PLAN_PRICING',
      target: 'Plan: starter',
      details: 'Changed price from ₹99 (9900 paise) to ₹99 (9900 paise)',
      ip: '103.21.124.89',
      timestamp: '2026-11-04 21:15:32',
    },
    {
      id: 'log-2',
      actor: 'Master Super Admin (admin@smartqr.in)',
      action: 'SYSTEM_SETTINGS_CHANGE',
      target: 'Platform: general',
      details: 'Updated free trial duration setting: 24 Hours',
      ip: '103.21.124.89',
      timestamp: '2026-11-04 20:45:10',
    },
    {
      id: 'log-3',
      actor: 'Security Daemon',
      action: 'AUTOPAY_WEBHOOK_VERIFY',
      target: 'Subscription: sub_Hz876A1B2C3',
      details: 'Signature verified with Razorpay HMAC SHA256 secret. Mandate active.',
      ip: 'razorpay-webhook-gw',
      timestamp: '2026-11-04 18:22:11',
    },
    {
      id: 'log-4',
      actor: 'Master Super Admin (admin@smartqr.in)',
      action: 'SUSPEND_PROFILE_PAGE',
      target: 'Business: apex-academy',
      details: 'Suspended public QR landing page due to payment delinquency.',
      ip: '103.21.124.89',
      timestamp: '2026-11-02 10:12:00',
    },
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          System Security & Admin Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Immutable audit record of all administrative actions, plan updates, and webhook verifications.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px] bg-slate-950/50">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Actor</th>
                <th className="py-3 px-5">Action</th>
                <th className="py-3 px-5">Target & Change Details</th>
                <th className="py-3 px-5">IP / Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-5 font-mono text-[11px] text-slate-400">
                    {log.timestamp}
                  </td>

                  <td className="py-4 px-5 font-semibold text-white">
                    {log.actor}
                  </td>

                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-4 px-5">
                    <p className="font-semibold text-slate-200">{log.target}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                  </td>

                  <td className="py-4 px-5 font-mono text-[11px] text-slate-500">
                    {log.ip}
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
