import React, { createContext, useContext, useEffect, useState } from 'react';
import { Business, QRCode, Subscription, Plan, MenuItem, BusinessService } from '../types/database';
import { useAuth } from './AuthContext';
import { supabase, isDemoMode, DEFAULT_PLANS } from '../lib/supabase';

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

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Compute 24-hr trial countdown
  const [trialRemainingTime, setTrialRemainingTime] = useState({
    hours: 24,
    minutes: 0,
    isExpired: false,
  });

  // Calculate remaining trial time accurately
  useEffect(() => {
    if (!subscription) return;

    const interval = setInterval(() => {
      if (subscription.status === 'active') {
        setTrialRemainingTime({ hours: 720, minutes: 0, isExpired: false });
        return;
      }

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
    }, 1000);

    return () => clearInterval(interval);
  }, [subscription]);

  const loadData = async () => {
    if (!user) {
      setBusinesses([]);
      setCurrentBusiness(null);
      setLoading(false);
      return;
    }

    try {
      if (isDemoMode) {
        const cached = localStorage.getItem(`${LOCAL_BUSINESSES_KEY}_${user.id}`);
        if (cached) {
          const parsed: Business[] = JSON.parse(cached);
          // Purge old mock initialBiz if present for clean owner experience
          const filtered = parsed.filter(b => b.id !== 'biz-hotel-grand-1');
          setBusinesses(filtered);
          setCurrentBusiness(filtered[0] || null);
          if (filtered[0]?.subscription) {
            setSubscription(filtered[0].subscription);
          } else {
            setSubscription(null);
          }
        } else {
          // Fresh new owner has 0 businesses initially
          setBusinesses([]);
          setCurrentBusiness(null);
          setSubscription(null);
        }
      } else {
        // Fetch real businesses from Supabase Cloud
        const { data: bizList, error } = await supabase
          .from('businesses')
          .select(`
            *,
            category:business_categories(*),
            photos:business_photos(*),
            qr_code:qr_codes(*),
            subscription:subscriptions(*, plan:plans(*))
          `)
          .eq('owner_id', user.id);

        if (error) {
          console.error('Error fetching businesses from Supabase:', error);
          setBusinesses([]);
          setCurrentBusiness(null);
          setSubscription(null);
        } else if (bizList && bizList.length > 0) {
          setBusinesses(bizList);
          setCurrentBusiness(bizList[0]);
          if (bizList[0].subscription) {
            setSubscription(bizList[0].subscription);
          } else {
            setSubscription(null);
          }
        } else {
          // No business created yet in database
          setBusinesses([]);
          setCurrentBusiness(null);
          setSubscription(null);
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
      const slug = businessData.slug || businessData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `biz-${Date.now()}`;
      const newBiz: Business = {
        id: `biz-${Date.now()}`,
        owner_id: user.id,
        name: businessData.name || 'My New Business',
        slug,
        phone: businessData.phone || '',
        address: businessData.address || '',
        short_description: businessData.short_description || '',
        full_description: businessData.full_description || '',
        whatsapp: businessData.whatsapp || businessData.phone || '',
        email: businessData.email || user.email,
        google_maps_url: businessData.google_maps_url || '',
        google_review_url: businessData.google_review_url || '',
        is_active: true,
        status: 'trialing',
        opening_hours: businessData.opening_hours || {
          monday: { open: '09:00', close: '21:00', closed: false },
          tuesday: { open: '09:00', close: '21:00', closed: false },
          wednesday: { open: '09:00', close: '21:00', closed: false },
          thursday: { open: '09:00', close: '21:00', closed: false },
          friday: { open: '09:00', close: '21:00', closed: false },
          saturday: { open: '09:00', close: '21:00', closed: false },
          sunday: { open: '10:00', close: '18:00', closed: false },
        },
        menu_items: [],
        services: [],
        photos: [],
        qr_code: {
          id: `qr-${Date.now()}`,
          business_id: `biz-${Date.now()}`,
          permanent_code: slug,
          permanent_url: `${window.location.origin}/b/${slug}`,
          foreground_color: '#000000',
          background_color: '#FFFFFF',
          frame_type: 'standard',
          custom_text: 'SCAN ME FOR DETAILS & REVIEWS',
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
        const { data, error } = await supabase.from('businesses').insert(newBiz).select().single();
        if (error) return { success: false, error: error.message };
        await loadData();
        return { success: true, business: data };
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
        const { error } = await supabase.from('businesses').update(updates).eq('id', id);
        if (error) return { success: false, error: error.message };
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
      const selectedPlan = DEFAULT_PLANS.find((p) => p.id === planId) || DEFAULT_PLANS[1];
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const updatedSub: Subscription = {
        id: `sub-${Date.now()}`,
        business_owner_id: user?.id || 'owner-1',
        business_id: currentBusiness?.id,
        plan_id: planId,
        status: 'active',
        trial_started_at: subscription?.trial_started_at || now.toISOString(),
        trial_expires_at: subscription?.trial_expires_at || now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        razorpay_subscription_id: paymentResponse.razorpay_subscription_id,
        autopay_mandate_status: 'authorized',
        cancel_at_period_end: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        plan: selectedPlan,
      };

      setSubscription(updatedSub);

      if (currentBusiness) {
        await updateBusiness(currentBusiness.id, { status: 'active' });
      }

      return true;
    } catch (err) {
      console.error('Failed to activate subscription:', err);
      return false;
    }
  };

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
        activePlan: subscription?.plan || DEFAULT_PLANS[0],
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
