import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Clock, ShieldCheck, Search, Filter } from 'lucide-react';

interface MockPaymentRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  amountPaise: number;
  status: 'captured' | 'failed' | 'pending';
  razorpayPaymentId: string;
  razorpaySubId: string;
  mandateStatus: 'authorized' | 'active' | 'failed';
  date: string;
}

export const AdminPayments: React.FC = () => {
  const [payments] = useState<MockPaymentRecord[]>([
    {
      id: 'pay-1',
      customerName: 'Rajesh Sharma',
      customerEmail: 'owner@hotelgrand.in',
      amountPaise: 9900,
      status: 'captured',
      razorpayPaymentId: 'pay_NzE1aBc982kL',
      razorpaySubId: 'sub_Hz876A1B2C3',
      mandateStatus: 'active',
      date: '2026-11-04 18:22:10',
    },
    {
      id: 'pay-2',
      customerName: 'Dr. S. Mehta',
      customerEmail: 'clinic@mehtadental.in',
      amountPaise: 19900,
      status: 'captured',
      razorpayPaymentId: 'pay_Me819xZpL12',
      razorpaySubId: 'sub_Kx192847192',
      mandateStatus: 'active',
      date: '2026-11-03 14:10:45',
    },
    {
      id: 'pay-3',
      customerName: 'Sunil Choudhary',
      customerEmail: 'info@apexacademy.org',
      amountPaise: 39900,
      status: 'failed',
      razorpayPaymentId: 'pay_Fx918237190',
      razorpaySubId: 'sub_Pp991827364',
      mandateStatus: 'failed',
      date: '2026-11-02 09:30:12',
    },
    {
      id: 'pay-4',
      customerName: 'Amit Verma',
      customerEmail: 'amit@spicegarden.com',
      amountPaise: 9900,
      status: 'pending',
      razorpayPaymentId: 'pay_pending_mandate',
      razorpaySubId: 'sub_trial_auth_91',
      mandateStatus: 'authorized',
      date: '2026-11-04 20:05:00',
    },
  ]);

  const [search, setSearch] = useState('');

  const filtered = payments.filter((p) =>
    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
    p.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
    p.razorpayPaymentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Razorpay UPI AutoPay Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time server-side verified recurring mandates, payments, and settlements.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment ID, email or customer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-semibold uppercase text-[10px] bg-slate-950/50">
                <th className="py-3 px-5">Customer & Email</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5">Payment Status</th>
                <th className="py-3 px-5">Mandate Status</th>
                <th className="py-3 px-5">Razorpay IDs</th>
                <th className="py-3 px-5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-5">
                    <p className="font-bold text-white text-sm">{pay.customerName}</p>
                    <p className="text-[11px] text-slate-500">{pay.customerEmail}</p>
                  </td>

                  <td className="py-4 px-5 font-bold text-white text-sm">
                    ₹{(pay.amountPaise / 100).toFixed(2)}
                  </td>

                  <td className="py-4 px-5">
                    {pay.status === 'captured' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Captured
                      </span>
                    ) : pay.status === 'failed' ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold flex items-center gap-1 w-max">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Failed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1 w-max">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-5">
                    <span className="text-[11px] font-semibold text-slate-300 capitalize">
                      {pay.mandateStatus}
                    </span>
                  </td>

                  <td className="py-4 px-5 font-mono text-[11px] text-slate-400 space-y-0.5">
                    <p>Pay: <span className="text-amber-400/90">{pay.razorpayPaymentId}</span></p>
                    <p>Sub: <span className="text-slate-400">{pay.razorpaySubId}</span></p>
                  </td>

                  <td className="py-4 px-5 font-mono text-[11px] text-slate-500">
                    {pay.date}
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
