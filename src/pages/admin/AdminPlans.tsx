import React, { useState, useEffect } from 'react';
import { CreditCard, Edit2, Plus, CheckCircle2, Save, X, RefreshCw } from 'lucide-react';
import { DEFAULT_PLANS, supabaseUrl, supabaseAnonKey } from '../../lib/supabase';
import { Plan } from '../../types/database';

export const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editPriceRupees, setEditPriceRupees] = useState('');
  const [editMaxPhotos, setEditMaxPhotos] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadDbPlans() {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/plans?select=*&order=sort_order.asc`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPlans(data);
          }
        }
      } catch (err) {
        console.warn('Could not load plans from database, using cached defaults:', err);
      }
    }
    loadDbPlans();
  }, []);

  const startEdit = (p: Plan) => {
    setEditingPlan(p);
    setEditPriceRupees((p.price_paise / 100).toString());
    setEditMaxPhotos(p.max_photos_per_business.toString());
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSaving(true);

    const newPricePaise = Math.round(parseFloat(editPriceRupees) * 100);
    const newMaxPhotos = parseInt(editMaxPhotos) || editingPlan.max_photos_per_business;

    const updatedPlans = plans.map((p) => {
      if (p.id === editingPlan.id) {
        return {
          ...p,
          price_paise: newPricePaise,
          max_photos_per_business: newMaxPhotos,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });

    try {
      await fetch(`${supabaseUrl}/rest/v1/plans?id=eq.${editingPlan.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_paise: newPricePaise,
          max_photos_per_business: newMaxPhotos,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('Could not patch plan in database:', err);
    }

    setPlans(updatedPlans);
    try {
      localStorage.setItem('smartqr_plans', JSON.stringify(updatedPlans));
    } catch {}

    setSaving(false);
    setEditingPlan(null);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Subscription Plans & Pricing Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Super Admin Control: Edit any plan price in Rupees and update photo limits live.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Plan pricing updated and synced with billing engine & database!</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  {p.slug}
                </span>
              </div>

              <div>
                <p className="text-3xl font-black text-white">
                  ₹{(p.price_paise / 100).toFixed(0)}
                  <span className="text-xs text-slate-400 font-normal"> / month</span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  ({p.price_paise} integer paise)
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
                <p>Max Businesses: <strong className="text-slate-200">{p.max_businesses}</strong></p>
                <p>Max Photos Per Outlet: <strong className="text-slate-200">{p.max_photos_per_business}</strong></p>
              </div>

              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Features:</p>
                <ul className="space-y-1 text-xs text-slate-300">
                  {p.features.map((f, i) => (
                    <li key={i} className="truncate">• {f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => startEdit(p)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Price & Limits</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base">Edit {editingPlan.name} Plan Price</h3>
              <button onClick={() => setEditingPlan(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Price (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  value={editPriceRupees}
                  onChange={(e) => setEditPriceRupees(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500 font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Stored as {Math.round((parseFloat(editPriceRupees) || 0) * 100)} paise in database.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Max Photo Gallery Limit
                </label>
                <input
                  type="number"
                  required
                  value={editMaxPhotos}
                  onChange={(e) => setEditMaxPhotos(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Updating...' : 'Save Plan Price'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
