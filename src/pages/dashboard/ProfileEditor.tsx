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
  Briefcase
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

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
  const { currentBusiness, updateBusiness, createBusiness } = useBusiness();
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
    }
  }, [currentBusiness, isNew]);

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
                placeholder="e.g. Maa Durga CSC Center / Sharma Super Store"
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

        {/* Branding Images */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Logo & Banner Image URLs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Logo URL (Square PNG / JPG)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Header Cover Banner URL (Landscape)
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-md shadow-brand-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : isNew ? 'Create Business Profile' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
