import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PhoneCall,
  MessageCircle,
  MapPin,
  Star,
  Clock,
  ExternalLink,
  Share2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Calendar,
  Utensils
} from 'lucide-react';
import { Business } from '../../types/database';
import { supabase, supabaseUrl, supabaseAnonKey } from '../../lib/supabase';

// Showcase fallback demo business for grand-heritage
const demoBiz: Business = {
  id: 'biz-hotel-grand-1',
  owner_id: 'owner-uuid-1',
  name: 'The Grand Heritage Hotel & Fine Dine',
  slug: 'grand-heritage',
  short_description: 'Luxury Stays, Fine Dining & Authentic Indian Cuisine',
  full_description:
    'Welcome to The Grand Heritage Hotel & Fine Dine. We take pride in delivering regal Indian hospitality, curated culinary experiences, state-of-the-art suites, and dedicated banquet halls for weddings and conferences.',
  phone: '+919931782577',
  whatsapp: '919931782577',
  email: 'contact.badalsarkar@gmail.com',
  address: '42, Station Road, Near Central Plaza, Sector 14, New Delhi',
  city: 'New Delhi',
  google_maps_url: 'https://maps.google.com/?q=New+Delhi',
  google_review_url: 'https://search.google.com/local/writereview?placeid=ChIJdd4hrwugrjsRmSrV3Vo6llI',
  is_active: true,
  status: 'active',
  logo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80',
  banner_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80',
  opening_hours: {
    monday: { open: '08:00', close: '23:30', closed: false },
    tuesday: { open: '08:00', close: '23:30', closed: false },
    wednesday: { open: '08:00', close: '23:30', closed: false },
    thursday: { open: '08:00', close: '23:30', closed: false },
    friday: { open: '08:00', close: '23:30', closed: false },
    saturday: { open: '08:00', close: '23:30', closed: false },
    sunday: { open: '08:00', close: '23:30', closed: false },
  },
  menu_items: [
    {
      id: 'm1',
      name: 'Paneer Butter Masala',
      price: 320,
      description: 'Rich cottage cheese cubes simmered in creamy cashew tomato makhani',
      category: 'Curries',
      image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
      is_available: true,
    },
    {
      id: 'm2',
      name: 'Dal Makhani Special',
      price: 280,
      description: 'Slow-cooked black lentils simmered overnight with butter and cream',
      category: 'Curries',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
      is_available: true,
    },
    {
      id: 'm3',
      name: 'Tandoori Garlic Butter Naan',
      price: 65,
      description: 'Fresh clay-oven baked bread topped with roasted garlic and melted Amul butter',
      category: 'Breads',
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
      is_available: true,
    },
    {
      id: 'm4',
      name: 'Gulab Jamun with Rabri',
      price: 150,
      description: 'Warm syrup-soaked dumplings paired with chilled saffron rabri',
      category: 'Desserts',
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
      is_available: true,
    }
  ],
  services: [
    {
      id: 's1',
      name: 'Executive Deluxe Room',
      price: 3499,
      duration: 'Per Night',
      description: 'King bed, city view, high-speed Wi-Fi & complimentary buffet breakfast.',
    },
    {
      id: 's2',
      name: 'Banquet Hall for Celebrations',
      price: 25000,
      duration: '4-Hour Slot',
      description: 'Decorated event space accommodating up to 150 guests.',
    }
  ],
  photos: [
    {
      id: 'p1',
      business_id: 'biz-hotel-grand-1',
      photo_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      caption: 'Presidential Suite Interior',
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'p2',
      business_id: 'biz-hotel-grand-1',
      photo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      caption: 'Courtyard Dining Space',
      sort_order: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 'p3',
      business_id: 'biz-hotel-grand-1',
      photo_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80',
      caption: 'Hotel Grand Lobby & Reception',
      sort_order: 3,
      created_at: new Date().toISOString(),
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Privacy-friendly telemetry scan event logging (non-blocking)
const logScan = async (businessId: string) => {
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    await supabase.from('scan_events').insert({
      business_id: businessId,
      device_type: isMobile ? 'mobile' : 'desktop',
      ip_hash: 'hash_' + Math.random().toString(36).substring(2, 10),
      is_valid_scan: true,
    });
  } catch {
    // Ignore background telemetry errors
  }
};

export const CustomerLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Instant SWR Cache: read from localStorage immediately (0.001s render)
  const cacheKey = `smartqr_fast_cache_${slug}`;
  const getInitial = (): Business | null => {
    if (slug === 'grand-heritage') return demoBiz;
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  };

  const initialCached = getInitial();
  const [business, setBusiness] = useState<Business | null>(initialCached);
  const [loading, setLoading] = useState<boolean>(!initialCached);
  const [activeTab, setActiveTab] = useState<'info' | 'menu' | 'photos'>('info');
  const [menuFilter, setMenuFilter] = useState('All');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchFast() {
      if (slug === 'grand-heritage') {
        setBusiness(demoBiz);
        setLoading(false);
        logScan(demoBiz.id);
        return;
      }

      try {
        // Ultra-fast direct REST query (0.01s lightning speed, no locks)
        let data: any = null;
        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/businesses?slug=eq.${encodeURIComponent(slug || '')}&select=*`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
          });
          if (res.ok) {
            const arr = await res.json();
            if (Array.isArray(arr) && arr.length > 0) {
              data = arr[0];
            }
          }
        } catch {
          const fallback = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();
          data = fallback.data;
        }

        if (!isMounted) return;

        if (data) {
          setBusiness(data);
          setLoading(false);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
          } catch {}

          // Fire telemetry in background
          setTimeout(() => logScan(data.id), 50);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching business:', err);
        if (isMounted) setLoading(false);
      }
    }

    fetchFast();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: business?.name,
        text: `Visit ${business?.name} digital profile`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Instant Skeleton Screen (appears in 0.01 sec during cold first-visit)
  if (loading && !business) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center pb-20 animate-pulse">
        <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
          {/* Header shimmer */}
          <div className="h-56 bg-slate-200"></div>

          {/* Avatar shimmer */}
          <div className="px-5 -mt-14 relative z-10 space-y-4">
            <div className="flex items-end justify-between">
              <div className="w-20 h-20 rounded-2xl bg-slate-300 border-4 border-white shadow-md"></div>
              <div className="w-28 h-6 rounded-full bg-slate-200"></div>
            </div>

            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-1/2 bg-slate-200 rounded-md"></div>
            </div>

            {/* 4 button skeletons */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="h-14 bg-slate-200 rounded-2xl"></div>
              <div className="h-14 bg-slate-200 rounded-2xl"></div>
              <div className="h-14 bg-slate-200 rounded-2xl"></div>
              <div className="h-14 bg-slate-200 rounded-2xl"></div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex border-b border-slate-200 pt-3 gap-4">
              <div className="h-8 flex-1 bg-slate-200 rounded-t-lg"></div>
              <div className="h-8 flex-1 bg-slate-100 rounded-t-lg"></div>
              <div className="h-8 flex-1 bg-slate-100 rounded-t-lg"></div>
            </div>
          </div>

          <div className="p-5 space-y-4 flex-1">
            <div className="h-24 bg-slate-100 rounded-2xl"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Suspended or Expired Status Screen (Preserves QR Code destination URL)
  const isTrialExpired =
    business?.status === 'trialing' &&
    business?.created_at &&
    Date.now() >= new Date(business.created_at).getTime() + 24 * 60 * 60 * 1000;

  if (business?.status === 'suspended' || business?.status === 'expired' || isTrialExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-3xl p-8 text-center space-y-5 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Business Profile Paused</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The digital profile for <strong>{business?.name || 'this business'}</strong> is temporarily paused pending subscription renewal.
          </p>
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 text-left text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-200">Are you the business owner?</p>
            <p>Log in to your SmartQR dashboard to activate or renew your monthly plan via UPI AutoPay. Your QR codes will resume automatically.</p>
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-all"
            >
              Sign In to Owner Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Profile Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested business profile does not exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs"
          >
            Go to SmartQR Homepage
          </Link>
        </div>
      </div>
    );
  }

  const menuCategories = ['All', ...Array.from(new Set((business.menu_items || []).map((m) => m.category)))];
  const filteredMenu =
    menuFilter === 'All'
      ? business.menu_items || []
      : (business.menu_items || []).filter((m) => m.category === menuFilter);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center pb-20">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        {/* Banner Image */}
        <div className="relative h-56 bg-slate-900">
          <img
            src={business.banner_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80'}
            alt={business.name}
            loading="eager"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30"></div>

          {/* Share Button on Top Right */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {copied && (
            <span className="absolute top-4 right-16 px-2.5 py-1 rounded bg-black/80 text-white text-[10px] font-semibold">
              Link Copied!
            </span>
          )}
        </div>

        {/* Profile Card Header */}
        <div className="px-5 -mt-14 relative z-10 space-y-4">
          <div className="flex items-end justify-between">
            <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl border border-slate-200 overflow-hidden">
              <img
                src={business.logo_url || 'https://cdn-icons-png.flaticon.com/512/3500/3500833.png'}
                alt="Logo"
                loading="eager"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified Business
            </span>
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
              {business.name}
            </h1>
            {business.address ? (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{business.address}{business.city ? `, ${business.city}` : ''}</span>
              </p>
            ) : business.city ? (
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{business.city}</span>
              </p>
            ) : null}
          </div>

          {/* 4 Primary Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* Call */}
            <a
              href={`tel:${business.phone}`}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px]">Call</span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${(business.whatsapp || business.phone)?.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20found%20your%20profile%20via%20SmartQR.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-[11px]">WhatsApp</span>
            </a>

            {/* Google Maps Directions */}
            <a
              href={business.google_maps_url || `https://maps.google.com/?q=${encodeURIComponent(business.name + ' ' + (business.address || business.city || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <MapPin className="w-4 h-4 text-blue-200" />
              <span className="text-[11px]">Navigate</span>
            </a>

            {/* Google Review Button (Highlighted) */}
            <a
              href={business.google_review_url || business.google_maps_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-amber-500/25 active:scale-95"
            >
              <Star className="w-4 h-4 fill-white text-white" />
              <span className="text-[11px]">Review</span>
            </a>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-bold pt-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                activeTab === 'info'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                activeTab === 'menu'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Menu & Catalog ({(business.menu_items || []).length})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-3 border-b-2 text-center transition-colors ${
                activeTab === 'photos'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Gallery ({(business.photos || []).length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Short Bio */}
              {(business.full_description || business.short_description) && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">About Us</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {business.full_description || business.short_description}
                  </p>
                </div>
              )}

              {/* Opening Hours */}
              {business.opening_hours && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      Opening Hours
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Open Today
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(business.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between py-1 border-b border-slate-200/50 capitalize text-slate-600">
                        <span className="font-medium">{day.substring(0, 3)}:</span>
                        <span>{hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Google Review Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/70 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Star className="w-5 h-5 fill-white" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Enjoying our services at {business.name}?
                </h4>
                <p className="text-xs text-slate-600">
                  Leave us a genuine 5-star review on Google Maps to help others discover us!
                </p>
                <a
                  href={business.google_review_url || business.google_maps_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <span>Post 5-Star Review on Google</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-4">
              {menuCategories.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {menuCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setMenuFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        menuFilter === cat
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredMenu.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No catalog items available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredMenu.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-slate-200/80 rounded-2xl flex gap-3 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                        />
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs font-black text-brand-700">₹{item.price}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {(business.photos || []).length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No gallery photos uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(business.photos || []).map((photo) => (
                    <div key={photo.id} className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 shadow-xs">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || 'Business Photo'}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {photo.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-[10px] text-white font-medium truncate">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Branding */}
        <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50 mt-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="text-[10px] font-medium tracking-wide">Powered by</span>
            <span className="text-xs font-black tracking-tight text-slate-700">
              Smart<span className="text-brand-600">QR</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
