import React, { useState } from 'react';
import { Image as ImageIcon, Trash2, Plus, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { BusinessPhoto } from '../../types/database';
import { DirectPhotoUpload } from '../../components/common/DirectPhotoUpload';

export const MediaManager: React.FC = () => {
  const { currentBusiness, updateBusiness, activePlan } = useBusiness();
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photos = currentBusiness?.photos || [];
  const maxPhotos = activePlan?.max_photos_per_business || 20;

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setError(null);

    if (!photoUrl) {
      setError('Please select or upload a photo from your device first.');
      return;
    }

    if (photos.length >= maxPhotos) {
      setError(`Your current ${activePlan?.name || 'Plan'} allows up to ${maxPhotos} photos. Please upgrade your plan to add more.`);
      return;
    }

    setAdding(true);
    const newPhoto: BusinessPhoto = {
      id: `p-${Date.now()}`,
      business_id: currentBusiness.id,
      photo_url: photoUrl,
      caption: caption || undefined,
      sort_order: photos.length + 1,
      created_at: new Date().toISOString(),
    };

    const updated = [...photos, newPhoto];
    const res = await updateBusiness(currentBusiness.id, { photos: updated });
    setAdding(false);

    if (res.success) {
      setPhotoUrl('');
      setCaption('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || 'Failed to add photo.');
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!currentBusiness) return;
    if (!window.confirm('Are you sure you want to delete this photo from your gallery?')) return;

    const updated = photos.filter((p) => p.id !== photoId);
    await updateBusiness(currentBusiness.id, { photos: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Photo Gallery Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Upload direct photos from your phone gallery or camera to showcase to customer scanners.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          Used: <strong>{photos.length}</strong> / {maxPhotos} Photos
        </span>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Photo uploaded and saved to your gallery successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add New Direct Photo Card */}
      <form onSubmit={handleAddPhoto} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-brand-600" />
          Direct Photo Upload (Mobile / Laptop)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <DirectPhotoUpload
              label="Select Photo from Device *"
              value={photoUrl}
              onChange={setPhotoUrl}
              aspectHint="Supports camera photos, phone gallery, JPG, PNG & WebP"
              placeholderText="Tap to Choose Photo from Device / Camera"
              maxDimension={1200}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Photo Caption (Optional)
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Reception Desk, Storefront, Outlet View"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                A brief description displayed to customers when viewing your gallery.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={adding || !photoUrl || photos.length >= maxPhotos}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{adding ? 'Uploading Photo...' : 'Upload to Gallery'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Gallery Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Current Gallery Photos ({photos.length})</h3>

        {photos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs">No photos in your gallery yet. Choose a photo from your device above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative rounded-2xl overflow-hidden border border-slate-200 group bg-slate-50 shadow-xs">
                <img
                  src={photo.photo_url}
                  alt={photo.caption || 'Gallery photo'}
                  className="w-full h-44 object-cover"
                />
                <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs text-slate-700 truncate font-medium">
                    {photo.caption || 'Direct Photo'}
                  </span>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    title="Delete photo"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
