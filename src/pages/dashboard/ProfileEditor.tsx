import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Save,
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Briefcase,
  Copy,
  Calendar
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { DirectPhotoUpload } from '../../components/common/DirectPhotoUpload';
import { OpeningHours } from '../../types/database';

const DAYS_OF_WEEK: { key: keyof OpeningHours; label: string; shortLabel: string }[] = [
  { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
];

const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: '09:00', close: '20:00', closed: false },
  tuesday: { open: '09:00', close: '20:00', closed: false },
  wednesday: { open: '09:00', close: '20:00', closed: false },
  thursday: { open: '09:00', close: '20:00', closed: false },
  friday: { open: '09:00', close: '20:00', closed: false },
  saturday: { open: '09:00', close: '20:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
};

const BUSINESS_CATEGORIES = [
  { id: 'f13ce3c2-83e4-41be-92e3-3e47a913034c', name: 'CSC & Online Services (Cyber Cafe, CSC Center, Aadhaar, Banking Kiosk)' },
  { id: '1f764dab-ae3f-445d-9c70-5cd2671b8b2e', name: 'Retail Store & Kirana (General Store, Grocery, Supermarket, Clothing, Electronics)' },
  { id: '649575c7-56ee-4e93-9da2-e3b5f145b515', name: 'Restaurants & Dining (Family Restaurant, Dhaba, Fast Food, Biryani)' },
  { id: '43513385-7610-434b-a61d-45351a06bbf5', name: 'Cafes & Bakeries (Coffee Shop, Bakery, Tea Point, Sweets)' },
  { id: '8e1feda8-1736-4313-bad8-e0361a150625', name: 'Hotels & Lodging (Hotel, Resort, Guest House, Lodge)' },
  { id: 'e5504088-6aca-4fe1-aa74-2c6c36b71575', name: 'Salons & Spas (Beauty Parlor, Hair Salon, Spa, Grooming)' },
  { id: 'a1e00ddd-29f3-4fbc-974d-360a232fa125', name: 'Hospitals & Clinics (Doctor Clinic, Dental, Pharmacy, Diagnostic Lab)' },
  { id: '24a3fa24-4448-46f4-94fe-5edc7e57cceb', name: 'Coaching & Education (Tuition Center, Computer Academy, School, Library)' },
  { id: 'f13ce3c2-83e4-41be-92e3-3e47a913034c', name: 'Gym & Fitness (Gym, Fitness Center, Yoga, Crossfit)' },
  { id: 'f13ce3c2-83e4-41be-92e3-3e47a913034c', name: 'Professional Services & Other Businesses' },
];

export const ProfileEditor: React.FC = () => {
  const {
    currentBusiness,
    updateBusiness,
    createBusiness,
    businesses,
    maxBusinessesAllowed,
    canCreateNewBusiness,
    activePlan
  } = useBusiness();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(BUSINESS_CATEGORIES[0].id);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHours>(DEFAULT_OPENING_HOURS);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentBusiness && !isNew) {
      setName(currentBusiness.name || '');
      setSlug(currentBusiness.slug || '');
      setCategoryId(currentBusiness.category_id || BUSINESS_CATEGORIES[0].id);
      setPhone(currentBusiness.phone || '');
      setWhatsapp(currentBusiness.whatsapp || '');
      setEmail(currentBusiness.email || '');
      setAddress(currentBusiness.address || '');
      setCity(currentBusiness.city || '');
      setState(currentBusiness.state || '');
      setPincode(currentBusiness.pincode || '');
      setShortDesc(currentBusiness.short_description || '');
      setFullDesc(currentBusiness.full_description || '');
      setGoogleMapsUrl(currentBusiness.google_maps_url || '');
      setGoogleReviewUrl(currentBusiness.google_review_url || '');
      setLogoUrl(currentBusiness.logo_url || '');
      setBannerUrl(currentBusiness.banner_url || '');

      if (currentBusiness.opening_hours && typeof currentBusiness.opening_hours === 'object') {
        const raw = currentBusiness.opening_hours as any;
        setOpeningHours({
          monday: raw.monday ? { open: raw.monday.open || '09:00', close: raw.monday.close || '20:00', closed: Boolean(raw.monday.closed) } : DEFAULT_OPENING_HOURS.monday,
          tuesday: raw.tuesday ? { open: raw.tuesday.open || '09:00', close: raw.tuesday.close || '20:00', closed: Boolean(raw.tuesday.closed) } : DEFAULT_OPENING_HOURS.tuesday,
          wednesday: raw.wednesday ? { open: raw.wednesday.open || '09:00', close: raw.wednesday.close || '20:00', closed: Boolean(raw.wednesday.closed) } : DEFAULT_OPENING_HOURS.wednesday,
          thursday: raw.thursday ? { open: raw.thursday.open || '09:00', close: raw.thursday.close || '20:00', closed: Boolean(raw.thursday.closed) } : DEFAULT_OPENING_HOURS.thursday,
          friday: raw.friday ? { open: raw.friday.open || '09:00', close: raw.friday.close || '20:00', closed: Boolean(raw.friday.closed) } : DEFAULT_OPENING_HOURS.friday,
          saturday: raw.saturday ? { open: raw.saturday.open || '09:00', close: raw.saturday.close || '20:00', closed: Boolean(raw.saturday.closed) } : DEFAULT_OPENING_HOURS.saturday,
          sunday: raw.sunday ? { open: raw.sunday.open || '10:00', close: raw.sunday.close || '16:00', closed: raw.sunday.closed !== undefined ? Boolean(raw.sunday.closed) : true } : DEFAULT_OPENING_HOURS.sunday,
        });
      } else {
        setOpeningHours(DEFAULT_OPENING_HOURS);
      }
    } else if (isNew) {
      setName('');
      setSlug('');
      setCategoryId(BUSINESS_CATEGORIES[0].id);
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
      setCity('');
      setState('');
      setPincode('');
      setShortDesc('');
      setFullDesc('');
      setGoogleMapsUrl('');
      setGoogleReviewUrl('');
      setLogoUrl('');
      setBannerUrl('');
      setOpeningHours(DEFAULT_OPENING_HOURS);
    }
  }, [currentBusiness, isNew]);

  const handleToggleClosed = (dayKey: keyof OpeningHours) => {
    setOpeningHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        closed: !prev[dayKey].closed,
      },
    }));
  };

  const handleTimeChange = (dayKey: keyof OpeningHours, field: 'open' | 'close', value: string) => {
    setOpeningHours((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
  };

  const handleCopyMondayToAll = () => {
    const mon = openingHours.monday;
    setOpeningHours((prev) => ({
      ...prev,
      tuesday: { ...mon },
      wednesday: { ...mon },
      thursday: { ...mon },
      friday: { ...mon },
      saturday: { ...mon },
    }));
  };

  const handleSetAllDaysOpen = () => {
    setOpeningHours((prev) => {
      const updated: any = {};
      DAYS_OF_WEEK.forEach(({ key }) => {
        updated[key] = { ...prev[key], closed: false };
      });
      return updated as OpeningHours;
    });
  };

  const handleToggleSunday = () => {
    setOpeningHours((prev) => ({
      ...prev,
      sunday: {
        ...prev.sunday,
        closed: !prev.sunday.closed,
      },
    }));
  };

  const handleSet24Hours = () => {
    setOpeningHours((prev) => {
      const updated: any = {};
      DAYS_OF_WEEK.forEach(({ key }) => {
        updated[key] = { open: '00:00', close: '23:59', closed: false };
      });
      return updated as OpeningHours;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      if (isNew) {
        const res = await createBusiness({
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category_id: categoryId,
          phone,
          whatsapp,
          email,
          address,
          city,
          state,
          pincode,
          short_description: shortDesc,
          full_description: fullDesc,
          google_maps_url: googleMapsUrl,
          google_review_url: googleReviewUrl,
          logo_url: logoUrl,
          banner_url: bannerUrl,
          opening_hours: openingHours,
        });

        if (res.success) {
          setSavedSuccess(true);
        } else {
          setError(res.error || 'Failed to create business profile.');
        }
      } else if (currentBusiness) {
        const res = await updateBusiness(currentBusiness.id, {
          name,
          category_id: categoryId,
          phone,
          whatsapp,
          email,
          address,
          city,
          state,
          pincode,
          short_description: shortDesc,
          full_description: fullDesc,
          google_maps_url: googleMapsUrl,
          google_review_url: googleReviewUrl,
          logo_url: logoUrl,
          banner_url: bannerUrl,
          opening_hours: openingHours,
        });

        if (res.success) {
          setSavedSuccess(true);
        } else {
          setError(res.error || 'Failed to update business profile.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isNew ? 'Create New Business Profile' : 'Edit Business Profile'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Updates here reflect instantly on your public QR page without re-printing.
          </p>
        </div>

        {currentBusiness && !isNew && (
          <a
            href={`/b/${currentBusiness.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <span>Preview Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully! Live profile is updated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isNew && !canCreateNewBusiness && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Business Limit Reached ({businesses.length}/{maxBusinessesAllowed})</span>
          </div>
          <p className="text-amber-800 leading-relaxed text-xs">
            Your current <strong>{activePlan?.name || 'Starter'}</strong> plan allows a maximum of <strong>{maxBusinessesAllowed} business profile</strong>.
            To add up to <strong>3 separate businesses</strong>—each with its own independent dynamic QR code, catalog, reviews, and branding—please upgrade to <strong>Business Plus (₹399/mo)</strong>.
          </p>
          <div className="pt-1">
            <a
              href="/dashboard/subscription"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              <span>Upgrade to Business Plus (₹399)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Business / Store Name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Permanent URL Identifier (Slug)
              </label>
              <input
                type="text"
                disabled={!isNew}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-business"
                className={`w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono ${
                  !isNew ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-brand-500'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {isNew ? 'Unique link for your QR: smartqr.in/b/your-slug' : 'Locked to protect your printed QR codes.'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-brand-600" />
              <span>Business Category & Industry *</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white font-medium text-slate-800"
            >
              {BUSINESS_CATEGORIES.map((cat, idx) => (
                <option key={`${cat.id}-${idx}`} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Select your business type. This adapts your public landing page buttons and QR card taglines.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Tagline / Catchphrase
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="e.g. Fast & Reliable Online Services • Banking Kiosk • All Online Work"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Business Story / Description
            </label>
            <textarea
              rows={3}
              value={fullDesc}
              onChange={(e) => setFullDesc(e.target.value)}
              placeholder="Describe your services, working hours, specialties, or product offerings..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contact & Location */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600" />
            Contact & Location Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Calling Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="919876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@mybusiness.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Physical Outlet Full Address *</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No. 5, Main Market, Near SBI Bank"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Town
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Patna / New Delhi"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Bihar / Delhi / UP"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 800001"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Google Integrations */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Google Maps & Google Review Link
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Maps Directions URL
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used for the 1-tap "Navigate" button on the customer page.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Review Submission URL
              </label>
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://g.page/r/review/..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Direct link that opens 5-star review form on the customer's phone.
              </p>
            </div>
          </div>
        </div>

        {/* Direct Photo Branding (Logo & Banner) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Direct Photo Upload (Logo & Header Banner)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose direct photos from your phone gallery or camera. No image link required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <DirectPhotoUpload
                label="Business Logo (Square 1:1)"
                value={logoUrl}
                onChange={setLogoUrl}
                maxDimension={600}
                initialAspectRatio={1}
                aspectHint="Square photo for QR center & profile picture"
                placeholderText="Upload Logo from Device / Camera"
              />
            </div>

            <div>
              <DirectPhotoUpload
                label="Cover Banner (Landscape 16:9)"
                value={bannerUrl}
                onChange={setBannerUrl}
                maxDimension={1200}
                initialAspectRatio={16 / 9}
                aspectHint="Wide cover photo displayed at top of customer landing page"
                placeholderText="Upload Banner from Device / Camera"
              />
            </div>
          </div>
        </div>

        {/* Weekly Opening Hours & Shop Timing */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Store Opening Hours & Shop Timing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Set opening and closing times for each day. Customers see this live when scanning your QR code.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopyMondayToAll}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                title="Copy Monday's open & close times to Tue-Sat"
              >
                <Copy className="w-3 h-3 text-brand-600" />
                <span>Copy Mon to All</span>
              </button>
              <button
                type="button"
                onClick={handleSetAllDaysOpen}
                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
              >
                Open All 7 Days
              </button>
              <button
                type="button"
                onClick={handleToggleSunday}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                  openingHours.sunday.closed
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {openingHours.sunday.closed ? 'Sunday: Closed' : 'Sunday: Open'}
              </button>
              <button
                type="button"
                onClick={handleSet24Hours}
                className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
              >
                24 Hours Open
              </button>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 sm:p-4 space-y-2">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const day = openingHours[key];
              return (
                <div
                  key={key}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                    day.closed
                      ? 'bg-slate-100/70 border-slate-200/90 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  {/* Day Label & Open/Closed Status Toggle */}
                  <div className="flex items-center gap-3 w-44">
                    <button
                      type="button"
                      onClick={() => handleToggleClosed(key)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        day.closed
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                      }`}
                    >
                      {day.closed ? 'Closed' : 'Open'}
                    </button>
                    <span className={`text-sm font-bold ${day.closed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {label}
                    </span>
                  </div>

                  {/* Timing Inputs */}
                  {day.closed ? (
                    <div className="text-xs font-medium text-slate-400 italic py-1 sm:text-right flex-1">
                      Shop / Outlet is closed on this day
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap sm:justify-end flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Open:</span>
                        <input
                          type="time"
                          value={day.open || '09:00'}
                          onChange={(e) => handleTimeChange(key, 'open', e.target.value)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                      </div>
                      <span className="text-slate-400 text-xs font-bold">to</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Close:</span>
                        <input
                          type="time"
                          value={day.close || '20:00'}
                          onChange={(e) => handleTimeChange(key, 'close', e.target.value)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving || (isNew && !canCreateNewBusiness)}
            className="inline-flex items-center gap-2 px-7 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-md shadow-brand-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : isNew ? 'Create Business Profile' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
