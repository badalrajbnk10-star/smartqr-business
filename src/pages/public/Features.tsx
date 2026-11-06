import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Star,
  MessageCircle,
  PhoneCall,
  MapPin,
  Printer,
  Smartphone,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
          Complete SaaS Suite
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Everything Your Business Needs in One Smart QR
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Explore the modern features designed to boost customer engagement, save printing costs, and skyrocket your local online presence.
        </p>
      </div>

      {/* Feature 1: Permanent Dynamic QR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Never Re-Print Your QR Code Again
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Traditional QR codes encode fixed links that break if you change your menu, phone number, or address. SmartQR provides a <strong>permanent dynamic URL</strong> (e.g. <code>smartqr.in/b/your-business</code>) that routes customers to your live cloud digital profile.
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Change phone, timings, or photos in real-time</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>QR code destination stays identical even after renewal</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Saves thousands of rupees in recurring printing expenses</span>
            </li>
          </ul>
        </div>
        <div className="bg-slate-100 p-8 rounded-3xl flex justify-center border border-slate-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xs w-full text-center space-y-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dynamic Cloud Sync</p>
            <div className="p-3 bg-brand-50 rounded-xl inline-block">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://smartqr-business.vercel.app&color=312E81"
                alt="QR Sample"
                className="w-36 h-36"
              />
            </div>
            <p className="text-xs font-semibold text-slate-800">Scan redirects to live digital profile</p>
          </div>
        </div>
      </div>

      {/* Feature 2: 1-Tap Google Reviews & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
        <div className="order-2 lg:order-1 bg-slate-100 p-8 rounded-3xl flex justify-center border border-slate-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full space-y-3">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-sm text-slate-900">Google Review Boost</span>
            </div>
            <p className="text-xs text-slate-600">
              Customers are redirected straight to your Google Review submission screen with 5-stars pre-selected.
            </p>
            <div className="flex gap-2 pt-2">
              <span className="w-full text-center py-2 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">
                ★ 5-Star Reviews
              </span>
              <span className="w-full text-center py-2 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                Direct WhatsApp
              </span>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2 space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Star className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Automate 5-Star Google Reviews
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Satisfied customers in your store or restaurant want to praise you, but finding your profile on Google Maps takes too much effort. Our 1-tap Google Review button opens your review window directly on their smartphone.
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Boost local SEO and Google Maps ranking</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Outrank competing shops and restaurants in your area</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Direct WhatsApp chat button for instant orders and queries</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Feature 3: Print Kits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Printer className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Professional Ready-to-Print Kits
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            SmartQR includes built-in print templates: table stands (tents) for dining tables, storefront stickers for counter glass, posters for waiting rooms, and mini business cards.
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>High DPI vector PDF exports (A4, A5, A6)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Custom brand colors and logo embedded in center</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Take the PDF directly to any cyber cafe or print shop</span>
            </li>
          </ul>
        </div>
        <div className="bg-slate-100 p-8 rounded-3xl flex justify-center border border-slate-200">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xs w-full text-center space-y-4">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">A4 / Table Tent PDF</span>
            <div className="h-40 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center p-4">
              <p className="text-[11px] font-bold text-amber-400">TABLE TENT STAND</p>
              <div className="w-14 h-14 bg-white rounded mt-2 p-1">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=https://smartqr.in" alt="mini" />
              </div>
              <p className="text-[9px] text-slate-300 mt-2">Scan for Menu & Reviews</p>
            </div>
            <p className="text-xs text-slate-500">1-Click PDF Download</p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-brand-600 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
        <h2 className="text-3xl font-extrabold">Ready to launch your business profile?</h2>
        <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base">
          Try it today with 24 hours of free access. No commitment, cancel anytime.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:scale-105 transition-all"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
