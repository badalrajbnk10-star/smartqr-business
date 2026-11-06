import React, { createContext, useContext, useEffect, useState } from 'react';
import { Business, QRCode, Subscription, Plan, MenuItem, BusinessService } from '../types/database';
import { useAuth } from './AuthContext';
import { supabase, isDemoMode, DEFAULT_PLANS, supabaseUrl, supabaseAnonKey } from '../lib/supabase';

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business) => void;
  loading: boolean;
  createBusiness: (businessData: Partial<Business>) => Promise<{ success: boolean; business?: Business; error?: string }>;
  updateBusiness: (id: string, updates: Partial<Business>) => Promise<{ success: boolean; error?: string }>;
  updateQRCode: (qrCodeId: string, updates: Partial<QRCode>) => Promise<{ success: boolean; error?: string }>;
  refreshData: () => Promise<void>;
  trialRemainingTime: { hours: number; minutes: number; isExpired: boolean };
  activePlan: Plan | null;
  subscription: Subscription | null;
  upgradeSubscription: (planId: string, paymentResponse: any) => Promise<boolean>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const LOCAL_BUSINESSES_KEY = 'smartqr_demo_businesses';
const ACTIVE_BIZ_KEY = 'smartqr_active_business';

const TRIAL_PLAN: Plan = {
  id: 'plan-trial',
  name: '24-Hour Free Trial',
  slug: 'trial',
  price_paise: 0,
  billing_period: 'trial',
  max_businesses: 1,
  max_photos_per_business: 5,
  features: [
    '24-Hour Full Trial Access',
    'Dynamic QR Code & Printable Stand',
    'Customer Profile Page',
    'Google Maps & WhatsApp Integration'
  ],
  is_active: true,
  sort_order: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    try {
      const cached = localStorage.getItem(ACTIVE_BIZ_KEY);
      return cached ? [JSON.parse(cached)] : [];
    } catch {
      return [];
    }
  });
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(() => {
    try {
      const cached = localStorage.getItem(ACTIVE_BIZ_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(ACTIVE_BIZ_KEY);
    } catch {
      return true;
    }
  });
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    try {
      const cached = localStorage.getItem(ACTIVE_BIZ_KEY);
      if (cached) {
        const b = JSON.parse(cached);
        return b?.subscription || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Compute 24-hr trial countdown
  const [trialRemainingTime, setTrialRemainingTime] = useState({
    hours: 24,
    minutes: 0,
    isExpired: false,
  });

  // Calculate remaining trial time accurately
  useEffect(() => {
    if (!subscription) return;

    if (subscription.status === 'active' || currentBusiness?.status === 'active') {
      setTrialRemainingTime({ hours: 720, minutes: 0, isExpired: false });
      return;
    }

    const checkTime = () => {
      const expiry = new Date(subscription.trial_expires_at).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTrialRemainingTime({ hours: 0, minutes: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTrialRemainingTime({ hours, minutes, isExpired: false });
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  const loadData = async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusiness(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      if (isDemoMode) {
        const cached = localStorage.getItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`);
        if (cached) {
          const parsed: Business[] = JSON.parse(cached);
          const filtered = parsed.filter(b => b.id !== 'biz-hotel-grand-1');
          setBusinesses(filtered);
          setCurrentBusiness(filtered[0] || null);
          setSubscription(filtered[0]?.subscription || null);
        } else {
          setBusinesses([]);
          setCurrentBusiness(null);
          setSubscription(null);
        }
      } else {
        // Fetch real businesses from Supabase Cloud via direct REST
        const selectQuery = '*,category:business_categories(*),photos:business_photos(*),qr_code:qr_codes(*),subscription:subscriptions(*,plan:plans(*))';
        let rawBizList: any[] = [];

        try {
          const res = await fetch(`${supabaseUrl}/rest/v1/businesses?owner_id=eq.${user.id}&select=${encodeURIComponent(selectQuery)}`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`,
            },
          });
          if (res.ok) {
            rawBizList = await res.json();
          }
        } catch (fetchErr) {
          console.warn('Direct fetch error, falling back to supabase client:', fetchErr);
          const { data } = await supabase
            .from('businesses')
            .select(selectQuery)
            .eq('owner_id', user.id);
          rawBizList = data || [];
        }

        if (rawBizList && rawBizList.length > 0) {
          // Normalize businesses & verify 24-hr trial state
          const normalizedList: Business[] = [];

          for (const b of rawBizList) {
            let qr = Array.isArray(b.qr_code) ? b.qr_code[0] : b.qr_code;

            // Auto-heal: If an existing business is missing its permanent QR record, create it now
            if (!qr) {
              const newQR = {
                business_id: b.id,
                permanent_code: b.slug,
                permanent_url: `${window.location.origin}/b/${b.slug}`,
                foreground_color: '#0047D4',
                background_color: '#FFFFFF',
                frame_type: 'table_tent',
                custom_text: 'Scan to Connect',
                total_scans: 0,
              };

              const { data: insertedQR } = await supabase
                .from('qr_codes')
                .insert(newQR)
                .select()
                .maybeSingle();

              qr = insertedQR || newQR;
            }

            // Check if an actual paid subscription exists in database or opening_hours._subscription
            const dbSub = Array.isArray(b.subscription) ? b.subscription[0] : b.subscription;
            const customPaidSub = (b.opening_hours as any)?._subscription;
            const activePaidSub = (dbSub && dbSub.status === 'active') ? dbSub : (customPaidSub && customPaidSub.status === 'active' ? customPaidSub : null);

            const bizCreated = new Date(b.created_at || Date.now()).getTime();
            const trialExpires = new Date(bizCreated + 24 * 60 * 60 * 1000).toISOString();
            const isTrialOver = Date.now() >= (bizCreated + 24 * 60 * 60 * 1000);

            let sub: Subscription;
            if (activePaidSub) {
              const matchedPlan = DEFAULT_PLANS.find(p => p.id === activePaidSub.plan_id || p.slug === activePaidSub.plan_slug) || DEFAULT_PLANS[0];
              sub = {
                ...activePaidSub,
                plan: matchedPlan,
                status: 'active',
              };
            } else {
              sub = {
                id: `sub-trial-${b.id}`,
                business_owner_id: user.id,
                business_id: b.id,
                plan_id: 'plan-trial',
                status: isTrialOver ? 'expired' : 'trialing',
                trial_started_at: new Date(bizCreated).toISOString(),
                trial_expires_at: trialExpires,
                current_period_start: new Date(bizCreated).toISOString(),
                current_period_end: trialExpires,
                autopay_mandate_status: 'pending',
                cancel_at_period_end: false,
                created_at: new Date(bizCreated).toISOString(),
                updated_at: new Date(bizCreated).toISOString(),
                plan: TRIAL_PLAN,
              };
            }

            const bizPhotos = Array.isArray(b.photos) && b.photos.length > 0
              ? b.photos
              : (Array.isArray((b.opening_hours as any)?._photos) ? (b.opening_hours as any)?._photos : []);

            normalizedList.push({
              ...b,
              photos: bizPhotos,
              status: sub.status === 'active' ? 'active' : (isTrialOver ? 'expired' : 'trialing'),
              qr_code: qr,
              subscription: sub,
            });
          }

          setBusinesses(normalizedList);
          setCurrentBusiness(normalizedList[0]);
          setSubscription(normalizedList[0].subscription || null);
          localStorage.setItem(ACTIVE_BIZ_KEY, JSON.stringify(normalizedList[0]));
        } else {
          // Fresh New Owner: Provision clean starter profile (ZERO fake address/phone)
          const ownerSlug = (user.full_name || 'my-business')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || `biz-${user.id.substring(0, 6)}`;

          const nowIso = new Date().toISOString();
          const trialEndIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

          const starterBiz = {
            owner_id: user.id,
            name: user.full_name ? `${user.full_name}'s Business` : 'My Business',
            slug: `${ownerSlug}-${user.id.substring(0, 4)}`,
            phone: user.phone || '',
            whatsapp: user.phone || '',
            email: user.email,
            address: '',
            city: '',
            pincode: '',
            short_description: '',
            full_description: '',
            is_active: true,
            status: 'trialing' as const,
            opening_hours: {
              monday: { open: '09:00', close: '20:00', closed: false },
              tuesday: { open: '09:00', close: '20:00', closed: false },
              wednesday: { open: '09:00', close: '20:00', closed: false },
              thursday: { open: '09:00', close: '20:00', closed: false },
              friday: { open: '09:00', close: '20:00', closed: false },
              saturday: { open: '09:00', close: '20:00', closed: false },
              sunday: { open: '10:00', close: '16:00', closed: false },
            },
            menu_items: [],
            services: [],
          };

          const { data: createdBiz, error: createErr } = await supabase
            .from('businesses')
            .insert(starterBiz)
            .select()
            .single();

          if (!createErr && createdBiz) {
            const starterQR = {
              business_id: createdBiz.id,
              permanent_code: createdBiz.slug,
              permanent_url: `${window.location.origin}/b/${createdBiz.slug}`,
              foreground_color: '#0047D4',
              background_color: '#FFFFFF',
              frame_type: 'table_tent',
              custom_text: 'Scan to Connect',
              total_scans: 0,
            };

            const { data: qrData } = await supabase
              .from('qr_codes')
              .insert(starterQR)
              .select()
              .single();

            const initialTrialSub: Subscription = {
              id: `sub-trial-${createdBiz.id}`,
              business_owner_id: user.id,
              business_id: createdBiz.id,
              plan_id: 'plan-trial',
              status: 'trialing',
              trial_started_at: nowIso,
              trial_expires_at: trialEndIso,
              current_period_start: nowIso,
              current_period_end: trialEndIso,
              autopay_mandate_status: 'pending',
              cancel_at_period_end: false,
              created_at: nowIso,
              updated_at: nowIso,
              plan: TRIAL_PLAN,
            };

            const fullBiz: Business = {
              ...createdBiz,
              qr_code: qrData || starterQR,
              subscription: initialTrialSub,
            };

            setBusinesses([fullBiz]);
            setCurrentBusiness(fullBiz);
            setSubscription(initialTrialSub);
            localStorage.setItem(ACTIVE_BIZ_KEY, JSON.stringify(fullBiz));
          } else {
            setBusinesses([]);
            setCurrentBusiness(null);
            setSubscription(null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const createBusiness = async (businessData: Partial<Business>) => {
    if (!user) return { success: false, error: 'User not logged in' };

    try {
      const rawSlug = businessData.slug || businessData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `biz-${Date.now()}`;
      const slug = rawSlug.replace(/^-|-$/g, '');

      const newBiz: Business = {
        id: `biz-${Date.now()}`,
        owner_id: user.id,
        name: businessData.name || 'My Business',
        slug,
        phone: businessData.phone || user.phone || '',
        address: businessData.address || '',
        short_description: businessData.short_description || '',
        full_description: businessData.full_description || '',
        whatsapp: businessData.whatsapp || businessData.phone || '',
        email: businessData.email || user.email,
        google_maps_url: businessData.google_maps_url || '',
        google_review_url: businessData.google_review_url || '',
        city: businessData.city || '',
        state: businessData.state || '',
        pincode: businessData.pincode || '',
        logo_url: businessData.logo_url || '',
        banner_url: businessData.banner_url || '',
        is_active: true,
        status: 'trialing',
        opening_hours: businessData.opening_hours || {
          monday: { open: '09:00', close: '20:00', closed: false },
          tuesday: { open: '09:00', close: '20:00', closed: false },
          wednesday: { open: '09:00', close: '20:00', closed: false },
          thursday: { open: '09:00', close: '20:00', closed: false },
          friday: { open: '09:00', close: '20:00', closed: false },
          saturday: { open: '09:00', close: '20:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false },
        },
        menu_items: [],
        services: [],
        photos: [],
        qr_code: {
          id: `qr-${Date.now()}`,
          business_id: `biz-${Date.now()}`,
          permanent_code: slug,
          permanent_url: `${window.location.origin}/b/${slug}`,
          foreground_color: '#0047D4',
          background_color: '#FFFFFF',
          frame_type: 'table_tent',
          custom_text: 'Scan to Connect',
          total_scans: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isDemoMode) {
        const updated = [...businesses, newBiz];
        setBusinesses(updated);
        setCurrentBusiness(newBiz);
        localStorage.setItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`, JSON.stringify(updated));
        return { success: true, business: newBiz };
      } else {
        const { qr_code, photos, category, subscription, id: tempId, ...bizFields } = newBiz;

        const { data: insertedBiz, error: insertErr } = await supabase
          .from('businesses')
          .insert(bizFields)
          .select()
          .single();

        if (insertErr) return { success: false, error: insertErr.message };

        const newQR = {
          business_id: insertedBiz.id,
          permanent_code: slug,
          permanent_url: `${window.location.origin}/b/${slug}`,
          foreground_color: '#0047D4',
          background_color: '#FFFFFF',
          frame_type: 'table_tent',
          custom_text: 'Scan to Connect',
          total_scans: 0,
        };

        await supabase.from('qr_codes').insert(newQR);
        await loadData();
        return { success: true, business: insertedBiz };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    try {
      if (isDemoMode && user) {
        const updatedList = businesses.map((b) => (b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b));
        setBusinesses(updatedList);
        const current = updatedList.find((b) => b.id === id) || null;
        setCurrentBusiness(current);
        localStorage.setItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`, JSON.stringify(updatedList));
        return { success: true };
      } else {
        const { qr_code, photos, category, subscription, id: _id, owner_id: _oid, ...bizUpdates } = updates;

        // If photos are provided, persist them inside opening_hours._photos in Postgres
        if (Array.isArray(photos)) {
          const currentHours = ((currentBusiness?.opening_hours || {}) as any);
          bizUpdates.opening_hours = {
            ...currentHours,
            ...bizUpdates.opening_hours,
            _photos: photos,
          };
        }

        const { error } = await supabase.from('businesses').update(bizUpdates).eq('id', id);
        if (error) return { success: false, error: error.message };
        if (currentBusiness && currentBusiness.id === id) {
          const merged = {
            ...currentBusiness,
            ...bizUpdates,
            photos: Array.isArray(photos) ? photos : currentBusiness.photos,
            updated_at: new Date().toISOString()
          };
          setCurrentBusiness(merged);
          localStorage.setItem(ACTIVE_BIZ_KEY, JSON.stringify(merged));
        }
        await loadData();
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateQRCode = async (qrCodeId: string, updates: Partial<QRCode>) => {
    if (!currentBusiness) return { success: false, error: 'No business selected' };

    try {
      if (isDemoMode && user) {
        const updatedQR = { ...currentBusiness.qr_code, ...updates, updated_at: new Date().toISOString() } as QRCode;
        const updatedBiz = { ...currentBusiness, qr_code: updatedQR };
        const updatedList = businesses.map((b) => (b.id === currentBusiness.id ? updatedBiz : b));
        setBusinesses(updatedList);
        setCurrentBusiness(updatedBiz);
        localStorage.setItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`, JSON.stringify(updatedList));
        return { success: true };
      } else {
        const { error } = await supabase.from('qr_codes').update(updates).eq('id', qrCodeId);
        if (error) return { success: false, error: error.message };
        await loadData();
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const upgradeSubscription = async (planId: string, paymentResponse: any): Promise<boolean> => {
    try {
      const selectedPlan = DEFAULT_PLANS.find((p) => p.id === planId || p.slug === planId) || DEFAULT_PLANS[0];
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const updatedSub: Subscription = {
        id: `sub-${Date.now()}`,
        business_owner_id: user?.id || 'owner-1',
        business_id: currentBusiness?.id,
        plan_id: selectedPlan.id,
        status: 'active',
        trial_started_at: subscription?.trial_started_at || now.toISOString(),
        trial_expires_at: subscription?.trial_expires_at || now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        razorpay_subscription_id: paymentResponse?.razorpay_subscription_id || `sub_rzp_${Date.now()}`,
        autopay_mandate_status: 'authorized',
        cancel_at_period_end: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        plan: selectedPlan,
      };

      setSubscription(updatedSub);
      setTrialRemainingTime({ hours: 720, minutes: 0, isExpired: false });

      if (currentBusiness) {
        const currentHours = ((currentBusiness.opening_hours || {}) as any);
        await updateBusiness(currentBusiness.id, {
          status: 'active',
          opening_hours: {
            ...currentHours,
            _subscription: {
              plan_id: selectedPlan.id,
              plan_slug: selectedPlan.slug,
              plan_name: selectedPlan.name,
              amount_paise: selectedPlan.price_paise,
              status: 'active',
              payment_id: paymentResponse?.razorpay_payment_id || `pay_${Date.now()}`,
              activated_at: now.toISOString(),
              expires_at: periodEnd.toISOString(),
            },
          },
        });
      }

      return true;
    } catch (err) {
      console.error('Failed to activate subscription:', err);
      return false;
    }
  };

  // Determine active plan to display
  const activePlanToDisplay: Plan | null =
    subscription?.status === 'active'
      ? (subscription.plan || DEFAULT_PLANS[0])
      : (subscription?.status === 'trialing' ? TRIAL_PLAN : null);

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusiness,
        loading,
        createBusiness,
        updateBusiness,
        updateQRCode,
        refreshData: loadData,
        trialRemainingTime,
        activePlan: activePlanToDisplay,
        subscription,
        upgradeSubscription,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
