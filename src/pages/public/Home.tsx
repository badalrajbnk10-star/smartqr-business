import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star,
  Smartphone,
  PhoneCall,
  MapPin,
  MessageCircle,
  Eye,
  CheckCircle,
  Hotel,
  Utensils,
  ShoppingBag,
  Scissors,
  Cross,
  GraduationCap,
  Building2,
  Clock,
  Printer
} from 'lucide-react';

export const Home: React.FC = () => {
  const categories = [
    { name: 'Hotels & Lodges', icon: Hotel, count: '1,200+ Active', desc: 'Room tour, Wi-Fi details, check-in info and Google reviews.' },
    { name: 'Restaurants & Cafes', icon: Utensils, count: '3,800+ Active', desc: 'Digital contactless menu, daily specials, chef picks & table reservation.' },
    { name: 'Retail & Supermarkets', icon: ShoppingBag, count: '2,400+ Active', desc: 'Product catalogs, festival offers, store location and WhatsApp ordering.' },
    { name: 'Salons & Spas', icon: Scissors, count: '950+ Active', desc: 'Rate card, appointment booking on WhatsApp, client reviews & style gallery.' },
    { name: 'Hospitals & Clinics', icon: Cross, count: '620+ Active', desc: 'Doctor timings, emergency call, clinic direction and patient feedback.' },
    { name: 'Coaching & Tuition', icon: GraduationCap, count: '1,100+ Active', desc: 'Course prospectus, batch timings, admission inquiries and results.' },
  ];

  const features = [
    {
      title: 'Permanent Dynamic QR Code',
      desc: 'One permanent QR code for your business. Update your phone number, menu, photos, or address anytime without re-printing your posters or table stands.',
      icon: QrCode,
    },
    {
      title: 'Google Reviews on Autopilot',
      desc: 'Direct 1-tap Google Review button. Boost your Google Maps 5-star ratings and outrank local competitors instantly.',
      icon: Star,
    },
    {
      title: 'Instant WhatsApp & Call Actions',
      desc: 'Customers can call you or start a WhatsApp chat with 1 click without typing or saving your phone number.',
      icon: MessageCircle,
    },
    {
      title: 'Print-Ready PDF Kits',
      desc: 'Download high-DPI table tents, storefront stickers, posters, and mini business cards ready to print at any local studio.',
      icon: Printer,
    },
    {
      title: 'UPI AutoPay Recurring Billing',
      desc: 'Affordable monthly plans starting at ₹99/mo with seamless, authorized UPI AutoPay mandate and 24-hour risk-free trial.',
      icon: ShieldCheck,
    },
    {
      title: 'Real-Time Scan Analytics',
      desc: 'Track daily customer scans, peak business hours, visitor devices, and engagement with privacy-first analytics.',
      icon: Eye,
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>India's #1 Dynamic Digital Profile Platform for Businesses</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Turn Every Customer Scan into <span className="text-brand-600 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">5-Star Reviews & Sales</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Give your hotel, restaurant, clinic, or shop a stunning digital profile. Customers scan your smart QR to view your menu, call on WhatsApp, navigate with Google Maps, and leave 5-star Google reviews.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all text-sm sm:text-base"
                >
                  <span>Start 24-Hour Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/b/grand-heritage"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-2xl border border-slate-300 shadow-sm transition-all text-sm sm:text-base"
                >
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <span>See Live Sample Profile</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>No credit card needed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Plans from ₹99/month</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Razorpay UPI AutoPay ready</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-brand-500 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 space-y-6">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                        GH
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Grand Heritage Hotel</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" /> New Delhi
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                      ★ 4.9 (340+)
                    </span>
                  </div>

                  {/* QR Stand Preview */}
                  <div className="bg-gradient-to-b from-slate-900 to-indigo-950 rounded-2xl p-6 text-center text-white space-y-4 shadow-inner">
                    <p className="text-[11px] uppercase tracking-widest font-extrabold text-brand-300">
                      SCAN FOR DIGITAL MENU & REVIEWS
                    </p>
                    <div className="inline-block p-3.5 bg-white rounded-xl shadow-lg">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://smartqr.in/b/grand-heritage&color=1E1B4B"
                        alt="Demo QR"
                        className="w-36 h-36 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Call: +91 98765 43210</span>
                    </div>
                  </div>

                  {/* Quick Action Preview */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 font-semibold flex flex-col items-center gap-1">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 font-semibold flex flex-col items-center gap-1">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Directions</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 font-semibold flex flex-col items-center gap-1">
                      <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                      <span>Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Business Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Built for Every Local Business
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From luxury hotels to neighborhood clinics, SmartQR gives your physical outlet an instant, high-converting digital storefront.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-brand-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-600 flex items-center justify-center text-brand-600 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {cat.count}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{cat.name}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-900 text-white py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Everything You Need to Dominate Your Local Market
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-3 hover:border-brand-500/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simple 3-Step Onboarding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Get Your Business Online in 3 Simple Steps
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            No technical knowledge or coding needed. Ready in less than 3 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-black text-lg flex items-center justify-center mx-auto">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Enter Business Details</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add your shop name, address, photos, WhatsApp number, and Google Review link.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-black text-lg flex items-center justify-center mx-auto">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Download Printable QR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose an elegant table stand, sticker, or poster design and download the high-resolution print PDF.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-black text-lg flex items-center justify-center mx-auto">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Display & Collect Reviews</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Put the stand on your counter or table. Watch your Google ratings and repeat customers skyrocket!
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-brand-800 via-brand-700 to-indigo-700 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your business profile?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Get your dynamic QR code and customer digital page today. Enjoy a full 24-hour free trial with zero upfront payment.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 hover:bg-brand-50 font-extrabold text-base rounded-2xl shadow-lg hover:scale-105 transition-all"
            >
              <span>Get Started Free in 2 Minutes</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
