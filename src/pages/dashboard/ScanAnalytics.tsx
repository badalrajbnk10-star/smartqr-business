import React from 'react';
import {
  BarChart3,
  Smartphone,
  Laptop,
  Tablet,
  TrendingUp,
  Star,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Calendar,
  Activity
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { getCleanAnalytics } from '../../lib/telemetry';

export const ScanAnalytics: React.FC = () => {
  const { currentBusiness } = useBusiness();

  // Load real telemetry analytics
  const analytics = getCleanAnalytics(
    currentBusiness?.opening_hours,
    currentBusiness?.qr_code?.total_scans
  );

  const totalScans = analytics.total_scans;
  const reviewClicks = analytics.review_clicks;
  const whatsappClicks = analytics.whatsapp_clicks;
  const callClicks = analytics.call_clicks;
  const whatsappAndCalls = whatsappClicks + callClicks;

  const conversionRate = totalScans > 0 ? ((reviewClicks / totalScans) * 100).toFixed(1) : '0';

  const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = daysOrder.map((day) => ({
    day,
    scans: analytics.weekly[day] || 0,
  }));

  const maxScan = Math.max(1, ...weeklyData.map((d) => d.scans));

  const dev = analytics.devices;
  const devTotal = dev.mobile + dev.tablet + dev.desktop;
  const mobPercent = devTotal > 0 ? Math.round((dev.mobile / devTotal) * 100) : (totalScans > 0 ? 100 : 0);
  const tabPercent = devTotal > 0 ? Math.round((dev.tablet / devTotal) * 100) : 0;
  const deskPercent = devTotal > 0 ? Math.max(0, 100 - mobPercent - tabPercent) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            QR Scan Analytics & Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time customer visits and telemetry without violating customer privacy.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Anti-Bot Verification Active</span>
        </div>
      </div>

      {/* Top 3 KPI Cards (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scans (All-Time)</span>
          <p className="text-3xl font-black text-slate-900">{totalScans}</p>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Real-time active counter
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Google Review Clicks</span>
          <p className="text-3xl font-black text-slate-900">{reviewClicks}</p>
          <span className="text-xs text-slate-500 font-medium">{conversionRate}% conversion rate</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp & Calls</span>
          <p className="text-3xl font-black text-slate-900">{whatsappAndCalls}</p>
          <span className="text-xs text-slate-500 font-medium">Direct customer enquiries</span>
        </div>
      </div>

      {/* Weekly Activity Bar Chart */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            Weekly Scan Trends
          </h3>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Past 7 Days
          </span>
        </div>

        {/* Visual Bar representation */}
        <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100">
          {weeklyData.map((d) => {
            const heightPercent = maxScan > 0 ? Math.round((d.scans / maxScan) * 100) : 0;
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-slate-600 group-hover:text-brand-600 transition-colors">
                  {d.scans}
                </span>
                <div className="w-full max-w-[42px] bg-slate-100 rounded-xl overflow-hidden h-36 flex items-end">
                  <div
                    style={{ height: `${Math.max(d.scans > 0 ? 12 : 4, heightPercent)}%` }}
                    className={`w-full rounded-xl transition-all ${
                      d.scans > 0
                        ? 'bg-gradient-to-t from-brand-700 to-brand-500 group-hover:from-indigo-600 group-hover:to-brand-400'
                        : 'bg-slate-200/60'
                    }`}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-500">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Device Breakdown</h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-brand-600" /> Mobile (Android / iOS)</span>
                <span>{mobPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${mobPercent}%` }} className="bg-brand-600 h-full rounded-full transition-all duration-500"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Tablet className="w-4 h-4 text-indigo-500" /> Tablets & iPads</span>
                <span>{tabPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${tabPercent}%` }} className="bg-indigo-500 h-full rounded-full transition-all duration-500"></div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5"><Laptop className="w-4 h-4 text-slate-400" /> Laptops & Desktops</span>
                <span>{deskPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div style={{ width: `${deskPercent}%` }} className="bg-slate-400 h-full rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Top Customer Actions</h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="font-semibold text-amber-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Clicked "Rate Us on Google"
              </span>
              <span className="font-bold text-amber-800">{reviewClicks} taps</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="font-semibold text-emerald-900 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                Started WhatsApp Conversation
              </span>
              <span className="font-bold text-emerald-800">{whatsappClicks} taps</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
              <span className="font-semibold text-blue-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                Tapped Phone Call
              </span>
              <span className="font-bold text-blue-800">{callClicks} taps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
