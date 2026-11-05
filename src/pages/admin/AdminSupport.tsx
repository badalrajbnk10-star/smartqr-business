import React, { useState } from 'react';
import { LifeBuoy, CheckCircle2, Clock, MessageSquare, Send } from 'lucide-react';

interface SupportTicket {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  date: string;
}

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 't-1',
      senderName: 'Rajesh Sharma',
      senderEmail: 'owner@hotelgrand.in',
      subject: 'Help setting up Google Review URL',
      message: 'Hello, could you assist me in finding my direct Google Place ID review link so customers can leave 5-star reviews on 1 tap?',
      status: 'pending',
      date: '2026-11-04 19:40',
    },
    {
      id: 't-2',
      senderName: 'Pooja Beauty Salon',
      senderEmail: 'pooja@salonglow.in',
      subject: 'Changing UPI AutoPay Mandate Bank',
      message: 'I want to switch my deduction account from SBI to HDFC bank. Please guide.',
      status: 'resolved',
      date: '2026-11-03 11:20',
    },
  ]);

  const toggleStatus = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'pending' ? 'resolved' : 'pending' } : t))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Customer Support & Inquiries Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Review, respond, and resolve customer support tickets submitted by business owners.
        </p>
      </div>

      <div className="space-y-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">{t.subject}</h3>
                <p className="text-xs text-slate-400">
                  From: <strong className="text-slate-200">{t.senderName}</strong> ({t.senderEmail}) • <span className="font-mono">{t.date}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    t.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {t.status === 'resolved' ? 'Resolved' : 'Pending Action'}
                </span>

                <button
                  onClick={() => toggleStatus(t.id)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Mark as {t.status === 'resolved' ? 'Pending' : 'Resolved'}
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              "{t.message}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
