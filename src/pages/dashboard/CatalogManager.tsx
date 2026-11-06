import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Trash2, CheckCircle2, AlertCircle, Tag, Briefcase } from 'lucide-react';
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

  // Service Form
  const [svcName, setSvcName] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcDuration, setSvcDuration] = useState('');
  const [svcDesc, setSvcDesc] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const menuItems = currentBusiness?.menu_items || [];
  const services = currentBusiness?.services || [];

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setSaving(true);

    const newItem: MenuItem = {
      id: `m-${Date.now()}`,
      name: menuName,
      price: parseFloat(menuPrice) || 0,
      category: menuCategory,
      description: menuDesc || undefined,
      image_url: menuImage || undefined,
      is_available: true,
    };

    const updated = [...menuItems, newItem];
    await updateBusiness(currentBusiness.id, { menu_items: updated });
    setSaving(false);
    setMenuName('');
    setMenuPrice('');
    setMenuDesc('');
    setMenuImage('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!currentBusiness) return;
    const updated = menuItems.filter((m) => m.id !== id);
    await updateBusiness(currentBusiness.id, { menu_items: updated });
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
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness) return;
    setSaving(true);

    const newSvc: BusinessService = {
      id: `s-${Date.now()}`,
      name: svcName,
      price: svcPrice ? parseFloat(svcPrice) : undefined,
      duration: svcDuration || undefined,
      description: svcDesc || undefined,
    };

    const updated = [...services, newSvc];
    await updateBusiness(currentBusiness.id, { services: updated });
    setSaving(false);
    setSvcName('');
    setSvcPrice('');
    setSvcDuration('');
    setSvcDesc('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDeleteService = async (id: string) => {
    if (!currentBusiness) return;
    const updated = services.filter((s) => s.id !== id);
    await updateBusiness(currentBusiness.id, { services: updated });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Menu & Services Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish your digital food menu, price list, or service packages for QR scanners.
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
          <span>Catalog item saved and published live!</span>
        </div>
      )}

      {tab === 'menu' ? (
        <div className="space-y-6">
          {/* Add Menu Item Form */}
          <form onSubmit={handleAddMenuItem} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-brand-600" />
              Add Menu Dish
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                  placeholder="Paneer Tikka Masala"
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
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
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
                  label="Dish / Product Photo (Optional)"
                  value={menuImage}
                  onChange={setMenuImage}
                  maxDimension={800}
                  aspectHint="Choose photo from phone gallery or camera"
                  placeholderText="Tap to Choose Photo from Device"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Dish to Menu</span>
              </button>
            </div>
          </form>

          {/* Menu Items Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Current Menu Dishes ({menuItems.length})</h3>

            {menuItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No dishes added yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {menuItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                          <Tag className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.name}</h4>
                        <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-semibold">
                          {item.category}
                        </span>
                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-extrabold text-slate-900">₹{item.price}</span>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
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
          {/* Quick 1-Click Popular Service Packs for CSC, Retail, Salons & Clinics */}
          <div className="bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-600" />
                  1-Click Quick Add Common Services & Products
                </h3>
                <p className="text-xs text-slate-500">
                  Click any service below to instantly add it to your live customer rate card without typing.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {[
                { name: 'Aadhaar Card Print (PVC)', price: 50, duration: '5 min', desc: 'High quality color PVC card' },
                { name: 'PAN Card New / Correction', price: 150, duration: '15 min', desc: 'Online application with doc verification' },
                { name: 'Income / Caste Certificate', price: 100, duration: '10 min', desc: 'RTPS online government application' },
                { name: 'AePS Money Withdrawal & Transfer', price: 20, duration: '2 min', desc: 'Instant biometric cash withdrawal' },
                { name: 'Electricity / Mobile Bill Payment', price: 10, duration: '2 min', desc: 'Instant bill payment & receipt' },
                { name: 'Xerox Photocopy & Lamination', price: 5, duration: '1 min', desc: 'B&W / Color print and lamination' },
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

          {/* Add Custom Service Form */}
          <form onSubmit={handleAddService} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-600" />
              Add Custom Service or Product
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service / Room Name *</label>
                <input
                  type="text"
                  required
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  placeholder="Deluxe Ac Suite / Hair Spa"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ INR)</label>
                <input
                  type="number"
                  value={svcPrice}
                  onChange={(e) => setSvcPrice(e.target.value)}
                  placeholder="3500"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration / Rate Unit</label>
                <input
                  type="text"
                  value={svcDuration}
                  onChange={(e) => setSvcDuration(e.target.value)}
                  placeholder="Per Night / 45 Mins"
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
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

                    <div className="flex items-center gap-4">
                      {svc.price && <span className="text-sm font-extrabold text-brand-600">₹{svc.price}</span>}
                      <button
                        onClick={() => handleDeleteService(svc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
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
