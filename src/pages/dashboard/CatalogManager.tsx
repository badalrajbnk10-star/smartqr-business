import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, CheckCircle2, AlertCircle, Tag, Briefcase, Edit2, X, Save } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { MenuItem, BusinessService } from '../../types/database';
import { DirectPhotoUpload } from '../../components/common/DirectPhotoUpload';

export const CatalogManager: React.FC = () => {
  const { currentBusiness, updateBusiness } = useBusiness();
  const isFood = currentBusiness?.category?.slug === 'restaurant' || currentBusiness?.category?.slug === 'cafe';
  const [tab, setTab] = useState<'menu' | 'services'>(() => (isFood ? 'menu' : 'services'));

  // Menu Form
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [menuCategory, setMenuCategory] = useState('Main Course');
  const [menuDesc, setMenuDesc] = useState('');
  const [menuImage, setMenuImage] = useState('');
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);

  // Service Form
  const [svcName, setSvcName] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcDuration, setSvcDuration] = useState('');
  const [svcDesc, setSvcDesc] = useState('');
  const [editingSvcId, setEditingSvcId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const menuItems = currentBusiness?.menu_items || [];
  const services = currentBusiness?.services || [];

  const handleStartEditMenu = (item: MenuItem) => {
    setEditingMenuId(item.id);
    setMenuName(item.name);
    setMenuPrice(item.price.toString());
    setMenuCategory(item.category || 'General');
    setMenuDesc(item.description || '');
    setMenuImage(item.image_url || '');
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleCancelEditMenu = () => {
    setEditingMenuId(null);
    setMenuName('');
    setMenuPrice('');
    setMenuDesc('');
    setMenuImage('');
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setSaving(true);

    let updated: MenuItem[];
    if (editingMenuId) {
      updated = menuItems.map((m) =>
        m.id === editingMenuId
          ? {
              ...m,
              name: menuName,
              price: parseFloat(menuPrice) || 0,
              category: menuCategory,
              description: menuDesc || undefined,
              image_url: menuImage || undefined,
            }
          : m
      );
    } else {
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        name: menuName,
        price: parseFloat(menuPrice) || 0,
        category: menuCategory,
        description: menuDesc || undefined,
        image_url: menuImage || undefined,
        is_available: true,
      };
      updated = [...menuItems, newItem];
    }

    await updateBusiness(currentBusiness.id, { menu_items: updated });
    try {
      localStorage.removeItem(`smartqr_fast_cache_${currentBusiness.slug}`);
    } catch {}
    setSaving(false);
    setEditingMenuId(null);
    setMenuName('');
    setMenuPrice('');
    setMenuDesc('');
    setMenuImage('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!currentBusiness) return;
    if (editingMenuId === id) handleCancelEditMenu();
    const updated = menuItems.filter((m) => m.id !== id);
    await updateBusiness(currentBusiness.id, { menu_items: updated });
    try {
      localStorage.removeItem(`smartqr_fast_cache_${currentBusiness.slug}`);
    } catch {}
  };

  const handleStartEditService = (svc: BusinessService) => {
    setEditingSvcId(svc.id);
    setSvcName(svc.name);
    setSvcPrice(svc.price ? svc.price.toString() : '');
    setSvcDuration(svc.duration || '');
    setSvcDesc(svc.description || '');
    window.scrollTo({ top: 150, behavior: 'smooth' });
  };

  const handleCancelEditService = () => {
    setEditingSvcId(null);
    setSvcName('');
    setSvcPrice('');
    setSvcDuration('');
    setSvcDesc('');
  };

  const handleQuickAddService = async (item: { name: string; price?: number; duration?: string; desc?: string }) => {
    if (!currentBusiness) return;
    setSaving(true);
    const newSvc: BusinessService = {
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: item.name,
      price: item.price,
      duration: item.duration,
      description: item.desc,
    };
    const updated = [...services, newSvc];
    await updateBusiness(currentBusiness.id, { services: updated });
    try {
      localStorage.removeItem(`smartqr_fast_cache_${currentBusiness.slug}`);
    } catch {}
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setSaving(true);

    let updated: BusinessService[];
    if (editingSvcId) {
      updated = services.map((s) =>
        s.id === editingSvcId
          ? {
              ...s,
              name: svcName,
              price: svcPrice ? parseFloat(svcPrice) : undefined,
              duration: svcDuration || undefined,
              description: svcDesc || undefined,
            }
          : s
      );
    } else {
      const newSvc: BusinessService = {
        id: `s-${Date.now()}`,
        name: svcName,
        price: svcPrice ? parseFloat(svcPrice) : undefined,
        duration: svcDuration || undefined,
        description: svcDesc || undefined,
      };
      updated = [...services, newSvc];
    }

    await updateBusiness(currentBusiness.id, { services: updated });
    try {
      localStorage.removeItem(`smartqr_fast_cache_${currentBusiness.slug}`);
    } catch {}
    setSaving(false);
    setEditingSvcId(null);
    setSvcName('');
    setSvcPrice('');
    setSvcDuration('');
    setSvcDesc('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDeleteService = async (id: string) => {
    if (!currentBusiness) return;
    if (editingSvcId === id) handleCancelEditService();
    const updated = services.filter((s) => s.id !== id);
    await updateBusiness(currentBusiness.id, { services: updated });
    try {
      localStorage.removeItem(`smartqr_fast_cache_${currentBusiness.slug}`);
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Menu & Services Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish your price list, food menu, or service packages with 1-click price editing.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold border border-slate-200">
          <button
            onClick={() => setTab('menu')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              tab === 'menu' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Digital Menu ({menuItems.length})
          </button>
          <button
            onClick={() => setTab('services')}
            className={`px-4 py-2 rounded-xl transition-colors ${
              tab === 'services' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Services / Packages ({services.length})
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Catalog item and price updated and published live!</span>
        </div>
      )}

      {tab === 'menu' ? (
        <div className="space-y-6">
          {/* Add / Edit Menu Item Form */}
          <form onSubmit={handleSaveMenuItem} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-brand-600" />
                <span>{editingMenuId ? 'Edit Dish & Price' : 'Add Menu Dish'}</span>
              </h3>
              {editingMenuId && (
                <button
                  type="button"
                  onClick={handleCancelEditMenu}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ INR) *</label>
                <input
                  type="number"
                  required
                  value={menuPrice}
                  onChange={(e) => setMenuPrice(e.target.value)}
                  placeholder="280"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={menuCategory}
                  onChange={(e) => setMenuCategory(e.target.value)}
                  placeholder="Starters, Main, Breads..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={menuDesc}
                  onChange={(e) => setMenuDesc(e.target.value)}
                  placeholder="Ingredients, spice level, or chef specialty"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <DirectPhotoUpload
                  label="Dish Photo (Direct Upload from Device)"
                  value={menuImage}
                  onChange={setMenuImage}
                  maxDimension={800}
                  aspectHint="Direct photo from phone gallery or camera"
                  placeholderText="Choose Dish Photo from Device"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editingMenuId && (
                <button
                  type="button"
                  onClick={handleCancelEditMenu}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/25 transition-all"
              >
                {editingMenuId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingMenuId ? 'Save Price & Dish Updates' : 'Add Menu Dish'}</span>
              </button>
            </div>
          </form>

          {/* Menu Items List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Menu Items ({menuItems.length})</h3>

            {menuItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No dishes added yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {menuItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <UtensilsCrossed className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.name}</h4>
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                        {item.description && <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900">₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => handleStartEditMenu(item)}
                        title="Edit dish and price"
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMenuItem(item.id)}
                        title="Delete dish"
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
      ) : (
        <div className="space-y-6">
          {/* Quick Add Presets */}
          <div className="bg-gradient-to-br from-brand-50 via-indigo-50 to-white rounded-3xl border border-brand-200/80 p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-brand-600" />
                1-Click Quick Add Services (CSC, Kirana, Clinic, Salon)
              </span>
              <span className="text-[10px] font-semibold text-brand-600 bg-white px-2.5 py-1 rounded-full border border-brand-200">
                Tap to Add Instantly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
              {[
                { name: 'Aadhaar Card Print (PVC)', price: 50, duration: '5 min', desc: 'High quality color PVC card' },
                { name: 'PAN Card New / Correction', price: 150, duration: '15 min', desc: 'Online application with doc verification' },
                { name: 'Income / Caste Certificate', price: 100, duration: '10 min', desc: 'RTPS online government application' },
                { name: 'AePS Cash Withdrawal / Deposit', price: 20, duration: 'Instant', desc: 'Fingerprint Biometric Aadhaar ATM' },
                { name: 'Electricity / Mobile Bill Payment', price: 10, duration: '2 min', desc: 'Instant bill payment & receipt' },
                { name: 'Passport Size Photo (8 Pcs)', price: 40, duration: '10 min', desc: 'Instant glossy print with white/blue bg' },
                { name: 'General Consultation & Checkup', price: 200, duration: '15 min', desc: 'Health checkup and advice' },
                { name: 'Haircut & Beard Grooming', price: 120, duration: '25 min', desc: 'Professional styling & trim' },
                { name: 'Daily Essentials & Kirana Pack', price: 499, duration: 'Same day', desc: 'Rice, Dal, Oil & Spices combo' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={saving}
                  onClick={() => handleQuickAddService(preset)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-brand-200 hover:border-brand-500 hover:shadow-sm text-left transition-all group"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-brand-600 truncate">{preset.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{preset.desc}</p>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">
                    + ₹{preset.price}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add / Edit Custom Service Form */}
          <form onSubmit={handleSaveService} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-600" />
                <span>{editingSvcId ? 'Edit Service & Price' : 'Add Custom Service or Product'}</span>
              </h3>
              {editingSvcId && (
                <button
                  type="button"
                  onClick={handleCancelEditService}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service / Item Name *</label>
                <input
                  type="text"
                  required
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  placeholder="e.g. Deluxe Room / PVC Card Print"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  value={svcPrice}
                  onChange={(e) => setSvcPrice(e.target.value)}
                  placeholder="50"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration / Rate Unit</label>
                <input
                  type="text"
                  value={svcDuration}
                  onChange={(e) => setSvcDuration(e.target.value)}
                  placeholder="Per Night / 10 Mins / Per Pcs"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={svcDesc}
                onChange={(e) => setSvcDesc(e.target.value)}
                placeholder="Details of what is included in this service"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              {editingSvcId && (
                <button
                  type="button"
                  onClick={handleCancelEditService}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/25 transition-all"
              >
                {editingSvcId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingSvcId ? 'Save Price & Service Updates' : 'Add Service'}</span>
              </button>
            </div>
          </form>

          {/* Services List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Active Services ({services.length})</h3>

            {services.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No services listed yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {services.map((svc) => (
                  <div key={svc.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">{svc.name}</h4>
                      {svc.duration && <span className="text-[10px] text-slate-400">{svc.duration}</span>}
                      {svc.description && <p className="text-[11px] text-slate-500 mt-0.5">{svc.description}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      {svc.price !== undefined && (
                        <span className="text-sm font-extrabold text-brand-600">₹{svc.price}</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStartEditService(svc)}
                        title="Edit price and details"
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(svc.id)}
                        title="Delete service"
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
      )}
    </div>
  );
};
