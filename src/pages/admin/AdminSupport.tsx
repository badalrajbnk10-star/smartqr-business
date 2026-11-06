import React, { useState } from 'react';
import { LifeBuoy, CheckCircle2, Clock, Send, MessageSquare } from 'lucide-react';

interface SupportTicket {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: 'pending' | 'resolved';
  date: string;
}

const STORAGE_KEY = 'smartqr_admin_support_tickets';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const toggleStatus = (id: string) => {
    const updated = tickets.map((t) =>
      t.id === id ? { ...t, status: (t.status === 'pending' ? 'resolved' : 'pending') as 'pending' | 'resolved' } : t
    );
    setTickets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const filteredTickets = tickets.filter(
    (t) => filter === 'all' || t.status === filter
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Customer Support & Inquiries Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review, respond, and resolve customer support tickets submitted by business owners.
          </p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({tickets.filter((t) => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'resolved' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({tickets.filter((t) => t.status === 'resolved').length})
          </button>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-white text-base">All Caught Up!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            There are currently no open support requests. All business profiles, QR redirects, and WhatsApp integrations are running normally.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm">{t.subject}</h3>
                  <p className="text-xs text-slate-400">
                    From: <strong className="text-slate-300">{t.senderName}</strong> ({t.senderEmail})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {t.status === 'pending' ? 'Pending' : 'Resolved'}
                  </span>

                  <button
                    onClick={() => toggleStatus(t.id)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    Mark {t.status === 'pending' ? 'Resolved' : 'Pending'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                "{t.message}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span className="font-mono">Received: {t.date}</span>
                <a
                  href={`mailto:${t.senderEmail}?subject=Re: ${encodeURIComponent(t.subject)}`}
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:underline font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};