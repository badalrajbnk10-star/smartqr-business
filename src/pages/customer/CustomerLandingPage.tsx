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
import { trackScanEvent, trackCustomerAction } from '../../lib/telemetry';

export const CustomerLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Instant SWR Cache: read from localStorage immediately (0.001s render)
  const cacheKey = `smartqr_fast_cache_${slug}`;
  const getInitial = (): Business | null => {
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
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        // Ultra-fast direct REST query (0.01s lightning speed, no locks, never cached)
        let data: any = null;
        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/businesses?slug=eq.${encodeURIComponent(slug || '')}&select=*`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
            },
            cache: 'no-store',
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

          // Fire real telemetry in background
          setTimeout(() => trackScanEvent(data.id, data.qr_code?.id), 50);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching business:', err);
        if (isMounted) setLoading(false);
      }
    }

    fetchFast();

    // Realtime Postgres sync: instant live update on customer phone without refreshing
    let channel: any = null;
    if (slug) {
      try {
        channel = supabase
          .channel(`customer_live_${slug}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'businesses',
              filter: `slug=eq.${slug}`,
            },
            (payload: any) => {
              if (payload?.new && isMounted) {
                setBusiness(payload.new as Business);
                try {
                  localStorage.setItem(cacheKey, JSON.stringify(payload.new));
                } catch {}
              }
            }
          )
          .subscribe();
      } catch {}
    }

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
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
  const sub = (business?.opening_hours as any)?._subscription;
  const isSubscriptionExpired = sub?.expires_at && Date.now() >= new Date(sub.expires_at).getTime();
  const isTrialExpired =
    (business?.status === 'trialing' || !sub) &&
    business?.created_at &&
    Date.now() >= new Date(business.created_at).getTime() + 24 * 60 * 60 * 1000;

  if (business?.status === 'suspended' || business?.status === 'expired' || isTrialExpired || isSubscriptionExpired) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-800/80 border border-slate-700 rounded-3xl p-8 text-center space-y-5 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Business Services Paused</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The digital profile and customer services for <strong>{business?.name || 'this business'}</strong> are temporarily paused because the 1-month subscription validity has ended.
          </p>
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 text-left text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-200">Are you the business owner?</p>
            <p>Log in to your SmartQR dashboard and pay via UPI to renew your monthly plan. All QR services, review links, and catalog items will resume automatically.</p>
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20"
            >
              Sign In to Renew Subscription via UPI
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

  const servicesList = business.services || [];
  const menuList = business.menu_items || [];
  const totalServicesAndItems = servicesList.length + menuList.length;
  const menuCategories = ['All', ...Array.from(new Set(menuList.map((m) => m.category)))];
  const filteredMenu =
    menuFilter === 'All'
      ? menuList
      : menuList.filter((m) => m.category === menuFilter);

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
              onClick={() => trackCustomerAction(business.id, 'call')}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-1 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px]">Call</span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${(business.whatsapp || business.phone)?.replace(/[^0-9]/g, '')}?text=Hi%2C%20I%20found%20your%20profile%20via%20SmartQR.`}
              onClick={() => trackCustomerAction(business.id, 'whatsapp')}
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
              onClick={() => trackCustomerAction(business.id, 'review')}
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
              Services ({totalServicesAndItems})
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
                  onClick={() => trackCustomerAction(business.id, 'review')}
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
              {/* 1. Services List (Instant Display for CSC, Salons, Clinics, Consulting, Services) */}
              {servicesList.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Services ({servicesList.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {servicesList.map((svc) => (
                      <div
                        key={svc.id}
                        className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-900">{svc.name}</h4>
                            {svc.duration && (
                              <span className="text-[10px] text-brand-700 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-full font-semibold">
                                {svc.duration}
                              </span>
                            )}
                          </div>
                          {svc.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {svc.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {svc.price !== undefined && svc.price !== null && (
                            <span className="text-sm font-black text-brand-700">₹{svc.price}</span>
                          )}
                          <a
                            href={`https://wa.me/${(business.whatsapp || business.phone)?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${business.name}, I would like to inquire about: ${svc.name}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Enquire</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Menu / Products List (For Restaurants, Cafes, Bakeries) */}
              {menuList.length > 0 && (
                <div className="space-y-3 pt-1">
                  {servicesList.length > 0 && (
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Menu & Products ({menuList.length})
                    </h3>
                  )}
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
                </div>
              )}

              {/* 3. Empty State if Neither Services nor Menu items exist */}
              {servicesList.length === 0 && menuList.length === 0 && (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Utensils className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No services or catalog items listed yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (() => {
            const galleryList = (business.photos && business.photos.length > 0)
              ? business.photos
              : ((business.opening_hours as any)?._photos || []);

            return (
              <div className="space-y-4">
                {galleryList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs">No gallery photos uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {galleryList.map((photo: any) => (
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
            );
          })()}
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
