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
  Plus
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const ProfileEditor: React.FC = () => {
  const { currentBusiness, updateBusiness, createBusiness } = useBusiness();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
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
      setPhone(currentBusiness.phone || '');
      setWhatsapp(currentBusiness.whatsapp || '');
      setEmail(currentBusiness.email || '');
      setAddress(currentBusiness.address || '');
      setShortDesc(currentBusiness.short_description || '');
      setFullDesc(currentBusiness.full_description || '');
      setGoogleMapsUrl(currentBusiness.google_maps_url || '');
      setGoogleReviewUrl(currentBusiness.google_review_url || '');
      setLogoUrl(currentBusiness.logo_url || '');
      setBannerUrl(currentBusiness.banner_url || '');
    } else if (isNew) {
      setName('');
      setSlug('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
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
          phone,
          whatsapp,
          email,
          address,
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
          phone,
          whatsapp,
          email,
          address,
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
                placeholder="The Grand Heritage Hotel"
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
                placeholder="grand-heritage"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Tagline / Catchphrase
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="Luxury Stays, Fine Dining & Authentic Indian Cuisine"
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
              placeholder="Tell customers about your specialties, quality, hygiene, and offerings..."
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
                placeholder="info@hotelgrand.in"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Outlet Full Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="42, Station Road, Near Central Plaza, Sector 14, New Delhi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
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
